@echo off
title Price Scraper System - Ejecucion
echo =====================================================================
echo                INICIANDO PRICE SCRAPER SYSTEM
echo =====================================================================
echo.
echo Iniciando concurrentemente:
echo   [SCRAPER] Python FastAPI (http://127.0.0.1:8000)
echo   [SERVER]  Node Express Gateway (http://localhost:5000)
echo   [CLIENT]  React Vite Frontend (http://localhost:5173)
echo.

bun --version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    call bun run dev
) else (
    call npm run dev
)

pause
