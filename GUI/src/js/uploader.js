function updateStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = type;
}

async function handleFiles(files) {
  const dicomFiles = Array.from(files).filter(file =>
    file.name.toLowerCase().endsWith('.dcm')
  );

  if (dicomFiles.length === 0) {
    updateStatus('No valid DICOM files found.', 'warning');
    return;
  }

  try {
    updateStatus('Uploading...', 'progress');
    const filePaths = dicomFiles.map(file => file.path); // Electron gives access to file.path only when using dialog or drag-drop via preload
    await window.electronAPI.uploadDICOM(filePaths);
    updateStatus('Upload successful!', 'success');
    console.log('Upload successful');
  } catch (err) {
    updateStatus(`Error: ${err.message}`, 'error');
    console.error('Upload failed:', err);
  }
}

document.getElementById('upload-btn').addEventListener('click', async () => {
  try {
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

    const fakeFileList = result.filePaths.map(path => ({ path, name: path.split(/[\\/]/).pop() }));
    handleFiles(fakeFileList);
  } catch (err) {
    updateStatus(`Error: ${err.message}`, 'error');
    console.error('Upload failed:', err);
  }
});

// 🟦 Drag and Drop support
const dropZone = document.getElementById('drop-zone');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');

  const files = e.dataTransfer.files;
  handleFiles(files);
});
