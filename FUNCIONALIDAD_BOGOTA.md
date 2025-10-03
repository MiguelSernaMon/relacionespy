# Funcionalidad de Relaciones para Bogotá

## 📋 Resumen

Se ha implementado exitosamente la funcionalidad para relacionar planillas de Bogotá en las aplicaciones web y de escritorio con **DOS MÉTODOS DE RELACIÓN**.

## 🚀 Aplicaciones Actualizadas

### 1. **app_web.py** (Aplicación Web)
- **URL**: http://localhost:8080
- **Modo Bogotá**: Selector de modo en la interfaz web
- **Funcionalidad**: 
  - Relaciona planillas por NIT y/o DOCUMENTO ASOCIADO
  - Actualiza el campo `Nrodcto` al formato: `Nrodcto-NUMERO_PEDIDO`
  - Conserva el formato Excel de la planilla inicial de Bogotá

### 2. **app_mejorada.py** (Aplicación de Escritorio)
- **Interfaz**: Tkinter con selector de modo
- **Modo Bogotá**: Combobox para seleccionar entre "normal" y "bogota"
- **Funcionalidad**: Misma que la versión web

### 3. **app_relacionar_bogota.py** (Script Standalone)
- Script dedicado solo para Bogotá
- Se ejecuta desde la terminal
- Procesa automáticamente los archivos en el directorio

## 📁 Archivos de Entrada Requeridos

### Para Modo Bogotá:

#### Planilla Inicial Bogotá (.xlsx)
- **Archivo**: `Planillas Iniciales bogota.xlsx`
- **Formato**: Excel con 3 filas de encabezado
- **Columnas requeridas**: 
  - `nit`: Número de identificación
  - `Nrodcto`: Número de documento (puede estar como BG752604, K8163450, etc.)
  - Todas las demás columnas del formato original

#### Planilla de Pedidos (.xlsx)
- **Archivo**: `Planilla 01-10-2025 (1).xlsx`
- **Columnas requeridas**:
  - `IDENTIFICACION`: NIT del paciente
  - `NUMERO DE PEDIDO`: Número del pedido a relacionar
  - `DOCUMENTO ASOCIADO`: Documento (puede estar como bg-752604, k8-163450, etc.)

## 🔧 Proceso de Relación - DUAL

### ✨ NUEVO: DOS MÉTODOS DE RELACIÓN

El sistema ahora intenta relacionar los registros de DOS formas:

#### **Método 1: Por NIT (Prioridad Alta)**
- Compara el campo `nit` de la planilla inicial con `IDENTIFICACION` de la planilla de pedidos
- Es el método principal

#### **Método 2: Por DOCUMENTO ASOCIADO (Fallback)**
- Si no encuentra por NIT, intenta por documento
- **Normalización inteligente**:
  - Convierte a MAYÚSCULAS
  - Elimina guiones (-)
  - Elimina espacios
  - Ejemplos:
    - `BG752604` == `bg-752604` ✅
    - `K8163450` == `k8-163450` ✅
    - `R1260173` == `r1-260173` ✅

### 📊 Estadísticas Mostradas

Al finalizar, el proceso muestra:
- Total de NITs en la planilla de pedidos
- Total de DOCUMENTOS en la planilla de pedidos
- Total de registros en la planilla inicial
- **Registros actualizados por NIT**
- **Registros actualizados por DOCUMENTO**
- **Total actualizados**
- Registros sin coincidencia

### 🎯 Ejemplo del Proceso

**Planilla Inicial (Bogotá):**
```
nit: 21938007
Nrodcto: BG752604
```

**Planilla de Pedidos:**
```
IDENTIFICACION: 21938007
NUMERO DE PEDIDO: 88057043
DOCUMENTO ASOCIADO: bg-752604
```

**Resultado:**
```
nit: 21938007
Nrodcto: BG752604-88057043
```

### 🔍 Casos Especiales Manejados

