# Creador de Relaciones Mailbox - Bogotá Edition

Aplicación de escritorio con Electron para procesar archivos Excel de Bogotá y convertirlos al formato Libro2.

## 🚀 Instalación

```bash
npm install
```

## 🏃 Ejecutar en Desarrollo

```bash
npm start
```

## 📦 Compilar para Windows

```bash
# Instalador NSIS (recomendado)
npm run build

# Ejecutable portable
npm run build-portable
```

El ejecutable se generará en la carpeta `dist/`

## 📋 Funcionalidad

- **Entrada:**
  - Planilla Ehlpharma Bogotá (Excel con IDENTIFICACION, NUMERO DE PEDIDO)
  - Planilla Ofimatic Bogotá (Excel con nit, Nrodcto, NOMBRE, DIRECCION, etc.)

- **Salida:**
  - Archivo Libro2 formato ruteo para Cundinamarca
  - Guardado automáticamente en la carpeta Descargas

## 🛠️ Tecnologías

- **Electron**: Framework para aplicaciones de escritorio
- **xlsx**: Librería para leer/escribir archivos Excel
- **electron-builder**: Para generar ejecutables de Windows

## 📁 Estructura del Proyecto

```
electron-bogota/
├── main.js           # Proceso principal de Electron
├── preload.js        # Script de preload (seguridad)
├── index.html        # Interfaz HTML
├── styles.css        # Estilos de la interfaz
├── renderer.js       # Lógica del frontend
├── package.json      # Configuración y dependencias
└── assets/           # Iconos (opcional)
```

## 🎨 Personalización

Para agregar un icono personalizado:
1. Coloca `icon.ico` en la carpeta `assets/`
2. Coloca `icon.png` en la carpeta `assets/`
3. El build lo usará automáticamente

## ⚙️ Requisitos

- Node.js 16 o superior
- npm o yarn

## 📝 Notas

- El archivo de salida se guarda automáticamente en Descargas con timestamp
- La aplicación detecta automáticamente encabezados en diferentes filas
- Formato de salida: `Libro2_Bogota_YYYY-MM-DD-HHMMSS.xlsx`
