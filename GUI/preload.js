const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  uploadDICOM: (filePaths) => ipcRenderer.invoke('upload-dicom', filePaths),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog')
});