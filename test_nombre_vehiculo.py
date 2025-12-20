#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para detectar caracteres raros en la columna NomMensajero
"""
import pandas as pd
import sys

def analizar_nombre_vehiculo(archivo_excel):
    """Analiza la columna NomMensajero para detectar caracteres raros"""
    
    print(f"📖 Leyendo archivo: {archivo_excel}\n")
    
    try:
        df = pd.read_excel(archivo_excel)
        print(f"✅ Archivo leído correctamente")
        print(f"   Columnas disponibles: {list(df.columns)}\n")
        
        # Buscar la columna NomMensajero (puede tener variaciones)
        nom_col = None
        for col in df.columns:
            if 'NomMensajero' in str(col) or 'mensajero' in str(col).lower():
                nom_col = col
                break
        
        if not nom_col:
            print("❌ No se encontró la columna NomMensajero")
            print(f"   Columnas disponibles: {list(df.columns)}")
            return
        
        print(f"🔍 Analizando columna: '{nom_col}'")
        print(f"   Tipo de columna: {type(nom_col)}")
        print(f"   Representación: {repr(nom_col)}")
        print(f"   Bytes: {nom_col.encode('utf-8') if isinstance(nom_col, str) else 'N/A'}\n")
        
        # Obtener valores únicos
        valores_unicos = df[nom_col].dropna().unique()
        
        print(f"📊 Valores únicos encontrados: {len(valores_unicos)}\n")
        
        # Analizar cada valor único
        for idx, valor in enumerate(valores_unicos[:10], 1):  # Solo primeros 10
            print(f"Valor {idx}:")
            print(f"  - Texto: '{valor}'")
            print(f"  - Tipo: {type(valor)}")
            print(f"  - Repr: {repr(valor)}")
            if isinstance(valor, str):
                print(f"  - Bytes: {valor.encode('utf-8')}")
                print(f"  - Longitud: {len(valor)}")
                # Mostrar cada carácter con su código Unicode
                print(f"  - Caracteres:")
                for i, char in enumerate(valor):
                    print(f"      [{i}] '{char}' -> U+{ord(char):04X} ({ord(char)})")
            print()
        
        # Verificar si hay espacios o caracteres invisibles
        print("\n🔍 Buscando caracteres invisibles o espacios raros...")
        for idx, valor in enumerate(valores_unicos[:10], 1):
            if isinstance(valor, str):
                # Buscar caracteres raros
                caracteres_raros = []
                for char in valor:
                    # Detectar espacios no-breaking, tabs, etc
                    if ord(char) not in range(32, 127):  # Fuera del rango ASCII imprimible
                        if char not in [' ', '\n', '\r', '\t']:  # Excluir espacios comunes
                            caracteres_raros.append(f"U+{ord(char):04X}")
                
                if caracteres_raros:
                    print(f"⚠️ Valor {idx} ('{valor}') contiene caracteres raros: {caracteres_raros}")
        
        # Verificar espacios al inicio/final
        print("\n🔍 Verificando espacios al inicio/final...")
        for idx, valor in enumerate(valores_unicos[:10], 1):
            if isinstance(valor, str):
                if valor != valor.strip():
                    print(f"⚠️ Valor {idx} tiene espacios: inicio={valor != valor.lstrip()}, final={valor != valor.rstrip()}")
                    print(f"   Original: '{valor}' (len={len(valor)})")
                    print(f"   Stripped: '{valor.strip()}' (len={len(valor.strip())})")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python test_nombre_vehiculo.py <archivo_excel>")
        print("\nEjemplo:")
        print("  python test_nombre_vehiculo.py 'Planillas Iniciales OFIMA NOVIEMBRE 22.xlsx'")
        sys.exit(1)
    
    archivo = sys.argv[1]
    analizar_nombre_vehiculo(archivo)
