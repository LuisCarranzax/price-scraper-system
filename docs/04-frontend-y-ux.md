# Diseño Frontend y Experiencia de Usuario (UX/UI)

Este documento describe la evolucion visual, los componentes interactivos y los principios de diseño aplicados en el cliente web React.

---

## 1. Principios de Diseño Visual

- **Ausencia de Frameworks CSS de Terceros**: El diseño se construyo íntegramente en CSS nativo estructurado (`client/src/assets/styles.css`), garantizando independencia total de librerias como Tailwind o Bootstrap.
- **Iconografia Vectorial Profesional**: Se erradico completamente el uso de emojis en botones, titulos y etiquetas. En su lugar, se utilizan componentes SVG de la suite `lucide-react` con colores tematicos coherentes (`Search`, `SlidersHorizontal`, `Zap`, `Store`, `CheckCircle2`, `Cpu`, `Layers`, `ExternalLink`, etc.).
- **Paleta de Identidad Cromatica**: Cada tienda dispone de variables CSS exclusivas para sus insignias, permitiendo una identificacion inmediata del comercio en las tarjetas:
  - Mercado Libre: `#ffe600` (texto `#2d3277`)
  - Mesajil: `#1e40af` (texto `#ffffff`)
  - Alpha Technology: `#7c3aed` (texto `#ffffff`)
  - Computer House: `#0891b2` (texto `#ffffff`)
  - CYC Computer: `#0284c7` (texto `#ffffff`)
  - Memory Kings: `#dc2626` (texto `#ffffff`)
  - Pegasus 5000: `#4f46e5` (texto `#ffffff`)
  - Repuestos Laptop Peru: `#059669` (texto `#ffffff`)

---

## 2. Transicion de Estados Estilo Google

La aplicacion implementa dos modos de visualizacion complementarios sin recargar la pagina:

### Vista 1: Modo Inicial (Home Centrado)
- Presentacion minimalista inspirada en buscadores lideres.
- Barra de busqueda de gran tamaño centrada vertical y horizontalmente.
- Mensaje orientativo: "¿Que repuesto buscas hoy?".
- Chips interactivos de busquedas populares ("SSD Kingston 1TB", "RTX 4060 8GB", "Ryzen 7 5700X", etc.) que ejecutan la consulta con un solo clic.

### Vista 2: Modo Resultados (Header Superior Fijo)
- Al enviar la busqueda, la interfaz anima la barra hacia la parte superior, fijandola de forma permanente mediante `position: sticky; top: 0; z-index: 100;`.
- Se despliega el boton "Volver al inicio" junto al logotipo institucional.
- Aparecen el banner informativo sobre precios, la barra de filtros desplegables y la cuadricula de productos.

---

## 3. Rediseño de Filtros: Dropdowns con Checkboxes y Cierre Automatico

A diferencia de las barras laterales estaticas que consumen excesivo ancho util en pantallas convencionales, se adopto una barra horizontal de menus desplegables interactivos:

- **Menus Desplegables**:
  - **Tiendas**: Checkboxes para las 8 tiendas soportadas.
  - **Categorias**: Checkboxes para las 9 categorias de hardware identificadas.
  - **Estado**: Checkboxes para clasificar productos Nuevos y Seminuevos/Usados.
  - **Precio Maximo**: Deslizador de rango interactivo que adapta sus limites superior e inferior de acuerdo a los precios reales del catalogo obtenido.
- **Comportamiento Tipo Acordeon**: Al abrir un menu desplegable o interactuar con el mismo, cualquier otro menu abierto se cierra de inmediato, impidiendo la saturacion visual.
- **Boton "Aplicar Filtros"**: Permite que el usuario marque o desmarque multiples opciones comodamente y confirme la aplicacion en un unico evento sin provocar peticiones redundantes.
- **Boton "Limpiar"**: Restaura los filtros a su estado inicial.

---

## 4. Modal de Informacion Completa y Solucion a Titulos Truncados

En las tarjetas de la cuadricula, los titulos excesivamente extensos se limitan a 2 lineas con elipsis para mantener la uniformidad de altura del catalogo. Para acceder a la informacion completa, se creo `ProductModal.jsx`:

- **Insignias Integradas en la Cabecera**:
  - Esquina superior izquierda interna: Insignia de la Tienda de origen y etiqueta de la Categoria detectada.
  - Esquina superior derecha interna: Insignia de Estado del producto ("Nuevo" / "Seminuevo") y boton de cierre "X".
- **Visualizacion Completa del Titulo**: Texto íntegro del articulo sin truncamiento ni recortes.
- **Ficha Tecnica Dinamica**: Desglose de especificaciones detectadas mediante iconos semanticos propios para procesador, memoria, almacenamiento, interfaz y potencia.
- **Boton de Accion Directo**: Boton de alta jerarquia visual para navegar hacia la publicacion oficial en pestaña independiente (`target="_blank" rel="noopener noreferrer"`).
- **Accesibilidad**: Cierre mediante clic en el fondo difuminado (backdrop blur) o pulsando la tecla <kbd>Escape</kbd>.

---

## 5. Paginacion Dual

- **Estructura de Cuadrícula**: Distribucion fija de 3 columnas por 5 filas, totalizando exactamente 15 productos por pagina.
- **Navegacion Duplicada**: Controles de paginacion ubicados tanto en la cabecera de los resultados (para agilidad de exploracion) como al pie de pagina.
- **Desplazamiento Automatico**: Al cambiar de pagina, la vista realiza un desplazamiento suave hacia la parte superior de los resultados.
