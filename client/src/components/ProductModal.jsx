import React, { useEffect, useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Store, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  HardDrive, 
  Layers, 
  Monitor, 
  ShieldCheck, 
  Tag 
} from 'lucide-react';

const DEFAULT_PLACEHOLDER_IMG = 'https://placehold.co/400x300/f1f5f9/94a3b8?text=Producto';

export default function ProductModal({ product, onClose }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

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

  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price) || price === 0) return 'Consultar en tienda';
    return price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const specsEntries = Object.entries(product.specs || {});

  const getSpecIcon = (key) => {
    switch (key.toLowerCase()) {
      case 'procesador': return <Cpu size={16} className="spec-icon" />;
      case 'almacenamiento': return <HardDrive size={16} className="spec-icon" />;
      case 'memoria ram': return <Layers size={16} className="spec-icon" />;
      case 'gráficos': return <Monitor size={16} className="spec-icon" />;
      default: return <Tag size={16} className="spec-icon" />;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del Modal */}
        <div className="modal-header">
          <div className="modal-badges-group">
            <span className={`store-badge ${getStoreClass(product.store)}`}>
              <Store size={12} />
              <span>{product.store || 'Tienda'}</span>
            </span>

            <span className="category-badge">
              <Tag size={12} />
              <span>{product.category || 'Hardware'}</span>
            </span>

            <span className={`condition-badge ${product.condition?.toLowerCase().includes('usado') ? 'usado' : 'nuevo'}`}>
              <CheckCircle2 size={12} />
              <span>{product.condition || 'Nuevo'}</span>
            </span>
          </div>

          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="modal-body">
          {/* Imagen Grande */}
          <div className="modal-image-wrapper">
            <img
              src={imgError || !product.image ? DEFAULT_PLACEHOLDER_IMG : product.image}
              alt={product.title}
              className="modal-product-img"
              onError={() => setImgError(true)}
            />
          </div>

          {/* Información y Especificaciones */}
          <div className="modal-details">
            <h2 className="modal-product-title">
              {product.title}
            </h2>

            <div className="modal-price-box">
              <span className="modal-price-label">Precio extraído:</span>
              <div className="modal-price-value">
                <span className="modal-currency">{product.currency || 'PEN'}</span>
                <span className="modal-amount">S/ {formatPrice(product.price)}</span>
              </div>
            </div>

            {/* Ficha de Especificaciones Detectadas */}
            {specsEntries.length > 0 && (
              <div className="modal-specs-section">
                <h4 className="specs-title">
                  <Layers size={15} />
                  <span>Especificaciones Técnicas Clave</span>
                </h4>
                <div className="specs-grid">
                  {specsEntries.map(([key, val]) => (
                    <div key={key} className="spec-item">
                      <span className="spec-label">
                        {getSpecIcon(key)}
                        {key}:
                      </span>
                      <strong className="spec-value">{val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aviso de Compra Segura */}
            <div className="modal-notice">
              <ShieldCheck size={18} className="notice-icon" />
              <p>
                Los precios y el stock están sujetos a verificación en la tienda oficial. Podrán aplicarse descuentos por métodos de pago al concretar la compra.
              </p>
            </div>

            {/* Botón de Enlace a la Tienda */}
            <a
              href={product.link && product.link !== '#' ? product.link : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-buy-btn"
            >
              <span>Ver y comprar en {product.store || 'tienda oficial'}</span>
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
