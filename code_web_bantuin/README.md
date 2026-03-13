# 🚀 bantu.in - Platform Marketplace Pekerjaan & Talent

Website marketplace untuk menghubungkan pencari kerja (talents) dengan perusahaan (clients).

## 📋 Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js + Express.js
- **Database:** MySQL (via XAMPP)
- **Authentication:** JWT (JSON Web Token)

## 🔧 Quick Start

### 1. Setup XAMPP

1. Install XAMPP dan start **Apache** + **MySQL**
2. Buka phpMyAdmin: `http://localhost/phpmyadmin`
3. Import database: Copy isi `database/schema.sql` → Execute di SQL tab

### 2. Install & Run Backend

```powershell
cd backend
npm install
npm start
```

Backend: `http://localhost:3000`

### 3. Run Frontend

```powershell
python -m http.server 8000
```

Frontend: `http://localhost:8000/beranda.html`

## 👥 Sample Accounts

- **Admin:** admin@bantuin.com / admin123
- **Client:** client@test.com / client123
- **Talent:** talent@test.com / talent123

## 🌐 Pages

- Homepage: `/beranda.html`
- Login: `/login.html`
- Register: `/register-client.html`, `/register-talent.html`
- Test API: `/test-api.html`

## 📚 Dokumentasi

- `SETUP-XAMPP.md` - Setup database dengan XAMPP
- `SETUP-BACKEND.md` - Dokumentasi backend API
- `INTEGRASI-API.md` - Panduan integrasi frontend-backend

## 📁 Struktur

```
├── assets/js/        # Frontend modules
├── backend/          # Node.js API server
├── database/         # SQL schema
└── *.html           # Frontend pages
```

## 🧪 Testing

```powershell
# Test backend
Invoke-RestMethod -Uri "http://localhost:3000"

# Test jobs API
Invoke-RestMethod -Uri "http://localhost:3000/api/jobs"
```

Lihat `SETUP-XAMPP.md` untuk panduan lengkap.
