#!/bin/bash

# Script para crear el ejecutable de la aplicación
echo "🚀 Creando ejecutable de Creador de Relaciones Mailbox..."

# Activar el entorno virtual y crear el ejecutable
source .venv/bin/activate

# Crear el ejecutable con PyInstaller
pyinstaller --onefile --windowed --name="CreadorDeRelaciones" app_unir_planillas.py

echo "✅ ¡Proceso completado!"
echo "📁 El ejecutable se encuentra en: ./dist/CreadorDeRelaciones"
echo ""
echo "Para distribuir la aplicación:"
echo "1. Comparte el archivo './dist/CreadorDeRelaciones' (en macOS/Linux)"
echo "2. En Windows, el proceso sería similar pero generaría un .exe"
echo ""
echo "🎯 La aplicación es totalmente independiente y no requiere Python instalado"