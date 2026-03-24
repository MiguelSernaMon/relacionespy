@echo off
echo ============================================
echo   CREADOR DE RELACIONES MAILBOX
echo   Instalacion y Compilacion
echo ============================================
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no esta instalado
    echo Descargalo desde: https://nodejs.org
    pause
    exit /b 1
)

echo [1/3] Instalando dependencias...
call npm install

if errorlevel 1 (
    echo [ERROR] Error al instalar dependencias
    pause
    exit /b 1
)

echo.
echo [2/3] Compilando aplicacion para Windows...
call npm run build

if errorlevel 1 (
    echo [ERROR] Error durante la compilacion
    pause
    exit /b 1
)

echo.
echo [3/3] Compilacion exitosa!
echo.
echo ============================================
echo El instalador esta en: dist\
echo ============================================
echo.
explorer dist
pause
