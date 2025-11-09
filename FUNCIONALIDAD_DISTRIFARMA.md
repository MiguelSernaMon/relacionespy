# Funcionalidad Distrifarma → Libro2

## 📋 Descripción

Nueva funcionalidad que permite transformar archivos de Distrifarma (que ya tienen formato similar a Libro2) al formato Libro2.xlsx final, realizando las siguientes transformaciones:

## 🔄 Transformaciones Realizadas

### 1. **Título de la Visita**
- **Original**: Campo separado "Titulo de la Visita"
- **Nuevo**: `Persona de Contacto - CEDULA`
- **Ejemplo**: `"GUILLERMO ANTONIO GOMEZ ZULETA - 70000885"`

### 2. **ID Referencia**
- **Original**: Número de referencia (ej: `12981287`)
- **Nuevo**: `Diswifarma-{ID_original}`
- **Ejemplo**: `"Diswifarma-12981287"`

### 3. **Columna CEDULA**
- ✅ **Eliminada** del archivo final
- La información se preserva en el "Título de la Visita"

### 4. **Otros Campos**
- **Dirección**: Permanece igual
- **Persona de Contacto**: Permanece igual
- **Teléfono**: Permanece igual
- **Nombre Vehículo**: Permanece igual
- **Latitud/Longitud**: Permanecen igual
- **Notas**: Permanece igual
- **Emails**: Permanece igual

## 📊 Estructura de Entrada

El archivo Distrifarma debe tener las siguientes columnas:

```
- Nombre Vehiculo
- Titulo de la Visita
- Dirección
- Latitud
- Longitud
- ID Referencia
- Persona de Contacto
- CEDULA ← Esta columna se elimina
- Teléfono
- Notas (opcional)
- Emails (opcional)
```

## 📊 Estructura de Salida (Libro2.xlsx)

```
- Nombre Vehiculo
- Título de la Visita ← Persona de Contacto - CEDULA
- Dirección
- Latitud
- Longitud
- ID Referencia ← Diswifarma-{ID_original}
- Notas
- Persona de Contacto
- Teléfono
- Emails
```

## 🚀 Cómo Usar

1. **Abrir la aplicación web** (ejecutar `python3 app_web.py`)
2. **Seleccionar modo**: "Distrifarma → Libro2 (Transformar)"
3. **Cargar archivo**: Seleccionar el archivo `distrifarma.xlsx`
4. **Hacer clic** en "¡TRANSFORMAR ARCHIVO DISTRIFARMA!"
5. **Descargar**: El archivo se descargará automáticamente con formato: `Libro2_Distrifarma_YYYYMMDD_HHMMSS.xlsx`

## 📝 Ejemplo de Transformación

### Entrada:
| Persona de Contacto | CEDULA | ID Referencia | Dirección |
|---------------------|---------|---------------|-----------|
| GUILLERMO GOMEZ ZULETA | 70000885 | 12981287 | CL 39#64-22 ITAGUI |

### Salida:
| Título de la Visita | ID Referencia | Dirección | Persona de Contacto |
|---------------------|---------------|-----------|---------------------|
| GUILLERMO GOMEZ ZULETA - 70000885 | Diswifarma-12981287 | CL 39#64-22 ITAGUI | GUILLERMO GOMEZ ZULETA |

## ✅ Ventajas

- ✨ **Simplifica** la estructura eliminando columnas redundantes
- 🔖 **Identifica** claramente los registros de Distrifarma con el prefijo
- 📋 **Mantiene** toda la información necesaria en formato estándar Libro2
- 🚀 **Proceso rápido** - solo requiere un archivo de entrada

## 🛠️ Implementación Técnica

- **Ruta**: `/process_distrifarma_libro2`
- **Método**: `process_distrifarma_libro2()`
- **Archivo**: `app_web.py`
- **Tipo de archivo**: Solo Excel (.xlsx)
