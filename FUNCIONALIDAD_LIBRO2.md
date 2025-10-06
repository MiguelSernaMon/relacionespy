# Funcionalidad Medellín → Libro2 (Formato Ruteo)

## 📋 Resumen

Se ha implementado una nueva funcionalidad en la aplicación web que permite transformar los datos relacionados de Medellín (planilla madre + ofimatic) al formato **Libro2.xlsx** que se utiliza para el ruteo de entregas.

## 🚀 ¿Qué hace esta funcionalidad?

Esta función combina dos procesos en uno:
1. **Relaciona** las planillas de Medellín por NIT (igual que el modo normal)
2. **Transforma** el resultado al formato Libro2.xlsx con las columnas específicas para ruteo

## 📁 Archivos de Entrada

### 1. Planilla Madre (Medellín)
- **Formato**: Excel (.xlsx)
- **Columnas requeridas**:
  - `identificationPatient`: NIT del paciente
  - `idOrder`: ID de la orden/pedido
- **Columnas opcionales** (recomendadas):
  - `addressPatient`: Dirección del paciente
  - `phonePatient`: Teléfono del paciente  
  - `cityNameOrder`: Ciudad de la orden

### 2. Planilla Ofimatic
- **Formato**: Excel (.xlsx) con 4 filas de encabezado
- **Ejemplo**: `PLANILLAS OFMATIC BOGOTA.xlsx`
- **Columnas requeridas**:
  - `nit`: Número de identificación
  - `Nrodcto`: Número de documento
- **Columnas opcionales**:
  - `NOMBRE`: Nombre del paciente
  - `DIRECCION`: Dirección
  - `TEL1`, `TEL2`: Teléfonos
  - `TipoVta`: Tipo de venta
  - `Destino`: Ciudad destino

## 📊 Estructura del Archivo de Salida (Libro2.xlsx)

El archivo generado tiene la siguiente estructura:

| Columna | Origen de Datos | Descripción |
|---------|----------------|-------------|
| **Nombre Vehiculo** | Vacío | Para asignar manualmente |
| **Título de la Visita** | `NOMBRE` (ofimatic) | Nombre del paciente |
| **Dirección** | Combinado | Ver detalles abajo ⬇️ |
| **Latitud** | Vacío | Para geocodificación posterior |
| **Longitud** | Vacío | Para geocodificación posterior |
| **ID Referencia** | `Nrodcto-idOrder` | Documento relacionado |
| **Notas** | `TipoVta` (ofimatic) | Tipo de venta |
| **Persona de Contacto** | Vacío | Para completar manualmente |
| **Teléfono** | Combinado | Ver detalles abajo ⬇️ |
| **Emails** | Vacío | Para completar manualmente |

### 🏠 Construcción de la Dirección

La dirección se construye con esta lógica de prioridad:

1. **Se usa la dirección de la planilla MADRE** si está disponible
2. Si no está en madre, **se usa la dirección de OFIMATIC**
3. **Se agrega una coma (,) al final** de la dirección
4. **Se concatena**: `dirección, ciudad, Antioquia`

**Ejemplo:**
```
Entrada:
  - addressPatient (madre): "CR 49A #76-15 APART 2238"
  - cityNameOrder (madre): "BELLO"

Salida:
  - Dirección: "CR 49A #76-15 APART 2238, BELLO, Antioquia"
```

### 📞 Obtención del Teléfono

El teléfono se obtiene con esta prioridad:

1. **Primero**: `phonePatient` de la planilla madre
2. **Segundo**: `TEL1` de la planilla ofimatic
3. **Tercero**: `TEL2` de la planilla ofimatic
4. **Si ninguno existe**: queda vacío

## 🔧 Proceso Paso a Paso

### 1. Relación por NIT
```
Planilla Madre:          Planilla Ofimatic:
identificationPatient    nit: 1007633545
1007633545              Nrodcto: D11436520
idOrder: 88057043

                ↓

Nrodcto relacionado: D11436520-88057043
```

### 2. Transformación a Libro2

El sistema toma los datos relacionados y los reorganiza en el formato Libro2:

```
Entrada (Datos combinados):
- NOMBRE: "MARIA CAMILA MORALES MANCO"
- addressPatient (madre): "DG 57 # 33 - 84"
- cityNameOrder (madre): "BELLO"
- Nrodcto relacionado: "D11436520-88057043"
- TipoVta: "DOMICILIO CON COBRO"
- TEL1: "8330707"

Salida (Libro2.xlsx):
┌─────────────────┬──────────────────────────────┬──────────────────────────────────┬────────────────────┬──────────┐
│ Nombre Vehiculo │ Título de la Visita          │ Dirección                        │ ID Referencia      │ Notas    │
├─────────────────┼──────────────────────────────┼──────────────────────────────────┼────────────────────┼──────────┤
│                 │ MARIA CAMILA MORALES MANCO   │ DG 57 # 33 - 84, BELLO, Antioquia│ D11436520-88057043 │ DOM...   │
└─────────────────┴──────────────────────────────┴──────────────────────────────────┴────────────────────┴──────────┘
```

