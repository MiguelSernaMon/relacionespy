#!/usr/bin/env python3
"""
Script para probar la normalización de NITs
"""
import pandas as pd

# Simular datos
nits_madre = ['71339719.0', '43583507.0', '1000207793.0', '1000393754.0']
nits_ofimatic = ['43254496', '1000207793', '1000393754', '99999999']

print("="*60)
print("PRUEBA DE NORMALIZACIÓN DE NITs")
print("="*60)

print("\n📋 NITs originales:")
print(f"   Madre: {nits_madre}")
print(f"   Ofimatic: {nits_ofimatic}")

# Crear DataFrames
df_madre = pd.DataFrame({'identificationPatient': nits_madre})
df_ofimatic = pd.DataFrame({'nit': nits_ofimatic})

# Normalizar
df_madre['identificationPatient'] = df_madre['identificationPatient'].apply(
    lambda x: str(x).replace('.0', '') if pd.notna(x) and str(x).endswith('.0') else str(x)
).str.strip()

df_ofimatic['nit'] = df_ofimatic['nit'].astype(str).str.strip()

print("\n📋 NITs normalizados:")
print(f"   Madre: {df_madre['identificationPatient'].tolist()}")
print(f"   Ofimatic: {df_ofimatic['nit'].tolist()}")

# Verificar coincidencias
nits_madre_set = set(df_madre['identificationPatient'])
nits_ofimatic_set = set(df_ofimatic['nit'])
nits_comunes = nits_madre_set.intersection(nits_ofimatic_set)

print(f"\n✅ NITs en común: {len(nits_comunes)}")
print(f"   {sorted(list(nits_comunes))}")

print("\n" + "="*60)
