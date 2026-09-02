# Guia de Contenedorizacion y Despliegue con Docker

Este documento detalla el procedimiento para empaquetar y ejecutar los microservicios de la plataforma utilizando Docker y Docker Compose.

---

## 1. Arquitectura de Contenedores

La plataforma se divide en tres contenedores independientes interconectados por una red interna de Docker (`scraper-network`):

1. **`scraper-engine`**: Contenedor Python con FastAPI y Uvicorn escuchando en el puerto `8000`.
2. **`server-gateway`**: Contenedor Node.js con Express escuchando en el puerto `5000`.
3. **`client-frontend`**: Contenedor web para la aplicacion React empaquetada con Vite (o servida por Nginx) en el puerto `5173`.

---

## 2. Requisitos Previos

- Docker Engine version 24.0 o superior instalado.
- Docker Compose version 2.20 o superior instalado.
- Para Windows y macOS, contar con Docker Desktop en ejecucion.

---

## 3. Estructura de los Archivos Docker

### `scraper_engine/Dockerfile`
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Dependencias de compilacion si son requeridas
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### `server/Dockerfile`
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

ENV PYTHON_SCRAPER_URL=http://scraper-engine:8000

CMD ["node", "src/server.js"]
```

### `client/Dockerfile`
```dockerfile
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Servidor de produccion ligero
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  scraper-engine:
    build:
      context: ./scraper_engine
      dockerfile: Dockerfile
    container_name: price-scraper-engine
    ports:
      - "8000:8000"
    restart: unless-stopped
    networks:
      - scraper-net

  server-gateway:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: price-scraper-gateway
    ports:
      - "5000:5000"
    environment:
      - PYTHON_SCRAPER_URL=http://scraper-engine:8000
    depends_on:
      - scraper-engine
    restart: unless-stopped
    networks:
      - scraper-net

  client-frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: price-scraper-client
    ports:
      - "5173:80"
    depends_on:
      - server-gateway
    restart: unless-stopped
    networks:
      - scraper-net

networks:
  scraper-net:
    driver: bridge
```

---

## 4. Comandos de Despliegue y Control

### Construccion e Inicio de Servicios
Para compilar las imagenes e iniciar todos los contenedores en segundo plano:
```bash
docker-compose up -d --build
```

### Visualizacion de Logs en Tiempo Real
Para inspeccionar los logs de todos los servicios simultaneamente:
```bash
docker-compose logs -f
```
O de un servicio especifico:
```bash
docker-compose logs -f scraper-engine
```

### Detencion de los Contenedores
Para detener y retirar la red de contenedores:
```bash
docker-compose down
```

### Reinicio Limpio
```bash
docker-compose down -v
docker-compose up -d --build
```

---

## 5. Acceso a las Aplicaciones

- **Frontend (Interfaz de Usuario)**: `http://localhost:5173`
- **Gateway Server (API Node.js)**: `http://localhost:5000`
- **Documentacion Interactiva OpenAPI (FastAPI)**: `http://localhost:8000/docs`
