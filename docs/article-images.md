# Gambar dan kenyamanan membaca

Halaman artikel mempertahankan Barlow/Barlow Condensed dan palet portofolio yang sudah ada. Tidak ada perubahan pada isi/tanggal/status artikel production, skema collection, atau aturan akses Firebase.

## Untuk menulis

Di toolbar editor, pilih **Gambar**, lalu pilih foto bawaan atau isi URL HTTPS. Isi deskripsi gambar, keterangan, dan kredit sumber sesuai foto. Pilih posisi **Sampul** atau **Di posisi kursor**. Mengganti URL foto bawaan membersihkan deskripsi/kredit bawaannya agar tidak salah atribusi. Penyimpanan draf, preview, publikasi, undo/redo, dan pembukaan ulang menggunakan dokumen Tiptap yang sama.

Foto disimpan sebagai node `image` di field `body`, tanpa upload ke Firebase Storage. URL executable, data URI, kredensial dalam URL, serta alamat localhost/IP privat literal ditolak. Jika sampul eksternal gagal dimuat, pembaca mendapat foto cadangan lokal. Artikel lama tetap terbaca dan memperoleh ilustrasi yang sesuai topik tanpa penulisan ulang database. Bot baru menyisipkan satu sampul dari katalog lokal.

## Untuk membaca

- Sampul, gambar dalam artikel, caption dan kredit yang dapat diklik.
- Daftar isi dari heading artikel, dengan navigasi aktif dan versi ringkas di HP.
- Progres berdasarkan posisi baca, tanpa penghitung pembaca buatan.
- Pilihan ukuran teks 18/20/22 px yang disimpan sebagai preferensi browser.
- Berbagi lewat perangkat atau salin tautan, dengan fallback manual jika clipboard ditolak.
- Profil penulis dan maksimal tiga rekomendasi dari artikel published lain; artikel aktif dan draf tidak direkomendasikan.

## Sumber foto

| Berkas | Karya dan pembuat | Lisensi | Pemakaian |
| --- | --- | --- | --- |
| `orbit-station.jpg` | [STS-135 final flyaround of ISS 1 — NASA](https://commons.wikimedia.org/wiki/File:STS-135_final_flyaround_of_ISS_1.jpg) | [Public domain](https://creativecommons.org/publicdomain/mark/1.0/) | Ilustrasi topik orbit/antariksa; caption menyebut ISS dan Juli 2011. |
| `computing.jpg` | [Pleiades supercomputer — Marco Librero, NASA Ames Research Center](https://commons.wikimedia.org/wiki/File:Pleiades_supercomputer.jpg) | [Public domain](https://creativecommons.org/publicdomain/mark/1.0/) | Ilustrasi komputasi/AI; caption menyebut foto arsip 2008. |
| `workspace.jpg` | [Laptop on a desk — Aleksi Tappura](https://commons.wikimedia.org/wiki/File:Laptop_on_a_desk_(Unsplash).jpg) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | Ilustrasi catatan, pemrograman, dan karier. |

Semua berkas dihosting lokal, lebar 1280 px, sekitar 94/281/216 KB. Metadata unduhan dan kredit ada di `public/blog-media/credits.json`. Foto profil memakai aset penulis yang sudah ada. Kredit gambar penuh tampil di bawah foto; thumbnail di daftar merupakan tautan ke artikelnya.

## Verifikasi

`node --test tests/blog.content.test.mjs tests/article.reading.test.mjs` memeriksa kompatibilitas isi lama, URL/atribut aman, serialisasi gambar, teks, sampul dan anchor unik. Suite bot diuji dengan emulator Firestore, termasuk pembuatan draf dengan sampul, deduplikasi dan batas izin worker.

Uji browser emulator meliputi sisip sampul/inline, simpan-buka ulang, reset kredit, URL tidak aman, privasi draf, publikasi, dan fallback gambar gagal. Uji production build meliputi navigasi isi, ukuran teks dan persistensinya, share/clipboard ditolak, progres 100%, thumbnail blog dan pembersihan listener saat meninggalkan halaman. Layout diperiksa pada 320, 390, 768 dan 1440 px.

Gate visual: tidak ada FAIL pada 1440/768/390; satu peringatan heuristik tepi teks desktop diterima karena kolom baca dan daftar isi memang berbeda, sedangkan frame artikel tetap terpusat. Syarat marketing (video, empat gambar, judul promosi pendek dan animasi masuk) dikecualikan secara eksplisit untuk halaman baca artikel singkat. Tidak ada foto tambahan yang tidak relevan atau animasi yang mengganggu membaca.
