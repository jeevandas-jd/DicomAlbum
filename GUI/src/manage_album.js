// manage_album.js

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const albumId = urlParams.get('album_id');
  
    const albumNameInput = document.getElementById('album-name-input');
    const albumDescriptionInput = document.getElementById('album-description-input');
    const dicomFilesList = document.getElementById('album-dicom-files-list');
  
    // Fetch album data
    async function fetchAlbum() {
      try { 
        const response = await axios.get(`http://localhost:8000/api/albums/${albumId}/detail/`);
        const album = response.data;
  
        albumNameInput.value = album.name;
        albumDescriptionInput.value = album.description;
  
        dicomFilesList.innerHTML = '';
        album.files.forEach(file => {
          const fileItem = document.createElement('div');
          fileItem.className = 'dicom-file-item';
          fileItem.innerText = file.filename || 'Unnamed File';
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
  
    document.getElementById('save-album-changes-btn').addEventListener('click', saveChanges);
    document.getElementById('delete-album-btn').addEventListener('click', deleteAlbum);
  
    fetchAlbum();
  });
  