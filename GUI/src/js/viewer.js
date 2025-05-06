class DICOMViewer {
    static selectedDicomFiles = new Set();
  
    static async init() {
      this.setupEventListeners();
      await this.loadDicomFiles();
    }
  
    static setupEventListeners() {
      document.getElementById('apply-filters-btn').addEventListener('click', async () => {
        const filters = {
          patient_id: document.getElementById('filter-patient-id').value.trim() || undefined,
          modality: document.getElementById('filter-modality').value.trim() || undefined,
          date_from: document.getElementById('filter-date-from').value || undefined,
          date_to: document.getElementById('filter-date-to').value || undefined
        };
        await this.loadFilteredFiles(filters);
      });
  
      document.getElementById('select-all-checkbox').addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.dicom-file-item input[type="checkbox"]');
        checkboxes.forEach(cb => {
          cb.checked = e.target.checked;
          const div = cb.closest('.dicom-file-item');
          const file = JSON.parse(cb.dataset.file);
          this.toggleDicomSelection(file, div, cb.checked);
        });
      });
  
      document.getElementById('add-selected-btn').addEventListener('click', () => {
        if (this.selectedDicomFiles.size === 0) {
          Swal.fire('No Selection', 'Please select DICOM files to proceed.', 'warning');
          return;
        }
        const selectedIds = Array.from(this.selectedDicomFiles).map(f => f.id);
        console.log('Selected DICOM IDs:', selectedIds);
        // You can extend this to send data somewhere or process it.
      });
    }
  
    static async loadDicomFiles() {
      const container = document.getElementById('dicom-files-list');
      container.innerHTML = '<p>Loading DICOM files...</p>';
      try {
        const response = await axios.get('http://localhost:8000/api/images/');
        this.renderDicomFiles(response.data);
      } catch (error) {
        console.error('Failed to load DICOM files:', error);
        Swal.fire('Error', 'Could not load DICOM files.', 'error');
      }
    }
  
    static async loadFilteredFiles(filters) {
      try {
        const response = await window.electronAPI.invoke('dicom:previewFiltered', { filters });
        if (response.status === 'success') {
          this.renderDicomFiles(response.files);
        } else {
          Swal.fire('No Matches', response.message, 'warning');
        }
      } catch (error) {
        console.error('Error applying filters:', error);
        Swal.fire('Error', 'Failed to apply filters.', 'error');
      }
    }
  
    static renderDicomFiles(files) {
      const container = document.getElementById('dicom-files-list');
      container.innerHTML = '';
      this.selectedDicomFiles.clear();
  
      files.forEach(file => {
        const div = document.createElement('div');
        div.className = 'dicom-file-item';
  
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.file = JSON.stringify(file);
        checkbox.addEventListener('change', () => {
          this.toggleDicomSelection(file, div, checkbox.checked);
        });
  
        const label = document.createElement('span');
        label.textContent = `${file.file.split('/').pop()} (ID: ${file.id})`;
  
        div.appendChild(checkbox);
        div.appendChild(label);
  
        div.addEventListener('dblclick', () => {
          const metadata = {
            patient_id: file.patient_id,
            study_date: file.study_date,
            modality: file.modality
          };
          this.showMetadataPopup(metadata);
        });
  
        container.appendChild(div);
      });
    }
  
    static toggleDicomSelection(file, element, isSelected) {
      if (isSelected) {
        this.selectedDicomFiles.add(file);
        element.classList.add('selected');
      } else {
        this.selectedDicomFiles.delete(file);
        element.classList.remove('selected');
      }
    }
  
    static showMetadataPopup(metadata) {
      const formatted = JSON.stringify(metadata, null, 2);
      Swal.fire({
        title: 'DICOM Metadata',
        html: `<pre style="text-align:left;">${formatted}</pre>`,
        confirmButtonText: 'Close'
      });
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    DICOMViewer.init();
  });
  