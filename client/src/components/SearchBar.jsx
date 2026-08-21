import React, { useState, useEffect } from 'react';

export default function SearchBar({ onSearch, initialValue = '' }) {
  const [input, setInput] = useState(initialValue);
  const [suggestion, setSuggestion] = useState('');

  useEffect(() => {
    if (input.trim().length >= 2) {
      const controller = new AbortController();
      fetch(`http://localhost:5000/api/suggestions?q=${encodeURIComponent(input.trim())}`, {
        signal: controller.signal
      })
        .then(res => res.json())
        .then(data => {
          if (data.suggestion && data.suggestion.toLowerCase().startsWith(input.toLowerCase())) {
            // Mantiene el casing original escrito por el usuario y concatena el resto
            setSuggestion(input + data.suggestion.slice(input.length));
          } else {
            setSuggestion('');
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            setSuggestion('');
          }
        });

      return () => controller.abort();
    } else {
      setSuggestion('');
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      setInput(suggestion);
      setSuggestion('');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        onSearch(input.trim());
      }
    }
  };

  const handleSearchClick = () => {
    if (input.trim()) {
      onSearch(input.trim());
    }
  };

  return (
    <section className="search-section">
      <div className="search-box-wrapper">
        <input
          type="text"
          className="suggestion-overlay"
          value={suggestion}
          readOnly
          aria-hidden="true"
          tabIndex={-1}
        />
        <input
          type="text"
          className="search-input"
          placeholder="Escribe un componente (Ej: Kingston SSD, RTX 4060, Ryzen 7)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
        />
        <button 
          className="search-btn" 
          onClick={handleSearchClick}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          Buscar
        </button>
      </div>

      {suggestion && (
        <p className="tab-hint">
          Sugerencia disponible: Presiona <kbd className="kbd-badge">Tab ⇥</kbd> para autocompletar
        </p>
      )}
    </section>
  );
}