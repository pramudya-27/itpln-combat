# ITPLN COMBAT – Website Resmi UKM Bela Diri Institut Teknologi PLN

Website resmi Unit Kegiatan Mahasiswa (UKM) Bela Diri **ITPLN COMBAT** (Institut Teknologi PLN).
Dibangun menggunakan **Astro (Content Collections + Static Build) + Tailwind CSS + Decap CMS + GitHub Backend + Netlify Deployment**.

---

## ⚡ Fitur Utama & Arsitektur

1. **Design System & Identitas Visual**:
   - Tema gelap agresif khas bela diri (`#000000`, `#0e0e10`, `#e0161d`, `#ff3b30`) dengan tipografi *Anton*, *Barlow Condensed*, dan *Barlow*.
   - Hero section dengan animasi sambaran petir merah & putih-kemerahan (*Light Effect*), *mouse parallax*, dan logo lingkaran resmi di favicon (`/logo.webp`).
2. **Empat Kartu & Halaman Detail Cabang Olahraga (`/divisions/[slug]`)**:
   - **Muay Thai** (`/divisions/muay-thai`)
   - **Boxing** (`/divisions/boxing`)
   - **Tarung Derajat** (`/divisions/tarung-derajat`)
   - **MMA** (`/divisions/mma`)
   - Setiap cabang dilengkapi foto bela diri lokal yang relevan (`/uploads/divisions/*.jpg`), kurikulum materi teknik, standar perlengkapan latihan, jadwal latihan di Loby Depan, serta dokumentasi terkait.
3. **Astro Content Collections dengan Validasi Schema (`src/content/config.ts`)**:
   - **News Collection (`src/content/news/*.md`)**: Artikel berita berbasis Markdown dengan validasi Zod (`title`, `customSlug`, `description`, `featuredImage`, `imageAlt`, `category`, `author`, `startDate`, `endDate`, `publishDate`, `status`, `featured`, dan isi `body` Markdown).
   - **Gallery Collection (`src/content/gallery/*.json`)**: Dokumentasi foto kegiatan dengan validasi Zod (`title`, `description`, `image`, `alt`, `category`, `date`, `featured`, `order`, `status`).
4. **Perhitungan Status Berita Otomatis (Zona Waktu `Asia/Jakarta` / WIB)**:
   - Dihitung otomatis baik saat proses *build* maupun *real-time* di browser pengunjung tanpa perlu admin mengubah status expired secara manual:
     - **`Draft`**: Berita belum dipublikasikan (disembunyikan dari pengunjung publik).
     - **`Upcoming`**: Waktu sekarang belum mencapai `startDate`.
     - **`Active`**: Waktu sekarang berada dalam rentang `startDate` s/d `endDate`.
     - **`Expired`**: Waktu sekarang telah melewati `endDate` (otomatis menampilkan badge **`● EXPIRED`** dan banner arsip berita).
5. **Admin Overview Dashboard Terintegrasi Decap CMS (`/admin/` & `/admin/dashboard`)**:
   - Menampilkan statistik aktual dari Content Collection: *Total Berita*, *Berita Published*, *Berita Active*, *Berita Upcoming*, *Berita Expired*, dan *Total Foto Galeri*.
   - Terintegrasi langsung sebagai toolbar di atas panel `/admin/` serta halaman penuh di `/admin/dashboard` dengan pintasan langsung menuju koleksi Decap CMS.

---

## 📁 Struktur Direktori

