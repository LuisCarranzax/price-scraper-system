import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import ProductCard from './components/ProductCard';
import './assets/styles.css';

export default function App() {
  const [currentQuery, setCurrentQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ totalResults: 0, lowestPrice: 0, highestPrice: 0, storesFound: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    store: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'default'
  });

  const executeSearchRequest = (query, currentFilters = filters) => {
    if (!query || !query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    setCurrentQuery(query.trim());

    const params = new URLSearchParams({
      q: query.trim()
    });

    if (currentFilters.store) params.append('store', currentFilters.store);
    if (currentFilters.condition) params.append('condition', currentFilters.condition);
    if (currentFilters.minPrice) params.append('minPrice', currentFilters.minPrice);
    if (currentFilters.maxPrice) params.append('maxPrice', currentFilters.maxPrice);
    if (currentFilters.sortBy && currentFilters.sortBy !== 'default') {
      params.append('sortBy', currentFilters.sortBy);
    }

    fetch(`http://localhost:5000/api/search?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al consultar el servidor Gateway');
        return res.json();
      })
      .then((data) => {
        setProducts(data.results || []);
        setMeta({
          totalResults: data.totalResults || 0,
          lowestPrice: data.lowestPrice || 0,
          highestPrice: data.highestPrice || 0,
          storesFound: data.storesFound || []
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Search error:', err);
        setError('No se pudo conectar con el servidor de scraping. Asegúrate de que el backend esté ejecutándose.');
        setProducts([]);
        setLoading(false);
      });
  };

  const handleSearch = (query) => {
    executeSearchRequest(query, filters);
  };

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    if (currentQuery) {
      executeSearchRequest(currentQuery, updated);
    }
  };

  const handleResetFilters = () => {
    const reset = {
      store: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'default'
    };
    setFilters(reset);
    if (currentQuery) {
      executeSearchRequest(currentQuery, reset);
    }
  };

  return (
    <div className="app-container">
      {/* Cabecera Principal */}
      <header className="app-header">
        <span className="brand-badge">⚡ Comparador Inteligente</span>
        <h1 className="app-title">Búsqueda & Scraping de Hardware</h1>
        <p className="app-subtitle">
          Compara precios y disponibilidad de componentes de cómputo y repuestos en múltiples tiendas en un solo lugar.
        </p>
      </header>

      {/* Barra de Búsqueda con Autocompletado */}
      <SearchBar onSearch={handleSearch} initialValue={currentQuery} />

      {/* Layout de Contenido */}
      <div className="main-layout">
        {/* Barra Lateral de Filtros */}
        <aside className="filter-sidebar">
          <div className="filter-header">
            <h3 className="filter-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filtros
            </h3>
            <button type="button" className="reset-btn" onClick={handleResetFilters}>
              Limpiar
            </button>
          </div>

          {/* Filtro: Tienda */}
          <div className="filter-group">
            <label htmlFor="store-filter">Tienda</label>
            <select
              id="store-filter"
              className="filter-select"
              value={filters.store}
              onChange={(e) => handleFilterChange('store', e.target.value)}
            >
              <option value="">Todas las tiendas</option>
              <option value="Mercado Libre">Mercado Libre</option>
              <option value="Falabella">Falabella</option>
            </select>
          </div>

          {/* Filtro: Rango de Precios */}
          <div className="filter-group">
            <label>Rango de Precios (S/)</label>
            <div className="price-range-inputs">
              <input
                type="number"
                placeholder="Mín"
                className="price-input"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                min="0"
              />
              <span className="price-separator">-</span>
              <input
                type="number"
                placeholder="Máx"
                className="price-input"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                min="0"
              />
            </div>
          </div>

          {/* Filtro: Estado del Producto */}
          <div className="filter-group">
            <label htmlFor="condition-filter">Estado</label>
            <select
              id="condition-filter"
              className="filter-select"
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
            >
              <option value="">Cualquier estado</option>
              <option value="Nuevo">Nuevo</option>
              <option value="Seminuevo / Usado">Seminuevo / Repuestos</option>
            </select>
          </div>
        </aside>

        {/* Área Principal de Resultados */}
        <main className="results-container">
          {/* Barra de Información y Ordenamiento */}
          {searched && !loading && !error && (
            <div className="results-toolbar">
              <div className="results-info">
                <span className="results-count">
                  {products.length} {products.length === 1 ? 'resultado' : 'resultados'} para "{currentQuery}"
                </span>
                {meta.lowestPrice > 0 && (
                  <span className="price-highlight-badge">
                    Mejor precio desde: S/ {meta.lowestPrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              <div className="sort-wrapper">
                <label htmlFor="sort-select" className="sort-label">Ordenar:</label>
                <select
                  id="sort-select"
                  className="sort-select"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="default">Relevancia</option>
                  <option value="price_asc">Menor precio</option>
                  <option value="price_desc">Mayor precio</option>
                </select>
              </div>
            </div>
          )}

          {/* Estado: Cargando */}
          {loading && (
            <div className="state-container">
              <div className="spinner"></div>
              <h3 className="state-title">Extrayendo y comparando precios...</h3>
              <p className="state-desc">
                Consultando tiendas en línea para "{currentQuery}". Por favor espera un momento.
              </p>
            </div>
          )}

          {/* Estado: Error */}
          {!loading && error && (
            <div className="state-container">
              <span className="state-icon">⚠️</span>
              <h3 className="state-title">Hubo un problema</h3>
              <p className="state-desc">{error}</p>
            </div>
          )}

          {/* Estado: Sin resultados */}
          {!loading && !error && searched && products.length === 0 && (
            <div className="state-container">
              <span className="state-icon">🔍</span>
              <h3 className="state-title">No se encontraron productos</h3>
              <p className="state-desc">
                No encontramos coincidencias para "{currentQuery}" con los filtros seleccionados. Intenta ampliar el rango de precios o buscar otro término.
              </p>
            </div>
          )}

          {/* Estado Inicial: Bienvenida */}
          {!loading && !searched && (
            <div className="state-container">
              <span className="state-icon">🛒</span>
              <h3 className="state-title">Encuentra los mejores precios de hardware</h3>
              <p className="state-desc">
                Escribe arriba el nombre de una tarjeta gráfica, procesador, memoria RAM, disco SSD o repuesto electrónico para iniciar la comparación.
              </p>
            </div>
          )}

          {/* Grid de Productos */}
          {!loading && !error && products.length > 0 && (
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}