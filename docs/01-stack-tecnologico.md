# Stack Tecnologico del Sistema

Este documento describe en detalle la arquitectura tecnica y las tecnologias implementadas en cada capa de la plataforma de comparacion de precios mediante web scraping.

---

## 1. Arquitectura General del Sistema

El sistema opera bajo un patron de arquitectura desacoplada en tres capas principales:

1. **Frontend (Capa de Presentacion)**: Interfaz de usuario reactiva desarrollada en React 19 y empaquetada con Vite.
2. **Gateway Server (Capa de Orquestacion y Cache)**: Servidor intermediario en Node.js con Express que centraliza peticiones, gestiona la cache en memoria, aplica filtros y normaliza las respuestas.
3. **Motor de Scraping (Capa de Extraccion)**: Servicio independiente de alto rendimiento en Python con FastAPI y Cloudscraper, especializado en la extraccion concurrente y evasion de bloqueos web.

```
[ Cliente Web (React + Vite) ]
             |
             v  HTTP / JSON (Puerto 5173 -> 5000)
[ Gateway Server (Node.js + Express + Cache) ]
             |
             v  HTTP / JSON (Puerto 5000 -> 8000)
[ Motor de Scraping (Python + FastAPI + Cloudscraper) ]
             |
             +---> [ Mercado Libre ]
             +---> [ Mesajil ]
             +---> [ Alpha Technology ]
             +---> [ Computer House ]
             +---> [ CYC Computer ]
             +---> [ Memory Kings ]
             +---> [ Pegasus 5000 ]
             +---> [ Repuestos Laptop Peru ]
```

---

## 2. Frontend (Cliente Web)

- **Libreria Principal**: React 19 (`react`, `react-dom`).
- **Herramienta de Construccion**: Vite 8.x con `@vitejs/plugin-react`.
- **Iconografia**: Lucide React (`lucide-react`). Se utilizan exclusivamente componentes SVG nativos, prescindiendo de emojis para mantener una estetica profesional y formal.
- **Estilos**: CSS puro modular y variables CSS nativas (`styles.css` e `index.css`). Se evito explicitamente el uso de Tailwind CSS u otras librerias externas de utilidades para asegurar control total sobre animaciones, adaptabilidad y rendimiento de renderizado.
- **Manejo de Estado**: Estado local mediante hooks nativos de React (`useState`, `useEffect`, `useRef`).

---

## 3. Gateway Server (Backend Intermediario)

- **Entorno de Ejecucion**: Node.js (compatible con Bun y Node v18+).
- **Modulo de Servidor**: Express 4.x configurado en formato ECMAScript Modules (`"type": "module"`).
- **Seguridad y Accesibilidad**: Middleware `cors` para habilitar el consumo seguro entre origenes cruzados.
- **Sistema de Cache en Memoria**: Implementacion personalizada con `Map` y politica de expiracion TTL (Time-To-Live) de 5 minutos, protegiendo a los servicios de origen contra saturacion por consultas identicas.
- **Analizador Semantico de Especificaciones**: Algoritmo de expresiones regulares para deteccion jerarquica de categorias y parseo dinamico de especificaciones tecnicas (CPU, RAM, Almacenamiento, GPU, Potencia, Socket, etc.).

---

## 4. Motor de Scraping (Python Engine)

- **Lenguaje**: Python 3.11+.
- **Framework Web**: FastAPI 0.110+.
- **Servidor ASGI**: Uvicorn con recarga en caliente para desarrollo.
- **Cliente HTTP y Evasion Anti-Bot**:
  - `cloudscraper` (version 1.2.71+): Diseñado para gestionar retos JavaScript y comprobaciones WAF/Cloudflare.
  - `requests` (version 2.31+): Manejo de sesiones y transferencias con soporte de cabeceras personalizadas.
- **Parseo de Documentos HTML**: BeautifulSoup4 (`bs4`) con el analizador `html.parser`.
- **Validacion de Esquemas**: Pydantic v2.
- **Concurrencia**: `ThreadPoolExecutor` de la biblioteca estandar `concurrent.futures` para ejecutar hasta 8 tareas simultaneas de scraping en paralelo.

---

## 5. Herramientas de Desarrollo y Automatizacion

- **Gestor de Paquetes y Runtime**: Bun / Node.js npm.
- **Ejecucion Concurrente**: `concurrently` configurado en el `package.json` raiz para iniciar scraper, servidor y cliente desde un solo comando.
- **Scripts de Automatizacion**: Scripts por lotes `.bat` para instalacion y despliegue en sistemas Windows.
- **Contenedorizacion**: Docker y Docker Compose para empaquetado y aislamiento completo de servicios.
