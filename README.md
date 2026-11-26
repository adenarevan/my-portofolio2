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

## Blog dan editor Firebase

Fitur **Bot Artikel Trending** tersedia di menu admin `/admin/bot`. Versi gratis memakai **Gemini + GitHub Actions + Firebase Spark** untuk menyiapkan draf dari konsensus RSS. Tombol manual masuk antrean yang diperiksa runner sekitar setiap 15 menit. Default jadwal nonaktif, Indonesia, 24 jam, kategori AI/teknologi/pemrograman, satu draf per hari pukul 08.00 WIB. Lihat [setup secret GitHub, akun bot terbatas, jadwal, sumber, dan pengujian](docs/trending-bot.md).

Menu **Blog** membuka `/blog`. Pengunjung dapat membaca artikel di `/blog/:id`; tiga tulisan terbit terbaru juga tampil di halaman depan. `/login` memakai Firebase Authentication (email/kata sandi), sedangkan `/admin` menyediakan judul, topik, ringkasan opsional, isi, pratinjau, draf, publikasi, penarikan artikel, dan penghapusan dengan konfirmasi.

Isi tulisan memakai [Tiptap](https://tiptap.dev/docs/editor/getting-started/install/react), dengan heading, ukuran teks 12–48 px, tebal, miring, garis bawah, coret, daftar poin/nomor, kutipan, perataan, tautan, hapus format, undo/redo, dan shortcut keyboard. Format tampil di pratinjau serta artikel publik. Ringkasan otomatis dan waktu baca dihitung dari teks yang terlihat.

Format tersimpan sebagai JSON berversi dengan awalan `tiptap:v1:` di field string `body` yang sama, sehingga tidak memerlukan perubahan rules, collection, atau migrasi database. Tulisan teks biasa yang sudah ada tetap dapat dibaca dan diedit; format baru disimpan saat penulis menyimpannya. Renderer React hanya menerima node, ukuran teks, perataan, dan protokol tautan yang didukung. HTML mentah tidak dijalankan. Batas Firestore tetap 50.000 karakter termasuk struktur format; editor memberi pesan jika tulisan terlalu panjang tanpa membuang isinya.

Data tersimpan di Cloud Firestore, bukan local storage. Local storage hanya dipakai oleh preferensi bahasa dan mekanisme sesi Firebase. Draf hanya dapat dibaca oleh editor yang diizinkan. Timestamp dibuat server; perubahan bersamaan diperiksa sebelum menyimpan. Editor memperingatkan perubahan yang belum disimpan saat berpindah halaman atau menutup tab.

### Menghubungkan project Firebase

1. Salin `.env.example` menjadi `.env.local`, kemudian isi empat nilai konfigurasi Web App dari **Project settings → General → Your apps → Config**. Nilai ini adalah konfigurasi publik Web App; jangan menaruh service account, private key, atau password admin ke variabel `VITE_`.
2. Aktifkan **Authentication → Sign-in method → Email/Password**. Buat akun penulis di **Authentication → Users**, atau gunakan akun yang sudah ada. Password dimasukkan langsung di Firebase Console atau diatur melalui alur reset password; jangan commit password.
3. Salin **UID** akun penulis. Di Firestore, buat collection `portfolioBlogAdmins`, dengan document ID sama persis dengan UID tersebut dan field `enabled` bertipe **boolean** bernilai **true**. Akses editor ditentukan oleh dokumen ini di Security Rules, bukan oleh email yang tertulis di frontend. Dokumen akses tidak bisa dibuat atau diubah melalui website.
4. Terapkan aturan di `firestore.rules`. **Jika memakai project ADENA yang juga dipakai BTC, gabungkan fungsi dan dua blok collection blog ke rules yang sudah ada. Jangan mengganti seluruh rules project atau mengubah collection BTC.** Pastikan tidak ada aturan wildcard yang memberi akses luas ke collection blog; aturan Firestore yang cocok digabung dengan logika OR. Review rules project aktif sebelum deployment.
5. Tambahkan composite index dari `firestore.indexes.json`: collection `portfolioPosts`, field `status` ascending dan `publishedAt` descending, scope Collection. Tunggu index siap.
6. Tambahkan domain portofolio dan `localhost` ke **Authentication → Settings → Authorized domains** sesuai kebutuhan. Isi empat variabel Firebase yang sama di environment Vercel, kemudian build/deploy ulang. `vercel.json` mendukung akses langsung ke URL Blog, Login, dan Editor.

Untuk **project baru yang khusus blog** dan rules-nya belum berisi aplikasi lain:

```sh
npx firebase login
npx firebase deploy --only firestore:rules,firestore:indexes --project YOUR_PROJECT_ID
```

Collection yang digunakan:

- `portfolioPosts/{id}`: `title`, `excerpt`, `body`, `tag`, `status` (`draft`/`published`), `authorId`, `createdAt`, `updatedAt`, `publishedAt`.
- `portfolioBlogAdmins/{uid}`: `enabled: true` untuk akun yang diizinkan menulis.

Repository ini tidak membuat akun atau mengisi artikel di Firebase production secara otomatis. Tidak ada artikel contoh yang dipublikasikan ke database production. Jika konfigurasi belum dipasang, pembaca melihat keadaan blog kosong; halaman login memberi petunjuk konfigurasi khusus pengelola.

### Pengujian database lokal

```sh
npm run test:rules
```

Firebase Local Emulator Suite memerlukan Java yang kompatibel (Java 21 direkomendasikan). Pengujian menggunakan project demo `demo-portfolio-blog` dan tidak menghubungi database production. Suite memeriksa publik hanya membaca artikel terbit, draf privat, penolakan penulis tak berizin, akses admin, validasi data, timestamp/author yang tidak boleh dipalsukan, serta siklus draf–terbit–tarik–hapus.

Untuk mencoba UI di emulator, buat `.env.emulator.local` dengan project ID `demo-portfolio-blog`, konfigurasi web demo, dan `VITE_FIREBASE_EMULATORS=true`. Jalankan `npm run dev:emulators`, lalu `npm run dev -- --mode emulator`. Koneksi emulator hanya diaktifkan dalam development pada localhost, sehingga tidak terbawa ke build production. Grant editor dan artikel uji hanya berada di emulator. Sampel visual pada pengujian bukan tulisan yang diterbitkan pemilik.

Rujukan: [konfigurasi Web App](https://firebase.google.com/docs/web/setup), [autentikasi email/password](https://firebase.google.com/docs/auth/web/password-auth), [kondisi Security Rules](https://firebase.google.com/docs/firestore/security/rules-conditions), dan [uji rules melalui emulator](https://firebase.google.com/docs/rules/unit-tests).
