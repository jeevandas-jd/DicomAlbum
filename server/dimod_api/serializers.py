# serializers.py
from rest_framework import serializers
from .models import DICOMFile, Album
class DICOMFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DICOMFile
        fields = ['id', 'file','filename', 'patient_id', 'study_date', 'modality']

class AlbumSerializer(serializers.ModelSerializer):
    dicom_files = serializers.PrimaryKeyRelatedField(
        many=True, queryset=DICOMFile.objects.all(), required=False
    )

    class Meta:
        model = Album
        fields = ['id', 'name', 'description', 'created_at', 'dicom_files', 'creator', 'filecount']

    def create(self, validated_data):
        dicom_files = validated_data.pop('dicom_files', [])
        album = Album.objects.create(**validated_data)
        if dicom_files:
            album.dicom_files.set(dicom_files)
        return album

class DICOMFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DICOMFile
        fields = ['id', 'file', 'patient_id', 'study_date', 'modality']
