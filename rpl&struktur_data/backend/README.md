# Bantu.in Backend API

Backend REST API untuk platform job marketplace Bantu.in menggunakan Node.js, Express, dan MySQL.

## 📋 Persyaratan

- Node.js >= 18.0.0
- MySQL >= 8.0 atau PostgreSQL >= 13
- npm >= 9.0.0

## 🚀 Instalasi

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Database

Buat database MySQL:

```bash
mysql -u root -p
CREATE DATABASE bantuin_db;
USE bantuin_db;
SOURCE ../database/schema.sql;
EXIT;
```

### 3. Konfigurasi Environment

Copy file `.env.example` ke `.env`:

```bash
copy .env.example .env
```

Edit `.env` dan sesuaikan dengan konfigurasi Anda:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bantuin_db
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:8000
```

### 4. Jalankan Server

Development mode (auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint           | Deskripsi          | Auth |
| ------ | ------------------ | ------------------ | ---- |
| POST   | `/register`        | Register user baru | ❌   |
| POST   | `/login`           | Login user         | ❌   |
| GET    | `/profile`         | Get profile user   | ✅   |
| PUT    | `/profile`         | Update profile     | ✅   |
| POST   | `/change-password` | Ubah password      | ✅   |
| POST   | `/logout`          | Logout             | ✅   |
| GET    | `/verify`          | Verify token       | ✅   |

### Jobs (`/api/jobs`)

| Method | Endpoint      | Deskripsi                | Auth |
| ------ | ------------- | ------------------------ | ---- |
| GET    | `/`           | Get all jobs             | ❌   |
| GET    | `/:id`        | Get job by ID            | ❌   |
| POST   | `/`           | Create job (client only) | ✅   |
| PUT    | `/:id`        | Update job               | ✅   |
| DELETE | `/:id`        | Delete job               | ✅   |
| POST   | `/:id/save`   | Save/unsave job          | ✅   |
| GET    | `/saved/list` | Get saved jobs           | ✅   |
| GET    | `/my/list`    | Get my jobs              | ✅   |

### Talents (`/api/talents`)

| Method | Endpoint             | Deskripsi                   | Auth |
| ------ | -------------------- | --------------------------- | ---- |
| GET    | `/`                  | Get all talents             | ❌   |
| GET    | `/:id`               | Get talent by ID            | ❌   |
| POST   | `/`                  | Create talent (talent only) | ✅   |
| PUT    | `/:id`               | Update talent               | ✅   |
| DELETE | `/:id`               | Delete talent               | ✅   |
| POST   | `/user/:userId/save` | Save/unsave talent          | ✅   |
| GET    | `/saved/list`        | Get saved talents           | ✅   |
| GET    | `/my/list`           | Get my talents              | ✅   |

## 🔐 Authentication

API menggunakan JWT (JSON Web Token) untuk authentication.

### Request Header:

```
Authorization: Bearer <your_jwt_token>
```

### Response Format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    "user": {...},
    "token": "jwt_token_here"
  }
}
```

## 📝 Request Examples

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "client",
    "company": "PT Example"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Job

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Full Stack Developer",
    "company": "PT Example",
    "description": "Looking for experienced developer",
    "location": "Jakarta",
    "job_type": "full-time",
    "work_mode": "hybrid",
    "salary_min": 8000000,
    "salary_max": 12000000
  }'
```

### Get All Jobs

```bash
curl http://localhost:3000/api/jobs?status=open&location=Jakarta&limit=10
```

## 🛡️ Security Features

- ✅ Helmet.js - Security headers
- ✅ CORS - Cross-Origin Resource Sharing
- ✅ Rate Limiting - Prevent brute force attacks
- ✅ JWT Authentication - Secure token-based auth
- ✅ Bcrypt - Password hashing
- ✅ Input Validation - express-validator
- ✅ SQL Injection Protection - Parameterized queries

## 🔧 Environment Variables

| Variable         | Deskripsi           | Default                 |
| ---------------- | ------------------- | ----------------------- |
| `PORT`           | Server port         | `3000`                  |
| `NODE_ENV`       | Environment mode    | `development`           |
| `DB_HOST`        | Database host       | `localhost`             |
| `DB_PORT`        | Database port       | `3306`                  |
| `DB_USER`        | Database user       | `root`                  |
| `DB_PASSWORD`    | Database password   | -                       |
| `DB_NAME`        | Database name       | `bantuin_db`            |
| `JWT_SECRET`     | JWT secret key      | -                       |
| `JWT_EXPIRES_IN` | Token expiration    | `7d`                    |
| `CORS_ORIGIN`    | Allowed CORS origin | `http://localhost:8000` |

## 📁 Struktur Folder

```
backend/
├── config/
│   └── database.js         # Database connection
├── controllers/
│   ├── authController.js   # Auth logic
│   ├── jobController.js    # Job logic
│   └── talentController.js # Talent logic
├── middleware/
│   ├── auth.js            # JWT verification
│   ├── validator.js       # Input validation
│   └── errorHandler.js    # Error handling
├── models/
│   ├── User.js           # User model
│   ├── Job.js            # Job model
│   └── Talent.js         # Talent model
├── routes/
│   ├── authRoutes.js     # Auth routes
│   ├── jobRoutes.js      # Job routes
│   └── talentRoutes.js   # Talent routes
├── .env                  # Environment variables
├── .env.example          # Env template
├── .gitignore
├── package.json
└── server.js            # Main server file
```

## 🧪 Testing

Gunakan Postman, Thunder Client, atau curl untuk testing API.

Import collection Postman (coming soon).

## 🐛 Troubleshooting

### Database Connection Error

```
❌ Database connection failed: Access denied
```

**Solusi:**

- Cek credentials di `.env`
- Pastikan MySQL service berjalan
- Cek firewall/port 3306

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solusi:**

- Ubah PORT di `.env`
- Atau stop process yang menggunakan port 3000

### Token Expired

```
401 Token sudah kadaluarsa
```

**Solusi:**

- Login ulang untuk mendapatkan token baru
- Token default expired 7 hari

## 📄 License

MIT

## 👥 Author

Bantu.in Team - 2025
