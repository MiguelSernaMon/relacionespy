const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx-js-style');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 850,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
  
  // Descomentar para debug:
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// ============================================
// MESSENGER MAPPING FUNCTIONS
// ============================================

function getMessengerMappingsPath() {
  return path.join(app.getPath('userData'), 'messenger-mappings.json');
}

function loadMessengerMappings() {
  try {
    const mappingsPath = getMessengerMappingsPath();
    if (fs.existsSync(mappingsPath)) {
      const data = fs.readFileSync(mappingsPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Error loading messenger mappings:', error.message);
  }
  
  // Return default mappings if file doesn't exist or error
  return {
    mappings: [
      { code: "BOGOTA01", name: "Nombre del Mensajero 1" },
      { code: "BOGOTA02", name: "Nombre del Mensajero 2" },
      { code: "BOGOTA03", name: "Nombre del Mensajero 3" },
      { code: "BOGOTA04", name: "Nombre del Mensajero 4" },
      { code: "BOGOTA05", name: "Nombre del Mensajero 5" },
      { code: "BOGOTA06", name: "Nombre del Mensajero 6" },
      { code: "BOGOTA07", name: "Nombre del Mensajero 7" },
      { code: "BOGOTA08", name: "Luis Enrique" },
      { code: "BOGOTA09", name: "Nombre del Mensajero 9" },
      { code: "BOGOTA10", name: "Nombre del Mensajero 10" }
    ]
  };
}

function saveMessengerMappings(mappings) {
  try {
    const mappingsPath = getMessengerMappingsPath();
    fs.writeFileSync(mappingsPath, JSON.stringify(mappings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving messenger mappings:', error.message);
    return false;
  }
}

function applyMessengerMapping(messengerName, mappings) {
  if (!messengerName || typeof messengerName !== 'string') {
    return messengerName;
  }
  
  const trimmedName = messengerName.trim();
  if (!trimmedName) return messengerName;
  
  // Find a mapping that matches the messenger code
  const mapping = mappings.find(m => 
    m.code && trimmedName.toUpperCase().includes(m.code.toUpperCase())
  );
  
  if (mapping) {
    return mapping.name;
  }
  
  return messengerName;
}

// ============================================
// UTILIDADES
// ============================================

function limpiarDatos(data) {
  // Aplica trim a todos los valores de string en el array de objetos
  return data.map(row => {
    const cleanRow = {};
    Object.keys(row).forEach(key => {
      const value = row[key];
      // Si es string, hacer trim; si no, dejar el valor original
      cleanRow[key] = typeof value === 'string' ? value.trim() : value;
    });
    return cleanRow;
  });
}

function formatearExcel(worksheet, data) {
  if (!data || data.length === 0) return worksheet;
  
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  // Calcular anchos de columna basados en el contenido
  const colWidths = [];
  const headers = Object.keys(data[0]);
  
  headers.forEach((header, colIndex) => {
    let maxWidth = header.length;
    
    data.forEach(row => {
      const cellValue = String(row[header] || '');
      maxWidth = Math.max(maxWidth, cellValue.length);
    });
    
    // Limitar el ancho máximo y mínimo (con un poco más de espacio)
    colWidths.push({ wch: Math.min(Math.max(maxWidth + 3, 12), 60) });
  });
  
  worksheet['!cols'] = colWidths;
  
  // Estilo para los encabezados (primera fila)
  const headerStyle = {
    font: { 
      bold: true, 
      sz: 11,
      color: { rgb: "000000" }
    },
    fill: { 
      fgColor: { rgb: "D9D9D9" } 
    },
    border: {
      top: { style: 'thin', color: { rgb: "000000" } },
      bottom: { style: 'thin', color: { rgb: "000000" } },
      left: { style: 'thin', color: { rgb: "000000" } },
      right: { style: 'thin', color: { rgb: "000000" } }
    },
    alignment: { 
      horizontal: 'center', 
      vertical: 'center',
      wrapText: false
    }
  };
  
  // Aplicar estilo a los encabezados (fila 0)
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = headerStyle;
    }
  }
  
  // Estilo para las celdas de datos (alineación a la izquierda)
  const dataStyle = {
    alignment: { 
      horizontal: 'left', 
      vertical: 'center',
      wrapText: false
    }
  };
  
  // Aplicar estilo a las celdas de datos
  for (let row = range.s.r + 1; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = dataStyle;
      }
    }
  }
  
  return worksheet;
}

function leerExcelInteligente(filePath, skipRows = 0) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Leer con skiprows si se especifica
  let data = XLSX.utils.sheet_to_json(worksheet, { 
    defval: '',
    range: skipRows
  });
  
  // Detectar columnas conocidas
  const columnasConocidas = [
    'idOrder', 'authorizationNumber', 'identificationPatient',
    'IDENTIFICACION', 'NUMERO DE PEDIDO', 'DOCUMENTO ASOCIADO',
    'nit', 'Nrodcto', 'NomMensajero'
  ];
  
  const tieneColumnasConocidas = data.length > 0 && 
    columnasConocidas.some(col => Object.keys(data[0]).includes(col));
  
  if (!tieneColumnasConocidas) {
    // Intentar con diferentes skiprows
    for (let skip = 1; skip < 10; skip++) {
      const testData = XLSX.utils.sheet_to_json(worksheet, { 
        defval: '', 
        range: skip 
      });
      
      if (testData.length > 0 && columnasConocidas.some(col => Object.keys(testData[0]).includes(col))) {
        return limpiarDatos(testData);
      }
    }
  }
  
  return limpiarDatos(data);
}

