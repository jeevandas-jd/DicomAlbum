// src/metadata-viewer.js
function renderMetadata(dicomData) {
    return `
      <div class="metadata-section">
        <h3>Patient Info</h3>
        <p>ID: ${dicomData.patient_id}</p>
        
        <h3>Study Info</h3>
        <p>Modality: ${dicomData.modality}</p>
        <p>Body Part: ${dicomData.body_part}</p>
        <p>Description: ${dicomData.study_description}</p>
      </div>
    `;
  }
  
  // Usage: 
  // document.getElementById('metadata-viewer').innerHTML = renderMetadata(file);