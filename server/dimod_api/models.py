# dicom_api/models.py
from django.db import models
from django.contrib.auth.models import User
class Album(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    dicom_files = models.ManyToManyField('DICOMFile', related_name='albums', blank=True)

    description = models.TextField(blank=True)
    creator = models.CharField(max_length=100, blank=True)
    filecount = models.IntegerField(default=0)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
class DICOMFile(models.Model):
    filename = models.CharField(max_length=255, blank=True)
    file = models.FileField(upload_to='dicom/')
    patient_id = models.CharField(max_length=100, blank=True)
    study_date = models.DateField(null=True, blank=True)
    modality = models.CharField(max_length=10, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    