function navigate(page) {
    switch(page) {
      case 'upload':
        window.location.href = 'uploader.html';
        break;
      case 'albums':
        window.location.href = 'albums.html';
        break;
      case 'viewer':
        window.location.href = 'viewer.html';
        break;
      default:
        console.error('Unknown page:', page);
    }
  }
  
  // IPC communication setup
  window.electronAPI = {
    navigateTo: (page) => navigate(page)
  };