```
itpln-combat/
├── public/
│   ├── admin/
│   │   ├── index.html            # Panel Decap CMS + Integrated Overview Bar
│   │   └── config.yml            # Konfigurasi koleksi Decap CMS
│   ├── uploads/
│   │   ├── divisions/            # Foto lokal 4 cabang bela diri
│   │   ├── gallery/              # Foto lokal dokumentasi galeri
│   │   ├── merch/                # Foto merchandise
│   │   └── news/                 # Foto featured image berita
│   ├── _redirects                # Aturan routing Netlify
│   └── logo.webp                 # Favicon & logo resmi ITPLN COMBAT
├── src/
│   ├── content/
│   │   ├── config.ts             # Schema validasi Zod untuk News & Gallery
│   │   ├── news/                 # Artikel berita Markdown (*.md)
│   │   └── gallery/              # Data foto galeri (*.json)
│   ├── data/
│   │   ├── disciplines.json      # Data 4 cabang olahraga & kurikulum
│   │   ├── about.json            # Profil UKM, visi, misi, statistik & jadwal
│   │   ├── settings.json         # Link formulir, kontak, sosial media
│   │   └── merchandise.json      # Katalog merchandise
│   ├── lib/
│   │   ├── dateStatus.js         # Kalkulasi status tanggal timezone Asia/Jakarta
│   │   ├── content.js            # Helper query Content Collections & CMS stats
│   │   └── api.js                # Helper sinkronisasi API lokal
│   ├── components/
│   │   ├── Header.astro          # Navbar sticky & dropdown More
│   │   ├── Footer.astro          # Footer 4 kolom dengan link cabang & admin
│   │   ├── Hero.astro            # Hero section dengan animasi sambaran petir
│   │   ├── StoryRail.astro       # Kartu cabang bela diri interaktif
│   │   ├── Stats.astro           # Statistik dinamis organisasi
│   │   ├── NewsModal.astro       # Quick-view modal berita
│   │   └── Lightbox.astro        # Lightbox foto galeri
│   ├── layouts/
│   │   └── Layout.astro          # Layout utama & Netlify Identity token redirect
│   └── pages/
│       ├── index.astro           # Halaman utama (Home)
│       ├── about.astro           # Profil, cabang, & jadwal latihan Loby Depan
│       ├── gallery.astro         # Galeri foto dengan filter 7 kategori & lightbox
│       ├── merchandise.astro     # Katalog merchandise resmi
│       ├── 404.astro             # Halaman 404
│       ├── divisions/
│       │   └── [slug].astro      # Halaman detail masing-masing cabang bela diri
│       ├── news/
│       │   ├── index.astro       # Daftar berita, filter kategori/status & pagination
│       │   └── [slug].astro      # Halaman detail artikel berita (Markdown)
│       ├── admin/
│       │   └── dashboard.astro   # Halaman Admin Overview Dashboard
│       └── api/
│           └── cms-stats.json.ts # Endpoint JSON statistik Content Collection
├── server/
│   └── server.js                 # GitHub OAuth Proxy & MySQL local sync server
├── netlify.toml                  # Konfigurasi build & headers Netlify (TZ=Asia/Jakarta)
└── package.json
```

---

## 🚀 Perintah Pengembangan & Build

```bash
# 1. Instal dependensi
npm install

# 2. Jalankan server pengembangan Astro (http://localhost:4321)
npm run dev

# 3. Build statis untuk produksi (output ke folder dist/)
npm run build

# 4. Preview hasil build produksi
npm run preview
```

### Menjalankan Decap CMS di Lokal
1. Buka `public/admin/config.yml` dan aktifkan `local_backend: true` untuk sementara.
2. Jalankan `npx decap-server` pada terminal terpisah bersamaan dengan `npm run dev`.
3. Akses `http://localhost:4321/admin/` atau `http://localhost:4321/admin/dashboard`.
*(Pastikan `local_backend: true` dikomentari kembali sebelum push ke produksi).*

---

## 🌐 Konfigurasi Hosting, OAuth & Deployment

### A. Deployment di Netlify (Direkomendasikan)
1. Hubungkan repository GitHub ke Netlify (branch `main`).
2. Netlify otomatis membaca `netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment**: `NODE_VERSION = "20"`, `TZ = "Asia/Jakarta"`
3. Aktifkan **Netlify Identity**:
   - Buka **Site configuration → Identity → Enable Identity**.
4. Aktifkan **Git Gateway**:
   - Buka **Site configuration → Identity → Services → Git Gateway → Enable Git Gateway**.
5. Undang akun pengurus melalui tab **Identity → Invite users**.
6. Setiap commit yang disimpan pengurus melalui `/admin/` akan otomatis memicu Netlify melakukan build ulang dalam 1–2 menit.

### B. Deployment di Hosting Non-Netlify (Cloudflare Pages / Vercel / VPS)
Jika menggunakan hosting selain Netlify, Git Gateway tidak tersedia secara otomatis. Gunakan backend `github` dengan OAuth Proxy yang sudah disiapkan di `server/server.js` (`/auth` dan `/callback`):
1. Buat **GitHub OAuth App** di **GitHub Settings → Developer settings → OAuth Apps**:
   - **Authorization callback URL**: `https://domain-oauth-anda.com/callback`
2. Simpan `GITHUB_CLIENT_ID` dan `GITHUB_CLIENT_SECRET` di **Environment Variables** server OAuth (jangan pernah ditaruh di kode frontend!).
3. Ubah bagian `backend` di `public/admin/config.yml`:
   ```yaml
   backend:
     name: github
     repo: organisasi/itpln-combat
     branch: main
     base_url: https://domain-oauth-anda.com
     auth_endpoint: auth
   ```
