class AlbumManager {
  static albums = [];
  static selectedAlbum = null;
  static selectedDicomFiles = new Set();

  static async init() {
    this.setupEventListeners();
    await this.loadAlbums();
    await this.loadDicomFiles();
  }

  static setupEventListeners() {
    document.getElementById('create-album-btn').addEventListener('click', this.showCreateAlbumModal);
    document.getElementById('add-to-album-btn').addEventListener('click', this.addToAlbum.bind(this));
  }

  static showCreateAlbumModal() {
    Swal.fire({
      title: 'Create New Album',
      input: 'text',
      inputLabel: 'Album Name',
      inputPlaceholder: 'Enter album name',
      showCancelButton: true,
      confirmButtonText: 'Create',
    }).then(async (result) => {
      if (result.isConfirmed && result.value.trim()) {
        await AlbumManager.createAlbum(result.value.trim());
      }
    });
  }

  static async createAlbum(name) {
    try {
      const album = await window.electronAPI.invoke('albums:create', { name });
      this.albums.push(album);
      this.renderAlbumList();
      Swal.fire('Success', 'Album created successfully', 'success');
    } catch (error) {
      console.error('Failed to create album:', error);
      Swal.fire('Error', 'Failed to create album', 'error');
    }
  }

  static async loadAlbums() {
    try {
      const albums = await window.electronAPI.invoke('albums:get');
      this.albums = albums;
      this.renderAlbumList();
    } catch (error) {
      console.error('Failed to load albums:', error);
      Swal.fire('Error', 'Failed to load albums', 'error');
    }
  }

  static renderAlbumList() {
    const albumList = document.getElementById('album-list');
    albumList.innerHTML = '';

    this.albums.forEach((album, index) => {
      const div = document.createElement('div');
      div.className = 'album-item';
      div.innerText = album.name;
      div.addEventListener('click', () => this.selectAlbum(index));
      albumList.appendChild(div);
    });
  }

  static selectAlbum(index) {
    this.selectedAlbum = this.albums[index];
    document.getElementById('selected-album-name').innerText = this.selectedAlbum.name;
    document.getElementById('album-details').style.display = 'block';
    this.updateAddToAlbumButtonState();
  }

  static async loadDicomFiles() {
    const container = document.getElementById('dicom-files-list');
    container.innerHTML = '<p>Loading DICOM files...</p>';
    try {
      const response = await axios.get('http://localhost:8000/api/images/');
      this.renderDicomFiles(response.data);
      this.setupFilterListeners();
    } catch (error) {
      console.error('Failed to load DICOM files:', error);
      Swal.fire('Error', 'Failed to load DICOM files', 'error');
    }
  }
  static setupFilterListeners() {
    document.getElementById('apply-filter-btn').addEventListener('click', () => {
      const modality = document.getElementById('filter-modality').value;
      const studyDate = document.getElementById('filter-study-date').value;
  
      this.filteredDicomFiles = this.allDicomFiles.filter(file => {
        const matchesModality = modality ? file.modality === modality : true;
        const matchesDate = studyDate ? file.study_date === studyDate : true;
        return matchesModality && matchesDate;
      });
  
      this.renderDicomFiles(this.filteredDicomFiles);
    });
  
    document.getElementById('clear-filter-btn').addEventListener('click', () => {
      document.getElementById('filter-modality').value = '';
      document.getElementById('filter-study-date').value = '';
      this.filteredDicomFiles = [...this.allDicomFiles];
      this.renderDicomFiles(this.filteredDicomFiles);
    });
  }
  static toggleDicomSelection(file, element) {
    if (this.selectedDicomFiles.has(file)) {
      this.selectedDicomFiles.delete(file);
      element.classList.remove('selected');
    } else {
      this.selectedDicomFiles.add(file);
      element.classList.add('selected');
    }
    this.updateAddToAlbumButtonState();
  }

  static showMetadataPopup(metadata) {
    const popup = document.getElementById('metadata-popup');
    const content = document.getElementById('metadata-content');
    const closeBtn = popup.querySelector('.close-btn');
  
    content.textContent = JSON.stringify(metadata, null, 2); // Pretty format
    popup.classList.remove('hidden');
  
    closeBtn.onclick = () => popup.classList.add('hidden');
  
    // Optional: close on ESC key
    document.onkeydown = (e) => {
      if (e.key === 'Escape') {
        popup.classList.add('hidden');
      }
    };
  }
  static renderDicomFiles(files) {
    const container = document.getElementById('dicom-files-list');
    container.innerHTML = '';

    files.forEach(file => {
      const div = document.createElement('div');
      div.className = 'dicom-file';
      let fileName = file.file.split('/').pop()+"\t\t"+file.id
      div.innerText = fileName;
      div.addEventListener('click', () => this.toggleDicomSelection(file, div));
      const metadata={"patiant_id":file.patient_id,
                      "study_date":file.study_date,
                      "modality":file.modality
      }
      div.addEventListener('dblclick', () => {
        this.showMetadataPopup(metadata || {});
      });
      container.appendChild(div);
    });
  }



  static updateAddToAlbumButtonState() {
    const btn = document.getElementById('add-to-album-btn');
    btn.disabled = !this.selectedAlbum || this.selectedDicomFiles.size === 0;
  }

  static async addToAlbum() {
    if (!this.selectedAlbum || this.selectedDicomFiles.size === 0) {
      Swal.fire('Warning', 'Please select an album and DICOM files first.', 'warning');
      return; 
    }

    try {
      const fileNames = Array.from(this.selectedDicomFiles).map(f => f.name);

      await window.electronAPI.invoke('albums:addFiles', {
        albumId: this.selectedAlbum.id,
        fileNames
      });

      Swal.fire('Success', 'Files added to album successfully.', 'success');
      this.selectedDicomFiles.clear();
      this.updateAddToAlbumButtonState();
      await this.loadDicomFiles(); // Refresh file list
    } catch (error) {
      console.error('Failed to add files to album:', error);
      Swal.fire('Error', 'Failed to add files to album', 'error');
    }
  }
}

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  AlbumManager.init();
});
window.electronAPI.invoke('albums:get')
  .then(albums => {
    AlbumManager.albums = albums;
    AlbumManager.renderAlbumList();
  })
  .catch(error => {
    console.error('Failed to load albums:', error);
  });