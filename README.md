# Adena Reis Vanrika — Portfolio

Portfolio personal berbasis React 18 dan Vite, dengan tipografi Barlow, foto profesional monokrom, serta navigasi Bahasa Indonesia dan Inggris.

## Menjalankan

```sh
npm install
npm run dev
```

Di PowerShell yang membatasi skrip, gunakan `npm.cmd` sebagai pengganti `npm`.

```sh
npm run build
npm run preview
npm run lint
```

## Mengubah konten

- `src/components/portfolioContent.js`: teks dua bahasa, proyek, dan layanan.
- `src/components/LandingPage.jsx`: tata letak dan interaksi.
- `src/index.css`: token warna, tipografi, responsivitas, dan animasi.
- `src/assets/gua.jpeg`: foto profil asli dari proyek.
- `public/projects/`: artwork studi antarmuka. Ganti dengan screenshot produk asli bila tersedia.
- `src/components/ProjectPreview.jsx`: sumber ilustrasi antarmuka yang digunakan untuk artwork proyek.

Visual Regional Roads, Commerce Platform, dan Analytics Workspace merupakan studi antarmuka dengan data ilustratif berdasarkan topik pada portfolio sebelumnya. Visual ini tidak dinyatakan sebagai screenshot produk produksi. Testimoni dan angka pencapaian yang belum terverifikasi tidak ditampilkan.

## Kontak

Form memvalidasi nama, alamat email, dan pesan, lalu membuka aplikasi email dengan brief yang sudah disiapkan. Pengiriman dilakukan oleh pengunjung melalui aplikasi emailnya. Form tidak memakai backend pengiriman. Email, WhatsApp, GitHub, dan LinkedIn menggunakan kontak yang sudah ada pada proyek. Nomor WhatsApp memakai format internasional.

Pilihan layanan tersinkron dengan form. Bahasa tersimpan di browser bila penyimpanan lokal tersedia. Menu mendukung keyboard dan Escape. Animasi menghormati pengaturan reduced motion.

## Font

Font disimpan lokal agar tidak bergantung pada permintaan Google Fonts ketika halaman dibuka. Lisensi SIL Open Font License dan atribusi pemilik font tersedia di `public/fonts/OFL-Barlow.txt` dan `public/fonts/OFL-BarlowCondensed.txt`.