## 💻 Uso en la Aplicación Web

### Paso 1: Acceder al servidor
```bash
http://localhost:8080
```

### Paso 2: Seleccionar el modo
- En el selector de modo, elegir: **"Medellín → Libro2 (Formato Ruteo)"**

### Paso 3: Cargar archivos
1. **Planilla Madre Medellín (.xlsx)**: Archivo con los datos de identificationPatient e idOrder
2. **Planilla Ofimatic (.xlsx)**: Archivo tipo "PLANILLAS OFMATIC BOGOTA.xlsx"

### Paso 4: Procesar
- Hacer clic en **"¡GENERAR ARCHIVO LIBRO2!"**
- El archivo se descargará automáticamente con formato: `Libro2_Medellin_YYYYMMDD_HHMMSS.xlsx`

## ✅ Ventajas de esta Funcionalidad

1. **Automatización completa**: Un solo clic transforma y relaciona los datos
2. **Priorización inteligente**: Usa siempre la mejor fuente de datos disponible (madre > ofimatic)
3. **Formato de dirección estandarizado**: Siempre incluye ciudad y departamento
4. **Coma automática**: Agrega la coma al final de la dirección según requerimiento
5. **Manejo de datos faltantes**: No falla si faltan datos opcionales
6. **Listo para ruteo**: El archivo generado tiene exactamente la estructura de Libro2.xlsx

## 📊 Estadísticas Mostradas

Durante el proceso, la aplicación muestra:
- ✅ Total de registros en planilla madre
- ✅ Total de registros en planilla ofimatic
- 🔗 Cantidad de registros relacionados exitosamente por NIT
- 📄 Total de registros en el archivo Libro2 generado

## 🎯 Casos de Uso

### Caso 1: Datos completos en planilla madre
```
Resultado: Dirección y teléfono de madre, nombre de ofimatic
Dirección: "CR 49A #76-15, BELLO, Antioquia"
Teléfono: "3192532209" (de madre)
```

### Caso 2: Sin dirección en madre
```
Resultado: Dirección de ofimatic, teléfono de ofimatic
Dirección: "DG 60 AVD 37 11, BELLO, Antioquia"
Teléfono: "8330707" (TEL1 de ofimatic)
```

### Caso 3: Sin datos opcionales
```
Resultado: Solo datos básicos
Dirección: "BELLO, Antioquia" (solo ciudad)
Teléfono: (vacío)
```

## ⚠️ Notas Importantes

1. **La dirección de la planilla MADRE tiene prioridad** sobre la de ofimatic
2. **La coma (,) se agrega automáticamente** al final de la dirección
3. **El formato "ciudad, Antioquia" se mantiene** siempre en la dirección
4. **Los campos vacíos** (Nombre Vehículo, Latitud, Longitud, etc.) se pueden completar después
5. **El archivo generado** mantiene el formato Excel de Libro2 con columnas ajustadas

## 🔄 Relación con Otros Modos

Esta funcionalidad es diferente de:
- **Modo Normal**: Solo relaciona, no transforma el formato
- **Modo Bogotá**: Trabaja con estructura de 4 encabezados y mantiene formato original
- **Filtrar Bogotá**: Solo filtra, no relaciona ni transforma

## 📝 Ejemplo Completo

### Entrada (Madre):
```
identificationPatient | idOrder   | addressPatient      | phonePatient | cityNameOrder
1007633545           | 88057043  | DG 57 # 33 - 84     | 3192532209  | BELLO
```

### Entrada (Ofimatic):
```
nit        | Nrodcto    | NOMBRE                     | DIRECCION      | TEL1    | TipoVta
1007633545 | D11436520  | MARIA CAMILA MORALES MANCO | CR 49 # 76-15  | 8330707 | DOMICILIO CON COBRO
```

### Salida (Libro2.xlsx):
```
Nombre Vehiculo |  Título de la Visita          | Dirección                        | ID Referencia      | Teléfono
                |  MARIA CAMILA MORALES MANCO   | DG 57 # 33 - 84, BELLO, Antioquia| D11436520-88057043 | 3192532209
```

**Observar que:**
- ✅ Dirección tomada de **madre** (DG 57 # 33 - 84), no de ofimatic
- ✅ Coma agregada después de la dirección
- ✅ Ciudad y departamento concatenados
- ✅ Teléfono tomado de **madre** (3192532209), no de ofimatic
- ✅ Nombre tomado de **ofimatic**
- ✅ ID Referencia relacionado correctamente

---

**Versión**: 1.0  
**Fecha**: 5 de octubre de 2025  
**Autor**: Sistema de Relaciones Mailbox
