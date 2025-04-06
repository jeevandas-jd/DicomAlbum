class AlbumManager {
  static selectedAlbum = null;
  static selectedDicomFiles = new Set();

  static async init() {
    this.bindEvents();
    await this.loadAlbums();
    await this.loadDicomFiles();
  }

  static bindEvents() {
    // Album creation
    document.getElementById('create-album-btn').addEventListener('click', () => {
      this.showCreateAlbumDialog();
    });

    // Add to album
    document.getElementById('add-to-album-btn').addEventListener('click', () => {
      this.addFilesToSelectedAlbum();
    });

    // Search functionality
    document.getElementById('dicom-search').addEventListener('input', (e) => {
      this.filterDicomFiles(e.target.value);
    });
  }

  static async loadAlbums() {
    try {
      const albums = await this.listAlbums();
      this.renderAlbumList(albums);
    } catch (error) {
      console.error('Failed to load albums:', error);
      Swal.fire('Error', 'Failed to load albums', 'error');
    }
  }

  static async loadDicomFiles() {
    try {
      const response = await axios.get('http://localhost:8000/api/images/');
      console.log('Loaded DICOM files:', response.data);
      this.renderDicomFiles(response.data);
    } catch (error) {
      console.error('Failed to load DICOM files:', error);
      Swal.fire('Error', 'Failed to load DICOM files', 'error');
      console.error('Failed to load DICOM files:', error);
      Swal.fire('Error', 'Failed to load DICOM files', 'error');
    }
  }

  static renderAlbumList(albums) {
    const albumList = document.getElementById('album-list');
    albumList.innerHTML = '';

    if (albums.length === 0) {
      albumList.innerHTML = '<div class="empty-state">No albums created yet</div>';
      return;
    }

    albums.forEach(album => {
      const albumElement = document.createElement('div');
      albumElement.className = 'album-item';
      albumElement.dataset.albumId = album.id;
      
      albumElement.innerHTML = `
        <div class="album-item-header">
          <h3>${album.name}</h3>
          <span class="file-count">${album.dicom_files?.length || 0} files</span>
        </div>
        <p class="album-description">${album.description || 'No description'}</p>
        <div class="album-meta">
          <small>Created: ${new Date(album.created_at).toLocaleDateString()}</small>
        </div>
      `;

      albumElement.addEventListener('click', () => this.selectAlbum(album));
      albumList.appendChild(albumElement);
    });
  }

  static renderDicomFiles(files) {
    const filesContainer = document.getElementById('dicom-files-list');
    filesContainer.innerHTML = '';

    if (files.length === 0) {
      filesContainer.innerHTML = '<div class="empty-state">No DICOM files available</div>';
      return;
    }

    files.forEach(file => {
      const fileElement = document.createElement('div');
      fileElement.className = 'dicom-file-item';
      fileElement.dataset.fileId = file.id;
      
      fileElement.innerHTML = `
        <div class="file-thumbnail">
          <img src="http://localhost:8000${file.thumbnail_url || '/static/default-dicom.png'}" alt="DICOM thumbnail">
          <div class="selection-checkbox"></div>
        </div>
        <div class="file-info">
          <h4>${file.patient_id || 'Unknown Patient'}</h4>
          <p>${file.modality} • ${file.study_date || 'Unknown date'}</p>
          <p class="file-study">${file.study_description || ''}</p>
        </div>
      `;

      fileElement.addEventListener('click', (e) => {
        if (!e.target.closest('.file-thumbnail')) return;
        this.toggleFileSelection(file.id, fileElement);
      });

      filesContainer.appendChild(fileElement);
    });
  }

  static toggleFileSelection(fileId, element) {
    if (this.selectedDicomFiles.has(fileId)) {
      this.selectedDicomFiles.delete(fileId);
      element.classList.remove('selected');
    } else {
      this.selectedDicomFiles.add(fileId);
      element.classList.add('selected');
    }
    
    // Show/hide add to album button
    if (this.selectedAlbum && this.selectedDicomFiles.size > 0) {
      document.getElementById('add-to-album-btn').style.display = 'block';
    } else {
      document.getElementById('add-to-album-btn').style.display = 'none';
    }
  }

  static selectAlbum(album) {
    this.selectedAlbum = album;
    
    // Update UI
    document.querySelectorAll('.album-item').forEach(item => {
      item.classList.toggle('active', item.dataset.albumId === album.id.toString());
    });
    
    // Show album details
    document.getElementById('album-details').style.display = 'block';
    document.getElementById('album-detail-name').textContent = album.name;
    document.getElementById('album-detail-description').textContent = album.description || 'No description available';
    
    // Highlight files already in this album
    if (album.dicom_files && album.dicom_files.length > 0) {
      const albumFileIds = album.dicom_files.map(f => f.id);
      document.querySelectorAll('.dicom-file-item').forEach(item => {
        item.classList.toggle(
          'in-album', 
          albumFileIds.includes(parseInt(item.dataset.fileId))
        );
      });
    }
  }

  static async addFilesToSelectedAlbum() {
    if (!this.selectedAlbum || this.selectedDicomFiles.size === 0) return;
    
    try {
      await this.addFilesToAlbum(
        this.selectedAlbum.id, 
        Array.from(this.selectedDicomFiles)
      );
      
      Swal.fire('Success', 'Files added to album', 'success');
      await this.loadAlbums(); // Refresh album list
      this.selectedDicomFiles.clear();
      
      // Clear selection
      document.querySelectorAll('.dicom-file-item.selected').forEach(item => {
        item.classList.remove('selected');
      });
      
    } catch (error) {
      console.error('Failed to add files:', error);
      Swal.fire('Error', 'Failed to add files to album', 'error');
    }
  }

  static async showCreateAlbumDialog() {
    const { value: formValues } = await Swal.fire({
      title: 'Create New Album',
      html:
        '<input id="album-name" class="swal2-input" placeholder="Album Name" required>' +
        '<textarea id="album-desc" class="swal2-textarea" placeholder="Description"></textarea>',
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById('album-name').value.trim();
        if (!name) {
          Swal.showValidationMessage('Album name is required');
          return false;
        }
        return {
          name,
          description: document.getElementById('album-desc').value.trim()
        };
      }
    });

    if (formValues) {
      try {
        await this.createAlbum(formValues.name, formValues.description);
        await this.loadAlbums();
        Swal.fire('Success', 'Album created successfully', 'success');
      } catch (error) {
        console.error('Album creation failed:', error);
        Swal.fire('Error', 'Failed to create album', 'error');
      }
    }
  }

  static filterDicomFiles(searchTerm) {
    const term = searchTerm.toLowerCase();
    document.querySelectorAll('.dicom-file-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(term) ? 'flex' : 'none';
    });
  }

  // API Methods
  static async listAlbums() {
    const response = await window.electronAPI.invoke('albums:list');
    return response;
  }

  static async createAlbum(name, description) {
    return await window.electronAPI.invoke('albums:create', { name, description });
  }

  static async addFilesToAlbum(albumId, fileIds) {
    return await window.electronAPI.invoke('albums:add-files', { albumId, fileIds });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  AlbumManager.init();
});