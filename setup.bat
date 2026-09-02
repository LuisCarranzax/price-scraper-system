@echo off
setlocal enabledelayedexpansion
title Instalador Automatizado - Price Scraper System

echo =====================================================================
echo           PRICE SCRAPER SYSTEM - INSTALACION AUTOMATIZADA
echo =====================================================================
echo.

:: 1. Comprobar Python
echo [1/5] Verificando instalacion de Python...
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python no fue detectado en el PATH del sistema.
    echo Por favor instala Python 3.11 o superior desde https://www.python.org/
    echo Asegurate de marcar la casilla "Add Python to PATH" durante la instalacion.
    pause
    exit /b 1
)
python --version
echo [OK] Python detectado correctamente.
echo.

:: 2. Comprobar Node.js o Bun
echo [2/5] Verificando entorno de ejecucion JavaScript (Bun / Node.js)...
set JS_RUNTIME=npm
bun --version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set JS_RUNTIME=bun
    echo [OK] Bun detectado en el sistema:
    bun --version
) else (
    node --version >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] No se detecto ni Node.js ni Bun en el PATH del sistema.
        echo Por favor instala Node.js (v18+) desde https://nodejs.org/ o Bun desde https://bun.sh/
        pause
        exit /b 1
    )
    echo [OK] Node.js detectado en el sistema:
    node --version
)
echo.

:: 3. Instalar dependencias raiz
echo [3/5] Instalando dependencias en la raiz del proyecto...
if "%JS_RUNTIME%"=="bun" (
    call bun install
) else (
    call npm install
)
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Fallo al instalar las dependencias de la raiz.
    pause
    exit /b 1
)
echo [OK] Dependencias raiz instaladas correctamente.
echo.

:: 4. Instalar dependencias de Server y Client
echo [4/5] Instalando dependencias del Backend Gateway y Frontend React...

echo   - Instalando servidor gateway (server)...
cd server
if "%JS_RUNTIME%"=="bun" (
    call bun install
) else (
    call npm install
)
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Fallo al instalar dependencias del servidor.
    cd ..
    pause
    exit /b 1
)
cd ..

echo   - Instalando cliente frontend (client)...
cd client
if "%JS_RUNTIME%"=="bun" (
    call bun install
) else (
    call npm install
)
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Fallo al instalar dependencias del cliente.
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Dependencias de Gateway y Frontend instaladas.
echo.

:: 5. Instalar dependencias de Python
echo [5/5] Instalando dependencias del motor de scraping en Python...
python -m pip install --upgrade pip
python -m pip install -r scraper_engine\requirements.txt
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Fallo al instalar los paquetes de requirements.txt.
    pause
    exit /b 1
)
echo [OK] Dependencias de Python instaladas con exito.
echo.

echo =====================================================================
echo                INSTALACION COMPLETADA EXITOSAMENTE
echo =====================================================================
echo.
echo Para iniciar la plataforma completa puedes:
echo   1. Ejecutar el archivo: start.bat
echo   2. O ejecutar en tu terminal: npm run dev  (o bun run dev)
echo.
echo La plataforma estara disponible en:
echo   - Frontend:  http://localhost:5173
echo   - Gateway:   http://localhost:5000
echo   - Scraper:   http://127.0.0.1:8000
echo.
pause
