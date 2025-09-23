## 🚀 Creador de Relaciones Mailbox

**🌟 NUEVA VERSIÓN WEB DISPONIBLE - MÁS ESTABLE Y FÁCIL DE USAR**

Una aplicación para procesar y combinar planillas CSV de manera automática. Ahora disponible en **tres versiones diferentes** para máxima compatibilidad.

### ⚠️ Problema conocido en macOS
Las versiones de escritorio (Tkinter) pueden fallar en algunos sistemas macOS debido a problemas de compatibilidad con Tcl/Tk. **Por eso recomendamos usar la versión web**, que es completamente estable y funciona en cualquier sistema.

## 📋 ¿Qué hace esta aplicación?

Esta aplicación combina dos archivos CSV:
- **Planilla Madre**: Contiene información de pacientes con `identificationPatient` e `idOrder`
- **Planilla Ofimatic**: Contiene datos que necesitan ser enriquecidos con información de la planilla madre

El resultado es un archivo CSV que combina ambas planillas, creando una columna `Nrodcto` que contiene el formato `Nrodcto-idOrder`.

## 🎯 Cómo usar la aplicación

### Opción 1: Aplicación Web (¡RECOMENDADA! - Más estable)

1. **Ejecutar la aplicación web:**
   ```bash
   ./ejecutar_web.sh
   ```
   O manualmente:
   ```bash
   source .venv/bin/activate
   python app_web.py
   ```

2. **Usar la interfaz web:**
   - Se abrirá automáticamente tu navegador
   - Si no se abre, ve a: http://localhost:8080
   - Arrastra o selecciona la planilla madre (.csv)
   - Arrastra o selecciona la planilla ofimatic (.csv)  
   - Clic en "¡GENERAR ARCHIVO COMBINADO!"
   - Descarga automáticamente el resultado

3. **¡Listo!** El archivo se descarga directamente a tu carpeta de descargas.

### Opción 2: Aplicación de escritorio (Puede fallar en algunos sistemas)

1. **Ejecutar la aplicación:**
   ```bash
   ./ejecutar.sh
   ```
   O manualmente:
   ```bash
   source .venv/bin/activate
   python app_mejorada.py
   ```

### Opción 3: Ejecutable (Solo si funciona en tu sistema)

- En macOS: Doble clic en `CreadorDeRelaciones.app` 
- O ejecutar: `./dist/CreadorDeRelaciones/CreadorDeRelaciones`

## 📁 Archivos incluidos

- `app_web.py` - **Aplicación web (RECOMENDADA)** - La más estable y fácil de usar
- `app_mejorada.py` - Aplicación de escritorio con interfaz mejorada
- `app_unir_planillas.py` - Código fuente original de la aplicación
- `dist/CreadorDeRelaciones` - Ejecutable para macOS/Linux
- `dist/CreadorDeRelaciones.app/` - Aplicación nativa de macOS
- `ejecutar_web.sh` - Script para ejecutar la versión web
- `ejecutar.sh` - Script para ejecutar la versión de escritorio
- `crear_ejecutable.sh` - Script para regenerar el ejecutable
- `README.md` - Este archivo
- `EJEMPLOS.md` - Archivos de ejemplo para probar

## 🛠️ Requisitos técnicos

### Para usar el ejecutable:
- ✅ **Ninguno!** El ejecutable es completamente independiente

### Para ejecutar desde código:
- Python 3.9+
- pandas
- tkinter (incluido con Python)

## 📝 Formato de archivos de entrada

### Planilla Madre (CSV):
- Separador: `;` (punto y coma)
- Columnas requeridas: `identificationPatient`, `idOrder`

### Planilla Ofimatic (CSV):
- Las primeras 4 filas se omiten automáticamente
- Columna requerida: `nit` (se usa para hacer el match con `identificationPatient`)
- Columna: `Nrodcto` (se modificará para incluir el idOrder)

## 🔧 Para desarrolladores

### Crear un nuevo ejecutable:

```bash
# Instalar dependencias
pip install pyinstaller pandas

# Crear ejecutable
pyinstaller --onefile --windowed --name="CreadorDeRelaciones" app_unir_planillas.py
```

### Estructura del proyecto:
```
relacionespy/
├── app_unir_planillas.py     # Aplicación principal
├── crear_ejecutable.sh       # Script de compilación
├── dist/                     # Ejecutables generados
│   ├── CreadorDeRelaciones   # Ejecutable Unix
│   └── CreadorDeRelaciones.app/ # App de macOS
├── build/                    # Archivos temporales de PyInstaller
└── .venv/                    # Entorno virtual Python
```

## 💡 Notas importantes

- **Para Windows**: El mismo proceso funcionará pero generará un archivo `.exe`
- **Distribución**: Solo necesitas compartir el archivo de la carpeta `dist/`
- **Sin instalación**: Los ejecutables no requieren Python instalado en el sistema
- **Seguridad**: En macOS, posiblemente necesites permitir la ejecución en Configuración del Sistema > Privacidad y seguridad

## 🐛 Resolución de problemas

### La aplicación no se abre en macOS:
1. Ir a **Configuración del Sistema > Privacidad y seguridad**
2. Buscar mensaje sobre "CreadorDeRelaciones"
3. Hacer clic en "Abrir de todas formas"

### Errores al procesar archivos:
- Verificar que los archivos CSV tengan las columnas correctas
- Verificar que el separador de la planilla madre sea `;`
- Revisar que la planilla ofimatic tenga datos válidos después de la fila 4

## 🎉 ¡Listo para usar!

Tu aplicación está lista para ser distribuida. Cualquier persona puede usarla sin conocimiento técnico y sin tener Python instalado.

**¡Hasta tu tía puede usarla sin llamarte!** 😂