const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: (title) => ipcRenderer.invoke('select-file', title),
  readExcel: (filePath) => ipcRenderer.invoke('read-excel', filePath),
  processBogota: (ehlpharmaPath, ofimaticPath) => ipcRenderer.invoke('process-bogota', ehlpharmaPath, ofimaticPath)
});