function normalizarNit(valor) {
  if (valor === null || valor === undefined) return '';
  let str = String(valor);
  if (str.endsWith('.0')) {
    str = str.replace('.0', '');
  }
  return str.trim();
}

// Función para parsear fechas en diferentes formatos
function parsearFecha(fechaStr) {
  if (!fechaStr) return null;
  
  const str = String(fechaStr).trim();
  if (!str) return null;
  
  // Intentar formato DD/MM/YYYY (30/12/2025)
  const matchDDMMYYYY = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (matchDDMMYYYY) {
    const day = parseInt(matchDDMMYYYY[1], 10);
    const month = parseInt(matchDDMMYYYY[2], 10) - 1; // Meses en JS son 0-indexed
    const year = parseInt(matchDDMMYYYY[3], 10);
    return new Date(year, month, day);
  }
  
  // Intentar formato MM/DD/YYYY (12/30/2025)
  const matchMMDDYYYY = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (matchMMDDYYYY) {
    const month = parseInt(matchMMDDYYYY[1], 10) - 1;
    const day = parseInt(matchMMDDYYYY[2], 10);
    const year = parseInt(matchMMDDYYYY[3], 10);
    return new Date(year, month, day);
  }
  
  // Intentar formato YYYY-MM-DD
  const matchYYYYMMDD = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (matchYYYYMMDD) {
    const year = parseInt(matchYYYYMMDD[1], 10);
    const month = parseInt(matchYYYYMMDD[2], 10) - 1;
    const day = parseInt(matchYYYYMMDD[3], 10);
    return new Date(year, month, day);
  }
  
  // Intentar parsear como fecha ISO
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  return null;
}

