import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ onSearch, initialValue = '', isCompact = false }) {
  const [input, setInput] = useState(initialValue);

  useEffect(() => {
    setInput(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        onSearch(input.trim());
      }
    }
  };

  return (
    <form className={`search-wrapper ${isCompact ? 'compact' : 'hero-mode'}`} onSubmit={handleSubmit}>
      <div className="search-box-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Escribe un componente o repuesto (Ej: SSD Kingston, RTX 4060, Ryzen 7, Laptop Victus)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
          autoFocus={!isCompact}
        />
        <button 
          className="search-btn" 
          type="submit"
          aria-label="Buscar"
        >
          <Search size={18} />
          <span>Buscar</span>
        </button>
      </div>
    </form>
  );
}