# Adena Reis Vanrika — Portfolio

Portfolio React 18 + Vite untuk full-stack web developer di Jakarta. Desain memakai Barlow dan Barlow Condensed lokal, palet hitam/putih/oranye, serta konten Indonesia dan Inggris.

## Menjalankan

```sh
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

Di PowerShell yang membatasi skrip, gunakan `npm.cmd`.

## Konten dan komponen

- `src/components/portfolioContent.js`: profil, enam proyek pilihan, seluruh repository publik, fitur, tautan, dan teks dua bahasa.
- `src/components/LandingPage.jsx`: halaman aktif, pilihan proyek, arsip dengan filter, keahlian, dan form kontak.
- `src/index.css`: desain, responsivitas, fokus keyboard, dan reduced motion.
- `src/contexts/useLanguage.js` dan `LanguageContext.jsx`: konteks dan penyimpanan pilihan bahasa.
- `public/projects/sipdjd.jpg`, `crms.jpg`, `sinyallab.jpg`, `vis.jpg`, `surya.jpg`, `alby.jpg`: screenshot website proyek asli.
- `src/assets/gua.jpeg`: foto profil dari proyek sebelumnya.

## Sumber proyek

Informasi diverifikasi pada 26 November 2026 melalui API publik GitHub, README, dependency proyek, route Laravel, dan website aktif. Data disimpan sebagai konten statis agar halaman tidak bergantung pada kuota atau ketersediaan API GitHub. Perbarui daftar secara manual ketika repository berubah.

- [Profil dan repository GitHub](https://github.com/adenarevan)
- [SIPDJD](https://infrastrukturdaerah.pu.go.id/devsipdjd/beranda): Sistem Pengelolaan Database Jalan Daerah pada PFID, Kementerian Pekerjaan Umum. Preview beranda publik, rekapitulasi jalan, regulasi, panduan, dan portal dua bahasa. Repository privat sesuai keterangan pemilik; teknologi internal tidak diasumsikan.
- [CRMS](https://infrastrukturdaerah.pu.go.id/crms/access/auth/login): City Road Management System. Preview halaman login publik beserta jalur pengajuan akses pemerintah daerah/balai dan opsi lupa kata sandi. Repository privat sesuai keterangan pemilik. Fitur di balik autentikasi dan teknologi internal tidak diklaim.
- [SinyalLab Futures](https://github.com/adenarevan/btc_price_futures): Next.js, TypeScript, Firebase, data pasar WebSocket, dan paper trading. Preview hanya menampilkan halaman masuk publik. Workspace membutuhkan akun pemilik; tidak ada akses privat yang digunakan untuk membuat portofolio.
- [VIS Privacy Center](https://github.com/adenarevan/privacy-policy-vis): dokumen kebijakan, navigasi 12 bagian, PDF, dan cetak.
- [Surya Baja Lestari](https://github.com/adenarevan/suryabajalestari): profil perusahaan React. Demo Vercel mengarah ke website perusahaan.
- [Alby Snack](https://github.com/adenarevan/alby-snack): katalog Next.js dengan filter dan pemesanan WhatsApp.
- [Restoran frontend](https://github.com/adenarevan/restoran-frontend) dan [API](https://github.com/adenarevan/restoran-api): React, QR code, Laravel Sanctum, menu, pesanan, dan integrasi Midtrans. Ditampilkan lewat deskripsi dan repository; tidak ada demo publik yang diasumsikan.

Arsip memuat seluruh 12 repository publik, termasuk eksplorasi Laravel, dua repository portofolio, latihan frontend, dan README profil. Tidak ada metrik keberhasilan, pengalaman kerja, testimoni, atau hasil bisnis yang direka.

Screenshot merupakan tampilan website pada tanggal pengecekan, bukan feed live. UI, logo, dan gambar di dalamnya merupakan bagian dari website masing-masing. Sumber screenshot terhubung melalui tombol Buka website di bagian Proyek pilihan. Proyek dengan repository publik juga menyediakan Source code; proyek privat memakai label tanpa tautan repository. Tidak ada foto stok baru yang dipakai. Komponen dan artwork studi antarmuka versi terdahulu tidak digunakan oleh halaman aktif.

## Interaksi dan kontak

- Pilihan proyek menyelaraskan rincian, screenshot, dan tautan sumber. Tombol bisa digunakan dengan keyboard dan sentuhan.
- Arsip dapat dibuka lalu disaring berdasarkan aplikasi, website, backend, dan kategori lainnya.
- Pilihan keahlian tersinkron dengan jenis kebutuhan di form.
- Form memakai validasi browser, lalu menyiapkan email melalui `mailto:`. Pengunjung mengirim pesan dari aplikasi emailnya; tidak ada backend pengiriman.
- Menu ponsel menutup melalui tautan atau Escape. Bahasa tersimpan di local storage ketika tersedia.
- Email dan tautan sosial menggunakan kontak yang sudah ada dalam proyek. WhatsApp menggunakan format internasional.

## Font

Font disimpan lokal. Lisensi SIL Open Font License tersedia di `public/fonts/OFL-Barlow.txt` dan `public/fonts/OFL-BarlowCondensed.txt`.
