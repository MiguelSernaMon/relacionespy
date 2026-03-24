# 📦 Guía de Compilación - Creador de Relaciones Mailbox

Esta guía te ayudará a compilar la aplicación para Windows y macOS.

## 📋 Pre-requisitos

### Para todos los sistemas:
1. **Node.js** (v16 o superior)
2. **npm** (viene con Node.js)

### Para compilar Windows:
- Funciona en: Windows, macOS, Linux
- No requiere herramientas adicionales

### Para compilar macOS:
- **Requiere macOS** (para generar .icns y firmar la app)
- Xcode Command Line Tools: `xcode-select --install`

## 🚀 Proceso Completo de Compilación

### Paso 1: Preparar el proyecto

```bash
cd electron-app
npm install
```

### Paso 2: Generar íconos (si aún no lo hiciste)

```bash
npm run generate-icons
```

### Paso 3: Compilar la aplicación

#### Windows 🪟

##### Opción A: Instalador NSIS (Recomendado)
```bash
npm run build
```

**Resultado:**
- `dist/Creador Relaciones Mailbox-1.0.0-win-x64.exe` (≈80 MB)
- Instalador con configuración de carpeta
- Crea acceso directo en escritorio y menú inicio
- Se puede desinstalar desde Panel de Control

##### Opción B: Portable (Sin instalación)
```bash
npm run build-portable
```

**Resultado:**
- `dist/Creador Relaciones Mailbox-1.0.0-win-x64.exe` (≈80 MB)
- Ejecutable independiente
- No requiere instalación
- Ideal para USB o compartir

#### macOS 🍎

```bash
npm run build-mac
```

**Resultado:**
- `dist/Creador Relaciones Mailbox-1.0.0-mac-x64.dmg` (Intel, ≈90 MB)
- `dist/Creador Relaciones Mailbox-1.0.0-mac-arm64.dmg` (Apple Silicon, ≈85 MB)
- Instalador DMG estándar de Mac
- Arrastra y suelta en Aplicaciones

#### Ambas Plataformas 🌍

```bash
npm run build-all
```

**Nota:** Para compilar para macOS desde Windows/Linux, necesitas configuración adicional o usar CI/CD.

## 📊 Tamaños Aproximados

| Plataforma | Formato | Tamaño |
|------------|---------|--------|
| Windows | Instalador NSIS | ~80 MB |
| Windows | Portable | ~80 MB |
| macOS Intel | DMG | ~90 MB |
| macOS Apple Silicon | DMG | ~85 MB |

## 🎯 Distribución

### Para Windows:
1. Comparte el `.exe` generado
2. Los usuarios pueden instalarlo o ejecutarlo directamente (portable)
3. Windows Defender puede mostrar advertencia (es normal para apps sin firma)

### Para macOS:
1. Comparte el archivo `.dmg`
2. Los usuarios abren el DMG y arrastran la app a Aplicaciones
3. macOS puede mostrar advertencia de "desarrollador no identificado":
   - Solución: Click derecho > Abrir > Abrir de todas formas
   - O ve a: Preferencias del Sistema > Seguridad > Permitir

## 🔐 Firma de Código (Opcional pero Recomendado)

### Windows:
Para evitar advertencias de SmartScreen:
1. Obtén un certificado de firma de código
2. Configura en `package.json`:
```json
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "password"
}
```

### macOS:
Para distribución sin advertencias:
1. Obtén Apple Developer ID
2. Configura en `package.json`:
```json
"mac": {
  "identity": "Developer ID Application: Tu Nombre (TEAM_ID)"
}
```

## 🐛 Solución de Problemas

### Error: "electron-builder no encontrado"
```bash
npm install --save-dev electron-builder
```

### Error: "Cannot find module 'xlsx'"
```bash
npm install
```

### Error al compilar en Windows: "Icon file not found"
```bash
npm run generate-icons
```

### Error en macOS: "iconutil: command not found"
Los íconos se generarán automáticamente durante el build.

### La compilación es muy lenta
Es normal. La primera vez puede tardar 5-10 minutos dependiendo de tu conexión y PC.

## 📦 Distribución Automatizada con GitHub Actions

Puedes automatizar la compilación usando GitHub Actions:

```yaml
# .github/workflows/build.yml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest]
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 16
      
      - run: npm install
      - run: npm run generate-icons
      - run: npm run build
      
      - uses: actions/upload-artifact@v2
        with:
          name: ${{ matrix.os }}
          path: dist/
```

## 🎉 Checklist Final

Antes de distribuir, verifica:

- [ ] Versión actualizada en `package.json`
- [ ] Íconos generados correctamente
- [ ] App probada en modo desarrollo (`npm start`)
- [ ] Compilación exitosa sin errores
- [ ] Ejecutable probado en sistema limpio
- [ ] README.md actualizado con cambios
- [ ] CHANGELOG.md creado con novedades (opcional)

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en la carpeta `dist/`
2. Verifica que todas las dependencias estén instaladas
3. Consulta la [documentación de electron-builder](https://www.electron.build/)

---

**¡Listo para distribuir tu aplicación! 🚀**
