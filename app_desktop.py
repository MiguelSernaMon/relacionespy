#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Creador de Relaciones Mailbox - Versión Escritorio
===================================================
Ejecuta el servidor y abre la aplicación en el navegador.

Para compilar a .exe en Windows:
    pip install pyinstaller pandas openpyxl
    pyinstaller --onefile --name "CreadorRelaciones" app_desktop.py
"""

import os
import sys
import threading
import socket
import webbrowser
import time
from io import BytesIO, StringIO
import json
import base64
import pandas as pd
from http.server import HTTPServer, SimpleHTTPRequestHandler
import cgi

# Variable global para el servidor
server_instance = None
server_thread = None

def find_free_port():
    """Encuentra un puerto libre disponible"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        s.listen(1)
        port = s.getsockname()[1]
    return port

def leer_excel_inteligente_desde_contenido(contenido):
    """Lee un archivo Excel de manera inteligente desde bytes"""
    df = pd.read_excel(BytesIO(contenido))
    
    columnas_conocidas = [
        'idOrder', 'authorizationNumber', 'identificationPatient',
        'IDENTIFICACION', 'NUMERO DE PEDIDO', 'DOCUMENTO ASOCIADO',
        'nit', 'Nrodcto', 'NomMensajero'
    ]
    
    for col in columnas_conocidas:
        if col in df.columns:
            return df
    
    for skip in range(1, 10):
        try:
            df_test = pd.read_excel(BytesIO(contenido), skiprows=skip)
            for col in columnas_conocidas:
                if col in df_test.columns:
                    return df_test
        except:
            continue
    
    return df


