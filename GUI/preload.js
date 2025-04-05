const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  uploadDICOM: (filePaths) => ipcRenderer.invoke('upload-dicom', filePaths),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog')
});

contextBridge.exposeInMainWorld('electronAPI', {
  navigateTo: (page) => ipcRenderer.send('navigate', page),
  // Add other APIs as needed
});