function updateStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = type;
  }

  document.getElementById('upload-btn').addEventListener('click', async () => {
    try {
      // Use Electron's dialog to get files with paths
      const result = await window.electronAPI.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'DICOM Files', extensions: ['dcm'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
  
      if (result.canceled) {
        updateStatus('Upload cancelled', 'warning');
        return;
      }
  
      updateStatus('Uploading...', 'progress');
      await window.electronAPI.uploadDICOM(result.filePaths);
      updateStatus('Upload successful!', 'success');
    } catch (err) {
      updateStatus(`Error: ${err.message}`, 'error');
      console.error('Upload failed:', err);
    }
  });