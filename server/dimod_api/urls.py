# dicom_api/urls.py (app-level)
from django.urls import path
from .views import (
    UploadView,
    AlbumListCreate,
    AlbumDetail,
    AddToAlbumView,
    DICOMFileListView,
    CreateAlbumFromMetadataView,
    PreviewFilteredDICOMFilesView,
    deleteAlbumView,
    AlbumDetailView
)

urlpatterns = [
    # Existing upload endpoint
    path('upload/', UploadView.as_view(), name='upload'),
    
    # Album endpoints
    path('albums/', AlbumListCreate.as_view(), name='album-list'),
    path('albums/<int:pk>/', AlbumDetail.as_view(), name='album-detail'),
    path('albums/<int:album_id>/add-files/', AddToAlbumView.as_view(), name='add-to-album'),
    path('albums/dicom/preview/', PreviewFilteredDICOMFilesView.as_view(), name='preview_dicom_files'),
    path('albums/create/', CreateAlbumFromMetadataView.as_view(), name='create-album'),
    path('albums/delete/<int:album_id>/', deleteAlbumView.as_view(), name='delete-album'),
    path('albums/<int:album_id>/detail/', AlbumDetailView.as_view(), name='album-detail-view'),
    

    
    # DICOM file list (for album association)
    path('images/', DICOMFileListView.as_view(), name='dicom-list'),
]