# 🚀 QUICK START GUIDE - Posting Pekerjaan

## Untuk Client: Cara Posting Pekerjaan

### Step 1: Login sebagai Client

1. Buka `login.html`
2. Login dengan akun client
3. Atau register baru di `select.html` → Pilih **"Client"**

### Step 2: Buka Profile Page

1. Setelah login, buka `profile.html`
2. Scroll ke bawah ke section **"Posting Pekerjaan"**
3. Klik tombol **"Tambah Tugas Baru"**

### Step 3: Fill Form

Isi semua field yang tersedia:

| Field           | Deskripsi               | Contoh                            |
| --------------- | ----------------------- | --------------------------------- |
| **Judul Tugas** | Judul singkat pekerjaan | "Desain Logo Perusahaan"          |
| **Deskripsi**   | Penjelasan detail tugas | "Butuh desain logo modern..."     |
| **Budget**      | Harga yang ditawarkan   | "Rp 1.000.000" atau "Rp 50rb/jam" |
| **Type**        | Jenis pembayaran        | Fixed-price / Hourly / Monthly    |
| **Level**       | Tingkat kesulitan       | Entry / Intermediate / Expert     |
| **Category**    | Kategori pekerjaan      | Teknologi, Kreatif, Writing, dll  |
| **Location**    | Lokasi pekerjaan        | "Jakarta, ID" atau "Remote"       |
| **Deadline**    | Batas waktu (opsional)  | Pilih tanggal dari kalender       |
| **File**        | Attachment (opsional)   | Upload PDF/DOC/ZIP                |

### Step 4: Submit

1. Klik tombol **"Posting Tugas"**
2. Tunggu notifikasi: "Tugas berhasil diposting dan akan tampil di halaman Cari Pekerjaan!"
3. ✅ Done!

---

## Untuk Talent: Cara Lihat Pekerjaan

### Step 1: Buka Halaman Cari Pekerjaan

1. Buka `cari-pekerjaan.html`
2. Semua pekerjaan otomatis tampil
3. Pekerjaan terbaru ada di **paling atas** dengan badge **"BARU"**

### Step 2: Filter Pekerjaan

**Filter by Category:**

- ☑️ Teknologi & IT
- ☑️ Kreatif & Desain
- ☑️ Writing & Translation
- ☑️ Admin & Support
- ☑️ Pekerjaan Fisik

**Search by Keyword:**

- Ketik di search box
- Cari berdasarkan judul atau deskripsi

### Step 3: Lihat Detail

Setiap job card menampilkan:

- 📋 Judul dan deskripsi
- 💰 Budget
- 📊 Type (Fixed/Hourly/Monthly)
- ⭐ Level (Entry/Intermediate/Expert)
- 📍 Location
- 👤 Info client
- 🕐 Kapan diposting

---

## Testing & Debugging

### Test Manual (Recommended)

1. Buka `test_job_posting.html`
2. Klik **"Add Test Job"**
3. Buka `cari-pekerjaan.html`
4. Job harus tampil di atas!

### Test dengan Profile Page

1. Login sebagai client
2. Buka `profile.html`
3. Posting job via form
4. Buka `cari-pekerjaan.html` (refresh)
5. Job harus tampil

### Check Console

Buka Console (F12) di `cari-pekerjaan.html`:

```
Loading tasks from localStorage...
Parsed tasks: Array(5)
Total jobs to display: 10
```

### Check localStorage

Console command:

```javascript
// View all jobs
console.log(JSON.parse(localStorage.getItem("bantuin_tasks")));

// Count jobs
console.log(JSON.parse(localStorage.getItem("bantuin_tasks")).length);
```

---

## Common Issues & Solutions

### ❌ Issue: Job tidak tampil di Cari Pekerjaan

**Solusi 1:** Hard refresh

- Tekan `Ctrl + Shift + R` (Windows)
- Atau `Cmd + Shift + R` (Mac)

**Solusi 2:** Check localStorage

```javascript
// Apakah ada data?
localStorage.getItem("bantuin_tasks");
// Jika null, tidak ada jobs
```

