# dicom_api/urls.py (app-level)
from django.urls import path
from .views import (
    UploadView,
    AlbumListCreate,
    AlbumDetail,
    AddToAlbumView,
    DICOMFileListView,
    PreviewFilteredDICOMFilesView,
    deleteAlbumView,
    AlbumDetailView,
    CreateAlbumView,
    LoginView,
    RegisterView,
    LogoutView
)

urlpatterns = [
    # Existing upload endpoint
    path('upload/', UploadView.as_view(), name='upload'),
    #authentication endpoints
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    # Album endpoints
    path('albums/', AlbumListCreate.as_view(), name='album-list'),
    path('albums/<int:pk>/', AlbumDetail.as_view(), name='album-detail'),
    path('albums/<int:album_id>/add-files/', AddToAlbumView.as_view(), name='add-to-album'),
    path('albums/<int:album_id>/add-files/preview/', PreviewFilteredDICOMFilesView.as_view(), name='preview_filtered_dicom_files'),
    path('register/', RegisterView.as_view(), name='register'),
    path('albums/dicom/preview/', PreviewFilteredDICOMFilesView.as_view(), name='preview_dicom_files'),
    path('albums/create/', CreateAlbumView.as_view(), name='create-album'),
    path('albums/delete/<int:album_id>/', deleteAlbumView.as_view(), name='delete-album'),
    path('albums/<int:album_id>/detail/', AlbumDetailView.as_view(), name='album-detail-view'),


    
    # DICOM file list (for album association)
    path('images/', DICOMFileListView.as_view(), name='dicom-list'),
]