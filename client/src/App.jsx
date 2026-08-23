import React, { useState, useRef } from 'react';
import { 
  Zap, 
  ArrowLeft, 
  SlidersHorizontal, 
  RotateCcw, 
  Info, 
  AlertTriangle, 
  Search, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Layers,
  Store,
  CheckCircle2
} from 'lucide-react';
import SearchBar from './components/SearchBar';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import './assets/styles.css';

const ITEMS_PER_PAGE = 15; // 3 columnas x 5 filas

const QUICK_SUGGESTIONS = [
  'SSD Kingston 1TB',
  'RTX 4060 8GB',
  'Ryzen 7 5700X',
  'Laptop Victus Ryzen 7',
  'Memoria RAM 16GB DDR4',
  'Pantalla iPhone 11 Repuesto'
];

const CATEGORIES = [
  { value: '', label: 'Todas las categorías' },
  { value: 'Laptops', label: 'Laptops y Portátiles' },
  { value: 'Almacenamiento', label: 'Almacenamiento (SSD / Discos)' },
  { value: 'Tarjetas de Video', label: 'Tarjetas de Video (GPUs)' },
  { value: 'Procesadores', label: 'Procesadores (CPUs)' },
  { value: 'Memorias RAM', label: 'Memorias RAM' },
  { value: 'Placas Madre', label: 'Placas Madre' },
  { value: 'Fuentes de Poder', label: 'Fuentes de Poder' },
  { value: 'Pantallas y Monitores', label: 'Pantallas y Monitores' },
  { value: 'Accesorios y Repuestos', label: 'Accesorios y Repuestos' }
];

const STORES = [
  { value: '', label: 'Todas las tiendas' },
  { value: 'Mercado Libre', label: 'Mercado Libre' },
  { value: 'Mesajil', label: 'Mesajil' },
  { value: 'Alpha Technology', label: 'Alpha Technology' },
  { value: 'Pegasus 5000', label: 'Pegasus 5000' },
  { value: 'Grupo Compu & Vision', label: 'Grupo Compu & Vision' },
  { value: 'Impacto', label: 'Impacto' },
  { value: 'Sercoplus', label: 'Sercoplus' },
  { value: 'CYC Computer', label: 'CYC Computer' },
  { value: 'Cahuana', label: 'Cahuana' },
  { value: 'Memory Kings', label: 'Memory Kings' }


];

