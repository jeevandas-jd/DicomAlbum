const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  //authentication
  login: (username, password) => ipcRenderer.invoke('login-user', { username, password }),
  register: (username, email, password) => ipcRenderer.invoke('register-user', { username, email, password }),
  getToken: () => ipcRenderer.invoke('get-token'),
  logout: () => ipcRenderer.invoke('logout-user'),
  // file upload
  uploadDICOM: (filePaths) => ipcRenderer.invoke('upload-dicom', filePaths),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  navigateTo: (page) => ipcRenderer.send('navigate', page),
  getAlbums: () => ipcRenderer.invoke('albums:list'),
  createAlbum: (data) => ipcRenderer.invoke('albums:create', data),
  addFilesToAlbum: (data) => ipcRenderer.invoke('albums:add-files', data),

  getAlbumDetails: (albumId) => ipcRenderer.invoke('dicom:album-detail', albumId),
  updateAlbum: (albumId, updatedData) => ipcRenderer.invoke('albums:update', { albumId, updatedData }),
  deleteAlbum: (albumId) => ipcRenderer.invoke('albums:delete', albumId),
  // DICOM file operations
  getAlbumDetail: (albumId) => ipcRenderer.invoke('album:get-detail', { albumId }),

  updateAlbum: (albumId, name, description) =>
    ipcRenderer.invoke('album:update', { albumId, name, description}),

  deleteAlbum: (albumId) =>
    ipcRenderer.invoke('album:delete', { albumId }),
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  on: (channel, callback) => ipcRenderer.on(channel, callback)
});