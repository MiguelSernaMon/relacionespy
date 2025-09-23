#!/bin/bash

# Script para ejecutar la aplicación web de forma simple y directa
echo "🚀 Iniciando Creador de Relaciones Mailbox - Versión Web..."
echo ""

# Verificar si estamos en el directorio correcto
if [ ! -f "app_web.py" ]; then
    echo "❌ Error: No se encuentra el archivo app_web.py"
    echo "📁 Asegúrate de ejecutar este script desde el directorio del proyecto"
    exit 1
fi

# Activar el entorno virtual si existe
if [ -d ".venv" ]; then
    echo "🔧 Activando entorno virtual..."
    source .venv/bin/activate
else
    echo "⚠️  No se encontró entorno virtual, usando Python del sistema"
fi

# Verificar que pandas esté instalado
python3 -c "import pandas" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Error: pandas no está instalado"
    echo "💡 Ejecuta: pip install pandas"
    exit 1
fi

echo "✅ Dependencias verificadas"
echo "🌐 Iniciando servidor web..."
echo ""
echo "💡 IMPORTANTE:"
echo "   - El navegador se abrirá automáticamente"
echo "   - Si no se abre, ve a: http://localhost:8080"
echo "   - Para cerrar la aplicación: presiona Ctrl+C"
echo ""

# Ejecutar la aplicación web
python3 app_web.py

echo ""
echo "👋 ¡Hasta pronto!"