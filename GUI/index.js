const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data'); // Need to explicitly require FormData

let mainWindow;
const { dialog } = require('electron');

ipcMain.handle('show-open-dialog', async () => {
  return await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'DICOM Files', extensions: ['dcm'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
});
// Handle DICOM uploads
ipcMain.handle('upload-dicom', async (event, filePaths) => {
  try {
    const formData = new FormData();

    // Add each file with proper filename
    filePaths.forEach(filePath => {
      formData.append('files', fs.createReadStream(filePath), {
        filename: path.basename(filePath),
        knownLength: fs.statSync(filePath).size,
        contentType: 'application/dicom'
      });
    });

    const response = await axios.post('http://localhost:8000/api/upload/', formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Length': formData.getLengthSync()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    return response.data;
  } catch (error) {
    console.error('Full upload error:', error);
    throw new Error(error.response?.data?.detail || 'Upload failed');
  }
});

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  mainWindow.loadFile('src/uploader.html');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});