// Función para calcular diferencia en días entre dos fechas
function diferenciaEnDias(fecha1, fecha2) {
  if (!fecha1 || !fecha2) return Infinity;
  const diffMs = Math.abs(fecha1.getTime() - fecha2.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function formatearTelefono(telefono) {
  if (!telefono) return { formateado: '', esValido: false };
  
  // Convertir a string y limpiar espacios, guiones, paréntesis, etc.
  let tel = String(telefono).trim();
  tel = tel.replace(/[\s\-\(\)\.]/g, '');
  
  // Si ya tiene +57, quitarlo temporalmente para validar
  if (tel.startsWith('+57')) {
    tel = tel.substring(3);
  } else if (tel.startsWith('57') && tel.length === 12) {
    tel = tel.substring(2);
  }
  
  // Validar que sea un móvil colombiano válido:
  // - Debe tener exactamente 10 dígitos
  // - Debe empezar con 3
  // - Solo debe contener números
  const esMovilValido = /^3\d{9}$/.test(tel);
  
  if (esMovilValido) {
    return { formateado: `+57${tel}`, esValido: true };
  }
  
  // Si no es un móvil válido, retornar vacío
  return { formateado: '', esValido: false };
}

function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

// ============================================
// CACHE DE PLANILLAS MADRE (sin límite de tiempo)
// ============================================

// Resuelve la carpeta de caché una sola vez al iniciar y la reutiliza
let _cachedCacheDir = null;

function getMadresCacheDir() {
  if (_cachedCacheDir) return _cachedCacheDir;

  // Intentar userData primero
  let dir = path.join(app.getPath('userData'), 'madres_cache');
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Test de escritura real
    const testFile = path.join(dir, '.write_test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    _cachedCacheDir = dir;
    return dir;
  } catch (e) {
    // Fallback: directorio junto al ejecutable (portable Windows)
    const exeDir = path.dirname(app.getPath('exe'));
    dir = path.join(exeDir, 'madres_cache');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    _cachedCacheDir = dir;
    return dir;
  }
}

function cacheMadreFile(filePath) {
  if (!filePath) return null;
  const dir = getMadresCacheDir();
  const base = path.basename(filePath);
  const timestamp = Date.now();
  const dest = path.join(dir, `${timestamp}__${base}`);
  fs.copyFileSync(filePath, dest);
  // Verificar que se copió correctamente
  if (!fs.existsSync(dest)) {
    throw new Error('El archivo no se copió correctamente a: ' + dest);
  }
  return dest;
}

function getCacheFiles() {
  const dir = getMadresCacheDir();

  let files = [];
  try {
    files = fs.readdirSync(dir).filter(f => !f.startsWith('.')).map(f => path.join(dir, f));
  } catch (e) {
    return [];
  }

  const allFiles = [];
  files.forEach(fp => {
    try {
      const st = fs.statSync(fp);
      const basename = path.basename(fp);
      // Extraer timestamp del nombre (formato: <timestamp>__<nombre>)
      const tsMatch = basename.match(/^(\d+)__/);
      const addedTime = tsMatch ? parseInt(tsMatch[1], 10) : st.mtimeMs;

      allFiles.push({ path: fp, mtime: addedTime, size: st.size });
    } catch (e) { /* ignore */ }
  });

  // Ordenar de más antiguo a más reciente (los más recientes sobreescriben en mapeos)
  allFiles.sort((a, b) => a.mtime - b.mtime);
  return allFiles;
}

// Alias para compatibilidad con código existente
function getRecentCacheFiles(days = 4) {
  return getCacheFiles();
}

function getCacheInfo(days = 4) {
  const recentFiles = getRecentCacheFiles(days);
  return recentFiles.map(f => {
    const basename = path.basename(f.path);
    // Extraer nombre original (quitar prefijo timestamp__)
    const parts = basename.split('__');
    const originalName = parts.length > 1 ? parts.slice(1).join('__') : basename;
    const fecha = new Date(f.mtime);
    return {
      id: basename,
      originalName: originalName,
      fecha: fecha.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      hora: fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      sizeMB: (f.size / (1024 * 1024)).toFixed(2),
      fullPath: f.path,
      mtime: f.mtime
    };
  }).reverse(); // Devolver más recientes primero para la UI
}

function loadMadresFromCache(days = 4) {
  const recentFiles = getRecentCacheFiles(days);

  let acumulado = [];
  recentFiles.forEach(f => {
    try {
      if (f.path.toLowerCase().endsWith('.csv')) {
        const wb = XLSX.readFile(f.path);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const d = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        acumulado = acumulado.concat(limpiarDatos(d));
      } else {
        const d = leerExcelInteligente(f.path);
        acumulado = acumulado.concat(d);
      }
    } catch (e) {
      console.warn('Error leyendo planilla cacheada', f.path, e.message);
    }
  });

  return acumulado;
}

function removeCacheFile(fileId) {
  const dir = getMadresCacheDir();
  const fp = path.join(dir, fileId);
  try {
    if (fs.existsSync(fp)) {
      fs.unlinkSync(fp);
      return true;
    }
  } catch (e) { /* ignore */ }
  return false;
}

function clearAllCache() {
  const dir = getMadresCacheDir();
  try {
    const files = fs.readdirSync(dir);
    files.forEach(f => {
      try { fs.unlinkSync(path.join(dir, f)); } catch (e) { /* ignore */ }
    });
    return true;
  } catch (e) {
    return false;
  }
}

// ============================================
// IPC HANDLERS
// ============================================

// Seleccionar archivo
ipcMain.handle('select-file', async (event, title) => {
  const win = BrowserWindow.fromWebContents(event.sender) || BrowserWindow.getFocusedWindow() || mainWindow;
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    title: title,
    filters: [
      { name: 'Excel/CSV Files', extensions: ['xlsx', 'xls', 'csv'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Seleccionar carpeta
ipcMain.handle('select-folder', async (event, title) => {
  const win = BrowserWindow.fromWebContents(event.sender) || BrowserWindow.getFocusedWindow() || mainWindow;
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory', 'createDirectory'],
    title: title
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// ============================================
// MESSENGER MAPPINGS IPC HANDLERS
// ============================================

ipcMain.handle('get-messenger-mappings', async () => {
  return loadMessengerMappings();
});

ipcMain.handle('save-messenger-mappings', async (event, mappings) => {
  return saveMessengerMappings(mappings);
});

// ============================================
// CACHE IPC HANDLERS
// ============================================

ipcMain.handle('get-cache-info', async () => {
  return getCacheInfo(4);
});

ipcMain.handle('add-to-cache', async (event) => {
  try {
    // Usar la ventana del sender para máxima compatibilidad (portables Windows)
    const win = BrowserWindow.fromWebContents(event.sender) || BrowserWindow.getFocusedWindow() || mainWindow;
    
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile', 'multiSelections'],
      title: 'Agregar Planilla(s) Madre al Caché',
      filters: [
        { name: 'Excel/CSV Files', extensions: ['xlsx', 'xls', 'csv'] }
      ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      let added = 0;
      const errors = [];
      for (const fp of result.filePaths) {
        try {
          const cached = cacheMadreFile(fp);
          if (cached) added++;
        } catch (copyErr) {
          errors.push(`${path.basename(fp)}: ${copyErr.message}`);
        }
      }
      const cacheInfo = getCacheInfo(4);
      if (errors.length > 0 && added === 0) {
        return { cacheInfo, added, error: 'No se pudieron guardar los archivos:\n' + errors.join('\n') };
      }
      return { cacheInfo, added };
    }
    return { cacheInfo: getCacheInfo(4), added: 0 };
  } catch (err) {
    console.error('Error en add-to-cache:', err);
    return { cacheInfo: getCacheInfo(4), added: 0, error: err.message };
  }
});

ipcMain.handle('remove-cache-file', async (event, fileId) => {
  removeCacheFile(fileId);
  return getCacheInfo(4);
});

ipcMain.handle('clear-cache', async () => {
  clearAllCache();
  return getCacheInfo(4);
});

// ============================================
// PROCESO MEDELLÍN → LIBRO2
// ============================================

ipcMain.handle('process-medellin', async (event, madrePath, ofimaticPath, outputFolder) => {
  try {
    // Cachear la planilla madre seleccionada y cargar las últimas 4 días
    try {
      cacheMadreFile(madrePath);
    } catch (e) {
      // ignore
    }

    let madreData = loadMadresFromCache(4);

    // Si por alguna razón no hay datos en cache, leer la planilla seleccionada directamente
    if (!madreData || madreData.length === 0) {
      if (madrePath.toLowerCase().endsWith('.csv')) {
        const workbook = XLSX.readFile(madrePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        madreData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        madreData = limpiarDatos(madreData);
      } else {
        madreData = leerExcelInteligente(madrePath);
      }
    }
    
    // Leer planilla ofimatic (header en fila 4)
    const ofimaticWorkbook = XLSX.readFile(ofimaticPath);
    const ofimaticSheet = ofimaticWorkbook.Sheets[ofimaticWorkbook.SheetNames[0]];
    let ofimaticData = XLSX.utils.sheet_to_json(ofimaticSheet, { 
      defval: '',
      range: 3
    });
    ofimaticData = limpiarDatos(ofimaticData);
    
    // Crear mapeos desde planilla madre: almacenar múltiples órdenes por identificación con sus fechas
    // Busca ambos formatos de columna (Medellín y Bogotá) para compatibilidad con caché mixto
    const ordenesPorIdentificacion = {}; // { identificacion: [{idOrder, fecha, telefono, direccion}, ...] }
    
    madreData.forEach(row => {
      const identificacion = normalizarNit(row['identificationPatient']) || normalizarNit(row['IDENTIFICACION']);
      const idOrder = row['idOrder'] || row['NUMERO DE PEDIDO'] || '';
      const telefonoPaciente = row['mobilePhonePatient'] || '';
      const direccionPaciente = row['addressPatient'] || '';
      
      // Obtener fecha del pedido - buscar en diferentes columnas posibles
      // Para Bogotá: buscar específicamente "FECHA DE ENTREGA" (formato YYYY-MM-DD)
      let fechaPedido = null;
      const posiblesColumnasFecha = ['FECHA DE ENTREGA', 'FECHA_DE_ENTREGA', 'Fecha de Entrega', 'FechaDeEntrega', 'shippingDateOrder', 'fecha', 'Fecha', 'FECHA', 'date', 'Date'];
      for (const col of posiblesColumnasFecha) {
        if (row[col]) {
          fechaPedido = parsearFecha(row[col]);
          if (fechaPedido) break;
        }
      }
      
      if (identificacion && idOrder) {
        if (!ordenesPorIdentificacion[identificacion]) {
          ordenesPorIdentificacion[identificacion] = [];
        }
        
        ordenesPorIdentificacion[identificacion].push({
          idOrder: idOrder,
          fecha: fechaPedido,
          telefono: telefonoPaciente,
          direccion: direccionPaciente
        });
      }
    });
    
    // Crear mapeos simples para compatibilidad (telefono y dirección del pedido más reciente)
    const mapeoTelefono = {};
    const mapeoDireccion = {};
    
    Object.keys(ordenesPorIdentificacion).forEach(identificacion => {
      const ordenes = ordenesPorIdentificacion[identificacion];
      if (ordenes.length > 0) {
        // Para teléfono y dirección, usar el del pedido más reciente (con fecha más reciente)
        const ordenMasReciente = ordenes.reduce((latest, current) => {
          if (!latest.fecha) return current;
          if (!current.fecha) return latest;
          return current.fecha > latest.fecha ? current : latest;
        }, ordenes[0]);
        
        if (ordenMasReciente.telefono) {
          const resultadoTel = formatearTelefono(ordenMasReciente.telefono);
          if (resultadoTel.esValido) {
            mapeoTelefono[identificacion] = resultadoTel.formateado;
          }
        }
        
        if (ordenMasReciente.direccion && String(ordenMasReciente.direccion).trim()) {
          mapeoDireccion[identificacion] = String(ordenMasReciente.direccion).trim();
        }
      }
    });
    
    // Función para verificar si una fila es válida
    function esFilaValida(row) {
      // Verificar que existan valores importantes
      const nit = String(row['nit'] || '').trim();
      const nombre = String(row['NOMBRE'] || '').trim();
      const mensajero = String(row['NomMensajero'] || '').trim();
      const direccion = String(row['DIRECCION'] || '').trim();
      
      // Si no hay dirección, la fila no es válida
      if (!direccion) return false;
      
      // Si no hay nombre ni NIT, la fila no es válida
      if (!nombre && !nit) return false;
      
      // Verificar que el mensajero no sea solo un número (dato erróneo)
      if (mensajero && /^\d+$/.test(mensajero)) return false;
      
      return true;
    }
    
    // Procesar datos y contar relaciones
    let pedidosRelacionados = 0;
    let telefonosValidos = 0;
    let telefonosTotales = 0;
    
    const libro2Data = ofimaticData
      .filter(row => esFilaValida(row)) // Filtrar filas inválidas
      .map(row => {
        const nit = normalizarNit(row['nit']);
        
        // Obtener fecha de la fila ofimatic (columna "fecha" con formato "12/30/2025")
        const fechaOfimatic = parsearFecha(row['fecha'] || row['Fecha'] || row['FECHA']);
        
        let idOrderSeleccionado = '';
        let idOrderStr = '';
        
        // Buscar el pedido con la fecha más cercana
        if (ordenesPorIdentificacion[nit] && ordenesPorIdentificacion[nit].length > 0) {
          const ordenes = ordenesPorIdentificacion[nit];
          
          if (fechaOfimatic) {
            // Si tenemos fecha en ofimatic, encontrar el pedido con fecha más cercana
            let mejorOrden = null;
            let menorDiferencia = Infinity;
            
            ordenes.forEach(orden => {
              if (orden.fecha) {
                const diferencia = diferenciaEnDias(orden.fecha, fechaOfimatic);
                if (diferencia < menorDiferencia) {
                  menorDiferencia = diferencia;
                  mejorOrden = orden;
                }
              }
            });
            
            if (mejorOrden) {
              idOrderSeleccionado = mejorOrden.idOrder;
            } else {
              // Si ninguna orden tiene fecha, usar la más reciente (última en el array)
              idOrderSeleccionado = ordenes[ordenes.length - 1].idOrder;
            }
          } else {
            // Si no hay fecha en ofimatic, usar el pedido más reciente (último en el array)
            idOrderSeleccionado = ordenes[ordenes.length - 1].idOrder;
          }
          
          if (idOrderSeleccionado) {
            idOrderStr = String(idOrderSeleccionado);
            if (idOrderStr.endsWith('.0')) {
              idOrderStr = idOrderStr.replace('.0', '');
            }
            pedidosRelacionados++; // Incrementar contador
          }
        }
        
        const nrodctoRelacionado = idOrderStr 
          ? `${row['Nrodcto']}-${idOrderStr}`
          : String(row['Nrodcto'] || '');
        
        // Crear título de visita
        let nombre = String(row['NOMBRE'] || '').trim();
        nombre = nombre.replace(/\s+/g, ' ');
        const titulo = nombre && nit ? `${nombre} - ${nit}` : (nombre || nit);
        
        // Formatear teléfono: prioridad al de Helpharma, si no usar el de Ofimatic
        const telefonoHelpharma = mapeoTelefono[nit] || '';
        let telefonoFinal = '';
        
        if (telefonoHelpharma) {
          // Si Helpharma tiene un móvil válido, usarlo directamente
          telefonoFinal = telefonoHelpharma;
          telefonosTotales++;
          telefonosValidos++;
        } else {
          // Si no, intentar con el de Ofimatic
          const resultadoTelefono = formatearTelefono(row['TEL1']);
          if (row['TEL1'] && String(row['TEL1']).trim()) {
            telefonosTotales++;
            if (resultadoTelefono.esValido) {
              telefonosValidos++;
            }
          }
          telefonoFinal = resultadoTelefono.formateado;
        }
        
        // Dirección: si hay match con la madre, usar addressPatient
        const direccionFinal = mapeoDireccion[nit] || row['DIRECCION'] || '';
        
        return {
          'Nombre Vehiculo': String(row['NomMensajero'] || '').trim(),
          'Título de la Visita': titulo,
          'Dirección': direccionFinal,
          'Latitud': '',
          'Longitud': '',
          'ID Referencia': nrodctoRelacionado,
          'Notas': row['TipoVta'] || '',
          'Persona de Contacto': '',
          'Teléfono': telefonoFinal,
          'Emails': ''
        };
      });
    
    // Crear y guardar archivo
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(libro2Data);
    formatearExcel(newWorksheet, libro2Data);
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Hoja1');
    
    const outputDir = outputFolder || app.getPath('downloads');
    const outputPath = path.join(outputDir, `Libro2_Medellin_${getTimestamp()}.xlsx`);
    XLSX.writeFile(newWorkbook, outputPath);
    
    return {
      success: true,
      message: `Archivo generado con ${libro2Data.length} registros. (Caché: ${madreData.length} registros madre, ${Object.keys(ordenesPorIdentificacion).length} identificaciones con órdenes)`,
      outputPath: outputPath,
      recordCount: libro2Data.length,
      relacionados: pedidosRelacionados,
      totalPedidos: ofimaticData.length,
      telefonosValidos: telefonosValidos,
      telefonosTotales: telefonosTotales,
      cacheInfo: getCacheInfo(4),
      debug: {
        registrosEnCache: madreData.length,
        identificacionesConOrdenes: Object.keys(ordenesPorIdentificacion).length,
        nitsEnOfimatic: ofimaticData.slice(0, 5).map(r => normalizarNit(r['nit'])),
        nitsEnMadre: Object.keys(ordenesPorIdentificacion).slice(0, 5),
        columnasEnMadre: madreData.length > 0 ? Object.keys(madreData[0]) : []
      }
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// PROCESO BOGOTÁ → LIBRO2
// ============================================

ipcMain.handle('process-bogota', async (event, ehlpharmaPath, ofimaticPath, outputFolder) => {
  try {
    // Cachear la planilla ehlpharma seleccionada y cargar las últimas 4 días
    try {
      cacheMadreFile(ehlpharmaPath);
    } catch (e) {
      // ignore
    }

    let ehlpharmaData = loadMadresFromCache(4);

    // Si por alguna razón no hay datos en cache, leer la planilla seleccionada directamente
    if (!ehlpharmaData || ehlpharmaData.length === 0) {
      ehlpharmaData = leerExcelInteligente(ehlpharmaPath);
    }
    
    // Cargar mapeos de mensajeros
    const messengerMappings = loadMessengerMappings();
    
    // Leer archivo Ofimatic (header en fila 4)
    const ofimaticWorkbook = XLSX.readFile(ofimaticPath);
    const ofimaticSheet = ofimaticWorkbook.Sheets[ofimaticWorkbook.SheetNames[0]];
    let ofimaticData = XLSX.utils.sheet_to_json(ofimaticSheet, { 
      defval: '',
      range: 3
    });
    ofimaticData = limpiarDatos(ofimaticData);
    
    // Crear mapeos desde Ehlpharma: almacenar múltiples órdenes por identificación con sus fechas
    // Busca ambos formatos de columna (Medellín y Bogotá) para compatibilidad con caché mixto
    const ordenesPorIdentificacion = {}; // { identificacion: [{idOrder, fecha, telefono, direccion}, ...] }
    
    ehlpharmaData.forEach(row => {
      const identificacion = normalizarNit(row['IDENTIFICACION']) || normalizarNit(row['identificationPatient']);
      const numeroPedido = row['NUMERO DE PEDIDO'] || row['idOrder'] || '';
      // Para Bogotá, buscar columna CELULAR (feedback del usuario)
      const telefonoPaciente = row['CELULAR'] || row['mobilePhonePatient'] || '';
      // Para Bogotá, buscar columna DIRECCION DE ENTREGA (feedback del usuario)
      const direccionPaciente = row['DIRECCION DE ENTREGA'] || row['addressPatient'] || '';
      
      // Obtener fecha del pedido - buscar en diferentes columnas posibles
      // Para Bogotá: buscar específicamente "FECHA DE ENTREGA" (formato YYYY-MM-DD: 2026-01-23)
      let fechaPedido = null;
      const posiblesColumnasFecha = ['FECHA DE ENTREGA', 'FECHA_DE_ENTREGA', 'Fecha de Entrega', 'FechaDeEntrega', 'shippingDateOrder', 'fecha', 'Fecha', 'FECHA', 'date', 'Date'];
      for (const col of posiblesColumnasFecha) {
        if (row[col]) {
          fechaPedido = parsearFecha(row[col]);
          if (fechaPedido) break;
        }
      }
      
      if (identificacion && numeroPedido) {
        if (!ordenesPorIdentificacion[identificacion]) {
          ordenesPorIdentificacion[identificacion] = [];
        }
        
        ordenesPorIdentificacion[identificacion].push({
          idOrder: numeroPedido,
          fecha: fechaPedido,
          telefono: telefonoPaciente,
          direccion: direccionPaciente
        });
      }
    });
    
    // Crear mapeos simples para compatibilidad (telefono y dirección del pedido más reciente)
    const mapeoTelefono = {};
    const mapeoDireccion = {};
    
    Object.keys(ordenesPorIdentificacion).forEach(identificacion => {
      const ordenes = ordenesPorIdentificacion[identificacion];
      if (ordenes.length > 0) {
        // Para teléfono y dirección, usar el del pedido más reciente (con fecha más reciente)
        const ordenMasReciente = ordenes.reduce((latest, current) => {
          if (!latest.fecha) return current;
          if (!current.fecha) return latest;
          return current.fecha > latest.fecha ? current : latest;
        }, ordenes[0]);
        
        if (ordenMasReciente.telefono) {
          const resultadoTel = formatearTelefono(ordenMasReciente.telefono);
          if (resultadoTel.esValido) {
            mapeoTelefono[identificacion] = resultadoTel.formateado;
          }
        }
        
        if (ordenMasReciente.direccion && String(ordenMasReciente.direccion).trim()) {
          mapeoDireccion[identificacion] = String(ordenMasReciente.direccion).trim();
        }
      }
    });
    
    // Función para verificar si una fila es válida
    function esFilaValida(row) {
      // Verificar que existan valores importantes
      const nit = String(row['nit'] || '').trim();
      const nombre = String(row['NOMBRE'] || '').trim();
      const mensajero = String(row['NomMensajero'] || '').trim();
      const direccion = String(row['DIRECCION'] || '').trim();
      
      // Si no hay dirección, la fila no es válida
      if (!direccion) return false;
      
      // Si no hay nombre ni NIT, la fila no es válida
      if (!nombre && !nit) return false;
      
      // Verificar que el mensajero no sea solo un número (dato erróneo)
      if (mensajero && /^\d+$/.test(mensajero)) return false;
      
      return true;
    }
    
    // Procesar datos y contar relaciones
    let pedidosRelacionados = 0;
    let telefonosValidos = 0;
    let telefonosTotales = 0;
    
    const libro2Data = ofimaticData
      .filter(row => esFilaValida(row)) // Filtrar filas inválidas
      .map(row => {
        const nit = normalizarNit(row['nit']);
        
        // Obtener fecha de la fila ofimatic (columna "fecha" con formato "12/30/2025")
        const fechaOfimatic = parsearFecha(row['fecha'] || row['Fecha'] || row['FECHA']);
        
        let idOrderSeleccionado = '';
        let idOrderStr = '';
        
        // Buscar el pedido con la fecha más cercana
        if (ordenesPorIdentificacion[nit] && ordenesPorIdentificacion[nit].length > 0) {
          const ordenes = ordenesPorIdentificacion[nit];
          
          if (fechaOfimatic) {
            // Si tenemos fecha en ofimatic, encontrar el pedido con fecha más cercana
            let mejorOrden = null;
            let menorDiferencia = Infinity;
            
            ordenes.forEach(orden => {
              if (orden.fecha) {
                const diferencia = diferenciaEnDias(orden.fecha, fechaOfimatic);
                if (diferencia < menorDiferencia) {
                  menorDiferencia = diferencia;
                  mejorOrden = orden;
                }
              }
            });
            
            if (mejorOrden) {
              idOrderSeleccionado = mejorOrden.idOrder;
            } else {
              // Si ninguna orden tiene fecha, usar la más reciente (última en el array)
              idOrderSeleccionado = ordenes[ordenes.length - 1].idOrder;
            }
          } else {
            // Si no hay fecha en ofimatic, usar el pedido más reciente (último en el array)
            idOrderSeleccionado = ordenes[ordenes.length - 1].idOrder;
          }
          
          if (idOrderSeleccionado) {
            idOrderStr = String(idOrderSeleccionado);
            if (idOrderStr.endsWith('.0')) {
              idOrderStr = idOrderStr.replace('.0', '');
            }
            pedidosRelacionados++; // Incrementar contador
          }
        }
        
        const nrodctoRelacionado = idOrderStr 
          ? `${row['Nrodcto']}-${idOrderStr}`
          : String(row['Nrodcto'] || '');
        
        // Crear título de visita con nombre y nit
        let nombre = String(row['NOMBRE'] || '').trim();
        nombre = nombre.replace(/\s+/g, ' ');
        const titulo = nombre && nit ? `${nombre} - ${nit}` : (nombre || nit);
        
        // Formatear teléfono: prioridad al de Helpharma, si no usar el de Ofimatic
        const telefonoHelpharma = mapeoTelefono[nit] || '';
        let telefonoFinal = '';
        
        if (telefonoHelpharma) {
          telefonoFinal = telefonoHelpharma;
          telefonosTotales++;
          telefonosValidos++;
        } else {
          const resultadoTelefono = formatearTelefono(row['TEL1']);
          if (row['TEL1'] && String(row['TEL1']).trim()) {
            telefonosTotales++;
            if (resultadoTelefono.esValido) {
              telefonosValidos++;
            }
          }
          telefonoFinal = resultadoTelefono.formateado;
        }
        
        // Dirección: si hay match con Ehlpharma, usar addressPatient
        const direccionFinal = mapeoDireccion[nit] || row['DIRECCION'] || '';
        
        // Aplicar mapeo de mensajero si está disponible
        const nombreMensajeroOriginal = row['NomMensajero'] || '';
        const nombreMensajeroMapeado = applyMessengerMapping(nombreMensajeroOriginal, messengerMappings.mappings);
        
        return {
          'Nombre Vehiculo': nombreMensajeroMapeado,
          'Título de la Visita': titulo,
          'Dirección': direccionFinal,
          'Latitud': '',
          'Longitud': '',
          'ID Referencia': nrodctoRelacionado,
          'Notas': row['TipoVta'] || '',
          'Persona de Contacto': '',
          'Teléfono': telefonoFinal,
          'Emails': ''
        };
      });
    
    // Crear y guardar archivo
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(libro2Data);
    formatearExcel(newWorksheet, libro2Data);
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Hoja1');
    
    const outputDir = outputFolder || app.getPath('downloads');
    const outputPath = path.join(outputDir, `Libro2_Bogota_${getTimestamp()}.xlsx`);
    XLSX.writeFile(newWorkbook, outputPath);
    
    return {
      success: true,
      message: `Archivo generado exitosamente con ${libro2Data.length} registros.`,
      outputPath: outputPath,
      recordCount: libro2Data.length,
      relacionados: pedidosRelacionados,
      totalPedidos: ofimaticData.length,
      telefonosValidos: telefonosValidos,
      telefonosTotales: telefonosTotales,
      cacheInfo: getCacheInfo(4)
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// PROCESO DISTRIFARMA → LIBRO2
// PROCESO DISTRIFARMA → LIBRO2
// ============================================

ipcMain.handle('process-distrifarma', async (event, distrifarmaPath, outputFolder) => {
  try {
    const workbook = XLSX.readFile(distrifarmaPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Detectar si tiene encabezados
    const primeraFila = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0 })[0] || [];
    const encabezadosConocidos = ['nombre vehiculo', 'titulo de la visita', 'dirección', 'direccion',
                                   'persona de contacto', 'teléfono', 'telefono', 'cedula'];
    
    const primeraFilaLower = primeraFila.map(c => String(c || '').toLowerCase().trim());
    const tieneEncabezados = encabezadosConocidos.some(enc => primeraFilaLower.includes(enc));
    
    let df;
    if (tieneEncabezados) {
      df = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      df = limpiarDatos(df);
      
      // Normalizar nombres de columnas
      const mapeoColumnas = {
        'nombre vehiculo': 'Nombre Vehiculo',
        'titulo de la visita': 'Titulo de la Visita',
        'dirección': 'Dirección',
        'direccion': 'Dirección',
        'persona de contacto': 'Persona de Contacto',
        'teléfono': 'Teléfono',
        'telefono': 'Teléfono',
        'cedula': 'CEDULA',
        'id referencia': 'ID Referencia',
        'notas': 'Notas',
        'integrados': 'INTEGRADOS'
      };
      
      df = df.map(row => {
        const newRow = {};
        Object.keys(row).forEach(key => {
          const keyLower = key.toLowerCase().trim();
          const newKey = mapeoColumnas[keyLower] || key;
          newRow[newKey] = row[key];
        });
        return newRow;
      });
    } else {
      // Sin encabezados - asignar columnas por posición
      const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const cols = ['Nombre Vehiculo', 'Titulo de la Visita', 'Dirección', 'ID Referencia',
                    'Persona de Contacto', 'CEDULA', 'Teléfono', 'INTEGRADOS'];
      
      df = rawData.map(row => {
        const newRow = {};
        cols.forEach((col, i) => {
          const value = row[i] || '';
          newRow[col] = typeof value === 'string' ? value.trim() : value;
        });
        return newRow;
      });
    }
    
    // Función para procesar ID Referencia
    function procesarIdReferencia(valor) {
      if (!valor) return 'Diswifarma';
      const str = String(valor).trim();
      const tieneLetras = /[a-zA-Z]/.test(str);
      const tieneNumeros = /\d/.test(str);
      if (tieneLetras && tieneNumeros) {
        return str;
      }
      return `Diswifarma-${str}`;
    }
    
    // Función para verificar si una fila es válida
    function esFilaValida(row) {
      const nombreVehiculo = String(row['Nombre Vehiculo'] || '').trim();
      const titulo = String(row['Titulo de la Visita'] || '').trim();
      const personaContacto = String(row['Persona de Contacto'] || '').trim();
      const direccion = String(row['Dirección'] || '').trim();
      const cedula = String(row['CEDULA'] || '').trim();
      
      // Si no hay dirección, la fila no es válida
      if (!direccion) return false;
      
      // Si no hay persona de contacto ni título, la fila no es válida
      if (!personaContacto && !titulo) return false;
      
      // Verificar que el nombre del vehículo no sea solo un número (dato erróneo)
      if (nombreVehiculo && /^\d+$/.test(nombreVehiculo)) return false;
      
      return true;
    }
    
    // Crear datos Libro2
    let telefonosValidos = 0;
    let telefonosTotales = 0;
    
    const libro2Data = df
      .filter(row => esFilaValida(row)) // Filtrar filas inválidas
      .map(row => {
        // Título de la Visita
        let titulo = '';
        if (row['CEDULA'] && row['Persona de Contacto']) {
          titulo = `${row['Persona de Contacto']} - ${row['CEDULA']}`;
        } else {
          titulo = row['Persona de Contacto'] || row['Titulo de la Visita'] || '';
        }
        
        // Formatear teléfono y contar válidos
        const resultadoTelefono = formatearTelefono(row['Teléfono']);
        if (row['Teléfono'] && String(row['Teléfono']).trim()) {
          telefonosTotales++;
          if (resultadoTelefono.esValido) {
            telefonosValidos++;
          }
        }
        
        return {
          'Nombre Vehiculo': String(row['Nombre Vehiculo'] || '').trim(),
          'Título de la Visita': titulo,
          'Dirección': row['Dirección'] || '',
          'Latitud': row['Latitud'] || '',
          'Longitud': row['Longitud'] || '',
          'ID Referencia': procesarIdReferencia(row['ID Referencia']),
          'Notas': row['INTEGRADOS'] || row['Notas'] || '',
          'Persona de Contacto': row['Persona de Contacto'] || '',
          'Teléfono': resultadoTelefono.formateado,
          'Emails': row['Emails'] || ''
        };
      });
    
    // Crear y guardar archivo
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(libro2Data);
    formatearExcel(newWorksheet, libro2Data);
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Hoja1');
    
    const outputDir = outputFolder || app.getPath('downloads');
    const outputPath = path.join(outputDir, `Libro2_Distrifarma_${getTimestamp()}.xlsx`);
    XLSX.writeFile(newWorkbook, outputPath);
    
    return {
      success: true,
      message: `Archivo transformado exitosamente con ${libro2Data.length} registros.`,
      outputPath: outputPath,
      recordCount: libro2Data.length,
      relacionados: 0, // Distrifarma no tiene relaciones
      totalPedidos: libro2Data.length,
      telefonosValidos: telefonosValidos,
      telefonosTotales: telefonosTotales
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
});
