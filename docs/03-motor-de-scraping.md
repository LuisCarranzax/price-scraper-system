# Motor de Scraping y Evasion de Bloqueos

Este documento detalla la arquitectura tecnica interna del motor de scraping implementado en Python, sus estrategias de evasión de sistemas anti-bot y la implementacion de las 8 tiendas integradas.

---

## 1. Arquitectura de la Clase Base (`BaseScraper`)

Todos los scrapers del sistema heredan de la clase abstracta `BaseScraper`, definida en `scraper_engine/scrapers/base_scraper.py`. Dicha clase centraliza los mecanismos criticos:

- **Instancia de Cloudscraper**: En lugar de utilizar peticiones estandar de `requests` (que son rechazadas inmediatamente por retos de Cloudflare o Akamai), se crea una instancia configurada para emular un navegador Google Chrome de escritorio sobre entorno Windows.
- **Pool de User-Agents Rotativos**: Conjunto de cabeceras de navegadores modernos reales (Chrome, Firefox, Safari, Edge) que se seleccionan aleatoriamente en cada solicitud HTTP:
  ```python
  USER_AGENTS_POOL = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
      ...
  ]
  ```
- **Pausas Inteligentes (`smart_delay`)**: Retardos pseudoaleatorios con distribucion continua (`random.uniform(min_s, max_s)`) insertados antes de emitir solicitudes para dispersar patrones de trafico automatizado.
- **Analizador Numerico de Precios (`parse_smart_price`)**: Algoritmo robusto que resuelve discrepancias entre separadores de miles y decimales comunes en Peru (por ejemplo: `S/ 1,099.00`, `S/ 1.099`, `S/ 932.96`, `S/. 361.00`, `145,00`), retornando un flotante normalizado.

---

## 2. Tiendas Integradas y Caracteristicas de Extraccion

### 1. Mercado Libre (`mercadolibre_scraper.py`)
- **Estructura**: Catalogo con componentes `.poly-card` y `li.ui-search-layout__item`.
- **Estrategia Anti-Bloqueo**: Normalizacion del termino a minusculas con guiones (`ssd-kingston`). Cuando Mercado Libre devuelve retos WAF (`suspicious-traffic-frontend`), se activa una peticion de contingencia con cabecera de rastreador indexador que entrega la vista publica completa.
- **Campos**: Titulo completo, identificador MPE, precio formateado, condicion (Nuevo / Seminuevo) y enlace oficial.

### 2. Mesajil Hermanos (`mesajil_scraper.py`)
- **Plataforma**: WooCommerce de alto volumen.
- **Selectores**: `.wd-product`, `.limited-lines`, `.price ins .woocommerce-Price-amount`.
- **Rendimiento**: Retorno constante de 20 a 35 productos en menos de 2.5 segundos con fotos en alta resolucion y precios en moneda local.

### 3. Alpha Technology (`alphatec_scraper.py`)
- **Plataforma**: Comercio electronico para hardware gamer y componentes de gama alta.
- **Selectores**: `.product`, `.product-small`, `.woocommerce-Price-amount`.

### 4. Computer House (`computerhouse_scraper.py`)
- **Plataforma**: Distribuidor mayorista y minorista de computo en Lima.
- **Selectores**: `.product-title`, `.price`, `.product-type-simple`.

### 5. CYC Computer (`cycComputer_scraper.py`)
- **Plataforma**: PrestaShop con visualizacion dual de precios (Dolares y Soles).
- **Tratamiento Especial**: Extraccion prioritaria del precio equivalente en Soles mediante regex `r'S/[\s]*([\d.,]+)'` sobre las etiquetas `.laber-product-price-and-shipping`.

### 6. Memory Kings (`memoryKings_scraper.py`)
- **Plataforma**: Tienda lider de tecnologia en Peru con proteccion estricta HTTP 403.
- **Tratamiento Especial**: Emulacion de sesion mediante `requests.Session()` con cabeceras de navegacion completa (`Accept-Encoding: gzip, deflate, br`) y extraccion tanto de precio regular como de precio rebajado en `.price-before`.

### 7. Pegasus 5000 (`pegasus5000_scraper.py`)
- **Plataforma**: Distribuidora de perifericos y componentes en Lima.
- **Tratamiento Especial**: Neutralizacion de excepciones por apreton de manos SSL (`SSLV3_ALERT_HANDSHAKE_FAILURE`) manteniendo la integridad de extraccion.

### 8. Repuestos Laptop Peru (`repuestoslaptopperu_scraper.py`)
- **Plataforma**: Portal especializado en repuestos tecnicos (teclados, pantallas, baterias, cargadores).
- **Tratamiento Especial**: Limpieza de URLs de imagenes procedentes del CDN de WordPress/Jetpack (`i0.wp.com`), removiendo sufijos de recorte y resolucion para enlazar a la foto original.

---

## 3. Politica de Cantidad Dinamica de Productos

Para equilibrar el tiempo de respuesta total y no sobrecargar los servidores destino, el sistema calcula de forma reactiva la cuota de productos requerida:

| Tiendas Seleccionadas | Limite por Tienda | Volumen Estimado Total |
| :--- | :--- | :--- |
| 1 tienda especifica | 50 productos | ~50 productos |
| 2 tiendas especificas | 35 productos | ~70 productos |
| 3 o mas tiendas / Todas | 25 productos | ~100 - 150 productos |

---

## 4. Cache en Memoria del Gateway

En `server/src/services/scraperService.js`, se mantiene una estructura `Map` con clave combinada:
```
cache_${query}_${stores}_${limit}
```
- **Tiempo de Vida (TTL)**: 5 minutos (300,000 milisegundos).
- **Impacto de Rendimiento**: Respuestas a busquedas identicas reducen su latencia de ~3.5 segundos a menos de 4 milisegundos.
- **Mecanismo de Salvaguarda**: Si un scraper experimenta caida de red temporal pero existe una entrada previa en cache, el sistema entrega los datos cacheados con una advertencia en el log.
