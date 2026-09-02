# Finalidad y Alcance del Proyecto

Este documento describe los objetivos comerciales, tecnicos y funcionales que fundamentan la creacion de la plataforma de comparacion de precios mediante web scraping.

---

## 1. Problema Identificado

En el sector de reparacion tecnica de computadoras, ensamblaje de estaciones de trabajo y adquisicion de componentes electronicos en Peru, los usuarios tecnicos y compradores enfrentan una serie de dificultades recurrentes:

- **Fragmentacion de Catalogos**: Las tiendas especializadas no comparten un punto de encuentro unico de consulta, obligando a los usuarios a abrir de 6 a 12 pestañas simultaneas para corroborar precios, especificaciones y disponibilidad.
- **Variabilidad de Precios**: La misma pieza de hardware (por ejemplo, una memoria RAM DDR4/DDR5, un SSD NVMe o una pantalla de reemplazo para laptop) presenta fluctuaciones significativas entre plataformas de terceros (como Mercado Libre) y distribuidores directos (como Mesajil, Memory Kings o CYC Computer).
- **Perdida de Productividad**: El proceso de cotizacion manual para presupuestos de servicio tecnico consume un tiempo valioso y es propenso a errores humanos.
- **Opacidad en Descuentos**: Con frecuencia se confunden precios en dolares, comisiones de pasarelas de pago o promociones especiales que requieren ser revisadas en la tienda final.

---

## 2. Objetivo Principal

Construir una plataforma centralizada y de respuesta rapida que consolide en tiempo real los catalogos de las principales tiendas de tecnologia del mercado peruano, proporcionando:

1. **Consulta Unificada**: Un solo campo de busqueda que dispare peticiones concurrentes a todas las tiendas integradas.
2. **Comparacion Inteligente**: Ordenamiento por menor y mayor precio, destacando el mejor costo unitario disponible.
3. **Normalizacion Monetaria**: Conversion y presentacion uniforme en moneda local (Soles peruanos - PEN).
4. **Filtros Avanzados sin Recarga**: Capacidad de acotar resultados por tiendas especificas, categorias de hardware, estado del producto (nuevo/usado) y techo presupuestario con un deslizador continuo.
5. **Transparencia en la Compra**: Enlace directo a la publicacion oficial del producto para confirmar stock y completar la adquisicion de forma segura.

---

## 3. Publico Objetivo

- **Tecnicos de Hardware y Reparacion de Laptops**: Profesionales que requieren cotizar repuestos especificos (teclados, pantallas, baterias, cables flex) con rapidez para generar presupuestos a clientes.
- **Ensambladores de PCs**: Usuarios que buscan optimizar el costo total de una torre gamer o estacion de trabajo combinando piezas de diferentes tiendas.
- **Entusiastas y Consumidores Finales**: Compradores que desean adquirir productos tecnologicos al menor precio de mercado sin invertir horas en investigacion manual.

---

## 4. Alcance del Sistema

### Alcance Incluido
- Extraccion en tiempo real de 8 tiendas comerciales activas en Peru.
- Filtrado multidimensional con persistencia y aplicacion por demanda.
- Paginacion dual fija (3 columnas por 5 filas, 15 productos por pagina).
- Modal interactivo de alta definicion con visualizacion de ficha tecnica desglosada y titulo completo sin truncamiento.
- Proteccion contra denegacion de servicio y bloqueos WAF mediante tecnicas de rotacion y cache.

### Fuera de Alcance
- Procesamiento directo de pagos o pasarela transaccional (la compra final se efectua siempre en el portal del vendedor).
- Modificacion de inventario o bases de datos de las tiendas externas.
- Garantia sobre politicas de devolucion o tiempos de despacho de terceros.