class MailboxDesktopHandler(SimpleHTTPRequestHandler):
    """Handler HTTP para la aplicación de escritorio"""
    
    def log_message(self, format, *args):
        """Silenciar logs HTTP"""
        pass
    
    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(self.get_html_content().encode('utf-8'))
        else:
            self.send_error(404)
    
    def do_POST(self):
        if self.path == '/process':
            self.process_files()
        elif self.path == '/process_distrifarma_libro2':
            self.process_distrifarma_files()
        else:
            self.send_error(404)
    
    def get_html_content(self):
        """Retorna el HTML de la interfaz"""
        return '''<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Creador de Relaciones Mailbox</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #2c3e50;
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #7f8c8d;
            font-size: 16px;
        }
        
        .file-section {
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 20px;
            transition: all 0.3s ease;
        }
        
        .file-section:hover {
            border-color: #667eea;
            background: #f0f4ff;
        }
        
        .file-section.has-file {
            border-color: #28a745;
            background: #d4edda;
        }
        
        .file-label {
            display: block;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 12px;
            font-size: 15px;
        }
        
        .file-input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ced4da;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            transition: border-color 0.3s;
        }
        
        .file-input:hover {
            border-color: #667eea;
        }
        
        .file-status {
            margin-top: 10px;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 13px;
        }
        
        .status-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .process-btn {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 10px;
        }
        
        .process-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }
        
        .process-btn:disabled {
            background: #bdc3c7;
            cursor: not-allowed;
        }
        
        .result-section {
            margin-top: 30px;
            padding: 20px;
            border-radius: 10px;
            display: none;
        }
        
        .result-success {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        
        .result-error {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        
        .download-btn {
            display: inline-block;
            margin-top: 15px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(40, 167, 69, 0.4);
        }
        
        .loading {
            display: none;
            text-align: center;
            margin-top: 20px;
        }
        
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .info-box {
            background-color: #e8f4fd;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-bottom: 25px;
            border-radius: 0 8px 8px 0;
        }
        
        .info-box h3 {
            color: #2980b9;
            font-size: 15px;
            margin-bottom: 8px;
        }
        
        .info-box ul {
            color: #34495e;
            font-size: 13px;
            margin-left: 20px;
        }
        
        .info-box li {
            margin-bottom: 5px;
        }
        
        select.file-input {
            background: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Creador de Relaciones Mailbox</h1>
            <p>Transforma planillas al formato Libro2 de manera fácil y rápida</p>
        </div>
        
        <div style="margin-bottom: 20px;">
            <label class="file-label" for="modoSelector">🔧 Selecciona el modo de operación:</label>
            <select id="modoSelector" class="file-input" style="padding: 12px;">
                <option value="medellin_libro2">Medellín → Libro2 (Formato Ruteo)</option>
                <option value="bogota_libro2">Bogotá → Libro2 (Formato Ruteo)</option>
                <option value="distrifarma_libro2">Distrifarma → Libro2 (Transformar)</option>
            </select>
        </div>
        
        <div class="info-box" id="infoMedellinLibro2">
            <h3>📋 Medellín → Libro2:</h3>
            <ul>
                <li><strong>Planilla Madre:</strong> CSV o Excel con datos de Medellín</li>
                <li><strong>Planilla Ofimatic:</strong> Excel con nit, Nrodcto, NOMBRE, etc.</li>
                <li><strong>Resultado:</strong> Excel formato Libro2 para ruteo</li>
            </ul>
        </div>
        
        <div class="info-box" id="infoBogotaLibro2" style="display: none;">
            <h3>📋 Bogotá → Libro2:</h3>
            <ul>
                <li><strong>Planilla Ehlpharma:</strong> Excel con datos de Bogotá</li>
                <li><strong>Planilla Ofimatic:</strong> Excel Bogotá</li>
                <li><strong>Resultado:</strong> Excel formato Libro2 para Cundinamarca</li>
            </ul>
        </div>

        <div class="info-box" id="infoDistrifarmaLibro2" style="display: none;">
            <h3>📋 Distrifarma → Libro2:</h3>
            <ul>
                <li><strong>Archivo Distrifarma:</strong> Excel con cualquier formato</li>
                <li><strong>Detección Automática:</strong> Detecta formato antiguo o Carmen de Viboral</li>
                <li><strong>Resultado:</strong> Excel formato Libro2 estándar</li>
            </ul>
        </div>
        
        <form id="fileForm">
            <div class="file-section" id="madreSection">
                <label class="file-label" for="madreFile" id="madreLabel">1️⃣ Planilla Madre Medellín (.csv/.xlsx)</label>
                <input type="file" id="madreFile" class="file-input" accept=".csv,.xlsx,.xls" required>
                <div id="madreStatus" class="file-status" style="display: none;"></div>
            </div>
            
            <div class="file-section" id="ofimaticSection">
                <label class="file-label" for="ofimaticFile" id="ofimaticLabel">2️⃣ Planilla Ofimatic (.xlsx)</label>
                <input type="file" id="ofimaticFile" class="file-input" accept=".csv,.xlsx,.xls" required>
                <div id="ofimaticStatus" class="file-status" style="display: none;"></div>
            </div>
            
            <button type="submit" id="processBtn" class="process-btn" disabled>
                3️⃣ ¡GENERAR ARCHIVO LIBRO2!
            </button>
        </form>
        
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>🔄 Procesando archivos...</p>
        </div>
        
        <div class="result-section" id="result">
            <div id="resultContent"></div>
        </div>
    </div>

    <script>
        const modoSelector = document.getElementById('modoSelector');
        const madreFile = document.getElementById('madreFile');
        const ofimaticFile = document.getElementById('ofimaticFile');
        const madreLabel = document.getElementById('madreLabel');
        const ofimaticLabel = document.getElementById('ofimaticLabel');
        const processBtn = document.getElementById('processBtn');
        const form = document.getElementById('fileForm');
        const loading = document.getElementById('loading');
        const result = document.getElementById('result');
        const infoMedellinLibro2 = document.getElementById('infoMedellinLibro2');
        const infoBogotaLibro2 = document.getElementById('infoBogotaLibro2');
        const infoDistrifarmaLibro2 = document.getElementById('infoDistrifarmaLibro2');
        
        function updateModeUI(modo) {
            if (modo === 'medellin_libro2') {
                madreLabel.textContent = '1️⃣ Planilla Madre Medellín (.csv/.xlsx)';
                ofimaticLabel.textContent = '2️⃣ Planilla Ofimatic (.xlsx)';
                document.getElementById('madreSection').style.display = 'block';
                document.getElementById('ofimaticSection').style.display = 'block';
                infoMedellinLibro2.style.display = 'block';
                infoBogotaLibro2.style.display = 'none';
                infoDistrifarmaLibro2.style.display = 'none';
                processBtn.textContent = '3️⃣ ¡GENERAR ARCHIVO LIBRO2!';
                madreFile.required = true;
                ofimaticFile.required = true;
            } else if (modo === 'bogota_libro2') {
                madreLabel.textContent = '1️⃣ Planilla Ehlpharma Bogotá (.xlsx)';
                ofimaticLabel.textContent = '2️⃣ Planilla Ofimatic Bogotá (.xlsx)';
                document.getElementById('madreSection').style.display = 'block';
                document.getElementById('ofimaticSection').style.display = 'block';
                infoMedellinLibro2.style.display = 'none';
                infoBogotaLibro2.style.display = 'block';
                infoDistrifarmaLibro2.style.display = 'none';
                processBtn.textContent = '3️⃣ ¡GENERAR ARCHIVO LIBRO2 BOGOTÁ!';
                madreFile.required = true;
                ofimaticFile.required = true;
            } else if (modo === 'distrifarma_libro2') {
                madreLabel.textContent = '1️⃣ Archivo Distrifarma (.xlsx)';
                document.getElementById('madreSection').style.display = 'block';
                document.getElementById('ofimaticSection').style.display = 'none';
                infoMedellinLibro2.style.display = 'none';
                infoBogotaLibro2.style.display = 'none';
                infoDistrifarmaLibro2.style.display = 'block';
                processBtn.textContent = '2️⃣ ¡TRANSFORMAR ARCHIVO DISTRIFARMA!';
                madreFile.required = true;
                ofimaticFile.required = false;
            }
        }
        
        modoSelector.addEventListener('change', () => {
            updateModeUI(modoSelector.value);
            madreFile.value = '';
            ofimaticFile.value = '';
            document.getElementById('madreStatus').style.display = 'none';
            document.getElementById('ofimaticStatus').style.display = 'none';
            document.getElementById('madreSection').classList.remove('has-file');
            document.getElementById('ofimaticSection').classList.remove('has-file');
            checkFormReady();
        });
        
        function updateFileStatus(fileInput, statusDiv, sectionDiv) {
            const file = fileInput.files[0];
            if (file) {
                statusDiv.textContent = '✅ ' + file.name;
                statusDiv.className = 'file-status status-success';
                statusDiv.style.display = 'block';
                sectionDiv.classList.add('has-file');
            } else {
                statusDiv.style.display = 'none';
                sectionDiv.classList.remove('has-file');
            }
            checkFormReady();
        }
        
        function checkFormReady() {
            const modo = modoSelector.value;
            const madreReady = madreFile.files.length > 0;
            const ofimaticReady = ofimaticFile.files.length > 0;
            
            if (modo === 'distrifarma_libro2') {
                processBtn.disabled = !madreReady;
            } else {
                processBtn.disabled = !(madreReady && ofimaticReady);
            }
        }
        
        madreFile.addEventListener('change', () => {
            updateFileStatus(madreFile, document.getElementById('madreStatus'), document.getElementById('madreSection'));
        });
        
        ofimaticFile.addEventListener('change', () => {
            updateFileStatus(ofimaticFile, document.getElementById('ofimaticStatus'), document.getElementById('ofimaticSection'));
        });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const modo = modoSelector.value;
            
            if (modo === 'distrifarma_libro2') {
                if (!madreFile.files[0]) {
                    alert('Por favor, selecciona el archivo.');
                    return;
                }
            } else {
                if (!madreFile.files[0] || !ofimaticFile.files[0]) {
                    alert('Por favor, selecciona ambos archivos.');
                    return;
                }
            }
            
            form.style.display = 'none';
            loading.style.display = 'block';
            result.style.display = 'none';
            
            try {
                let url = '/process';
                const formData = new FormData();
                
                if (modo === 'distrifarma_libro2') {
                    url = '/process_distrifarma_libro2';
                    formData.append('file', madreFile.files[0]);
                } else {
                    formData.append('madre', madreFile.files[0]);
                    formData.append('ofimatic', ofimaticFile.files[0]);
                    formData.append('modo', modo);
                }
                
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                loading.style.display = 'none';
                result.style.display = 'block';
                
                if (data.success) {
                    result.className = 'result-section result-success';
                    
                    const binaryString = atob(data.excel_data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    const blob = new Blob([bytes], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                    const downloadUrl = URL.createObjectURL(blob);
                    
                    document.getElementById('resultContent').innerHTML = 
                        '<h3>✅ ¡Proceso completado!</h3>' +
                        '<p>' + data.message + '</p>' +
                        '<a href="' + downloadUrl + '" download="' + data.filename + '" class="download-btn">📥 Descargar ' + data.filename + '</a>' +
                        '<br><br><button onclick="resetForm()" class="process-btn" style="background: #6c757d;">🔄 Procesar otro archivo</button>';
                } else {
                    result.className = 'result-section result-error';
                    document.getElementById('resultContent').innerHTML = 
                        '<h3>❌ Error</h3>' +
                        '<p>' + data.error + '</p>' +
                        (data.details ? '<p><small>' + data.details + '</small></p>' : '') +
                        '<button onclick="resetForm()" class="process-btn" style="background: #6c757d; margin-top: 15px;">🔄 Intentar de nuevo</button>';
                }
                
            } catch (error) {
                loading.style.display = 'none';
                result.style.display = 'block';
                result.className = 'result-section result-error';
                document.getElementById('resultContent').innerHTML = 
                    '<h3>❌ Error de conexión</h3>' +
                    '<p>' + error.message + '</p>' +
                    '<button onclick="resetForm()" class="process-btn" style="background: #6c757d; margin-top: 15px;">🔄 Intentar de nuevo</button>';
            }
        });
        
        function resetForm() {
            form.style.display = 'block';
            result.style.display = 'none';
            madreFile.value = '';
            ofimaticFile.value = '';
            document.getElementById('madreStatus').style.display = 'none';
            document.getElementById('ofimaticStatus').style.display = 'none';
            document.getElementById('madreSection').classList.remove('has-file');
            document.getElementById('ofimaticSection').classList.remove('has-file');
            checkFormReady();
        }
        
        // Inicializar
        updateModeUI(modoSelector.value);
    </script>
</body>
</html>'''

    def process_files(self):
        """Procesa los archivos subidos"""
        try:
            content_type = self.headers['Content-Type']
            
            if 'multipart/form-data' not in content_type:
                self.send_json_response({'success': False, 'error': 'Formato no soportado'})
                return
            
            # Parsear el form data
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={'REQUEST_METHOD': 'POST', 'CONTENT_TYPE': content_type}
            )
            
            modo = form.getvalue('modo', 'medellin_libro2')
            
            madre_file = form['madre']
            madre_content = madre_file.file.read()
            madre_filename = madre_file.filename
            
            ofimatic_file = form['ofimatic']
            ofimatic_content = ofimatic_file.file.read()
            ofimatic_filename = ofimatic_file.filename
            
            if modo == 'medellin_libro2':
                result = self.process_medellin_libro2(madre_content, madre_filename, ofimatic_content, ofimatic_filename)
            elif modo == 'bogota_libro2':
                result = self.process_bogota_libro2(madre_content, madre_filename, ofimatic_content, ofimatic_filename)
            else:
                result = {'success': False, 'error': f'Modo no soportado: {modo}'}
            
            self.send_json_response(result)
            
        except Exception as e:
            self.send_json_response({'success': False, 'error': str(e)})
    
    def process_distrifarma_files(self):
        """Procesa archivos Distrifarma"""
        try:
            content_type = self.headers['Content-Type']
            
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={'REQUEST_METHOD': 'POST', 'CONTENT_TYPE': content_type}
            )
            
            distrifarma_file = form['file']
            distrifarma_content = distrifarma_file.file.read()
            distrifarma_filename = distrifarma_file.filename
            
            result = self.process_distrifarma_libro2(distrifarma_content, distrifarma_filename)
            self.send_json_response(result)
            
        except Exception as e:
            self.send_json_response({'success': False, 'error': str(e)})
    
    def process_medellin_libro2(self, madre_content, madre_filename, ofimatic_content, ofimatic_filename):
        """Procesa archivos de Medellín"""
        try:
            # Leer planilla madre
            madre_ext = os.path.splitext(madre_filename)[1].lower()
            
            if madre_ext == '.csv':
                for encoding in ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']:
                    for delim in [',', ';', '\t']:
                        try:
                            texto = madre_content.decode(encoding)
                            df_madre = pd.read_csv(StringIO(texto), delimiter=delim)
                            if 'identificationPatient' in df_madre.columns:
                                break
                        except:
                            continue
                    if 'identificationPatient' in df_madre.columns:
                        break
            else:
                df_madre = leer_excel_inteligente_desde_contenido(madre_content)
            
            # Leer planilla ofimatic
            df_ofimatic = pd.read_excel(BytesIO(ofimatic_content), header=3)
            
            # Normalizar NITs
            df_madre['identificationPatient'] = df_madre['identificationPatient'].apply(
                lambda x: str(x).replace('.0', '') if pd.notna(x) and str(x).endswith('.0') else str(x)
            ).str.strip()
            
            df_ofimatic['nit'] = df_ofimatic['nit'].apply(
                lambda x: str(x).replace('.0', '') if pd.notna(x) and str(x).endswith('.0') else str(x)
            ).str.strip()
            
            # Crear mapeos
            mapeo_nit_idorder = df_madre.set_index('identificationPatient')['idOrder'].to_dict()
            
            # Aplicar mapeo
            df_ofimatic['idOrder_mapeado'] = df_ofimatic['nit'].map(mapeo_nit_idorder).fillna('')
            
            df_ofimatic['idOrder_mapeado'] = df_ofimatic['idOrder_mapeado'].apply(
                lambda x: str(int(float(x))) if x and str(x).replace('.','',1).replace('-','',1).isdigit() else str(x)
            )
            
            df_ofimatic['Nrodcto_relacionado'] = df_ofimatic.apply(
                lambda row: f"{row['Nrodcto']}-{row['idOrder_mapeado']}" if row['idOrder_mapeado'] else row['Nrodcto'],
                axis=1
            )
            
            # Limpiar NomMensajero
            if 'NomMensajero' in df_ofimatic.columns:
                df_ofimatic['NomMensajero'] = df_ofimatic['NomMensajero'].astype(str).str.strip()
            
            # Crear DataFrame Libro2
            df_libro2 = pd.DataFrame()
            df_libro2['Nombre Vehiculo'] = df_ofimatic['NomMensajero'] if 'NomMensajero' in df_ofimatic.columns else ''
            
            # Título de la Visita
            def crear_titulo(row):
                nombre = str(row.get('NOMBRE', '')).strip() if pd.notna(row.get('NOMBRE')) else ''
                nombre = ' '.join(nombre.split())
                nit = str(row['nit']).replace('.0', '') if str(row['nit']).endswith('.0') else str(row['nit'])
                return f"{nombre} - {nit}" if nombre and nit else (nombre or nit)
            
            df_libro2['Título de la Visita'] = df_ofimatic.apply(crear_titulo, axis=1)
            df_libro2['Dirección'] = df_ofimatic['DIRECCION'] if 'DIRECCION' in df_ofimatic.columns else ''
            df_libro2['Latitud'] = None
            df_libro2['Longitud'] = None
            df_libro2['ID Referencia'] = df_ofimatic['Nrodcto_relacionado']
            df_libro2['Notas'] = df_ofimatic['TipoVta'] if 'TipoVta' in df_ofimatic.columns else ''
            df_libro2['Persona de Contacto'] = None
            df_libro2['Teléfono'] = df_ofimatic['TEL1'] if 'TEL1' in df_ofimatic.columns else None
            df_libro2['Emails'] = None
            
            # Generar Excel
            excel_buffer = BytesIO()
            with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
                df_libro2.to_excel(writer, sheet_name='Hoja1', index=False)
            
            excel_buffer.seek(0)
            excel_data = base64.b64encode(excel_buffer.read()).decode('utf-8')
            
            from datetime import datetime
            fecha = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            return {
                'success': True,
                'message': f'Archivo transformado exitosamente. {len(df_libro2)} registros.',
                'excel_data': excel_data,
                'filename': f'Libro2_Medellin_{fecha}.xlsx'
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def process_bogota_libro2(self, ehlpharma_content, ehlpharma_filename, ofimatic_content, ofimatic_filename):
        """Procesa archivos de Bogotá"""
        try:
            df_ehlpharma = leer_excel_inteligente_desde_contenido(ehlpharma_content)
            df_ofimatic = pd.read_excel(BytesIO(ofimatic_content), header=3)
            
            # Normalizar
            df_ehlpharma['IDENTIFICACION'] = df_ehlpharma['IDENTIFICACION'].astype(str)
            df_ofimatic['nit'] = df_ofimatic['nit'].astype(str)
            
            # Mapeos
            mapeo_idorder = df_ehlpharma.set_index('IDENTIFICACION')['NUMERO DE PEDIDO'].to_dict()
            
            df_ofimatic['idOrder_mapeado'] = df_ofimatic['nit'].map(mapeo_idorder).fillna('')
            
            df_ofimatic['Nrodcto_relacionado'] = df_ofimatic.apply(
                lambda row: f"{row['Nrodcto']}-{row['idOrder_mapeado']}" if row['idOrder_mapeado'] else row['Nrodcto'],
                axis=1
            )
            
            # Crear Libro2
            df_libro2 = pd.DataFrame()
            df_libro2['Nombre Vehiculo'] = df_ofimatic['NomMensajero'] if 'NomMensajero' in df_ofimatic.columns else ''
            df_libro2['Título de la Visita'] = df_ofimatic['NOMBRE'] if 'NOMBRE' in df_ofimatic.columns else ''
            df_libro2['Dirección'] = df_ofimatic['DIRECCION'] if 'DIRECCION' in df_ofimatic.columns else ''
            df_libro2['Latitud'] = None
            df_libro2['Longitud'] = None
            df_libro2['ID Referencia'] = df_ofimatic['Nrodcto_relacionado']
            df_libro2['Notas'] = df_ofimatic['TipoVta'] if 'TipoVta' in df_ofimatic.columns else ''
            df_libro2['Persona de Contacto'] = None
            df_libro2['Teléfono'] = df_ofimatic['TEL1'] if 'TEL1' in df_ofimatic.columns else None
            df_libro2['Emails'] = None
            
            excel_buffer = BytesIO()
            with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
                df_libro2.to_excel(writer, sheet_name='Hoja1', index=False)
            
            excel_buffer.seek(0)
            excel_data = base64.b64encode(excel_buffer.read()).decode('utf-8')
            
            from datetime import datetime
            fecha = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            return {
                'success': True,
                'message': f'Archivo transformado exitosamente. {len(df_libro2)} registros.',
                'excel_data': excel_data,
                'filename': f'Libro2_Bogota_{fecha}.xlsx'
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def process_distrifarma_libro2(self, distrifarma_content, distrifarma_filename):
        """Procesa archivos de Distrifarma"""
        try:
            # Detectar formato
            df_test = pd.read_excel(BytesIO(distrifarma_content), header=None, nrows=1)
            primera_fila = df_test.iloc[0].tolist() if len(df_test) > 0 else []
            
            encabezados_conocidos = ['nombre vehiculo', 'titulo de la visita', 'dirección', 'direccion',
                                    'persona de contacto', 'teléfono', 'telefono', 'cedula']
            
            primera_fila_lower = [str(celda).strip().lower() for celda in primera_fila if pd.notna(celda)]
            tiene_encabezados = any(enc in primera_fila_lower for enc in encabezados_conocidos)
            
            if tiene_encabezados:
                df = pd.read_excel(BytesIO(distrifarma_content), header=0)
                # Normalizar columnas
                mapeo = {
                    'nombre vehiculo': 'Nombre Vehiculo',
                    'titulo de la visita': 'Titulo de la Visita',
                    'dirección': 'Dirección',
                    'direccion': 'Dirección',
                    'persona de contacto': 'Persona de Contacto',
                    'teléfono': 'Teléfono',
                    'telefono': 'Teléfono',
                    'cedula': 'CEDULA',
                    'id referencia': 'ID Referencia',
                    'notas': 'Notas'
                }
                nuevos_nombres = {}
                for col in df.columns:
                    col_lower = str(col).strip().lower()
                    if col_lower in mapeo:
                        nuevos_nombres[col] = mapeo[col_lower]
                if nuevos_nombres:
                    df.rename(columns=nuevos_nombres, inplace=True)
            else:
                df = pd.read_excel(BytesIO(distrifarma_content), header=None)
                cols = ['Nombre Vehiculo', 'Titulo de la Visita', 'Dirección', 'ID Referencia',
                       'Persona de Contacto', 'CEDULA', 'Teléfono', 'INTEGRADOS']
                if len(df.columns) >= len(cols):
                    df.columns = cols + [f'Extra_{i}' for i in range(len(df.columns) - len(cols))]
                else:
                    df.columns = cols[:len(df.columns)]
            
            # Crear Libro2
            df_libro2 = pd.DataFrame()
            df_libro2['Nombre Vehiculo'] = df['Nombre Vehiculo'].astype(str).str.strip() if 'Nombre Vehiculo' in df.columns else ''
            
            # Título
            if 'CEDULA' in df.columns and 'Persona de Contacto' in df.columns:
                df_libro2['Título de la Visita'] = df.apply(
                    lambda r: f"{r['Persona de Contacto']} - {r['CEDULA']}" if pd.notna(r['Persona de Contacto']) and pd.notna(r['CEDULA']) else str(r.get('Persona de Contacto', '')),
                    axis=1
                )
            else:
                df_libro2['Título de la Visita'] = df['Persona de Contacto'] if 'Persona de Contacto' in df.columns else ''
            
            df_libro2['Dirección'] = df['Dirección'] if 'Dirección' in df.columns else ''
            df_libro2['Latitud'] = df['Latitud'] if 'Latitud' in df.columns else None
            df_libro2['Longitud'] = df['Longitud'] if 'Longitud' in df.columns else None
            
            # ID Referencia
            def proc_id(x):
                if pd.isna(x): return 'Diswifarma'
                s = str(x).strip()
                if any(c.isalpha() for c in s) and any(c.isdigit() for c in s):
                    return s
                return f"Diswifarma-{s}"
            
            df_libro2['ID Referencia'] = df['ID Referencia'].apply(proc_id) if 'ID Referencia' in df.columns else 'Diswifarma'
            df_libro2['Notas'] = df.get('INTEGRADOS', df.get('Notas', ''))
            df_libro2['Persona de Contacto'] = df['Persona de Contacto'] if 'Persona de Contacto' in df.columns else None
            df_libro2['Teléfono'] = df['Teléfono'] if 'Teléfono' in df.columns else None
            df_libro2['Emails'] = df['Emails'] if 'Emails' in df.columns else None
            
            excel_buffer = BytesIO()
            with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
                df_libro2.to_excel(writer, sheet_name='Hoja1', index=False)
            
            excel_buffer.seek(0)
            excel_data = base64.b64encode(excel_buffer.read()).decode('utf-8')
            
            from datetime import datetime
            fecha = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            return {
                'success': True,
                'message': f'Archivo transformado. {len(df_libro2)} registros.',
                'excel_data': excel_data,
                'filename': f'Libro2_Distrifarma_{fecha}.xlsx'
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def send_json_response(self, data):
        json_data = json.dumps(data, ensure_ascii=False)
        self.send_response(200)
        self.send_header('Content-type', 'application/json; charset=utf-8')
        self.send_header('Content-length', len(json_data.encode('utf-8')))
        self.end_headers()
        self.wfile.write(json_data.encode('utf-8'))


def start_server(port):
    """Inicia el servidor HTTP"""
    global server_instance
    server_instance = HTTPServer(('127.0.0.1', port), MailboxDesktopHandler)
    server_instance.serve_forever()


def main():
    """Función principal"""
    print()
    print("=" * 50)
    print("  🚀 CREADOR DE RELACIONES MAILBOX")
    print("=" * 50)
    print()
    
    # Encontrar puerto libre
    port = find_free_port()
    url = f'http://127.0.0.1:{port}'
    
    # Iniciar servidor en un hilo
    global server_thread
    server_thread = threading.Thread(target=start_server, args=(port,), daemon=True)
    server_thread.start()
    
    # Esperar un momento para que el servidor inicie
    time.sleep(0.5)
    
    # Abrir en navegador
    print(f"  📍 Servidor iniciado en: {url}")
    print()
    print("  🌐 Abriendo navegador...")
    webbrowser.open(url)
    
    print()
    print("  ✅ ¡Aplicación lista!")
    print()
    print("  ⚠️  NO CIERRES ESTA VENTANA")
    print("      (La aplicación dejará de funcionar)")
    print()
    print("  Presiona Ctrl+C para cerrar")
    print("=" * 50)
    
    # Mantener corriendo
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n  👋 ¡Hasta luego!")


if __name__ == '__main__':
    main()