**Solusi 3:** Clear cache

- `Ctrl + Shift + Delete`
- Pilih "Cached images and files"
- Clear & restart browser

---

### ❌ Issue: Form tidak bisa submit

**Check:**

1. Apakah login sebagai **Client**? (bukan Talent)
2. Apakah Title dan Description sudah diisi?
3. Check Console untuk error message

**Solusi:**

```javascript
// Check current role
const session = JSON.parse(localStorage.getItem("bantuin_session"));
console.log("Role:", session.role);
// Harus: "client"
```

---

### ❌ Issue: Job hilang setelah refresh

**Penyebab:** localStorage cleared atau Private/Incognito mode

**Solusi:**

- Jangan gunakan Private/Incognito
- Jangan clear localStorage
- Enable cookies & local storage di browser settings

---

## Data Structure Reference

### Task Object

```javascript
{
  id: 1733123456789,           // Unique timestamp ID
  title: "Job Title",
  description: "Job description...",
  budget: "Rp 1.000.000",
  type: "Fixed-price",          // Fixed-price | Hourly | Monthly
  level: "Intermediate",        // Entry | Intermediate | Expert
  category: "tekno",            // tekno | kreatif | writing | admin | fisik
  location: "Jakarta, ID",
  tags: ["tekno", "Intermediate", "Fixed-price"],
  deadline: "2025-12-31",       // ISO date or null
  fileName: null,               // Optional attachment
  createdAt: "2025-12-01T10:30:00.000Z",
  status: "open",               // open | in-progress | completed | closed
  owner: "John Doe",            // Client name
  ownerEmail: "john@example.com"
}
```

### Storage Keys

- `bantuin_tasks` - Global storage (all jobs)
- `bantuin_user_tasks_{email}` - Per-user storage
- `bantuin_session` - Login session
- `rpl_profile` - User profile
- `rpl_currentRole` - Current role (client/talent)

---

## Quick Commands (Console)

```javascript
// VIEW ALL JOBS
JSON.parse(localStorage.getItem("bantuin_tasks"));

// COUNT JOBS
JSON.parse(localStorage.getItem("bantuin_tasks")).length;

// ADD TEST JOB
const testJob = {
  id: Date.now(),
  title: "Test Job",
  description: "This is a test job",
  budget: "Rp 500.000",
  type: "Fixed-price",
  level: "Intermediate",
  category: "tekno",
  location: "Jakarta",
  tags: ["tekno", "Intermediate"],
  createdAt: new Date().toISOString(),
  status: "open",
  owner: "Test User",
  ownerEmail: "test@example.com",
};
const jobs = JSON.parse(localStorage.getItem("bantuin_tasks") || "[]");
jobs.unshift(testJob);
localStorage.setItem("bantuin_tasks", JSON.stringify(jobs));
console.log("Test job added!");

// CLEAR ALL JOBS
localStorage.removeItem("bantuin_tasks");
console.log("All jobs cleared!");

// CHECK SESSION
console.log("Session:", localStorage.getItem("bantuin_session"));
console.log("Profile:", localStorage.getItem("rpl_profile"));
console.log("Role:", localStorage.getItem("rpl_currentRole"));
```

---

## File Checklist

Files yang dimodifikasi/dibuat:

- ✅ `profile.html` - Enhanced task form dengan fields lengkap
- ✅ `profile.js` - Task submission & rendering logic
- ✅ `cari-pekerjaan.html` - Dynamic task loading & display
- ✅ `test_job_posting.html` - Testing utility page
- ✅ `FITUR_POSTING_PEKERJAAN.md` - Documentation lengkap
- ✅ `QUICK_START.md` - Quick guide (file ini)

---

## Support

Jika masih ada masalah:

1. **Check Console** (F12 → Console tab)
2. **Check localStorage** (F12 → Application → Local Storage)
3. **Use test_job_posting.html** untuk debugging
4. **Read FITUR_POSTING_PEKERJAAN.md** untuk dokumentasi lengkap

---

**Happy posting! 🚀**

Version: 1.0 | Last Updated: December 1, 2025
