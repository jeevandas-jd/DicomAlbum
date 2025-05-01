// manage_album.js

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const albumId = urlParams.get('album_id');
  
    const albumNameInput = document.getElementById('album-name-input');
    const albumDescriptionInput = document.getElementById('album-description-input');
    const dicomFilesList = document.getElementById('album-dicom-files-list');
    const addFilesBtn = document.getElementById('add-files-btn');
  
    // Fetch album data
    async function fetchAlbum() {
      try { 
        const response = await axios.get(`http://localhost:8000/api/albums/${albumId}/detail/`);
        const album = response.data;
        
        albumNameInput.value = album.name;
        albumDescriptionInput.value = album.description;
  
        dicomFilesList.innerHTML = '';
      console.log('Album files:', album.files);
        album.files.forEach(file => {
          const fileItem = document.createElement('div');
          fileItem.className = 'dicom-file-item';
          fileItem.innerText =  file.file.split('/').pop()+"\t\t"+"\t\t\t"+file.modality|| 'Unnamed File';
          dicomFilesList.appendChild(fileItem);
        });
  
      } catch (error) {
        console.error('Error fetching album:', error);
        Swal.fire('Error', 'Failed to load album details.', 'error');
      }
    }
  
    // Save changes
    async function saveChanges() {
      try {
        await axios.put(`http://localhost:8000/api/albums/${albumId}/detail/`, {
          name: albumNameInput.value,
          description: albumDescriptionInput.value,
        });
  
        Swal.fire('Success', 'Album updated successfully.', 'success');
      } catch (error) {
        console.error('Error updating album:', error);
        Swal.fire('Error', 'Failed to update album.', 'error');
      }
    }
  
    // Delete album
    async function deleteAlbum() {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This will permanently delete the album.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
      });
  
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:8000/api/albums/${albumId}/detail/`);
          Swal.fire('Deleted!', 'Album has been deleted.', 'success').then(() => {
            window.location.href = 'albums.html';
          });
        } catch (error) {
          console.error('Error deleting album:', error);
          Swal.fire('Error', 'Failed to delete album.', 'error');
        }
      }
    }
    async function loadDicomFiles(filters = {}) {
      try {
        
        let url = `http://localhost:8000/api/images/`;
        const response = await axios.get(url, { params: filters });
        const list = document.getElementById('dicom-files-list');
        list.innerHTML = '';
    
        response.data.forEach(file => {
          const item = document.createElement('div');
          item.className = 'dicom-file-item';
          item.innerHTML = `<input type="checkbox" value="${file.id}"> ${file.file.split('/').pop()} (${file.modality})`;
          list.appendChild(item);
        });
      } catch (error) {
        console.error('Error loading DICOM files:', error);
      }
    }
  async function loadDicomFilesFilters(filters = {}) {

      try {
        const response = await axios.post('http://localhost:8000/api/albums/dicom/preview/', filters);
        console.log('Received filters:', filters);
        const list = document.getElementById('dicom-files-list');
        list.innerHTML = '';
        console.log('Filtered DICOM files:', response.data.files);
        response.data.files.forEach(file => {
          const item = document.createElement('div');
          item.className = 'dicom-file-item';
          item.innerHTML = `<input type="checkbox" value="${file.id}"> ${file.file.split('/').pop()} (${file.modality})`;
          list.appendChild(item);
        });

      } catch (error) {
        console.error('Error loading DICOM files:', error);
      }
  }
    
  function setupFilterEvents() {
  document.getElementById('apply-filters-btn').addEventListener('click', () => {
    const filters = {
      patient_id: document.getElementById('filter-patient-id').value,
      modality: document.getElementById('filter-modality').value,
      date_from: document.getElementById('filter-date-from').value,
      date_to: document.getElementById('filter-date-to').value,
    };
    loadDicomFilesFilters(filters);
  });

  document.getElementById('add-selected-btn').addEventListener('click', async () => {
    const selected = [...document.querySelectorAll('#dicom-files-list input[type="checkbox"]:checked')]
      .map(cb => cb.value);

    if (selected.length === 0) {
      Swal.fire('No files selected', '', 'warning');
      return;
    }

    try {
      await axios.post(`http://localhost:8000/api/albums/${albumId}/add-files/`, {
        file_ids: selected
      });
      Swal.fire('Added', 'Files added to album', 'success');
      fetchAlbum(); // reload album
      Swal.close(); // close modal
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Could not add files', 'error');
    }
  });
}

    document.getElementById('save-album-changes-btn').addEventListener('click', saveChanges);
    document.getElementById('delete-album-btn').addEventListener('click', deleteAlbum);
    document.getElementById('add-dicom-files-btn').addEventListener('click', async () => {
      try {
        const response = await axios.get('components/dicom_selector.html');
        Swal.fire({
          title: 'Add DICOM Files',
          html: response.data,
          showConfirmButton: false,
          width: '80%',
          didOpen: () => {
            loadDicomFiles();  // defined below
            setupFilterEvents(); // also below
          }
        });
      } catch (error) {
        console.error('Failed to load selector:', error);
      }
    });
    
  
    fetchAlbum();
  });
  