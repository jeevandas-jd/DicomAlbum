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
class CreateAlbumView(APIView):
    def post(self, request):
        serializer = AlbumSerializer(data=request.data)
        if serializer.is_valid():
            album = serializer.save()
            return Response({"status": "success", "album_id": album.id}, status=201)
        return Response(serializer.errors, status=400)
    
class DICOMFileListView(generics.ListAPIView):
    queryset = DICOMFile.objects.all()
    serializer_class = DICOMFileSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        el=queryset[0].file
        print(f"File path: {el}")

        print(f"Queryset before filtering haiahaiaha: {queryset}")
        # Add any filtering logic here
        return queryset

class CreateAlbumFromMetadataView(APIView):
    def post(self, request):
        metadata = request.data.get('metadata', {})
        album_name = metadata.get('album_name', 'New Album')
        
        # Create a new album
        album = Album.objects.create(name=album_name)
        
        # Add DICOM files to the album
        file_ids = metadata.get('file_ids', [])
        for file_id in file_ids:
            dicom_file = get_object_or_404(DICOMFile, pk=file_id)
            album.dicom_files.add(dicom_file)
        
        return Response({"status": "success", "album_id": album.id}, status=201)


class PreviewFilteredDICOMFilesView(APIView):
    def post(self, request):
        print("Request data:", request.data)
        
        filters = request.data  # ✅ Fix here
        print("Filters:", filters)
        queryset = DICOMFile.objects.all()

        if 'modality' in filters and filters['modality']:
            queryset = queryset.filter(modality=filters['modality'])
            print(f"Filtered by modality: {filters['modality']}")
            print(f"Filtered queryset: {queryset} by modality")
            print(f"{len(queryset)} files found after filtering by modality")
        if 'patient_id' in filters and filters['patient_id']:
            queryset = queryset.filter(patient_id=filters['patient_id'])
            print(f"Filtered by patient_id: {filters['patient_id']}")

        if 'date_from' in filters and filters['date_from']:
            queryset = queryset.filter(study_date__gte=filters['date_from'])

        if 'date_to' in filters and filters['date_to']:
            queryset = queryset.filter(study_date__lte=filters['date_to'])
        if not queryset.exists():
            #print(f"Filtered queryset: {queryset}")
            return Response({"status": "error", "message": "No files found matching the criteria"}, status=404)
        #print(f"Final Filtered queryset: {queryset}")
        print(f"Number of files found: {queryset.count()}")
        serializer = DICOMFileSerializer(queryset, many=True)
        print(f"Serialized data: {serializer.data}")
        #print(f"Serialized data: {serializer.data}")


        return Response({"status": "success", "files":serializer.data}, status=200)
class deleteAlbumView(APIView):
    def delete(self, request, album_id):
        try:
            album = Album.objects.get(id=album_id)
            album.delete()
            return Response({"status": "success", "message": "Album deleted successfully"}, status=204)
        except Album.DoesNotExist:
            return Response({"status": "error", "message": "Album not found"}, status=404)
        
# Get album details
class AlbumDetailView(APIView):
    def get(self, request, album_id):
        album = get_object_or_404(Album, id=album_id)
        print(f"Album ID: {album.id}")
        print(f"Album Name: {album.name}")
        print(f"Album Description: {album.description}")
        files = DICOMFileSerializer(album.dicom_files.all(), many=True).data
        return Response({
            "name": album.name,
            "description": album.description,
            "files": files,
        })

    def put(self, request, album_id):
        album = get_object_or_404(Album, id=album_id)
        album.name = request.data.get('name', album.name)
        album.description = request.data.get('description', album.description)
        album.save()
        return Response({"status": "success"})

    def delete(self, request, album_id):
        album = get_object_or_404(Album, id=album_id)
        album.delete()  
        return Response({"status": "deleted"})
