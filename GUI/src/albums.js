// src/albums.js (Renderer Process)
class AlbumManager {
    static async listAlbums() {
      return await window.electronAPI.invoke('albums:list');
    }
  
    static async createAlbum(name, description) {
      return await window.electronAPI.invoke('albums:create', { name, description });
    }
  
    static async addFilesToAlbum(albumId, fileIds) {
      return await window.electronAPI.invoke('albums:add-files', { albumId, fileIds });
    }
  }
  
  // Example usage:
  // const albums = await AlbumManager.listAlbums();