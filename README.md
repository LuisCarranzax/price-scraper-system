# Price Scraper System

Sistema web de busqueda inteligente y comparacion de precios en tiempo real mediante web scraping, orientado al mercado de hardware, computo y repuestos electronicos en Peru.

---

## 1. Descripcion y Finalidad

Price Scraper System es una solucion integral diseñada para simplificar y acelerar el proceso de cotizacion de componentes de computadoras, repuestos de laptops y productos tecnologicos. 

En lugar de requerir que el usuario abra decenas de pestañas de navegacion simultaneas para corroborar precios entre distribuidores y plataformas de terceros, este sistema centraliza las consultas en una unica interfaz reactiva, extrayendo en paralelo los catalogos de las tiendas mas representativas, normalizando los precios en moneda local (Soles - PEN) y estructurando fichas tecnicas dinamicas.

### Tiendas Integradas
- Mercado Libre Peru
- Mesajil Hermanos
- Alpha Technology
- Computer House
- CYC Computer
- Memory Kings
- Pegasus 5000
- Repuestos Laptop Peru

---

## 2. Estructura del Proyecto

El repositorio esta organizado como un monorepositorio modular dividido en microservicios desacoplados:

```
price-scraper-system/
├── client/                     # Capa Frontend (React 19 + Vite + Lucide React)
│   ├── src/
│   │   ├── assets/
│   │   │   └── styles.css      # Estilos visuales en CSS nativo y variables CSS
│   │   ├── components/
│   │   │   ├── SearchBar.jsx   # Barra de busqueda con transicion de estados
│   │   │   ├── ProductCard.jsx # Tarjeta de producto con insignias por tienda
│   │   │   └── ProductModal.jsx# Modal de detalle con ficha tecnica dinamica
│   │   ├── App.jsx             # Componente principal, filtros y paginacion
│   │   ├── index.css           # Reseteo CSS base
│   │   └── main.jsx            # Punto de entrada de React
│   ├── package.json            # Dependencias del cliente
│   ├── Dockerfile              # Empaquetado Docker para produccion
│   └── vite.config.js          # Configuracion de Vite
│
├── server/                     # Capa Gateway Intermediaria (Node.js + Express)
│   ├── src/
│   │   ├── controllers/
│   │   │   └── searchController.js # Deteccion de categorias y specs tecnicas
│   │   ├── routes/
│   │   │   └── searchRoutes.js     # Rutas de la API Gateway (/api/search)
│   │   ├── services/
│   │   │   └── scraperService.js   # Orquestacion y cache en memoria (TTL 5 min)
│   │   └── server.js               # Servidor Express escuchando en puerto 5000
│   ├── package.json            # Dependencias del servidor Gateway
│   └── Dockerfile              # Empaquetado Docker para Node.js
│
├── scraper_engine/             # Capa de Extraccion (Python + FastAPI + Cloudscraper)
│   ├── scrapers/
│   │   ├── base_scraper.py     # Clase abstracta con evasion WAF y pausas
│   │   ├── mercadolibre_scraper.py
│   │   ├── mesajil_scraper.py
│   │   ├── alphatec_scraper.py
│   │   ├── computerhouse_scraper.py
│   │   ├── cycComputer_scraper.py
│   │   ├── memoryKings_scraper.py
│   │   ├── pegasus5000_scraper.py
│   │   └── repuestoslaptopperu_scraper.py
│   ├── main.py                 # API REST FastAPI concurrente (puerto 8000)
│   ├── requirements.txt        # Dependencias de Python
│   └── Dockerfile              # Empaquetado Docker para FastAPI
│
├── docs/                       # Documentacion tecnica modular y bitacora
│   ├── 01-stack-tecnologico.md
│   ├── 02-finalidad-y-alcance.md
│   ├── 03-motor-de-scraping.md
│   ├── 04-frontend-y-ux.md
│   ├── 05-extraccion-dinamica-especificaciones.md
│   ├── 06-bitacora-de-evolucion.md
│   └── 07-despliegue-docker.md
│
├── docker-compose.yml          # Orquestacion de los 3 microservicios
├── setup.bat                   # Instalador automatizado de un clic (Windows)
├── start.bat                   # Lanzador de la plataforma de un clic (Windows)
├── package.json                # Configuracion de concurrencia raiz
└── README.md                   # Documentacion principal del repositorio
```

---

## 3. Stack Tecnologico

- **Frontend**: React 19, Vite, Lucide React, CSS nativo modular con variables CSS.
- **Backend Gateway**: Node.js, Express, CORS, Cache en memoria con TTL de 5 minutos.
- **Motor de Scraping**: Python 3.11+, FastAPI, Uvicorn, Cloudscraper, BeautifulSoup4, `ThreadPoolExecutor`.
- **Automatizacion y Orquestacion**: Bun, npm, concurrently, Docker, Docker Compose, scripts por lotes `.bat`.

---

## 4. Requisitos Previos

Antes de instalar el proyecto, asegurese de contar con las siguientes herramientas en su sistema operativo:

