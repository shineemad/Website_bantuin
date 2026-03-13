# Fitur Buat Pekerjaan di Halaman Cari Pekerjaan

## Deskripsi

Pengguna dapat membuat pekerjaan baru langsung dari halaman **Cari Pekerjaan** melalui tombol "Buat Pekerjaan Baru". Pekerjaan yang dibuat akan otomatis muncul di halaman **Pekerjaan Terbaru**.

## Cara Kerja

### 1. Membuka Form

- Buka halaman **Cari Pekerjaan** (`cari-pekerjaan.html`)
- Di bagian header job feed, klik tombol **"Buat Pekerjaan Baru"** (hijau dengan icon +)
- Modal form akan muncul

### 2. Mengisi Form Pekerjaan

Modal berisi 8 field yang harus diisi:

1. **Judul Pekerjaan** (required)

   - Contoh: "Desain Logo Modern untuk Startup"

2. **Deskripsi** (required)

   - Jelaskan detail pekerjaan, requirements, dan deliverables

3. **Budget (Rp)** (required)

   - Masukkan angka, contoh: 5000000
   - Akan diformat otomatis menjadi "Rp 5.000.000"

4. **Deadline** (required)

   - Pilih tanggal dari date picker

5. **Kategori** (required)

   - Pilihan: Design, Development, Marketing, Writing, Video, Music, Business, Data, Lainnya

6. **Level** (required)

   - Pilihan: Entry Level, Intermediate, Expert

7. **Lokasi** (required)

   - Contoh: "Jakarta, Indonesia" atau "Remote"

8. **Tipe Pekerjaan** (required)
   - Pilihan: Full Time, Part Time, Freelance, Contract, Internship

### 3. Menyimpan Pekerjaan

- Klik tombol **"Simpan Pekerjaan"** (hijau dengan icon ✓)
- Alert konfirmasi akan muncul: "✅ Pekerjaan berhasil dibuat!"
- Modal akan tertutup otomatis
- Form akan di-reset untuk entry berikutnya

### 4. Melihat Pekerjaan

Pekerjaan yang baru dibuat akan:

- ✅ **Langsung muncul** di halaman **Cari Pekerjaan** (refresh otomatis)
- ✅ **Muncul di halaman Pekerjaan Terbaru** dengan badge "BARU"
- ✅ Tersimpan di localStorage untuk persistent data

## Fitur Modal

### Membuka Modal

- Klik tombol "Buat Pekerjaan Baru"
- Atau tekan shortcut keyboard (jika ditambahkan)

### Menutup Modal

Ada 3 cara menutup modal:

1. Klik tombol X (icon close) di header modal
2. Klik tombol "Batal"
3. Klik di luar area modal (overlay)
4. Tekan tombol **ESC** di keyboard

### Validasi Form

- Semua field adalah **required** (wajib diisi)
- Budget harus berupa angka positif (min: 0)
- Browser akan menampilkan pesan error jika ada field kosong

## Storage System

### Triple Storage

Pekerjaan disimpan di 3 lokasi localStorage:

1. **`bantuin_tasks`** (Global)

   - Semua pekerjaan dari semua user
   - Digunakan oleh halaman Cari Pekerjaan dan Pekerjaan Terbaru

2. **`bantuin_user_tasks_{email}`** (Per-User)

   - Pekerjaan spesifik per user
   - Contoh: `bantuin_user_tasks_john@example.com`

3. **`bantuin_admin_jobs`** (Admin Monitoring)
   - Copy untuk monitoring oleh admin

### Format Data

```javascript
{
  id: "job_1733097600000",           // Unique ID (timestamp)
  title: "Desain Logo Modern",       // Judul
  description: "Detail pekerjaan...", // Deskripsi lengkap
  budget: "Rp 5.000.000",            // Budget terformat
  deadline: "2025-12-31",            // Tanggal deadline
  category: "Design",                // Kategori
  level: "Intermediate",             // Level
  location: "Jakarta, Indonesia",    // Lokasi
  type: "Freelance",                 // Tipe pekerjaan
  postedBy: "John Doe",              // Nama pembuat
  postedByEmail: "john@example.com", // Email pembuat
  postedDate: "2024-12-01T10:00:00.000Z", // Timestamp
  status: "open",                    // Status pekerjaan
  source: "cari-pekerjaan"           // Sumber pembuatan
}
```

## Integrasi dengan Pekerjaan Terbaru

### Auto-Load

- Halaman **Pekerjaan Terbaru** otomatis load data dari `bantuin_tasks`
- Pekerjaan baru akan muncul dengan badge **"BARU"**

