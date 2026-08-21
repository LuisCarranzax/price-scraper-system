import React, { useState } from 'react';

const DEFAULT_PLACEHOLDER_IMG = 'https://placehold.co/300x200/f1f5f9/94a3b8?text=Hardware';

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);

  const getStoreClass = (store) => {
    if (!store) return 'default-store';
    const s = store.toLowerCase();
    if (s.includes('mercado libre') || s.includes('mercadolibre')) return 'mercadolibre';
    if (s.includes('falabella')) return 'falabella';
    return 'default-store';
  };

  const getConditionClass = (condition) => {
    if (!condition) return 'nuevo';
    const c = condition.toLowerCase();
    if (c.includes('usado') || c.includes('seminuevo') || c.includes('repuesto')) return 'usado';
    return 'nuevo';
  };

  // Formato monetario con separador de miles
  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price) || price === 0) return 'Consultar';
    return price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <article className="product-card">
      <div className="product-image-container">
        <span className={`store-badge ${getStoreClass(product.store)}`}>
          {product.store || 'Tienda'}
        </span>
        <span className={`condition-badge ${getConditionClass(product.condition)}`}>
          {product.condition || 'Nuevo'}
        </span>
        <img
          src={imgError || !product.image ? DEFAULT_PLACEHOLDER_IMG : product.image}
          alt={product.title}
          className="product-image"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>

      <div className="product-info">
        <h3 className="product-title" title={product.title}>
          {product.title}
        </h3>

        <div className="price-section">
          <span className="price-currency">{product.currency || 'S/'}</span>
          <span className="product-price">{formatPrice(product.price)}</span>
        </div>

        <a
          href={product.link && product.link !== '#' ? product.link : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="product-link"
        >
          <span>Ver en tienda</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>
    </article>
  );
}