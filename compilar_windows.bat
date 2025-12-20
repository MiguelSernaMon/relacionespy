@echo off
REM ============================================
REM Script para compilar Creador de Relaciones Mailbox
REM para Windows (.exe con interfaz gráfica)
REM ============================================

echo.
echo ============================================
echo   COMPILADOR - Creador de Relaciones Mailbox
echo ============================================
echo.

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python no está instalado o no está en el PATH
    echo Por favor, instala Python desde https://python.org
    pause
    exit /b 1
)

echo [1/4] Instalando dependencias...
pip install pyinstaller pandas openpyxl

if errorlevel 1 (
    echo [ERROR] Error al instalar dependencias
    pause
    exit /b 1
)

REM Intentar instalar pywebview (opcional, puede fallar)
echo Instalando pywebview (opcional)...
pip install pywebview 2>nul
echo (Si pywebview fallo, la app abrira en el navegador)

echo.
echo [2/4] Verificando archivos...
if not exist "app_desktop.py" (
    echo [ERROR] No se encontró app_desktop.py
    pause
    exit /b 1
)

echo.
echo [3/4] Compilando aplicación...
echo Esto puede tardar unos minutos...
echo.

pyinstaller --onefile --windowed --name "CreadorRelaciones" app_desktop.py

if errorlevel 1 (
    echo [ERROR] Error durante la compilación
    pause
    exit /b 1
)

echo.
echo [4/4] ¡Compilación exitosa!
echo.
echo ============================================
echo El archivo ejecutable está en:
echo   dist\CreadorRelaciones.exe
echo ============================================
echo.
echo Presiona cualquier tecla para abrir la carpeta...
pause >nul

explorer dist

exit /b 0
