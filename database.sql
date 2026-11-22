-- ========================================================
-- DATABASE SCHEMA: ITPLN COMBAT
-- Unit Kegiatan Mahasiswa Bela Diri Institut Teknologi PLN
-- ========================================================

CREATE DATABASE IF NOT EXISTS `itpln_combat` 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `itpln_combat`;

-- 1. Tabel Settings (Pengaturan Umum)
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `link_form_daftar` VARCHAR(255) NOT NULL,
  `link_form_merch` VARCHAR(255) NOT NULL,
  `instagram_url` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `event_nama` VARCHAR(150) NOT NULL,
  `event_tanggal` VARCHAR(50) NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabel About (Profil, Visi, Misi, Syarat)
CREATE TABLE IF NOT EXISTS `about` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tentang` TEXT NOT NULL,
  `visi` TEXT NOT NULL,
  `misi` TEXT NOT NULL,
  `syarat` VARCHAR(255) NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabel Jadwal Latihan (Rabu & Sabtu, 19:00 - 21:00, Loby Depan)
CREATE TABLE IF NOT EXISTS `jadwal` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hari` VARCHAR(50) NOT NULL,
  `waktu` VARCHAR(50) NOT NULL,
  `tempat` VARCHAR(100) NOT NULL,
  `urutan` INT DEFAULT 0
) ENGINE=InnoDB;

-- 4. Tabel Cabang Bela Diri (Disciplines)
CREATE TABLE IF NOT EXISTS `disciplines` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL,
  `deskripsi` TEXT NOT NULL,
  `foto` VARCHAR(255) DEFAULT '',
  `urutan` INT DEFAULT 0
) ENGINE=InnoDB;

-- 5. Tabel Kabar / Berita (Dengan Durasi Postingan: Mulai & Selesai)
CREATE TABLE IF NOT EXISTS `news` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `judul` VARCHAR(255) NOT NULL,
  `kategori` VARCHAR(50) NOT NULL,
  `ringkasan` TEXT NOT NULL,
  `konten` LONGTEXT,
  `foto` VARCHAR(255) DEFAULT '',
  `tanggal_mulai` DATETIME DEFAULT NULL,
  `tanggal_selesai` DATETIME DEFAULT NULL,
  `tanggal` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. Tabel Galeri Foto (Gallery)
CREATE TABLE IF NOT EXISTS `gallery` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `judul` VARCHAR(255) NOT NULL,
  `deskripsi` TEXT,
  `foto` VARCHAR(255) DEFAULT '',
  `kategori` VARCHAR(50) NOT NULL,
  `tanggal` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 7. Tabel Merchandise
CREATE TABLE IF NOT EXISTS `merchandise` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL,
  `harga` VARCHAR(50) NOT NULL,
  `deskripsi` TEXT,
  `foto` VARCHAR(255) DEFAULT '',
  `tersedia` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ========================================================
-- DATA AWAL (SEED DATA)
-- ========================================================

-- Settings
TRUNCATE TABLE `settings`;
INSERT INTO `settings` (`id`, `link_form_daftar`, `link_form_merch`, `instagram_url`, `email`, `event_nama`, `event_tanggal`)
VALUES (1, 'https://forms.gle/GANTI-LINK-FORM-PENDAFTARAN', 'https://forms.gle/GANTI-LINK-FORM-MERCH', 'https://www.instagram.com/itplncombat', 'combat@itpln.ac.id', 'Open Sparring ITPLN', '2026-12-20T09:00:00+07:00');

-- About
TRUNCATE TABLE `about`;
INSERT INTO `about` (`id`, `tentang`, `visi`, `misi`, `syarat`)
VALUES (1, 
'ITPLN COMBAT adalah Unit Kegiatan Mahasiswa di Institut Teknologi PLN yang menjadi wadah olahraga bela diri kontak. Berdiri 2025, kami melatih fisik, mental, dan sportivitas, serta membawa nama kampus ke kejuaraan.',
'Menjadi UKM bela diri yang melahirkan atlet berprestasi dan mahasiswa berkarakter.',
'Membina anggota secara rutin, mengikuti kejuaraan antar kampus, dan membangun komunitas yang aman dan saling menghargai.',
'Syarat: mahasiswa aktif ITPLN dan sehat jasmani');

