import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import pandas as pd
import os

def leer_archivo(ruta_archivo):
    """
    Lee un archivo CSV o Excel y retorna un DataFrame
    """
    try:
        # Detectar la extensión del archivo
        extension = os.path.splitext(ruta_archivo)[1].lower()
        
        if extension == '.csv':
            # Intentar leer CSV con diferentes delimitadores
            try:
                df = pd.read_csv(ruta_archivo, delimiter=';')
            except:
                try:
                    df = pd.read_csv(ruta_archivo, delimiter=',')
                except:
                    df = pd.read_csv(ruta_archivo)
            return df
            
        elif extension in ['.xlsx', '.xls']:
            # Leer archivo Excel
            df = pd.read_excel(ruta_archivo)
            return df
        else:
            raise ValueError(f"Formato de archivo no soportado: {extension}")
            
    except Exception as e:
        raise Exception(f"Error al leer el archivo {ruta_archivo}: {str(e)}")

def seleccionar_archivo_1():
    archivo = filedialog.askopenfilename(
        title="Seleccionar primer archivo (Madre)",
        filetypes=[
            ("Archivos CSV y Excel", "*.csv;*.xlsx;*.xls"), 
            ("Archivos CSV", "*.csv"), 
            ("Archivos Excel", "*.xlsx;*.xls"),
            ("Todos los archivos", "*.*")
        ]
    )
    if archivo:
        entry_archivo1.delete(0, tk.END)
        entry_archivo1.insert(0, archivo)

def seleccionar_archivo_2():
    archivo = filedialog.askopenfilename(
        title="Seleccionar segundo archivo (Ofimatic)",
        filetypes=[
            ("Archivos CSV y Excel", "*.csv;*.xlsx;*.xls"), 
            ("Archivos CSV", "*.csv"), 
            ("Archivos Excel", "*.xlsx;*.xls"),
            ("Todos los archivos", "*.*")
        ]
    )
    if archivo:
        entry_archivo2.delete(0, tk.END)
        entry_archivo2.insert(0, archivo)

def seleccionar_carpeta_destino():
    carpeta = filedialog.askdirectory(title="Seleccionar carpeta donde guardar")
    if carpeta:
        entry_destino.delete(0, tk.END)
        entry_destino.insert(0, carpeta)

def procesar_archivos():
    ruta_madre = entry_archivo1.get()
    ruta_ofimatic = entry_archivo2.get()
    carpeta_destino = entry_destino.get()
    
    if not ruta_madre or not ruta_ofimatic or not carpeta_destino:
        messagebox.showerror("Error", "Por favor selecciona todos los archivos y la carpeta de destino")
        return
    
    # Crear nombre del archivo de salida
    nombre_salida = "relaciones_unidas.csv"
    ruta_guardado = os.path.join(carpeta_destino, nombre_salida)
    
    try:
        # Mostrar progreso
        progress_label.config(text="Procesando archivos...")
        root.update()
        
        # Cargar los archivos usando la nueva función
        df_madre = leer_archivo(ruta_madre)
        
        # Para el archivo ofimatic, intentar saltando filas si es necesario
        try:
            df_ofimatic = leer_archivo(ruta_ofimatic)
        except:
            # Si falla, intentar saltando las primeras 4 filas (formato ofimatic)
            extension = os.path.splitext(ruta_ofimatic)[1].lower()
            if extension == '.csv':
                df_ofimatic = pd.read_csv(ruta_ofimatic, skiprows=4, delimiter=';')
            elif extension in ['.xlsx', '.xls']:
                df_ofimatic = pd.read_excel(ruta_ofimatic, skiprows=4)
        
        progress_label.config(text="Procesando datos...")
        root.update()
        
        # Verificar que las columnas necesarias existan
        if 'identificationPatient' not in df_madre.columns:
            raise ValueError("El archivo madre debe tener la columna 'identificationPatient'")
        if 'idOrder' not in df_madre.columns:
            raise ValueError("El archivo madre debe tener la columna 'idOrder'")
        if 'nit' not in df_ofimatic.columns:
            raise ValueError("El archivo ofimatic debe tener la columna 'nit'")
        if 'Nrodcto' not in df_ofimatic.columns:
            raise ValueError("El archivo ofimatic debe tener la columna 'Nrodcto'")
        
        # Seleccionar y limpiar columnas
        df_madre_reducido = df_madre[['identificationPatient', 'idOrder']].copy()
        df_madre_reducido['identificationPatient'] = df_madre_reducido['identificationPatient'].astype(str)
        df_ofimatic['nit'] = df_ofimatic['nit'].astype(str)

        # Unir los dos dataframes
        df_fusionado = pd.merge(df_ofimatic, df_madre_reducido, left_on='nit', right_on='identificationPatient', how='left')

        # Crear la nueva columna 'Nrodcto-idOrder'
        df_fusionado['idOrder'] = df_fusionado['idOrder'].fillna('').astype(str)
        # Asegurarnos que idOrder no tenga decimales si viene como número
        df_fusionado['idOrder'] = df_fusionado['idOrder'].apply(lambda x: str(int(float(x))) if x and x.replace('.','',1).isdigit() else x)

        df_fusionado['Nrodcto_final'] = df_fusionado['Nrodcto'].astype(str) + '-' + df_fusionado['idOrder']
        
        # Reemplazar la columna original
        df_fusionado['Nrodcto'] = df_fusionado['Nrodcto_final']
        
        # Eliminar las columnas que ya no son necesarias
        columnas_a_eliminar = ['identificationPatient', 'idOrder', 'Nrodcto_final']
        df_fusionado = df_fusionado.drop(columns=[col for col in columnas_a_eliminar if col in df_fusionado.columns])

        progress_label.config(text="Guardando archivo...")
        root.update()
        
        # Guardar el resultado
        df_fusionado.to_csv(ruta_guardado, index=False, sep=';')
        
        progress_label.config(text="¡Proceso completado!")
        messagebox.showinfo("¡Éxito!", f"Proceso completado.\nEl archivo se guardó en:\n{ruta_guardado}")

    except Exception as e:
        progress_label.config(text="Error en el proceso")
        messagebox.showerror("¡Error!", f"Ocurrió un problema: \n{e}")

