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
      document.getElementById('create-album-btn').addEventListener('click', async () => {
        if (this.selectedDicomFiles.size === 0) {
          Swal.fire('No Selection', 'Please select DICOM files first!', 'warning');
          return;
        }
        const selectedIds = Array.from(this.selectedDicomFiles).map(file => file.id);
        console.log('Selected DICOM IDs:', selectedIds);
        await this.showCreateAlbumModal(selectedIds);
      });
    
      document.getElementById('add-to-album-btn').addEventListener('click', this.addToAlbum.bind(this));
    
      document.getElementById('apply-filters-btn').addEventListener('click', async () => {
        const patientId = document.getElementById('filter-patient-id').value.trim();
        const modality = document.getElementById('filter-modality').value.trim();
        const dateFrom = document.getElementById('filter-date-from').value;
        const dateTo = document.getElementById('filter-date-to').value;
    
        const filters = {
          patient_id: patientId || undefined,
          modality: modality || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined
        };
    
        await this.loadFilteredFiles(filters);
      });
    }
    

    static async showCreateAlbumModal(file_ids) {
      const { value: albumName } = await Swal.fire({
        title: 'Create New Album',
        input: 'text',
        inputLabel: 'Album Name',
        inputPlaceholder: 'Enter album name',
        showCancelButton: true,
        confirmButtonText: 'Create',
      });
    
      if (albumName && albumName.trim()) {
        await AlbumManager.createAlbum(albumName.trim(), file_ids);
      }
    }
    

    static async createAlbum(name, selectedDicomIds = []) {
      try {
        const album = await window.electronAPI.invoke('albums:create', { name, file_ids: selectedDicomIds });
        this.albums.push(album);
        this.renderAlbumList();
        Swal.fire('Success', 'Album created successfully with selected images!', 'success');
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
    
      this.albums.forEach((album) => {
        const div = document.createElement('div');
        div.className = 'album-item';
    
        // Build inner HTML with all fields
        div.innerHTML = `
          <div class="album-cover">
            <img src="${album.coverUrl || 'assets/default_cover.png'}" alt="Cover" style="max-height: 100%; max-width: 100%; object-fit: cover;" />
          </div>
          <div class="album-item-header" style="padding: 10px;">
            <strong>${album.name}</strong>
            <span class="file-count">${album.fileCount || 0} files</span>
          </div>
          <div class="album-description" style="padding: 0 10px;">
            ${album.description || 'No description'}
          </div>
          <div class="album-meta" style="padding: 0 10px 10px;">
            Created: ${album.createdAt || 'N/A'}
          </div>
        `;
    
        div.addEventListener('click', () => {
          window.location.href = `manage_album.html?album_id=${album.id}`;
        });
    
        albumList.appendChild(div);
      });
    }


    // This function is called when the user selects a filter
    static async loadFilteredFiles(filters) {
      try {
        const response = await window.electronAPI.invoke('dicom:previewFiltered',  {filters} );
        console.log('Filtered DICOM files:', response);

        if (response.status === 'success') {
          //this.filteredFiles = response.file;
          this.renderDicomFiles(response.files) // You should define this to show the preview list
        } else {
          console.warn('No matching files found');
          Swal.fire('No Matches', response.message, 'warning');
        }
      } catch (error) {
        console.error('Failed to load filtered DICOM files:', error);
        Swal.fire('Error', 'Failed to load filtered files', error);
        console.log(error);
      }
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
        //this.setupFilterListeners();
      } catch (error) {
        console.error('Failed to load DICOM files:', error);
        Swal.fire('Error', 'Failed to load DICOM files but its working', 'error');
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
  //
    static async showImageSelectionModal() {
      try {
        const response = await axios.get('http://localhost:8000/api/images/');
        const dicomFiles = response.data;
    
        let checkboxesHtml = `
          <button id="select-all-btn">Select All</button>
          <button id="deselect-all-btn">Deselect All</button><br><br>
          <div style="max-height: 300px; overflow-y: auto; text-align: left;">
        `;
    
        dicomFiles.forEach(file => {
          checkboxesHtml += `
            <input type="checkbox" class="dicom-checkbox" value="${file.id}" id="file-${file.id}">
            <label for="file-${file.id}">${file.patient_id || 'Unnamed'} - ${file.modality || ''}</label><br>
          `;
        });
    
        checkboxesHtml += `</div>`;
    
        const { value: selectedFiles } = await Swal.fire({
          title: 'Select DICOM Files',
          html: checkboxesHtml,
          showCancelButton: true,
          confirmButtonText: 'Next',
          focusConfirm: false,
          preConfirm: () => {
            const selected = Array.from(document.querySelectorAll('.dicom-checkbox:checked')).map(cb => cb.value);
            if (selected.length === 0) {
              Swal.showValidationMessage('Please select at least one file');
            }
            return selected;
          },
          didOpen: () => {
            document.getElementById('select-all-btn').addEventListener('click', () => {
              document.querySelectorAll('.dicom-checkbox').forEach(cb => cb.checked = true);
            });
            document.getElementById('deselect-all-btn').addEventListener('click', () => {
              document.querySelectorAll('.dicom-checkbox').forEach(cb => cb.checked = false);
            });
          }
        });
    
        if (selectedFiles) {
          await AlbumManager.showCreateAlbumModal(selectedFiles);
        }
    
      } catch (error) {
        console.error('Failed to load DICOM files for selection:', error);
        Swal.fire('Error', 'Failed to load files', 'error');
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