-- Jadwal Latihan
TRUNCATE TABLE `jadwal`;
INSERT INTO `jadwal` (`hari`, `waktu`, `tempat`, `urutan`) VALUES
('Rabu', '19:00 - 21:00', 'Loby Depan', 1),
('Sabtu', '19:00 - 21:00', 'Loby Depan', 2);

-- Cabang Bela Diri
TRUNCATE TABLE `disciplines`;
INSERT INTO `disciplines` (`nama`, `deskripsi`, `foto`, `urutan`) VALUES
('Muay Thai', 'Seni delapan anggota tubuh. Pukulan, tendangan, siku, dan lutut.', '', 1),
('Boxing', 'Footwork, jab, dan kombinasi. Dasar dari semua striking.', '', 2),
('Tarung Derajat', 'Seni bela diri praktis dan reaksi cepat khas Indonesia. Pukulan, tendangan, bantingan, dan kuncian pertarungan jalanan.', '', 3),
('MMA', 'Gabungan striking, wrestling, dan grappling.', '', 4);

-- Kabar / Berita (Dengan Durasi Postingan)
TRUNCATE TABLE `news`;
INSERT INTO `news` (`judul`, `kategori`, `ringkasan`, `konten`, `foto`, `tanggal_mulai`, `tanggal_selesai`, `tanggal`) VALUES
('Pendaftaran Dibuka', 'Kegiatan', 'Isi formulir dan ikuti sesi latihan perdana di Loby Depan.', 
'Pendaftaran anggota baru UKM Bela Diri ITPLN COMBAT untuk periode tahun akademik 2026/2027 resmi dibuka! Seluruh mahasiswa aktif Institut Teknologi PLN dari berbagai angkatan dan jurusan dipersilakan mendaftar. Latihan rutin diadakan setiap hari Rabu dan Sabtu pukul 19:00 - 21:00 di Loby Depan kampus. Baik pemula yang belum pernah menyentuh beladiri sama sekali maupun yang sudah memiliki pengalaman bertanding, semua akan dibimbing dari dasar dengan kurikulum latihan yang terstruktur dan aman. Jangan lewatkan sesi orientasi dan latihan perdana. Bawa pakaian olahraga yang nyaman dan botol minum. Klik tombol ''Daftar Anggota'' di navigasi untuk mengisi formulir pendaftaran sekarang juga!', 
'', '2026-11-01 08:00:00', '2026-12-15 23:59:00', '2026-11-01'),

('Juara Antar Kampus', 'Pertandingan', 'Atlet ITPLN COMBAT membawa pulang medali emas dan perak.', 
'Kabar gembira dan membanggakan dari kejuaraan bela diri antar perguruan tinggi se-Jabodetabek! Kontingen atlet ITPLN COMBAT berhasil menorehkan prestasi gemilang dengan membawa pulang total 3 medali emas dan 2 medali perak. Capaian ini merupakan buah dari disiplin drilling teknik serta latihan fisik intensif selama berbulan-bulan. Kami berterima kasih atas doa dan dukungan seluruh civitas akademika ITPLN. Semoga prestasi ini menjadi motivasi bagi seluruh anggota untuk terus giat berlatih dan menjunjung tinggi sportivitas di arena pertandingan berikutnya!', 
'', '2026-10-25 09:00:00', '2026-11-25 21:00:00', '2026-10-25'),

('Latihan Gabungan', 'Latihan', 'Sparring bersama UKM bela diri kampus lain.', 
'Guna mengasah mental bertanding dan memperluas silaturahmi antar pegiat bela diri mahasiswa, ITPLN COMBAT sukses menggelar sesi Latihan Gabungan dan Open Sparring. Kegiatan ini diikuti oleh lebih dari 60 atlet dari universitas rekanan. Sesi latihan diawali dengan pemanasan bersama dan drilling teknik kombinasi striking, dilanjutkan dengan sparring persahabatan menggunakan gear pelindung lengkap di bawah pengawasan ketat wasit internal. Acara ditutup dengan evaluasi teknik bersama dan ramah tamah untuk mempererat persaudaraan antar atlet kampus.', 
'', '2026-10-18 14:00:00', '2026-11-20 22:00:00', '2026-10-18'),

