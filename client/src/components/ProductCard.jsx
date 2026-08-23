import React, { useState } from 'react';
import { ExternalLink, Eye, Store, CheckCircle2 } from 'lucide-react';

const DEFAULT_PLACEHOLDER_IMG = 'https://placehold.co/300x200/f1f5f9/94a3b8?text=Hardware';

export default function ProductCard({ product, onSelect }) {
  const [imgError, setImgError] = useState(false);

  const getStoreClass = (store = '') => {
    const s = store.toLowerCase();
    if (s.includes('mercado libre') || s.includes('mercadolibre')) return 'mercadolibre';
    if (s.includes('mesajil')) return 'mesajil';
    if (s.includes('falabella')) return 'falabella';
    if (s.includes('alpha')) return 'alphatec';
    if (s.includes('computer')) return 'computerhouse';
    if (s.includes('aliexpress')) return 'aliexpress';
    return 'default-store';
  };

  const getConditionClass = (condition = '') => {
    const c = condition.toLowerCase();
    if (c.includes('usado') || c.includes('seminuevo') || c.includes('repuesto')) return 'usado';
    return 'nuevo';
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price) || price === 0) return 'Consultar';
    return price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(product);
    }
  };

  return (
    <article className="product-card" onClick={handleCardClick}>
      <div className="product-image-container">
        <span className={`store-badge ${getStoreClass(product.store)}`}>
          <Store size={11} />
          <span>{product.store || 'Tienda'}</span>
        </span>

        <span className={`condition-badge ${getConditionClass(product.condition)}`}>
          <CheckCircle2 size={11} />
          <span>{product.condition || 'Nuevo'}</span>
        </span>

        <img
          src={imgError || !product.image ? DEFAULT_PLACEHOLDER_IMG : product.image}
          alt={product.title}
          className="product-image"
          loading="lazy"
          onError={() => setImgError(true)}
        />

        <div className="card-quick-hover">
          <Eye size={16} />
          <span>Ver detalles completos</span>
        </div>
      </div>

      <div className="product-info">
        <h3 className="product-title" title={product.title}>
          {product.title}
        </h3>

        <div className="price-section">
          <span className="price-currency">S/</span>
          <span className="product-price">{formatPrice(product.price)}</span>
        </div>

        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="product-details-btn"
            onClick={handleCardClick}
          >
            <Eye size={14} />
            <span>Detalles</span>
          </button>

          <a
            href={product.link && product.link !== '#' ? product.link : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="product-link"
          >
            <span>Tienda</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </article>
  );
}