1. **Python**: Version 3.11 o superior ([Descargar Python](https://www.python.org/downloads/)). Durante la instalacion en Windows, marque la opcion **"Add Python to PATH"**.
2. **Node.js o Bun**:
   - Node.js LTS (v18 o superior) ([Descargar Node.js](https://nodejs.org/)).
   - Opcionalmente **Bun** (recomendado por su alta velocidad de instalacion y ejecucion).
3. **Git**: Para clonar el repositorio ([Descargar Git](https://git-scm.com/)).

---

## 5. Guia de Instalacion de Bun (Opcional pero Recomendado)

Bun es un entorno de ejecucion todo en uno compatible con Node.js que acelera drasticamente la instalacion de paquetes.

### Instalacion en Windows
Abra una ventana de PowerShell y ejecute:
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```
Una vez finalizada la instalacion, reinicie la terminal y compruebe la version:
```powershell
bun --version
```

### Instalacion en Linux / macOS / WSL
Abra la terminal y ejecute:
```bash
curl -fsSL https://bun.sh/install | bash
```

---

## 6. Instalacion Automatizada con un Solo Clic (Windows)

Si se encuentra en un entorno Windows, puede realizar la instalacion completa de manera desatendida ejecutando el archivo por lotes provisto en la raiz:

1. Haga doble clic sobre el archivo **`setup.bat`** (o ejecutelo desde la terminal mediante `.\setup.bat`).
2. El script verificara la presencia de Python y Node.js/Bun en el PATH.
3. Instalara automaticamente las dependencias raiz, las dependencias del servidor Gateway (`server`), las del cliente (`client`) y los paquetes de Python desde `requirements.txt`.
4. Al finalizar, el entorno estara completamente listo para usarse.

---

## 7. Instalacion Manual Paso a Paso

Si prefiere instalar las dependencias manualmente, ejecute la siguiente secuencia de comandos desde la raiz del repositorio:

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/LuisCarranzax/price-scraper-system.git
cd price-scraper-system
```

### Paso 2: Instalar Dependencias de la Raiz
```bash
npm install
# O con bun:
bun install
```

### Paso 3: Instalar Dependencias del Servidor Gateway (`server`)
```bash
cd server
npm install
# O con bun:
bun install
cd ..
```

### Paso 4: Instalar Dependencias del Cliente Frontend (`client`)
```bash
cd client
npm install
# O con bun:
bun install
cd ..
```

### Paso 5: Instalar Dependencias de Python (`scraper_engine`)
```bash
python -m pip install --upgrade pip
python -m pip install -r scraper_engine/requirements.txt
```

---

## 8. Ejecucion de la Plataforma

### Opcion A: Ejecucion Automatizada con `start.bat` (Windows)
Haga doble clic en **`start.bat`** o ejecutelo desde la consola:
```powershell
.\start.bat
```

### Opcion B: Ejecucion Concurrente Unificada desde Terminal
Desde la raiz del proyecto, ejecute un solo comando para levantar simultaneamente el Scraper (Python), el Gateway (Node.js) y el Cliente (React):
```bash
npm run dev
# O con bun:
bun run dev
```

El orquestador `concurrently` iniciara los servicios con prefijos de color:
- **`[SCRAPER]`**: Python FastAPI en `http://127.0.0.1:8000`
- **`[SERVER]`**: Express Gateway en `http://localhost:5000`
- **`[CLIENT]`**: React Vite en `http://localhost:5173`

Abra su navegador web e ingrese a `http://localhost:5173`.

### Opcion C: Ejecucion en Terminales Separadas

Si desea ejecutar o depurar los servicios de manera individual:

1. **Terminal 1 - Motor de Scraping**:
   ```bash
   python scraper_engine/main.py
   ```
2. **Terminal 2 - Servidor Gateway**:
   ```bash
   cd server
   npm run start
   ```
3. **Terminal 3 - Cliente Web**:
   ```bash
   cd client
   npm run dev
   ```

---

## 9. Despliegue con Docker y Docker Compose

El proyecto incluye configuracion lista para produccion mediante contenedores Docker:

### Iniciar todos los servicios
Desde la raiz del proyecto, compile y levante los contenedores en segundo plano:
```bash
docker-compose up -d --build
```

### Comprobar el estado y logs
```bash
docker-compose ps
docker-compose logs -f
```

### Detener los servicios
```bash
docker-compose down
```

Los servicios estaran disponibles en:
- Frontend Web: `http://localhost:5173`
- Gateway API: `http://localhost:5000`
- FastAPI Engine: `http://localhost:8000/docs`

---

## 10. Documentacion Detallada (`docs/`)

Para profundizar en el diseño y la evolucion del sistema, consulte los documentos tecnicos ubicados en el directorio `docs/`:

1. [Stack Tecnologico del Sistema](docs/01-stack-tecnologico.md): Descripcion de componentes y bibliotecas.
2. [Finalidad y Alcance del Proyecto](docs/02-finalidad-y-alcance.md): Justificacion de negocio y objetivos funcionales.
3. [Motor de Scraping y Evasion de Bloqueos](docs/03-motor-de-scraping.md): Estrategias WAF, `BaseScraper` y tiendas integradas.
4. [Diseño Frontend y Experiencia de Usuario](docs/04-frontend-y-ux.md): Transiciones, filtros dropdown y modal de producto.
5. [Extraccion Dinamica de Especificaciones](docs/05-extraccion-dinamica-especificaciones.md): Reglas semanticas por categoria de hardware.
6. [Bitacora de Evolucion y Mutaciones](docs/06-bitacora-de-evolucion.md): Registro cronologico de las fases de desarrollo.
7. [Guia de Contenedorizacion con Docker](docs/07-despliegue-docker.md): Especificaciones de Dockerfile y redes.

---

## 11. Licencia

Este proyecto se distribuye bajo fines educativos y de desarrollo profesional. El uso de las herramientas de extraccion debe respetar los terminos y condiciones de uso de cada una de las plataformas consultadas.