# Crear la interfaz gráfica
root = tk.Tk()
root.title("Unir Planillas - CSV y Excel")
root.geometry("600x400")

# Frame principal
frame_principal = ttk.Frame(root, padding="10")
frame_principal.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

# Título
titulo = ttk.Label(frame_principal, text="Unir Planillas CSV y Excel", font=("Arial", 16, "bold"))
titulo.grid(row=0, column=0, columnspan=3, pady=(0, 20))

# Archivo 1
ttk.Label(frame_principal, text="Archivo Madre (CSV/Excel):").grid(row=1, column=0, sticky=tk.W, pady=5)
entry_archivo1 = ttk.Entry(frame_principal, width=50)
entry_archivo1.grid(row=1, column=1, padx=5, pady=5)
ttk.Button(frame_principal, text="Seleccionar", command=seleccionar_archivo_1).grid(row=1, column=2, padx=5, pady=5)

# Archivo 2
ttk.Label(frame_principal, text="Archivo Ofimatic (CSV/Excel):").grid(row=2, column=0, sticky=tk.W, pady=5)
entry_archivo2 = ttk.Entry(frame_principal, width=50)
entry_archivo2.grid(row=2, column=1, padx=5, pady=5)
ttk.Button(frame_principal, text="Seleccionar", command=seleccionar_archivo_2).grid(row=2, column=2, padx=5, pady=5)

# Carpeta destino
ttk.Label(frame_principal, text="Carpeta de destino:").grid(row=3, column=0, sticky=tk.W, pady=5)
entry_destino = ttk.Entry(frame_principal, width=50)
entry_destino.grid(row=3, column=1, padx=5, pady=5)
ttk.Button(frame_principal, text="Seleccionar", command=seleccionar_carpeta_destino).grid(row=3, column=2, padx=5, pady=5)

# Botón procesar
ttk.Button(frame_principal, text="PROCESAR ARCHIVOS", command=procesar_archivos).grid(row=4, column=0, columnspan=3, pady=20)

# Etiqueta de progreso
progress_label = ttk.Label(frame_principal, text="Listo para procesar archivos", foreground="green")
progress_label.grid(row=5, column=0, columnspan=3, pady=10)

# Instrucciones
instrucciones_text = """
INSTRUCCIONES:
1. Selecciona el archivo MADRE (CSV o Excel)
2. Selecciona el archivo OFIMATIC (CSV o Excel)
3. Selecciona la carpeta donde guardar el resultado
4. Haz clic en PROCESAR ARCHIVOS

Formatos soportados: .csv, .xlsx, .xls
El archivo resultado se guardará como 'relaciones_unidas.csv'
"""

instrucciones = ttk.Label(frame_principal, text=instrucciones_text, justify=tk.LEFT, foreground="gray")
instrucciones.grid(row=6, column=0, columnspan=3, pady=20, sticky=tk.W)

# Configurar pesos para redimensionamiento
root.columnconfigure(0, weight=1)
root.rowconfigure(0, weight=1)
frame_principal.columnconfigure(1, weight=1)

if __name__ == "__main__":
    root.mainloop()