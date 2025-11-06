#!/usr/bin/env python3
"""
Script para verificar la estructura del archivo distrifarma.xlsx
"""
import pandas as pd

print("="*80)
print("VERIFICACIÓN DE ESTRUCTURA - distrifarma.xlsx")
print("="*80)

try:
    df = pd.read_excel('distrifarma.xlsx')
    print(f"\n✅ Archivo leído correctamente")
    print(f"📊 Total de registros: {len(df)}")
    print(f"📋 Columnas encontradas ({len(df.columns)}):")
    for i, col in enumerate(df.columns, 1):
        valores_no_nulos = df[col].dropna()
        print(f"   {i}. '{col}' ({len(valores_no_nulos)} valores)")
    
    print(f"\n📝 Primeras 5 filas:")
    print(df.head().to_string())
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*80)
