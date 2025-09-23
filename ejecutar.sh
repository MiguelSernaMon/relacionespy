#!/bin/bash

# Script para ejecutar la aplicación de forma simple y directa
echo "🚀 Iniciando Creador de Relaciones Mailbox..."
echo ""

# Verificar si estamos en el directorio correcto
if [ ! -f "app_mejorada.py" ]; then
    echo "❌ Error: No se encuentra el archivo app_mejorada.py"
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
echo "🎯 Ejecutando aplicación..."
echo ""

# Ejecutar la aplicación
python3 app_mejorada.py

echo ""
echo "👋 ¡Hasta pronto!"