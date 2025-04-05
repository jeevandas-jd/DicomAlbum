# views.py
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import DICOMFile
import pydicom  
import os
from rest_framework import generics
from .serializers import AlbumSerializer
from .models import Album
from django.shortcuts import get_object_or_404
from .serializers import DICOMFileSerializer
class UploadView(APIView):
    parser_classes = [MultiPartParser]
    
    def post(self, request):
        if not request.FILES:
            return Response({"error": "No files provided"}, status=400)
            
        results = []
        
        for uploaded_file in request.FILES.getlist('files'):
            try:
                # Create a temporary file path
                temp_path = os.path.join('/tmp', uploaded_file.name)
                
                # Save the uploaded file temporarily
                with open(temp_path, 'wb+') as destination:
                    for chunk in uploaded_file.chunks():
                        destination.write(chunk)
                
                # Process DICOM file
                ds = pydicom.dcmread(temp_path)
                
                # Save to your model
                dicom_file = DICOMFile.objects.create(
                    file=uploaded_file,
                    patient_id=getattr(ds, 'PatientID', ''),
                    modality=getattr(ds, 'Modality', '')
                )
                
                results.append({
                    "status": "success",
                    "file": uploaded_file.name,
                    "id": dicom_file.id
                })
                
                # Clean up
                os.remove(temp_path)
                
            except Exception as e:
                results.append({
                    "status": "error",
                    "file": uploaded_file.name,
                    "error": str(e)
                })
        
        return Response({"results": results}, status=201)
class AlbumListCreate(generics.ListCreateAPIView):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer

class AlbumDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer

class AddToAlbumView(APIView):
    def post(self, request, album_id):
        album = get_object_or_404(Album, pk=album_id)
        file_ids = request.data.get('file_ids', [])
        album.dicom_files.add(*file_ids)
        return Response({"status": "success"})
class DICOMFileListView(generics.ListAPIView):
    serializer_class = DICOMFileSerializer
    
    def get_queryset(self):
        queryset = DICOMFile.objects.all()
        
        # Optional filtering
        album_id = self.request.query_params.get('album_id')
        if album_id:
            queryset = queryset.filter(albums__id=album_id)
            
        return queryset