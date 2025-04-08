const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  uploadDICOM: (filePaths) => ipcRenderer.invoke('upload-dicom', filePaths),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  navigateTo: (page) => ipcRenderer.send('navigate', page),
  getAlbums: () => ipcRenderer.invoke('albums:list'),
  createAlbum: (data) => ipcRenderer.invoke('albums:create', data),
  addFilesToAlbum: (data) => ipcRenderer.invoke('albums:add-files', data),
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  on: (channel, callback) => ipcRenderer.on(channel, callback)
});