1. **NITs coinciden**: Usa el NUMERO DE PEDIDO directamente
2. **NITs NO coinciden pero documento SÍ**: 
   - Normaliza ambos documentos (mayúsculas, sin guiones)
   - Compara `Nrodcto` normalizado con `DOCUMENTO ASOCIADO` normalizado
   - Si coinciden, usa el NUMERO DE PEDIDO
3. **Variaciones de formato**:
   - `BG752604` == `bg-752604` == `BG-752604` == `bg752604`
   - `K8163450` == `k8-163450` == `K8-163450` == `k8163450`
   - Funciona con cualquier prefijo (2 o más letras)

## 🎨 Formato de Nrodcto

- **Sin decimales**: `88057043` (no `88057043.0`)
- **Formato final**: `Nrodcto-NUMERO_PEDIDO`
- **Preserva formato original**: 
  - Si era `BG752604`, queda `BG752604-88057043`
  - Si era `K8-163450`, queda `K8-163450-88057043`

## 💻 Cómo Usar

### Aplicación Web (app_web.py):
```bash
python app_web.py
```
1. Abre tu navegador en http://localhost:8080
2. Selecciona "Modo Bogotá" en el selector
3. Carga la Planilla Inicial Bogotá
4. Carga la Planilla de Pedidos
5. Haz clic en "¡RELACIONAR PLANILLAS BOGOTÁ!"
6. Descarga el archivo generado

### Aplicación de Escritorio (app_mejorada.py):
```bash
python app_mejorada.py
```
1. Selecciona "bogota" en el modo de operación
2. Selecciona la Planilla Inicial Bogotá
3. Selecciona la Planilla de Pedidos
4. Selecciona la carpeta de destino
5. Haz clic en "PROCESAR ARCHIVOS"

### Script Standalone (app_relacionar_bogota.py):
```bash
python app_relacionar_bogota.py
```
- Los archivos deben estar en el mismo directorio
- El resultado se guarda automáticamente

## ✅ Características Implementadas

- ✅ Lectura inteligente de Excel con encabezados en diferentes filas
- ✅ **Relación DUAL por NIT y DOCUMENTO**
- ✅ **Normalización de documentos (mayúsculas, sin guiones)**
- ✅ Actualización del campo Nrodcto con formato: `Nrodcto-NUMERO_PEDIDO`
- ✅ **Eliminación de decimales en NUMERO DE PEDIDO**
- ✅ Preservación del formato Excel original
- ✅ Conservación de todas las columnas y datos
- ✅ Aplicación de estilos al archivo de salida
- ✅ Interfaz web con selector de modo
- ✅ Interfaz de escritorio con selector de modo
- ✅ Script standalone dedicado
- ✅ Manejo de errores y validaciones
- ✅ **Estadísticas detalladas por método de relación**

## 📊 Resultados Esperados

Con los archivos de ejemplo:
- **Total NITs en pedidos**: 179
- **Total DOCUMENTOS en pedidos**: 185
- **Registros actualizados por NIT**: ~169
- **Registros actualizados por DOCUMENTO**: ~168
- **Total combinado**: ~180+ registros actualizados
- **Sin coincidencia**: Mucho menos que antes

## 🐛 Solución de Problemas

### Error: "Columnas faltantes"
- Verifica que la Planilla Inicial tenga las columnas `nit` y `Nrodcto`
- Verifica que la Planilla de Pedidos tenga `IDENTIFICACION`, `NUMERO DE PEDIDO` y `DOCUMENTO ASOCIADO`

### Pocos registros actualizados
- Verifica que los NITs coincidan exactamente
- Revisa que los documentos tengan formatos similares (con o sin guiones)
- La normalización automática debería manejar la mayoría de casos

### Formato incorrecto en Nrodcto
- El sistema ahora elimina automáticamente los `.0` de los números de pedido
- El formato del documento original se preserva (mayúsculas/minúsculas, guiones)

## 📞 Soporte

Para cualquier problema o sugerencia, revisa los logs en la consola del servidor o la aplicación de escritorio.

---
**Fecha de implementación**: 2-3 de octubre de 2025
**Versión**: 2.0 - Relación Dual
**Última actualización**: Normalización de documentos y relación por DOCUMENTO ASOCIADO
