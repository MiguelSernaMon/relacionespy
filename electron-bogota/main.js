const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const XLSX = require('xlsx');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
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

// Manejar selección de archivos
ipcMain.handle('select-file', async (event, title) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    title: title,
    filters: [
      { name: 'Excel Files', extensions: ['xlsx', 'xls', 'csv'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Leer archivo Excel
ipcMain.handle('read-excel', async (event, filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    return { success: true, data: data, headers: Object.keys(data[0] || {}) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Procesar archivos Bogotá → Libro2
ipcMain.handle('process-bogota', async (event, ehlpharmaPath, ofimaticPath) => {
  try {
    // Leer archivo Ehlpharma
    const ehlpharmaWorkbook = XLSX.readFile(ehlpharmaPath);
    let ehlpharmaSheet = ehlpharmaWorkbook.Sheets[ehlpharmaWorkbook.SheetNames[0]];
    let ehlpharmaData = XLSX.utils.sheet_to_json(ehlpharmaSheet, { defval: '' });
    
    // Detectar si necesita skiprows
    const knownColumns = ['IDENTIFICACION', 'NUMERO DE PEDIDO', 'DOCUMENTO ASOCIADO'];
    let hasKnownColumns = ehlpharmaData.length > 0 && 
      knownColumns.some(col => Object.keys(ehlpharmaData[0]).includes(col));
    
    if (!hasKnownColumns && ehlpharmaWorkbook.SheetNames[0]) {
      // Intentar con diferentes skiprows
      for (let skip = 1; skip < 10; skip++) {
        const range = XLSX.utils.decode_range(ehlpharmaSheet['!ref']);
        range.s.r = skip;
        const newSheet = XLSX.utils.encode_range(range);
        const testData = XLSX.utils.sheet_to_json(ehlpharmaSheet, { 
          defval: '', 
          range: skip 
        });
        
        if (testData.length > 0 && knownColumns.some(col => Object.keys(testData[0]).includes(col))) {
          ehlpharmaData = testData;
          break;
        }
      }
    }
    
    // Leer archivo Ofimatic (header en fila 4, índice 3)
    const ofimaticWorkbook = XLSX.readFile(ofimaticPath);
    const ofimaticSheet = ofimaticWorkbook.Sheets[ofimaticWorkbook.SheetNames[0]];
    const ofimaticData = XLSX.utils.sheet_to_json(ofimaticSheet, { 
      defval: '',
      range: 3  // skiprows=3, header=3
    });
    
    // Crear mapeo IDENTIFICACION → NUMERO DE PEDIDO
    const mapeoIdOrder = {};
    ehlpharmaData.forEach(row => {
      const identificacion = String(row['IDENTIFICACION'] || '').trim();
      const numeroPedido = row['NUMERO DE PEDIDO'];
      if (identificacion && numeroPedido) {
        mapeoIdOrder[identificacion] = numeroPedido;
      }
    });
    
    // Procesar datos de Ofimatic
    const libro2Data = ofimaticData.map(row => {
      const nit = String(row['nit'] || '').replace('.0', '').trim();
      const idOrderMapeado = mapeoIdOrder[nit] || '';
      
      const nrodctoRelacionado = idOrderMapeado 
        ? `${row['Nrodcto']}-${idOrderMapeado}`
        : String(row['Nrodcto'] || '');
      
      return {
        'Nombre Vehiculo': row['NomMensajero'] || '',
        'Título de la Visita': row['NOMBRE'] || '',
        'Dirección': row['DIRECCION'] || '',
        'Latitud': '',
        'Longitud': '',
        'ID Referencia': nrodctoRelacionado,
        'Notas': row['TipoVta'] || '',
        'Persona de Contacto': '',
        'Teléfono': row['TEL1'] || '',
        'Emails': ''
      };
    });
    
    // Crear nuevo workbook
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(libro2Data);
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Hoja1');
    
    // Guardar archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const outputPath = path.join(app.getPath('downloads'), `Libro2_Bogota_${timestamp}.xlsx`);
    XLSX.writeFile(newWorkbook, outputPath);
    
    return {
      success: true,
      message: `Archivo generado exitosamente con ${libro2Data.length} registros.`,
      outputPath: outputPath,
      recordCount: libro2Data.length
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
});
