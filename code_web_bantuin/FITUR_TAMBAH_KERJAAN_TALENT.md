# Fitur Tambah Kerjaan untuk Talent

## Deskripsi

Talent sekarang dapat membuat pekerjaan melalui halaman profile mereka, sama seperti client.

## Cara Kerja

### 1. Login sebagai Talent

- Login dengan akun yang memiliki role "talent"
- Badge pink dengan icon bintang akan muncul di profile

### 2. Membuat Pekerjaan

- Di halaman profile, scroll ke section **"Buat Pekerjaan Baru"**
- Klik tombol **"Tambah Kerjaan"**
- Isi form dengan informasi:
  - Judul Pekerjaan
  - Deskripsi
  - Budget (Rp)
  - Deadline
  - Kategori (Design, Development, Marketing, dll)
  - Level (Entry/Intermediate/Expert)
  - Lokasi
  - Tipe Pekerjaan (Full Time, Freelance, dll)
- Klik **"Simpan Pekerjaan"**

### 3. Pekerjaan Ditampilkan

- Pekerjaan yang dibuat akan **langsung muncul** di halaman **Cari Pekerjaan**
- Pekerjaan akan memiliki tag `userRole: "talent"` untuk membedakan dengan pekerjaan dari client

## Storage

Pekerjaan disimpan di 3 lokasi localStorage:

1. `bantuin_tasks` - Global (semua pekerjaan)
2. `bantuin_user_tasks_{email}` - Per user
3. `bantuin_admin_jobs` - Monitoring admin

## Perbedaan dengan Client

- **Client**: Tombol "Tambah Pekerjaan Baru" (section: `uploadTaskSection`)
- **Talent**: Tombol "Tambah Kerjaan" (section: `addJobTalentSection`)
- Keduanya menyimpan ke storage yang sama, sehingga semua pekerjaan muncul di halaman Cari Pekerjaan

## File yang Dimodifikasi

1. `profile.html`:

   - Tambah section `addJobTalentSection`
   - Tambah form `jobFormContainerTalent`
   - Tambah fungsi `toggleJobFormTalent()`
   - Tambah fungsi `handleJobSubmitTalent()`

2. `assets/js/profile.js`:
   - Update visibility control untuk `addJobTalentSection`
   - Hide form saat talent mode, show untuk talent

## Testing

1. Login sebagai talent
2. Buka halaman profile
3. Klik "Tambah Kerjaan"
4. Isi dan submit form
5. Buka halaman "Cari Pekerjaan" → Pekerjaan baru akan muncul
