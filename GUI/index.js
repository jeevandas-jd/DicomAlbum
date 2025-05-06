const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
;
const { setToken, getToken, clearToken } = require('./store');
let mainWindow;

ipcMain.handle('show-open-dialog', async () => {
  return await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'DICOM Files', extensions: ['dcm'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
});
//user-authenticaation
ipcMain.handle('login-user', async (event, { username, password }) => {
  try {
    const response = await axios.post('http://localhost:8000/api/login/', {
      username,
      password
    });
    console.log('Login response:', response.data);
    const { access, refresh } = response.data;
    setToken(access);
    return { access, refresh };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.response?.data?.detail || 'Login failed');
  }
});
ipcMain.handle('register-user', async (event, { username,email, password }) => {
  try {
    const response = await axios.post('http://localhost:8000/api/register/', {
      username,
      email,
      password
    });
    const { access, refresh } = response.data;
    setToken(access);
    return { access, refresh };
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error(error.response?.data?.detail || 'Registration failed');
  }
});
ipcMain.handle('get-token', () => getToken());
ipcMain.handle('logout-user', async () => {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await axios.post('http://localhost:8000/api/logout/', {
        refresh_token: refreshToken
      });
    }
  } catch (err) {
    console.error('Error logging out:', err.response?.data || err.message);
    // Still clear tokens even if server call fails
  }

  clearToken();  // this should clear both access and refresh tokens
  return true;
});

ipcMain.handle('upload-dicom', async (event, filePaths) => {
  try {
    const formData = new FormData();

    filePaths.forEach(filePath => {
      formData.append('files', fs.createReadStream(filePath), {
        filename: path.basename(filePath),
        knownLength: fs.statSync(filePath).size,
        contentType: 'application/dicom'
      });
    });

    const response = await axios.post('http://localhost:8000/api/upload/', formData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
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

ipcMain.handle('albums:list', async () => {
  const response = await axios.get('http://localhost:8000/api/albums/');
  return response.data;
});

ipcMain.handle('albums:create', async (event, { name, file_ids }) => {
  const response = await axios.post('http://localhost:8000/api/albums/create/', {
    name,
    file_ids
  },{headers: 
    {Authorization: `Bearer ${getToken()}`}});
  return response.data;
});
ipcMain.handle('albums:add-files', async (event, { albumId, fileIds }) => {

  const token = await getToken();
  console.log("authentication token:", token);
  const response = await axios.post(`http://localhost:8000/api/albums/${albumId}/add-files/`, {
    file_ids: fileIds
  }); 
  return response.data;
});

ipcMain.handle('albums:get', async () => {
  const response = await axios.get('http://localhost:8000/api/albums/',{headers:{Authorization:`Bearer ${getToken()}`}});
  return response.data;
}
);
ipcMain.handle('albums:get-files', async (event, { albumId }) => {
  const response = await axios.get(`http://localhost:8000/api/albums/${albumId}/files/`);
  return response.data;
}
);

ipcMain.handle('viwer:get', async (event, { id }) => {
  const response = await axios.get(`http://localhost:8000/api/images/${id}/`);
  return response.data;
});
ipcMain.handle('dicom:previewFiltered', async (event, { filters }) => {

  console.log('Received filters:', filters); 
  try {
    const response = await axios.post('http://localhost:8000/api/albums/dicom/preview/',filters);
    return response.data;
  } catch (error) {
    console.error("Error previewing filtered DICOM files:", error.response?.data || error.message);
    throw error;
  }
});
// Handle the event to get album details

ipcMain.handle('album:get-detail', async (event, { albumId }) => {
  const response = await axios.get(`http://localhost:8000/albums/${albumId}/detail/`);
  return response.data;
});

ipcMain.handle('album:update', async (event, { albumId, name, description}) => {

  console.log("authentication token:", getToken());
  const response = await axios.put(
    `http://localhost:8000/albums/${albumId}/detail/`,
    { name, description },
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  return response.data;
});

ipcMain.handle('album:delete', async (event, { albumId, token }) => {
  const response = await axios.delete(
    `http://localhost:8000/albums/${albumId}/detail/`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
});

app.whenReady().then(() => {
  try {
    // Define the path for the preload script
    const preloadPath = path.join(__dirname, 'preload.js');
    
    // Debugging: Log resolved path and check if file exists
    console.log('Resolved Preload Path:', preloadPath);
    
    // Check if the preload script file exists
    const preloadExists = fs.existsSync(preloadPath);
    console.log('Exists?', preloadExists); // Should return true if the file exists
    
    // If preload file doesn't exist, log and handle the error
    if (!preloadExists) {
      throw new Error(`Preload script not found at: ${preloadPath}`);
    }

    // Create the BrowserWindow
    mainWindow = new BrowserWindow({
      width: 1000,
      height: 700,
      webPreferences: {
        preload: preloadPath,
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        sandbox: false
      }
    });

    // Load the main HTML file into the window
    mainWindow.loadFile('src/home.html');

    // Handle any potential errors when loading the window
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error(`Failed to load home.html. Error Code: ${errorCode}, Description: ${errorDescription}`);
    });

  } catch (error) {
    console.error('Error during app initialization:', error);
    // Optionally, show a dialog with the error message
    dialog.showErrorBox('Initialization Error', error.message);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('navigate', (event, page) => {
  mainWindow.loadFile(`src/${page}.html`);
});
