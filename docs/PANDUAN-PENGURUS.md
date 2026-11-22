# Panduan Pengurus ITPLN COMBAT (Decap CMS & Dashboard)

Panduan ini disusun untuk pengurus UKM Bela Diri ITPLN COMBAT agar dapat mengelola berita, galeri foto, cabang olahraga, jadwal latihan, dan pengaturan website secara mandiri tanpa menyentuh kode program.

---

## 1. Cara Login dan Mengakses Admin

1. Buka browser dan kunjungi halaman:
   - **Panel Editor Decap CMS**: `/admin/` (contoh: `https://itplncombat.netlify.app/admin/`)
   - **Halaman Overview Dashboard**: `/admin/dashboard`
2. Klik tombol **Login with Netlify Identity** (atau **Login with GitHub** jika menggunakan GitHub OAuth).
3. Masukkan email dan kata sandi akun pengurus yang telah diundang.
4. Di bagian atas halaman `/admin/`, Anda juga dapat langsung melihat **Bar Ringkasan Statistik Konten** (*Total Berita*, *Published*, *Active*, *Upcoming*, *Expired*, dan *Total Galeri*).

---

## 2. Cara Menambahkan & Mengelola Berita (News)

1. Masuk ke `/admin/` lalu pilih koleksi **News (Kabar & Berita)** di menu kiri (atau klik tombol **Kelola News** di bar atas).
2. Klik tombol **New Berita** untuk membuat berita baru.
3. Isi formulir berikut:
   - **Judul Berita**: Judul artikel atau pengumuman.
   - **Slug URL**: Opsional, biarkan kosong agar dibuat otomatis dari judul.
   - **Deskripsi Singkat**: Ringkasan 1–2 kalimat yang tampil pada kartu berita.
   - **Featured Image**: Klik *Choose an image* → *Upload* untuk mengunggah foto utama berita.
   - **Alt Text Gambar**: Deskripsi singkat isi foto.
   - **Kategori Berita**: Pilih *Kegiatan*, *Pertandingan*, *Latihan*, *Pengumuman*, atau *Prestasi*.
   - **Penulis**: Nama penulis atau bidang pengurus (default: *Tim Humas ITPLN COMBAT*).
   - **Tanggal Mulai Berita (`startDate`)**: Tanggal dan jam berita mulai berlaku (WIB).
   - **Tanggal Berakhir Berita (`endDate`)**: Tanggal dan jam masa berlaku berita berakhir (WIB).
   - **Status Publikasi**:
     - Pilih **`Published`** agar berita tampil di website publik.
     - Pilih **`Draft`** jika berita masih konsep dan belum ingin ditampilkan ke publik.
   - **Featured**: Aktifkan jika berita merupakan sorotan utama.
   - **Isi Berita Lengkap**: Tulis isi lengkap artikel menggunakan editor Markdown.
4. Klik tombol **Publish → Publish now** di bagian atas.

### Ketentuan Status Tanggal Otomatis (Zona Waktu Asia/Jakarta):
- **`● UPCOMING`**: Muncul otomatis jika waktu sekarang belum mencapai `startDate`.
- **`● ACTIVE`**: Muncul otomatis jika waktu sekarang berada di antara `startDate` dan `endDate`.
- **`● EXPIRED`**: Muncul otomatis begitu waktu sekarang melewati `endDate` (tanpa perlu diubah manual oleh admin). Berita expired tetap dapat dibaca pengunjung sebagai arsip resmi UKM dengan penanda khusus arsip.

---

## 3. Cara Mengelola Galeri Foto (Gallery)

1. Di halaman `/admin/`, klik menu **Gallery (Dokumentasi Foto)** atau tombol **Kelola Gallery**.
2. Klik **New Foto Galeri** untuk menambah foto dokumentasi baru.
3. Isi kolom:
   - **Judul Foto**: Nama kegiatan atau momen latihan.
   - **Deskripsi Kegiatan**: Penjelasan detail momen yang akan tampil saat foto diklik di Lightbox.
   - **Gambar**: Unggah file foto dari perangkat (maksimal 1600px, disarankan di bawah 500 KB) atau masukkan URL gambar eksternal yang valid.
   - **Alt Text Gambar**: Deskripsi foto untuk aksesibilitas.
   - **Kategori Kegiatan**: Pilih salah satu dari:
     - *Muay Thai*
     - *Boxing*
     - *Tarung Derajat*
     - *MMA*
     - *Training*
     - *Competition*
     - *Events*
   - **Tanggal Kegiatan**: Tanggal berlangsungnya foto tersebut.
   - **Featured Image**: Aktifkan untuk memberi tanda sorotan (`★ Featured`).
   - **Urutan Tampilan**: Angka urutan tampil (angka 1 tampil paling awal).
   - **Status Publikasi**: Pilih `Published` untuk menampilkan di halaman Gallery, atau `Draft` untuk menyembunyikan sementara.
4. Klik **Publish → Publish now**.

---

## 4. Cara Mengelola Cabang Olahraga, Jadwal Latihan & Formulir

- **Cabang Olahraga (Divisions)**:
  Buka koleksi **Cabang Olahraga (Divisions)** → **Daftar Cabang Bela Diri** untuk memperbarui foto cabang, deskripsi lengkap, kurikulum teknik, maupun perlengkapan latihan untuk Muay Thai, Boxing, Tarung Derajat, dan MMA.
- **Profil, Statistik & Jadwal Latihan**:
  Buka koleksi **Tentang & Jadwal UKM** → **Profil, Statistik & Jadwal Latihan** untuk mengubah jadwal latihan di Loby Depan, jumlah anggota aktif, maupun jumlah medali kejuaraan.
- **Link Google Form & Kontak**:
  Buka koleksi **Pengaturan & Kontak** → **Pengaturan Umum** untuk memperbarui tautan Google Form Pendaftaran Anggota, Google Form Merchandise, Instagram, dan email resmi.