### Real-time Sync

- Menggunakan `storage` event listener
- Jika user membuka kedua halaman, perubahan akan sync otomatis
- Tidak perlu manual refresh

### Format Display

Pekerjaan dari localStorage ditampilkan dengan:

- ✅ Badge "BARU" (hijau)
- ✅ Icon user + nama pembuat
- ✅ Kategori sebagai tag
- ✅ Lokasi
- ✅ Budget dan tipe pekerjaan

## File yang Dimodifikasi

### 1. `cari-pekerjaan.html`

**Perubahan:**

- ✅ Tombol "Buat Pekerjaan Baru" di header (line ~857)
- ✅ CSS untuk modal (line ~555-677)
- ✅ HTML modal form (line ~1033-1144)
- ✅ JavaScript functions:
  - `openJobModal()` - Buka modal
  - `closeJobModal()` - Tutup modal
  - `handleJobSubmit()` - Handle form submission
  - Event listeners untuk ESC key dan click outside

**Total:** ~250+ baris kode baru

### 2. `pekerjaan-terbaru.html`

**Perubahan:**

- ✅ Fungsi `loadJobsFromStorage()` (sudah ada)
- ✅ Update `renderJobs()` untuk handle 2 format data:
  - Format localStorage (dari form baru)
  - Format dummy data (existing)
- ✅ DOMContentLoaded: merge localStorage + dummy data
- ✅ Storage event listener untuk real-time sync

**Total:** ~50+ baris kode baru/modified

## Testing

### Test Case 1: Membuat Pekerjaan Baru

1. Buka `cari-pekerjaan.html`
2. Klik "Buat Pekerjaan Baru"
3. Isi semua field
4. Klik "Simpan Pekerjaan"
5. Verifikasi:
   - ✅ Alert konfirmasi muncul
   - ✅ Modal tertutup
   - ✅ Pekerjaan muncul di list (paling atas)

### Test Case 2: Tampil di Pekerjaan Terbaru

1. Buka `pekerjaan-terbaru.html`
2. Verifikasi pekerjaan yang baru dibuat muncul
3. Cek badge "BARU" ada
4. Cek informasi lengkap (budget, kategori, lokasi)

### Test Case 3: Validasi Form

1. Buka modal
2. Coba submit tanpa mengisi field
3. Verifikasi browser menampilkan error
4. Isi field bertahap dan verifikasi validasi

### Test Case 4: Menutup Modal

1. Buka modal
2. Test 4 cara menutup:
   - Tombol X
   - Tombol Batal
   - Click di luar modal
   - Tekan ESC
3. Verifikasi form di-reset setelah ditutup

### Test Case 5: Real-time Sync

1. Buka `cari-pekerjaan.html` di satu tab
2. Buka `pekerjaan-terbaru.html` di tab lain
3. Buat pekerjaan baru di tab pertama
4. Verifikasi tab kedua otomatis update (mungkin perlu refresh manual karena storage event)

## Troubleshooting

### Pekerjaan tidak muncul

**Solusi:**

- Buka Console (F12) dan cek error
- Verifikasi localStorage: `localStorage.getItem('bantuin_tasks')`
- Pastikan form tersubmit dengan benar
- Refresh halaman

### Modal tidak terbuka

**Solusi:**

- Cek Console untuk JavaScript error
- Verifikasi fungsi `openJobModal()` terpanggil
- Cek CSS class `.active` ditambahkan ke modal

### Data tidak tersimpan

**Solusi:**

- Cek apakah localStorage enabled di browser
- Verifikasi tidak ada error di Console
- Cek kapasitas localStorage (limit ~5-10MB)

## Browser Compatibility

- ✅ Chrome/Edge (Chromium): Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ⚠️ IE11: Tidak support (localStorage OK, tapi CSS modern mungkin issue)

## Future Enhancements

1. [ ] Upload gambar untuk pekerjaan
2. [ ] Rich text editor untuk deskripsi
3. [ ] Auto-save draft
4. [ ] Duplicate pekerjaan existing
5. [ ] Edit pekerjaan setelah dibuat
6. [ ] Delete pekerjaan
7. [ ] Filter by user (lihat pekerjaan sendiri)
8. [ ] Notifikasi real-time (WebSocket)

## Kesimpulan

Fitur ini memungkinkan user untuk dengan mudah membuat pekerjaan baru langsung dari halaman pencarian, dengan form yang user-friendly dan integrasi seamless ke halaman pekerjaan terbaru. Data tersimpan secara persistent dan dapat diakses cross-page.
