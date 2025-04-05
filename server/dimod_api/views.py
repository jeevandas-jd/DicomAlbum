# views.py
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import DICOMFile
import pydicom  
import os

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