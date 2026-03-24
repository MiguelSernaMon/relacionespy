const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: (title) => ipcRenderer.invoke('select-file', title),
  selectFolder: (title) => ipcRenderer.invoke('select-folder', title),
  processMedellin: (madrePath, ofimaticPath, outputFolder) => ipcRenderer.invoke('process-medellin', madrePath, ofimaticPath, outputFolder),
  processBogota: (ehlpharmaPath, ofimaticPath, outputFolder) => ipcRenderer.invoke('process-bogota', ehlpharmaPath, ofimaticPath, outputFolder),
  processDistrifarma: (distrifarmaPath, outputFolder) => ipcRenderer.invoke('process-distrifarma', distrifarmaPath, outputFolder),
  getCacheInfo: () => ipcRenderer.invoke('get-cache-info'),
  addToCache: () => ipcRenderer.invoke('add-to-cache'),
  removeCacheFile: (fileId) => ipcRenderer.invoke('remove-cache-file', fileId),
  clearCache: () => ipcRenderer.invoke('clear-cache')
});
