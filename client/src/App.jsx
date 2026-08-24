import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  ArrowLeft, 
  RotateCcw, 
  Info, 
  AlertTriangle, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Sparkles,
  Layers,
  Store,
  CheckCircle2,
  Filter,
  DollarSign
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

const AVAILABLE_STORES = [
  'Mercado Libre',
  'Mesajil',
  'Alpha Technology',
  'Computer House',
  'CYC Computer',
  'Memory Kings',
  'Pegasus 5000',
  'Repuestos Laptop Perú'
];

const AVAILABLE_CATEGORIES = [
  'Laptops',
  'Almacenamiento',
  'Tarjetas de Video',
  'Procesadores',
  'Memorias RAM',
  'Placas Madre',
  'Fuentes de Poder',
  'Pantallas y Monitores',
  'Accesorios y Repuestos'
];

const AVAILABLE_CONDITIONS = [
  'Nuevo',
  'Seminuevo / Usado'
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

  // Control de menú dropdown abierto (solo 1 abierto a la vez)
  const [openDropdown, setOpenDropdown] = useState(null);

  // Estados de Filtros (Borrador antes de Aplicar)
  const [selectedStores, setSelectedStores] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const filterBarRef = useRef(null);
  const resultsTopRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown(prev => prev === name ? null : name);
  };

  const handleStoreToggle = (storeName) => {
    setSelectedStores(prev => 
      prev.includes(storeName) 
        ? prev.filter(s => s !== storeName) 
        : [...prev, storeName]
    );
  };

  const handleCategoryToggle = (catName) => {
    setSelectedCategories(prev => 
      prev.includes(catName) 
        ? prev.filter(c => c !== catName) 
        : [...prev, catName]
    );
  };

  const handleConditionToggle = (condName) => {
    setSelectedConditions(prev => 
      prev.includes(condName) 
        ? prev.filter(c => c !== condName) 
        : [...prev, condName]
    );
  };

  const executeSearchRequest = (query, filtersToUse = {
    stores: selectedStores,
    categories: selectedCategories,
    conditions: selectedConditions,
    maxPrice: maxPrice,
    sortBy: sortBy
  }) => {
    if (!query || !query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    setCurrentQuery(query.trim());
    setCurrentPage(1);
    setOpenDropdown(null);

    const params = new URLSearchParams({
      q: query.trim()
    });

    if (filtersToUse.stores && filtersToUse.stores.length > 0) {
      params.append('stores', filtersToUse.stores.join(','));
    }
    if (filtersToUse.categories && filtersToUse.categories.length > 0) {
      params.append('categories', filtersToUse.categories.join(','));
    }
    if (filtersToUse.conditions && filtersToUse.conditions.length > 0) {
      params.append('conditions', filtersToUse.conditions.join(','));
    }
    if (filtersToUse.maxPrice) {
      params.append('maxPrice', filtersToUse.maxPrice);
    }
    if (filtersToUse.sortBy && filtersToUse.sortBy !== 'default') {
      params.append('sortBy', filtersToUse.sortBy);
    }

    fetch(`http://localhost:5000/api/search?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al conectar con el servidor');
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
        setError('No se pudo conectar con el motor de scraping. Verifica que el backend esté ejecutándose.');
        setProducts([]);
        setLoading(false);
      });
  };

  const handleSearch = (query) => {
    executeSearchRequest(query);
  };

  const handleApplyFilters = () => {
    setOpenDropdown(null);
    if (currentQuery) {
      executeSearchRequest(currentQuery);
    }
  };

  const handleResetFilters = () => {
    setSelectedStores([]);
    setSelectedCategories([]);
    setSelectedConditions([]);
    setMaxPrice('');
    setSortBy('default');
    setOpenDropdown(null);
    if (currentQuery) {
      executeSearchRequest(currentQuery, {
        stores: [],
        categories: [],
        conditions: [],
        maxPrice: '',
        sortBy: 'default'
      });
    }
  };

  const handleBackToHome = () => {
    setSearched(false);
    setCurrentQuery('');
    setProducts([]);
    setError(null);
    setCurrentPage(1);
    setSelectedProduct(null);
    setOpenDropdown(null);
    setSelectedStores([]);
    setSelectedCategories([]);
    setSelectedConditions([]);
    setMaxPrice('');
    setSortBy('default');
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

  const sliderMaxBound = Math.max(meta.highestPrice || 10000, 1000);
  const currentSliderValue = maxPrice !== '' ? Number(maxPrice) : sliderMaxBound;

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
                <strong>Aviso sobre Precios:</strong> Los precios mostrados son extraídos por scraping de fuentes públicas. Promociones o cupones de cada tienda se confirmarán al pulsar <em>"Ver en tienda"</em>.
              </div>
            </div>

            {/* BARRA DE FILTROS REDISEÑADA: DROPDOWNS CON CHECKBOXES Y BOTÓN APLICAR */}
            <div className="filter-dropdowns-bar" ref={filterBarRef}>
              <div className="filter-dropdowns-group">
                {/* 1. Dropdown Tiendas */}
                <div className="dropdown-wrapper">
                  <button
                    type="button"
                    className={`dropdown-trigger-btn ${selectedStores.length > 0 ? 'active' : ''}`}
                    onClick={() => toggleDropdown('stores')}
                  >
                    <Store size={14} />
                    <span>
                      Tiendas {selectedStores.length > 0 ? `(${selectedStores.length})` : ''}
                    </span>
                    <ChevronDown size={14} className={`dropdown-chevron ${openDropdown === 'stores' ? 'open' : ''}`} />
                  </button>

                  {openDropdown === 'stores' && (
                    <div className="dropdown-menu-card">
                      <div className="dropdown-menu-header">
                        <span>Seleccionar Tiendas</span>
                      </div>
                      <div className="dropdown-options-list">
                        {AVAILABLE_STORES.map(storeName => (
                          <label key={storeName} className="checkbox-option-row">
                            <input
                              type="checkbox"
                              checked={selectedStores.includes(storeName)}
                              onChange={() => handleStoreToggle(storeName)}
                            />
                            <span>{storeName}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Dropdown Categorías */}
                <div className="dropdown-wrapper">
                  <button
                    type="button"
                    className={`dropdown-trigger-btn ${selectedCategories.length > 0 ? 'active' : ''}`}
                    onClick={() => toggleDropdown('categories')}
                  >
                    <Layers size={14} />
                    <span>
                      Categorías {selectedCategories.length > 0 ? `(${selectedCategories.length})` : ''}
                    </span>
                    <ChevronDown size={14} className={`dropdown-chevron ${openDropdown === 'categories' ? 'open' : ''}`} />
                  </button>

                  {openDropdown === 'categories' && (
                    <div className="dropdown-menu-card">
                      <div className="dropdown-menu-header">
                        <span>Filtrar por Categoría</span>
                      </div>
                      <div className="dropdown-options-list">
                        {AVAILABLE_CATEGORIES.map(catName => (
                          <label key={catName} className="checkbox-option-row">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(catName)}
                              onChange={() => handleCategoryToggle(catName)}
                            />
                            <span>{catName}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Dropdown Estado */}
                <div className="dropdown-wrapper">
                  <button
                    type="button"
                    className={`dropdown-trigger-btn ${selectedConditions.length > 0 ? 'active' : ''}`}
                    onClick={() => toggleDropdown('conditions')}
                  >
                    <CheckCircle2 size={14} />
                    <span>
                      Estado {selectedConditions.length > 0 ? `(${selectedConditions.length})` : ''}
                    </span>
                    <ChevronDown size={14} className={`dropdown-chevron ${openDropdown === 'conditions' ? 'open' : ''}`} />
                  </button>

                  {openDropdown === 'conditions' && (
                    <div className="dropdown-menu-card">
                      <div className="dropdown-menu-header">
                        <span>Estado del Producto</span>
                      </div>
                      <div className="dropdown-options-list">
                        {AVAILABLE_CONDITIONS.map(condName => (
                          <label key={condName} className="checkbox-option-row">
                            <input
                              type="checkbox"
                              checked={selectedConditions.includes(condName)}
                              onChange={() => handleConditionToggle(condName)}
                            />
                            <span>{condName}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Dropdown Rango de Precio con Slider */}
                <div className="dropdown-wrapper">
                  <button
                    type="button"
                    className={`dropdown-trigger-btn ${maxPrice !== '' ? 'active' : ''}`}
                    onClick={() => toggleDropdown('price')}
                  >
                    <DollarSign size={14} />
                    <span>
                      {maxPrice !== '' ? `Hasta S/ ${Number(maxPrice).toLocaleString('es-PE')}` : 'Precio Máximo'}
                    </span>
                    <ChevronDown size={14} className={`dropdown-chevron ${openDropdown === 'price' ? 'open' : ''}`} />
                  </button>

                  {openDropdown === 'price' && (
                    <div className="dropdown-menu-card slider-dropdown-card">
                      <div className="dropdown-menu-header">
                        <span>Rango de Precio</span>
                        <span className="slider-badge-val">Hasta S/ {currentSliderValue.toLocaleString('es-PE')}</span>
                      </div>
                      <div className="slider-control-box">
                        <input
                          type="range"
                          min="0"
                          max={sliderMaxBound}
                          step="50"
                          value={currentSliderValue}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="custom-range-slider"
                        />
                        <div className="slider-limits">
                          <span>S/ 0</span>
                          <span>S/ {sliderMaxBound.toLocaleString('es-PE')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón Aplicar Filtros */}
                <button
                  type="button"
                  className="apply-filters-btn"
                  onClick={handleApplyFilters}
                  title="Aplicar filtros seleccionados"
                >
                  <Filter size={14} />
                  <span>Aplicar filtros</span>
                </button>

                {/* Botón Limpiar */}
                {(selectedStores.length > 0 || selectedCategories.length > 0 || selectedConditions.length > 0 || maxPrice !== '') && (
                  <button
                    type="button"
                    className="reset-filters-btn"
                    onClick={handleResetFilters}
                    title="Limpiar todos los filtros"
                  >
                    <RotateCcw size={13} />
                    <span>Limpiar</span>
                  </button>
                )}
              </div>

              {/* Selector de Orden */}
              <div className="sort-inline-box">
                <label htmlFor="sort-select" className="sort-label">Ordenar:</label>
                <select
                  id="sort-select"
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    if (currentQuery) {
                      executeSearchRequest(currentQuery, {
                        stores: selectedStores,
                        categories: selectedCategories,
                        conditions: selectedConditions,
                        maxPrice: maxPrice,
                        sortBy: e.target.value
                      });
                    }
                  }}
                >
                  <option value="default">Relevancia</option>
                  <option value="price_asc">Menor precio</option>
                  <option value="price_desc">Mayor precio</option>
                  <option value="name_asc">Nombre (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Contenedor de Resultados */}
            <main className="results-container">
              {/* Toolbar de Información */}
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
                </div>
              )}

              {/* Paginación Superior */}
              {!loading && !error && renderPagination(true)}

              {/* Estado: Cargando */}
              {loading && (
                <div className="state-container">
                  <div className="spinner"></div>
                  <h3 className="state-title">Extrayendo y comparando precios en tiempo real...</h3>
                  <p className="state-desc">
                    Consultando Mercado Libre, Mesajil, Alpha Technology y Computer House para "{currentQuery}".
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
                    No encontramos coincidencias para "{currentQuery}" con los filtros seleccionados. Intenta ampliar el rango de precio o seleccionar más tiendas.
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