# dicom_api/models.py
from django.db import models
class Album(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)
    
class DICOMFile(models.Model):
    file = models.FileField(upload_to='dicom/')
    patient_id = models.CharField(max_length=100, blank=True)
    study_date = models.DateField(null=True, blank=True)
    modality = models.CharField(max_length=10, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)