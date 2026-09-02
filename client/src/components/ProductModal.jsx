import React, { useEffect, useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Store, 
  CheckCircle2, 
  Cpu, 
  HardDrive, 
  Layers, 
  Monitor, 
  ShieldCheck, 
  Tag,
  Zap,
  Activity
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
    if (s.includes('alpha')) return 'alphatec';
    if (s.includes('computer house') || s.includes('computerhouse')) return 'computerhouse';
    if (s.includes('cyc')) return 'cyccomputer';
    if (s.includes('memory') || s.includes('kings')) return 'memorykings';
    if (s.includes('pegasus')) return 'pegasus5000';
    if (s.includes('repuesto') || s.includes('laptop peru')) return 'repuestoslaptop';
    return 'default-store';
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price) || price === 0) return 'Consultar en tienda';
    return price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const specsEntries = Object.entries(product.specs || {});

  const getSpecIcon = (key = '') => {
    const k = key.toLowerCase();
    if (k.includes('procesador') || k.includes('socket') || k.includes('chipset')) return <Cpu size={16} className="spec-icon" />;
    if (k.includes('potencia') || k.includes('watts')) return <Zap size={16} className="spec-icon" />;
    if (k.includes('certificación') || k.includes('certificacion')) return <ShieldCheck size={16} className="spec-icon" />;
    if (k.includes('almacenamiento') || k.includes('disco') || k.includes('capacidad')) return <HardDrive size={16} className="spec-icon" />;
    if (k.includes('ram') || k.includes('vram') || k.includes('formato') || k.includes('tipo')) return <Layers size={16} className="spec-icon" />;
    if (k.includes('gráfico') || k.includes('video') || k.includes('gpu') || k.includes('monitor') || k.includes('sistema operativo')) return <Monitor size={16} className="spec-icon" />;
    if (k.includes('frecuencia') || k.includes('interfaz')) return <Activity size={16} className="spec-icon" />;
    return <Tag size={16} className="spec-icon" />;
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del Modal con Insignias Integradas */}
        <div className="modal-header">
          {/* Esquina Superior Izquierda: Tienda + Categoría */}
          <div className="modal-header-left">
            <span className={`modal-badge modal-store-badge ${getStoreClass(product.store)}`}>
              <Store size={13} />
              <span>{product.store || 'Tienda'}</span>
            </span>

            <span className="modal-badge modal-category-badge">
              <Tag size={13} />
              <span>{product.category || 'Hardware'}</span>
            </span>
          </div>

          {/* Esquina Superior Derecha: Estado + Botón Cerrar */}
          <div className="modal-header-right">
            <span className={`modal-badge modal-condition-badge ${product.condition?.toLowerCase().includes('usado') ? 'usado' : 'nuevo'}`}>
              <CheckCircle2 size={13} />
              <span>{product.condition || 'Nuevo'}</span>
            </span>

            <button 
              type="button" 
              className="modal-close-btn" 
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>
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
                <span className="modal-currency">PEN</span>
                <span className="modal-amount">S/ {formatPrice(product.price)}</span>
              </div>
            </div>

            {/* Ficha de Especificaciones Dinámicas */}
            {specsEntries.length > 0 && (
              <div className="modal-specs-section">
                <h4 className="specs-title">
                  <Layers size={15} />
                  <span>Especificaciones Detectadas</span>
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

            {/* Aviso de Compra */}
            <div className="modal-notice">
              <ShieldCheck size={18} className="notice-icon" />
              <p>
                Los precios y el stock corresponden a los datos extraídos en línea. Al acceder a la tienda oficial se confirmarán todas las promociones o cupones disponibles.
              </p>
            </div>

            {/* Botón de Enlace a la Tienda */}
            <a
              href={product.link && product.link !== '#' ? product.link : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-buy-btn"
            >
              <span>Ver y comprar en {product.store || 'tienda'}</span>
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
