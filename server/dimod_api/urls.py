# dicom_api/urls.py (app-level)
from django.urls import path
from .views import (
    UploadView,
    AlbumListCreate,
    AlbumDetail,
    AddToAlbumView,
    DICOMFileListView
)

urlpatterns = [
    # Existing upload endpoint
    path('upload/', UploadView.as_view(), name='upload'),
    
    # Album endpoints
    path('albums/', AlbumListCreate.as_view(), name='album-list'),
    path('albums/<int:pk>/', AlbumDetail.as_view(), name='album-detail'),
    path('albums/<int:album_id>/add-files/', AddToAlbumView.as_view(), name='add-to-album'),
    
    # DICOM file list (for album association)
    path('images/', DICOMFileListView.as_view(), name='dicom-list'),
]