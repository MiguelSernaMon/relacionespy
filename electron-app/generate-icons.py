#!/usr/bin/env python3
"""
Script para generar íconos de la aplicación en todos los formatos necesarios
Requiere: pip install Pillow cairosvg
"""

import os
from pathlib import Path

try:
    from PIL import Image
    import cairosvg
except ImportError:
    print("📦 Instalando dependencias necesarias...")
    import subprocess
    subprocess.check_call(['pip3', 'install', 'Pillow', 'cairosvg'])
    from PIL import Image
    import cairosvg

# Directorio de assets
ASSETS_DIR = Path(__file__).parent / 'assets'
SVG_PATH = ASSETS_DIR / 'icon.svg'

def generate_png(size, output_path):
    """Genera un PNG del tamaño especificado desde el SVG"""
    print(f"  📝 Generando {output_path.name} ({size}x{size})...")
    cairosvg.svg2png(
        url=str(SVG_PATH),
        write_to=str(output_path),
        output_width=size,
        output_height=size
    )

def generate_ico(png_path, ico_path):
    """Genera un archivo ICO para Windows"""
    print(f"  🪟 Generando {ico_path.name}...")
    img = Image.open(png_path)
    img.save(ico_path, format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])

def generate_icns(png_path, icns_path):
    """Genera un archivo ICNS para Mac"""
    print(f"  🍎 Generando {icns_path.name}...")
    
    # Crear directorio temporal para iconset
    iconset_dir = ASSETS_DIR / 'icon.iconset'
    iconset_dir.mkdir(exist_ok=True)
    
    # Tamaños necesarios para ICNS
    sizes = [16, 32, 64, 128, 256, 512]
    
    img_base = Image.open(png_path)
    
    for size in sizes:
        # Normal resolution
        img_resized = img_base.resize((size, size), Image.Resampling.LANCZOS)
        img_resized.save(iconset_dir / f'icon_{size}x{size}.png')
        
        # Retina resolution (@2x)
        if size <= 256:
            img_resized_2x = img_base.resize((size * 2, size * 2), Image.Resampling.LANCZOS)
            img_resized_2x.save(iconset_dir / f'icon_{size}x{size}@2x.png')
    
    # Convertir iconset a icns usando iconutil (solo en Mac)
    import subprocess
    import platform
    
    if platform.system() == 'Darwin':
        try:
            subprocess.run(['iconutil', '-c', 'icns', str(iconset_dir), '-o', str(icns_path)], check=True)
            print("  ✅ ICNS generado exitosamente")
        except Exception as e:
            print(f"  ⚠️  No se pudo generar ICNS (se necesita macOS): {e}")
    else:
        print("  ℹ️  ICNS se generará automáticamente al hacer build en Mac")
    
    # Limpiar iconset temporal
    import shutil
    shutil.rmtree(iconset_dir, ignore_errors=True)

def main():
    print("🎨 Generando íconos cyberpunk para la aplicación...\n")
    
    # Verificar que existe el SVG
    if not SVG_PATH.exists():
        print(f"❌ Error: No se encontró {SVG_PATH}")
        return
    
    # Generar PNG base de alta resolución
    png_512 = ASSETS_DIR / 'icon-512.png'
    generate_png(512, png_512)
    
    # Generar PNG de 256x256 para ICO
    png_256 = ASSETS_DIR / 'icon-256.png'
    generate_png(256, png_256)
    
    # Generar PNG de 1024x1024 para ICNS (alta resolución)
    png_1024 = ASSETS_DIR / 'icon-1024.png'
    generate_png(1024, png_1024)
    
    # Generar PNG para el código (usado en main.js)
    png_main = ASSETS_DIR / 'icon.png'
    generate_png(256, png_main)
    
    # Generar ICO para Windows
    ico_path = ASSETS_DIR / 'icon.ico'
    generate_ico(png_256, ico_path)
    
    # Generar ICNS para Mac
    icns_path = ASSETS_DIR / 'icon.icns'
    generate_icns(png_1024, icns_path)
    
    print("\n✨ ¡Íconos generados exitosamente!")
    print(f"📁 Ubicación: {ASSETS_DIR}")
    print("\n📦 Archivos generados:")
    print("   - icon.svg (original)")
    print("   - icon.png (256x256 - usado en la app)")
    print("   - icon-256.png (256x256)")
    print("   - icon-512.png (512x512)")
    print("   - icon-1024.png (1024x1024)")
    print("   - icon.ico (Windows)")
    print("   - icon.icns (macOS)")

if __name__ == '__main__':
    main()
