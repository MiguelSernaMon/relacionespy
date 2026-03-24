# 🚀 Creador de Relaciones Mailbox - Electron

<div align="center">
  
  ![Cyberpunk Icon](assets/icon.svg)
  
  **Aplicación de escritorio con estilo Cyberpunk para procesar archivos Excel y convertirlos al formato Libro2**
  
  [![Electron](https://img.shields.io/badge/Electron-28.1.0-47848F?style=flat&logo=electron)](https://www.electronjs.org/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  
</div>

---

## � Instalación

```bash
cd electron-app
npm install
```

## 🏃 Ejecutar en Desarrollo

```bash
npm start
```

## 🎨 Generar Íconos Cyberpunk

Si modificas el diseño del ícono o es la primera vez que compilas:

```bash
npm run generate-icons
```

Esto generará todos los formatos necesarios (.png, .ico, .icns) desde el SVG.

## 📦 Compilar Aplicación

### Windows 🪟

```bash
# Instalador NSIS (recomendado)
npm run build

# Ejecutable portable (sin instalador)
npm run build-portable
```

**Resultado:** 
- `dist/Creador Relaciones Mailbox-1.0.0-win-x64.exe` (Instalador)
- `dist/Creador Relaciones Mailbox-1.0.0-win-x64.exe` (Portable)

### macOS 🍎

```bash
npm run build-mac
```

**Resultado:**
- `dist/Creador Relaciones Mailbox-1.0.0-mac-x64.dmg` (Intel)
- `dist/Creador Relaciones Mailbox-1.0.0-mac-arm64.dmg` (Apple Silicon)

### Compilar para Ambas Plataformas 🌍

```bash
npm run build-all
```

**Nota:** Para compilar para macOS desde Windows/Linux o viceversa, se necesitan herramientas adicionales. Consulta la [documentación de electron-builder](https://www.electron.build/multi-platform-build).

## 📋 Modos de Operación

### 1️⃣ Medellín → Libro2
- **Planilla Madre:** CSV/Excel con `identificationPatient`, `idOrder`
- **Planilla Ofimatic:** Excel con `nit`, `Nrodcto`, `NOMBRE`, `DIRECCION`, etc.
- **Resultado:** Libro2 para ruteo con formato: `NOMBRE - NIT`

### 2️⃣ Bogotá → Libro2
- **Planilla Ehlpharma:** Excel con `IDENTIFICACION`, `NUMERO DE PEDIDO`
- **Planilla Ofimatic:** Excel con datos de Bogotá
- **Resultado:** Libro2 para Cundinamarca con formato: `NOMBRE - NIT`

### 3️⃣ Distrifarma → Libro2
- **Archivo Distrifarma:** Excel con cualquier formato
- **Detección automática** de formato antiguo o Carmen de Viboral
- **Resultado:** Libro2 estándar con transformación automática

## ✨ Nuevas Características

### 📂 Selector de Carpeta de Destino
- Puedes elegir dónde guardar los archivos generados
- Por defecto se guardan en la carpeta de Descargas
- Ubicación personalizable para cada procesamiento

### 📊 Estadísticas de Relación
Después de procesar archivos (Medellín y Bogotá), verás:
- ✅ **Pedidos relacionados**: Cantidad exitosamente relacionada
- 📋 **Total de pedidos**: Total procesado
- ⚠️ **Pedidos sin relación**: Cantidad sin relación encontrada
- 📈 **Porcentaje de éxito**: Con código de colores visual
  - 🟢 Verde: ≥ 80%
  - 🟡 Amarillo: 50-79%
  - 🔴 Rojo: < 50%

## 🎨 Diseño Cyberpunk

La aplicación cuenta con un diseño moderno inspirado en la estética cyberpunk:
- Íconos con efectos neón (cyan, magenta, amarillo)
- Gradientes futuristas
- Efectos de brillo (glow)
- Líneas de circuitos electrónicos
- Interfaz moderna y limpia

## 📁 Estructura del Proyecto

```
electron-app/
├── assets/
│   ├── icon.svg              # Ícono original vectorial
│   ├── icon.png              # Ícono para la app
│   ├── icon.ico              # Ícono Windows
│   ├── icon.icns             # Ícono macOS
│   └── ICON-README.md        # Guía de íconos
├── main.js                   # Proceso principal Electron
├── preload.js                # Script de preload
├── renderer.js               # Lógica del frontend
├── index.html                # Interfaz de usuario
├── styles.css                # Estilos de la app
├── generate-icons.py         # Script generador de íconos
├── package.json              # Configuración y dependencias
└── README.md                 # Este archivo
```

## 🔧 Tecnologías Utilizadas

- **Electron 28.1.0** - Framework para aplicaciones de escritorio
- **XLSX** - Lectura y escritura de archivos Excel
- **electron-builder** - Empaquetado y distribución
- **Python 3** - Generación de íconos (Pillow, cairosvg)

## 🐛 Solución de Problemas

### El ícono no se muestra
```bash
npm run generate-icons
```

### Error al compilar para Mac en Windows
Se necesita un sistema macOS o usar servicios en la nube. Alternativa: usar GitHub Actions.

### Los archivos no se procesan correctamente
Verifica que los archivos Excel tengan las columnas correctas según el modo seleccionado.

## 📝 Licencia

MIT © Miguel Serna

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

<div align="center">
  <strong>Hecho con ❤️ y ⚡ cyberpunk vibes</strong>
</div>

- **Resultado:** Libro2 estándar

## 🛠️ Tecnologías

- **Electron** - Framework para apps de escritorio
- **xlsx** - Lectura/escritura de Excel (reemplaza a pandas)
- **electron-builder** - Generación de ejecutables

## 📁 Estructura

```
electron-app/
├── main.js           # Proceso principal (backend)
├── preload.js        # Bridge seguro
├── index.html        # Interfaz HTML
├── styles.css        # Estilos CSS
├── renderer.js       # Lógica frontend
├── package.json      # Configuración
└── assets/           # Iconos
```

## 🎨 Personalizar Icono

1. Coloca `icon.ico` y `icon.png` en `assets/`
2. Recompila con `npm run build`

## ⚙️ Requisitos

- Node.js 16+
- npm

## 📝 Notas

- Los archivos se guardan automáticamente en **Descargas**
- Formato de salida: `Libro2_[Modo]_YYYY-MM-DD-HHMMSS.xlsx`
- No requiere Python ni otras dependencias externas
