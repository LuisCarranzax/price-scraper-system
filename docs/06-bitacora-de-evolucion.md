# Bitacora de Evolucion y Mutaciones del Sistema

Este documento recopila de manera cronologica las distintas etapas de desarrollo, cambios de requerimientos y optimizaciones aplicadas al sistema.

---

## Fase 1: Fundacion del Proyecto y Correcciones de Entorno

### Situacion Inicial
- El proyecto contaba con una estructura basica centrada casi exclusivamente en Mercado Libre.
- Existian problemas de resolucion de modulos en Python (mayusculas en `mercadoLibre_scraper.py` sin archivos `__init__.py`).
- El cliente React contenia los estilos por defecto de Vite que forzaban un ancho fijo de 1126px, centrado de texto y bordes toscos.
- La ejecucion de los servicios requeria abrir terminales manuales separadas sin coordinacion.

### Acciones Realizadas
- Creacion de paquetes Python con `__init__.py` y normalizacion de importaciones relativas y absolutas con inyeccion de `sys.path`.
- Eliminacion de estilos globales residuales (`App.css`) y adopcion de una hoja de estilos limpia en CSS nativo (`index.css` y `styles.css`).
- Configuracion del paquete raiz con `concurrently` (`npm run dev` / `bun run dev`) para levantar scraper, gateway y cliente simultaneamente con prefijos de colores.

---

## Fase 2: Rediseño de la Barra de Busqueda y Transicion de Estados

### Requerimientos
- Implementar una experiencia de transicion profesional similar a la de Google:
  - En la pagina de inicio (Home): barra de busqueda centrada vertical y horizontalmente con la pregunta "¿Que repuesto buscas hoy?" y chips interactivos.
  - Al buscar: la barra se traslada suavemente a la cabecera superior de forma fija, ocultando el mensaje de bienvenida y desplegando los resultados en cuadrícula.
- Implementar paginacion de 3 columnas por 5 filas (15 productos por pagina) y un aviso informativo sobre precios referenciales.

### Acciones Realizadas
- Creacion del componente `SearchBar.jsx` con transicion dinamica de modo "hero" a modo "compact".
- Incorporacion de la cabecera fija `.results-top-header` con boton de retorno rapido "Volver al inicio".
- Establecimiento de la cuadricula de 15 productos por pagina con paginacion numerada.

---

## Fase 3: Expansion Multi-Tienda y Filtros Inteligentes Iniciales

### Requerimientos
- Integrar mas tiendas del mercado peruano de computo (Mesajil, Alpha Technology, Computer House, Falabella, AliExpress).
- Incorporar un deslizador interactivo de precios en lugar de entradas de texto manuales.
- Solucionar el problema de titulos truncados con puntos suspensivos en las tarjetas mediante un modal de detalles.

### Acciones Realizadas
- Creacion de scrapers concurrentes en Python mediante `ThreadPoolExecutor`.
- Adicion de la libreria `lucide-react` para sustituir todos los emojis por iconos SVG limpios.
- Creacion de `ProductModal.jsx` para mostrar la publicacion sin truncar con su respectiva ficha tecnica preliminar.

---

## Fase 4: Optimizacion Anti-Bloqueo, Eliminacion de Autocompletado y Cache

### Cambios de Requerimiento y Desafios
- AliExpress y Falabella fueron retiradas debido a inconsistencias de scraping y cambios en sus APIs internas.
- Mercado Libre presento bloqueos temporales (pantallas `suspicious-traffic-frontend`).
- El autocompletado con tecla Tab fue descontinuado a peticion del usuario para optimizar la velocidad y responder exclusivamente a las teclas <kbd>Enter</kbd> o al boton "Buscar".

### Acciones Realizadas
- Migracion a `cloudscraper` en la clase base `BaseScraper` con rotacion de User-Agents y pausas inteligentes (`smart_delay`).
- Retiro del overlay de autocompletado en `SearchBar.jsx`.
- Implementacion de una capa de Cache en Memoria con TTL de 5 minutos en el Gateway de Node.js, reduciendo respuestas repetidas a menos de 4ms.
- Calculo dinamico del volumen de productos por tienda: 50 productos para 1 tienda, 35 por tienda para 2 tiendas, y 25 por tienda para 3 o mas tiendas.

---

## Fase 5: Rediseño de Filtros a Dropdowns con Checkboxes

### Requerimientos
- Reemplazar la barra lateral por un diseño compacto de menus desplegables horizontales con checkboxes de seleccion multiple.
- Cierre automatico de menus: al abrir un dropdown, cualquier otro menu abierto debe cerrarse de inmediato para evitar saturacion visual.
- Incorporar un boton expreso "Aplicar filtros" para confirmar la consulta en un unico clic.

### Acciones Realizadas
- Creacion de los dropdowns para Tiendas, Categorias, Estado y Precio Maximo con soporte de seleccion multiple en array.
- Logica de cierre automatico tipo acordeon y deteccion de clics externos mediante `useRef` y eventos de documento.
- Creacion de los botones "Aplicar filtros" y "Limpiar".

---

## Fase 6: Reincorporacion de Tiendas y Ficha Tecnica Avanzada

### Requerimientos
- Adaptar las tiendas `CYC Computer`, `Memory Kings`, `Pegasus 5000` y `Repuestos Laptop Peru` que contaban con una estructura anterior a la nueva clase `BaseScraper`.
- Resolver la confusion en la que placas madre con DDR5 se catalogaban erroneamente como "Memorias RAM".
- Agregar soporte dinamico para Fuentes de Poder (Potencia, Certificacion 80 Plus), PCs Ensambladas (RAM, SSD, Windows, Monitor), Procesadores y GPUs.
- Corregir el posicionamiento de las insignias de Tienda y Estado en el Modal, integrándolas dentro de su cabecera superior interna.

### Acciones Realizadas
- Refactorizacion completa de los 4 scrapers bajo `BaseScraper` con control de handshake SSL y extraccion en Soles.
- Reordenamiento jerarquico de `detectCategory` en `searchController.js` para priorizar Placas Madre y PCs Ensambladas.
- Reestructuracion del modal `ProductModal.jsx` y `styles.css` con cabecera interna dividida (`.modal-header-left` y `.modal-header-right`), situando las insignias de manera estatica y contenida.
