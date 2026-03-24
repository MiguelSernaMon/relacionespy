# 🎨 Generación de Íconos Cyberpunk

Este proyecto incluye un sistema automático para generar íconos en estilo cyberpunk para la aplicación.

## 📋 Prerequisitos

Necesitas tener instalado Python 3 y las siguientes librerías:

```bash
pip3 install Pillow cairosvg
```

## 🚀 Generar Íconos

### Opción 1: Usar el script npm (recomendado)
```bash
npm run generate-icons
```

### Opción 2: Ejecutar directamente el script Python
```bash
python3 generate-icons.py
```

## 📦 Archivos Generados

El script generará los siguientes archivos en la carpeta `assets/`:

- `icon.svg` - Ícono original en formato vectorial
- `icon.png` - Ícono 256x256 usado en la aplicación
- `icon-256.png` - Versión PNG 256x256
- `icon-512.png` - Versión PNG 512x512
- `icon-1024.png` - Versión PNG 1024x1024 (alta resolución)
- `icon.ico` - Formato para Windows (multi-tamaño)
- `icon.icns` - Formato para macOS (solo se genera en Mac)

## 🎨 Personalizar el Ícono

Para modificar el diseño del ícono:

1. Edita el archivo `assets/icon.svg` con tu editor favorito
2. Ejecuta `npm run generate-icons` para regenerar todos los formatos
3. Los nuevos íconos se aplicarán automáticamente

## 💡 Nota sobre ICNS (macOS)

El archivo `.icns` para macOS requiere la herramienta `iconutil` que solo está disponible en sistemas macOS. Si estás en Windows o Linux:

- El archivo ICNS se generará automáticamente cuando ejecutes `npm run build-mac` en una Mac
- O puedes usar servicios online para convertir PNG a ICNS

## 🎯 Características del Diseño Cyberpunk

- Gradientes neón (cyan, magenta, amarillo)
- Efectos de brillo (glow)
- Líneas de circuitos electrónicos
- Partículas luminosas
- Estética futurista y tecnológica