('Workshop Pertahanan Diri Mahasiswa', 'Kegiatan', 'Pelatihan teknik bela diri praktis untuk situasi darurat sehari-hari.', 
'ITPLN COMBAT menyelenggarakan workshop pertahanan diri (self-defense) yang terbuka untuk seluruh mahasiswa ITPLN di Loby Depan. Dalam workshop ini, para instruktur mengajarkan teknik melepaskan diri dari cengkeraman, proteksi diri saat diserang tiba-tiba, serta pentingnya situational awareness di tempat umum. Peserta sangat antusias mempraktikkan gerakan-gerakan dasar yang mudah diingat namun sangat efektif untuk melindungi diri.', 
'', '2026-10-05 10:00:00', '2026-11-15 20:00:00', '2026-10-05');

-- Galeri Foto
TRUNCATE TABLE `gallery`;
INSERT INTO `gallery` (`judul`, `deskripsi`, `foto`, `kategori`, `tanggal`) VALUES
('Pelantikan Pengurus', 'Momen pelantikan dan serah terima jabatan kepengurusan ITPLN COMBAT periode 2026/2027 di auditorium kampus bersama pembina UKM.', '', 'Kegiatan', '2026-11-05'),
('Conditioning Pagi', 'Sesi latihan fisik rutin, lari interval, dan calisthenics di lapangan kampus pada Minggu pagi untuk membangun ketahanan kardio atlet.', '', 'Latihan', '2026-10-28'),
('Gathering Anggota', 'Malam keakraban dan sharing session antar anggota baru dan senior untuk mempererat kekeluargaan di UKM ITPLN COMBAT.', '', 'Kegiatan', '2026-10-20'),
('Open Recruitment', 'Stan pendaftaran dan unjuk gelar demonstrasi teknik bela diri saat pekan orientasi mahasiswa baru ITPLN.', '', 'Kegiatan', '2026-10-15'),
('Medali Perdana', 'Penerimaan medali pertama kontingen ITPLN COMBAT di kejuaraan bela diri mahasiswa tingkat regional.', '', 'Pertandingan', '2026-10-08'),
('Drilling Tarung Derajat', 'Sesi latihan teknik pukulan reaksi cepat, tendangan sapuan, dan bantingan khas Tarung Derajat di atas matras.', '', 'Latihan', '2026-09-30'),
('Kejuaraan Antar Kampus', 'Aksi salah satu petarung ITPLN COMBAT saat berlaga di babak final kejuaraan antarkampus dengan semangat pantang menyerah.', '', 'Pertandingan', '2026-09-22'),
('Sparring Boxing', 'Latihan simulasi tanding boxing dengan perlindungan headguard dan sarung tinju resmi untuk mengasah timing dan refleks pertahanan.', '', 'Latihan', '2026-09-15'),
('Latihan Muay Thai', 'Latihan kombinasi pukulan, tendangan roundhouse, dan teknik clinch bersama pelatih Muay Thai di GOR Kampus.', '', 'Latihan', '2026-09-08');

-- Merchandise
TRUNCATE TABLE `merchandise`;
INSERT INTO `merchandise` (`nama`, `harga`, `deskripsi`, `foto`, `tersedia`) VALUES
('Jersey Latihan', 'Rp 135.000', 'Jersey latihan resmi ITPLN COMBAT dengan bahan adem dan cepat kering.', '', 1),
('Hoodie ITPLN COMBAT', 'Rp 225.000', 'Hoodie fleece tebal dengan sablon logo COMBAT tahan lama.', '', 1),
('Kaos Training', 'Rp 95.000', 'Kaos katun combed 24s nyaman untuk latihan harian.', '', 1),
('Gloves Bag', 'Rp 150.000', 'Tas khusus sarung tinju dengan ventilasi jaring anti bau.', '', 1),
('Tumbler', 'Rp 60.000', 'Botol minum stainless tahan dingin untuk hidrasi latihan.', '', 1),
('Stiker Pack', 'Rp 15.000', 'Paket 5 stiker vinyl anti air ITPLN COMBAT.', '', 1);
