# serializers.py
from rest_framework import serializers
from .models import DICOMFile, Album
class DICOMFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DICOMFile
        fields = '__all__'

class AlbumSerializer(serializers.ModelSerializer):
    dicom_files = DICOMFileSerializer(many=True, read_only=True)
    
    class Meta:
        model = Album
        fields = ['id', 'name', 'description', 'created_at', 'dicom_files']
class DICOMFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DICOMFile
        fields = ['id', 'file', 'patient_id', 'study_date', 'modality']
