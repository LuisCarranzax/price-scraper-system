import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ onSearch, initialValue = '', isCompact = false }) {
  const [input, setInput] = useState(initialValue);
  const [suggestion, setSuggestion] = useState('');

  useEffect(() => {
    setInput(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (input.trim().length >= 2) {
      const controller = new AbortController();
      fetch(`http://localhost:5000/api/suggestions?q=${encodeURIComponent(input.trim())}`, {
        signal: controller.signal
      })
        .then(res => res.json())
        .then(data => {
          if (data.suggestion && data.suggestion.toLowerCase().startsWith(input.toLowerCase())) {
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
    <div className={`search-wrapper ${isCompact ? 'compact' : 'hero-mode'}`}>
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
          placeholder="Escribe un componente o repuesto (Ej: SSD Kingston, RTX 4060, Ryzen 7)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
          autoFocus={!isCompact}
        />
        <button 
          className="search-btn" 
          onClick={handleSearchClick}
          type="button"
          aria-label="Buscar"
        >
          <Search size={18} />
          <span>Buscar</span>
        </button>
      </div>

      {suggestion && !isCompact && (
        <p className="tab-hint">
          Sugerencia disponible: Presiona <kbd className="kbd-badge">Tab ⇥</kbd> para completar a "{suggestion}"
        </p>
      )}
    </div>
  );
}