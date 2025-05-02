#  Sharable DICOM Album

A cross-platform desktop application to **upload, view, organize, and share DICOM studies**, built using **ElectronJS** for the GUI and **Django REST API** for the backend.  
This project is developed as part of **Google Summer of Code 2025**.

---

##  Features

###  DICOM Upload & Metadata

- Upload DICOM `.dcm` files directly through the desktop app.
- Automatically extract key metadata using `pydicom`:
  - Study ID
  - Scan Type
  - Study Date
  - Patient ID

###  Album Management

- Create, rename, and manage albums for organizing DICOM studies.
- Group studies by patient, diagnosis, or custom tags.

###  Search & Filter

- Filter studies based on:
  - Scan Type
  - Patient ID
  - Date Range
- Quick metadata search within albums.

### Shareable Albums

- Generate secure, shareable links for albums.
- Researchers can access metadata via browser without installing extra software.

###  Simple Study Viewer

- View study metadata and details.
- (Optional) Open images with external DICOM viewers.

---

##  Tech Stack

| Layer     | Technology        |
|-----------|-------------------|
| Frontend  | ElectronJS (HTML, CSS, JS) |
| Backend   | Django + Django REST Framework |
| DICOM Parsing | pydicom         |
| Database  | SQLite (default)    |

---

##  Project Structure

```
sharable-dicom-album/
├── GUI/       # ElectronJS app
├── server/       # Django backend
├── requirements.txt
└── README.md
```

---

##  Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/sharable-dicom-album.git
cd sharable-dicom-album
```

---

### 2. Backend Setup (Django)

```bash
cd server
python3 -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
- Server will be available at `http://127.0.0.1:8000/`

---

### 3. Frontend Setup (ElectronJS)

```bash
cd ../GUI
npm install
npm start
```
- This will launch the Electron desktop application.

---

## ⚙️ Requirements

- Python 3.10+
- Node.js 18+
- Django 4.x
- ElectronJS
- pydicom

(Backend dependencies are listed in `requirements.txt`)

---

##  Future Improvements

- Full DICOM image preview inside the app.
- Advanced album sharing permissions (private/public).
- Packaging the app into an installer using `electron-builder`.

---



---

# 


