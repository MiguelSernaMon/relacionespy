# Creador de Relaciones Mailbox - Versión Escritorio
## Guía de Compilación para Windows

### 📋 Requisitos Previos

1. **Python 3.8+** instalado
2. **pip** (viene con Python)
3. Conexión a internet para descargar dependencias

### 🚀 Compilación Rápida (Recomendado)

Simplemente ejecuta el script de compilación:

```batch
compilar_windows.bat
```

Esto:
1. Instalará las dependencias necesarias
2. Compilará la aplicación
3. Generará `CreadorRelaciones.exe` en la carpeta `dist/`

### 📦 Compilación Manual

Si prefieres hacerlo manualmente:

```batch
REM 1. Instalar dependencias
pip install pyinstaller pywebview pandas openpyxl

REM 2. Compilar (opción simple)
pyinstaller --onefile --windowed --name "CreadorRelaciones" app_desktop.py

REM O usando el archivo .spec (más configuraciones)
pyinstaller CreadorRelaciones.spec
```

### 📁 Estructura de Archivos

```
relacionespy/
├── app_desktop.py           # Aplicación principal
├── CreadorRelaciones.spec   # Configuración PyInstaller
├── compilar_windows.bat     # Script de compilación
└── dist/
    └── CreadorRelaciones.exe  # ← Ejecutable final
```

### 🎨 Agregar un Icono Personalizado

1. Crea o descarga un archivo `.ico` (icono de Windows)
2. Colócalo en la misma carpeta que `app_desktop.py`
3. Modifica `CreadorRelaciones.spec`:
   ```python
   icon='mi_icono.ico',  # Cambiar de None a tu archivo
   ```
4. Recompila

### ❓ Solución de Problemas

#### "Python no está instalado"
- Descarga Python desde https://python.org
- Durante la instalación, marca "Add Python to PATH"

#### "pip no encontrado"
```batch
python -m ensurepip --upgrade
```

#### El .exe no abre / se cierra inmediatamente
- Ejecuta desde CMD para ver errores:
  ```batch
  cd dist
  CreadorRelaciones.exe
  ```

#### "No module named 'webview'"
```batch
pip install pywebview
```

#### Antivirus bloquea el .exe
- Es normal que algunos antivirus marquen ejecutables nuevos
- Agrega una excepción o firma digitalmente el ejecutable

### 📝 Notas

- El ejecutable es **independiente** - no requiere Python instalado
- Funciona en **Windows 10/11**
- Incluye toda la interfaz web dentro del ejecutable
- Primera ejecución puede tardar unos segundos mientras se descomprime

### 🔧 Dependencias Incluidas

- **pandas**: Procesamiento de datos
- **openpyxl**: Lectura/escritura de Excel
- **pywebview**: Ventana nativa con WebView
- **http.server**: Servidor web interno
