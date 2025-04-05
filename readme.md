# 🧠 DICOM Desktop Viewer MVP

A cross-platform desktop application built using **Electron JS** (frontend) and **Django** (backend) to upload, view, organize, and share DICOM medical images. Developed as a Minimum Viable Product (MVP) within a 10-hour sprint-based development cycle.

---

## 🚀 Features

### 📤 Upload & Metadata
- Upload DICOM `.dcm` files from your computer
- Automatically extract basic metadata using `pydicom`
  - Study ID
  - Scan Type
  - Scan Date
  - Patient ID

### 📁 Album Management
- Create, rename, and delete albums
- Organize DICOM images by patient, study, or topic

### 🔍 Search & Filter
- Filter images by:
  - Scan Type
  - Date Range
  - Patient ID

### 🔗 Share Albums
- Generate shareable public links for albums
- Recipients can view DICOM metadata via browser — no login/software needed

### 🖼️ DICOM Viewer (Basic)
- Open images in external DICOM viewers from within the app
- (Optional) Basic preview using HTML or embed iframe viewers

---

## 🧱 Tech Stack

| Layer         | Tech Used                         |
|---------------|-----------------------------------|
| Frontend      | Electron.js, HTML/CSS/JS          |
| Backend       | Django (Python)                   |
| DICOM Parsing | `pydicom`                         |
| Database      | SQLite (via Django ORM)           |
| Packaging     | `electron-builder` (for later)    |

---

## 📦 Installation

### 🔧 Prerequisites

- [Node.js](https://nodejs.org/) with npm (v18+ recommended)
- [Python 3.10+](https://www.python.org/)
- [pip](https://pip.pypa.io/en/stable/)
- [virtualenv](https://virtualenv.pypa.io/)

### 🛠 Backend (Django)

```bash
cd backend/
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