export default function App() {
  const [currentQuery, setCurrentQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ 
    totalResults: 0, 
    lowestPrice: 0, 
    highestPrice: 10000, 
    storesFound: [], 
    categoriesFound: [] 
  });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const resultsTopRef = useRef(null);

  const [filters, setFilters] = useState({
    store: '',
    category: '',
    condition: '',
    maxPrice: '',
    sortBy: 'default'
  });

  const executeSearchRequest = (query, currentFilters = filters) => {
    if (!query || !query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    setCurrentQuery(query.trim());
    setCurrentPage(1);

    const params = new URLSearchParams({
      q: query.trim()
    });

    if (currentFilters.store) params.append('store', currentFilters.store);
    if (currentFilters.category) params.append('category', currentFilters.category);
    if (currentFilters.condition) params.append('condition', currentFilters.condition);
    if (currentFilters.maxPrice) params.append('maxPrice', currentFilters.maxPrice);
    if (currentFilters.sortBy && currentFilters.sortBy !== 'default') {
      params.append('sortBy', currentFilters.sortBy);
    }

    fetch(`http://localhost:5000/api/search?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al conectar con el servidor Gateway');
        return res.json();
      })
      .then((data) => {
        setProducts(data.results || []);
        setMeta({
          totalResults: data.totalResults || 0,
          lowestPrice: data.lowestPrice || 0,
          highestPrice: data.highestPrice > 0 ? data.highestPrice : 10000,
          storesFound: data.storesFound || [],
          categoriesFound: data.categoriesFound || []
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Search error:', err);
        setError('No se pudo conectar con el servidor de scraping. Verifica que el backend esté en ejecución.');
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
      category: '',
      condition: '',
      maxPrice: '',
      sortBy: 'default'
    };
    setFilters(reset);
    if (currentQuery) {
      executeSearchRequest(currentQuery, reset);
    }
  };

  const handleBackToHome = () => {
    setSearched(false);
    setCurrentQuery('');
    setProducts([]);
    setError(null);
    setCurrentPage(1);
    setSelectedProduct(null);
    setFilters({
      store: '',
      category: '',
      condition: '',
      maxPrice: '',
      sortBy: 'default'
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (resultsTopRef.current) {
      resultsTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Paginación 3 columnas x 5 filas = 15 productos por página
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, products.length);
  const paginatedProducts = products.slice(startIndex, endIndex);

  // Rango máximo del slider basado en el catálogo encontrado
  const sliderMaxBound = Math.max(meta.highestPrice || 10000, 1000);
  const currentSliderValue = filters.maxPrice !== '' ? Number(filters.maxPrice) : sliderMaxBound;

  // Componente reutilizable de paginación
  const renderPagination = (isTop = false) => {
    if (totalPages <= 1) return null;

    return (
      <nav className={`pagination-container ${isTop ? 'pagination-top' : 'pagination-bottom'}`} aria-label="Navegación de páginas">
        <span className="pagination-summary">
          Página {currentPage} de {totalPages} ({products.length} productos)
        </span>

        <div className="pagination-controls">
          <button
            type="button"
            className="page-nav-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Página anterior"
          >
            <ChevronLeft size={16} />
            <span>Anterior</span>
          </button>

          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`page-number-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="page-nav-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Página siguiente"
          >
            <span>Siguiente</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </nav>
    );
  };

  return (
    <div className={`app-root ${searched ? 'mode-results' : 'mode-home'}`}>
      {/* VISTA 1: HOME CENTRADO ESTILO GOOGLE */}
      {!searched && (
        <main className="home-container">
          <div className="home-hero">
            <span className="brand-badge-home">
              <Zap size={14} />
              <span>Hardware Price Scraper</span>
            </span>

            <h1 className="home-logo">Comparador Inteligente</h1>

            <div className="home-search-container">
              <SearchBar onSearch={handleSearch} initialValue={currentQuery} isCompact={false} />
            </div>

            <p className="home-question">¿Qué repuesto buscas hoy?</p>

            <div className="quick-tags-container">
              <span className="quick-tags-label">
                <Sparkles size={13} />
                <span>Búsquedas populares:</span>
              </span>
              <div className="quick-tags-list">
                {QUICK_SUGGESTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="quick-tag-chip"
                    onClick={() => handleSearch(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* VISTA 2: CABECERA FIJA Y RESULTADOS */}
      {searched && (
        <>
          {/* Header Superior Fijo */}
          <header className="results-top-header">
            <div className="results-top-inner">
              <div className="header-brand-group">
                <button
                  type="button"
                  className="back-home-btn"
                  onClick={handleBackToHome}
                  title="Volver al inicio"
                >
                  <ArrowLeft size={16} />
                  <span>Volver al inicio</span>
                </button>

                <div className="header-logo-text" onClick={handleBackToHome}>
                  <Zap size={18} className="brand-icon" />
                  <span>PriceScraper</span>
                </div>
              </div>

              <div className="header-search-container">
                <SearchBar onSearch={handleSearch} initialValue={currentQuery} isCompact={true} />
              </div>
            </div>
          </header>

          <div className="results-page-container" ref={resultsTopRef}>
            {/* Aviso Informativo sobre Precios y Descuentos */}
            <div className="disclaimer-banner">
              <Info size={20} className="disclaimer-icon" />
              <div className="disclaimer-text">
                <strong>Aviso sobre Precios y Ofertas:</strong> Los precios mostrados son extraídos por scraping de fuentes públicas. Pueden existir promociones temporales, cupones o descuentos por método de pago aplicables directamente al visitar la tienda oficial.
              </div>
            </div>

            {/* Layout Principal: Sidebar + Grid */}
            <div className="main-layout">
              {/* Barra Lateral de Filtros */}
              <aside className="filter-sidebar">
                <div className="filter-header">
                  <h3 className="filter-title">
                    <SlidersHorizontal size={16} />
                    <span>Filtros Inteligentes</span>
                  </h3>
                  <button 
                    type="button" 
                    className="reset-btn" 
                    onClick={handleResetFilters}
                    title="Restablecer todos los filtros"
                  >
                    <RotateCcw size={13} />
                    <span>Limpiar</span>
                  </button>
                </div>

                {/* Filtro: Tipo / Categoría de Producto */}
                <div className="filter-group">
                  <label htmlFor="category-filter">
                    <Layers size={13} />
                    <span>Categoría</span>
                  </label>
                  <select
                    id="category-filter"
                    className="filter-select"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro: Tienda de Origen */}
                <div className="filter-group">
                  <label htmlFor="store-filter">
                    <Store size={13} />
                    <span>Tienda</span>
                  </label>
                  <select
                    id="store-filter"
                    className="filter-select"
                    value={filters.store}
                    onChange={(e) => handleFilterChange('store', e.target.value)}
                  >
                    {STORES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro: Deslizador de Rango de Precios (Range Slider) */}
                <div className="filter-group slider-group">
                  <div className="slider-label-row">
                    <label htmlFor="price-slider">
                      <span>Precio Máximo</span>
                    </label>
                    <span className="slider-value-badge">
                      Hasta S/ {currentSliderValue.toLocaleString('es-PE')}
                    </span>
                  </div>

                  <input
                    id="price-slider"
                    type="range"
                    min="0"
                    max={sliderMaxBound}
                    step="50"
                    value={currentSliderValue}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="custom-range-slider"
                  />

                  <div className="slider-limits">
                    <span>S/ 0</span>
                    <span>S/ {sliderMaxBound.toLocaleString('es-PE')}</span>
                  </div>
                </div>

                {/* Filtro: Estado del Producto */}
                <div className="filter-group">
                  <label htmlFor="condition-filter">
                    <CheckCircle2 size={13} />
                    <span>Estado</span>
                  </label>
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

              {/* Contenedor de Resultados */}
              <main className="results-container">
                {/* Toolbar de Información, Orden y Paginación Superior */}
                {!loading && !error && (
                  <div className="results-toolbar">
                    <div className="results-info">
                      <span className="results-count">
                        {products.length} {products.length === 1 ? 'producto encontrado' : 'productos encontrados'} para "{currentQuery}"
                      </span>
                      {meta.lowestPrice > 0 && (
                        <span className="price-highlight-badge">
                          Desde S/ {meta.lowestPrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
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
                        <option value="name_asc">Nombre (A-Z)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Paginación Superior */}
                {!loading && !error && renderPagination(true)}

                {/* Estado: Cargando */}
                {loading && (
                  <div className="state-container">
                    <div className="spinner"></div>
                    <h3 className="state-title">Comparando precios en múltiples tiendas...</h3>
                    <p className="state-desc">
                      Consultando Mercado Libre, Mesajil, Alpha Technology, Computer House, Falabella y AliExpress para "{currentQuery}".
                    </p>
                  </div>
                )}

                {/* Estado: Error */}
                {!loading && error && (
                  <div className="state-container">
                    <AlertTriangle size={42} className="state-icon-alert" />
                    <h3 className="state-title">Hubo un problema</h3>
                    <p className="state-desc">{error}</p>
                  </div>
                )}

                {/* Estado: Sin Resultados */}
                {!loading && !error && products.length === 0 && (
                  <div className="state-container">
                    <Search size={42} className="state-icon-search" />
                    <h3 className="state-title">No se encontraron productos</h3>
                    <p className="state-desc">
                      No encontramos coincidencias para "{currentQuery}" con los filtros actuales. Prueba ampliando el rango del deslizador de precio o seleccionando "Todas las tiendas".
                    </p>
                  </div>
                )}

                {/* Cuadrícula de Productos (3 columnas x 5 filas = 15 por página) */}
                {!loading && !error && paginatedProducts.length > 0 && (
                  <div className="product-grid-3col">
                    {paginatedProducts.map((p) => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        onSelect={(prod) => setSelectedProduct(prod)} 
                      />
                    ))}
                  </div>
                )}

                {/* Paginación Inferior */}
                {!loading && !error && renderPagination(false)}
              </main>
            </div>
          </div>

          {/* Modal de Detalle de Producto */}
          {selectedProduct && (
            <ProductModal 
              product={selectedProduct} 
              onClose={() => setSelectedProduct(null)} 
            />
          )}
        </>
      )}
    </div>
  );
}