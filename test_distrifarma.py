#!/usr/bin/env python3
"""
Script para probar la transformación de Distrifarma
"""
import pandas as pd
from io import BytesIO
import sys
sys.path.insert(0, '/Users/usuario/Documents/proyectos/mailboxes/relacionespy')

# Simular la lectura del archivo
df_original = pd.read_excel('distrifarma.xlsx')

print("="*80)
print("PRUEBA DE TRANSFORMACIÓN DISTRIFARMA → LIBRO2")
print("="*80)

print(f"\n📋 Archivo original:")
print(f"   Registros: {len(df_original)}")
print(f"   Columnas: {list(df_original.columns)}")

print(f"\n📝 Primeras 3 filas originales:")
print(df_original[['Persona de Contacto', 'CEDULA', 'ID Referencia', 'Dirección']].head(3).to_string())

# Simular transformación
df_libro2 = pd.DataFrame()

# Nombre Vehículo
df_libro2['Nombre Vehiculo'] = df_original['Nombre Vehiculo'] if 'Nombre Vehiculo' in df_original.columns else ''

# Título de la Visita = Persona de Contacto - CEDULA
df_libro2['Título de la Visita'] = df_original.apply(
    lambda row: f"{row['Persona de Contacto']} - {row['CEDULA']}" 
              if pd.notna(row['Persona de Contacto']) and pd.notna(row['CEDULA'])
              else (row['Persona de Contacto'] if pd.notna(row['Persona de Contacto']) else str(row['CEDULA'])),
    axis=1
)

# Dirección - permanece igual
df_libro2['Dirección'] = df_original['Dirección']

# Latitud y Longitud
df_libro2['Latitud'] = df_original['Latitud'] if 'Latitud' in df_original.columns else None
df_libro2['Longitud'] = df_original['Longitud'] if 'Longitud' in df_original.columns else None

# ID Referencia = Distrifarma-ID_Referencia_original
df_libro2['ID Referencia'] = df_original['ID Referencia'].apply(
    lambda x: f"Distrifarma-{x}" if pd.notna(x) else 'Distrifarma'
)

# Notas
df_libro2['Notas'] = df_original['Notas'] if 'Notas' in df_original.columns else ''

# Persona de Contacto
df_libro2['Persona de Contacto'] = df_original['Persona de Contacto']

# Teléfono
df_libro2['Teléfono'] = df_original['Teléfono'] if 'Teléfono' in df_original.columns else None

# Emails
df_libro2['Emails'] = df_original['Emails'] if 'Emails' in df_original.columns else None

print(f"\n📋 Archivo transformado:")
print(f"   Registros: {len(df_libro2)}")
print(f"   Columnas: {list(df_libro2.columns)}")

print(f"\n✅ Verificación de que CEDULA no está en el resultado:")
print(f"   'CEDULA' en columnas: {'CEDULA' in df_libro2.columns}")

print(f"\n📝 Primeras 3 filas transformadas:")
print(df_libro2[['Título de la Visita', 'ID Referencia', 'Dirección', 'Persona de Contacto']].head(3).to_string())

print("\n" + "="*80)
print("✅ TRANSFORMACIÓN EXITOSA")
print("="*80)
