# Gambar dan kenyamanan membaca

Halaman artikel mempertahankan Barlow/Barlow Condensed dan palet portofolio yang sudah ada. Gambar memakai node Tiptap yang sama; tidak memerlukan collection, aturan Firebase, Firebase Storage, atau secret baru.

## Untuk menulis

Di toolbar editor, pilih **Gambar**, cari subjek lewat **Cari gambar sesuai topik**, lalu pilih foto. Kata kunci Inggris yang konkret seperti `Juventus stadium` biasanya memberi hasil lebih baik. Deskripsi, keterangan, dan kredit terisi dari metadata Wikimedia Commons dan tetap dapat diedit. Foto bawaan berada di bagian yang dapat dibuka; URL HTTPS foto sendiri juga tetap didukung. Ini pencarian/penyisipan URL, bukan upload file dari perangkat.

Posisi awal adalah **Di posisi kursor** untuk menambahkan foto di dalam tulisan. Pilih **Sampul** untuk mengganti foto pertama. Klik gambar yang sudah ada lalu tombol **Gambar** untuk menggantinya. Mengubah URL membersihkan kredit lama agar tidak salah atribusi. Simpan draf, pratinjau, publikasi, undo/redo, dan pembukaan ulang memakai dokumen Tiptap yang sama.

Foto disimpan sebagai node `image` di field `body`, tanpa upload ke Firebase Storage. URL executable, data URI, kredensial dalam URL, serta alamat localhost/IP privat literal ditolak. Foto pencarian dihosting Wikimedia; koneksi dan ketersediaannya bergantung pada layanan tersebut. Thumbnail pencarian 330 px sesuai preset Wikimedia, dengan fallback ke URL gambar utama; hasil yang tetap gagal dimuat dihapus dari pilihan. Gambar artikel maksimal 1280 px, gambar dalam artikel dimuat secara lazy. Pencarian berulang dicache sepuluh menit, maksimal 30 entri per sesi.

## Gambar bot

Gemini menghasilkan 1–2 frasa pencarian subjek konkret dari bahan artikelnya, bukan URL atau kredit karangan AI. Runner mencari lewat [MediaWiki Imageinfo](https://www.mediawiki.org/wiki/API:Imageinfo). Hasil harus berupa JPEG/PNG/WebP minimal 640×400, proporsi layak, subjek terlihat pada judul metadata, serta lisensi Public domain, CC0, CC BY atau CC BY-SA dengan nama pembuat yang muat utuh di editor. Sumber/kredit merujuk halaman berkas asli sesuai [panduan penggunaan Commons](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia/en). Permintaan server memakai identitas bot sesuai [User-Agent Policy](https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy).

Runner mengecek URL gambar dengan HEAD sebelum memasukkannya. Maksimal satu sampul dan satu foto berbeda di tengah bagian tulisan. URL gambar pada artikel bot lain dicatat dalam `bot.imageUrls` dan dilewati agar foto tidak terus berulang. Kegagalan, pencarian kosong, dan hasil terpilih dicatat sebagai diagnostics `stage: image`; kegagalan gambar tidak membatalkan penulisan. Bot tidak lagi memaksakan salah satu dari tiga foto bawaan. Jika tidak ada gambar terpilih, `bot.imageUrls: []` juga meniadakan sampul fallback generik. Admin tetap dapat mengganti gambar lewat editor yang sama.

Caption menyebut foto sebagai ilustrasi dokumentasi, bukan dokumentasi peristiwa terbaru. Pemilihan otomatis berdasarkan pencarian judul merupakan heuristik, bukan pemeriksaan visual atau identifikasi spesies; tinjau relevansinya saat mengedit. Foto yang tersedia belum tentu menggambarkan individu, versi produk, atau kejadian spesifik dalam berita.

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

Pembaruan pencarian gambar (27 November 2026): 37 pengujian root dan 25 pengujian bot dengan emulator lolos tanpa skip; lint dan build produksi lolos. Browser emulator memverifikasi pencarian Commons nyata, seluruh thumbnail terdecode, kredit terisi, sampul/inline, simpan-buka ulang, draf privat, publikasi, penggantian gambar di tempat tanpa duplikat, serta reset kredit saat URL berubah. Halaman artikel produksi diperiksa di 1440/768/390 px dengan foto terdecode, kredit tertaut, daftar isi, dan tanpa overflow/error runtime. Pemanggilan Gemini baru tidak dilakukan pada produksi untuk pengujian ini; penyisipan gambar bot diverifikasi melalui emulator dan pencarian/HEAD nyata secara terpisah.

Dua artikel bot publik lama diperbarui pada gambar saja dengan prasyarat versi dokumen. Semua node teks dan format dibandingkan persis sebelum commit; judul, tanggal terbit, dan status tidak diubah. `updatedAt` mencatat waktu penggantian. Artikel Juventus memakai [Juventus v Real Madrid, Stadium, Turin, 2013 — forzaq8, CC BY 2.0](https://commons.wikimedia.org/wiki/File:Juventus_v_Real_Madrid,_Champions_League,_Stadium,_Turin,_2013.jpg) sebagai sampul dan [Turin Juventus Stadium 1 — Валерий Дед, CC BY 3.0](https://commons.wikimedia.org/wiki/File:Turin_Juventus_Stadium_1.jpg) di tengah. Artikel Papua memakai [Pacific Blue Crab, Pulau Waigeo — CC0](https://commons.wikimedia.org/wiki/File:Pacific_Blue_Crab,_Pulau_Waigeo,_Raja_Ampat,_West_Papua,_ID_imported_from_iNaturalist_photo_336918876.jpg); metadata pembuat hanya berisi “no rights reserved”. Caption secara eksplisit menyatakan foto tersebut bukan spesies baru yang dibahas. Ketiganya memakai URL Wikimedia yang sudah diperiksa, dengan kredit/sumber langsung di bawah foto.

Komponen mengikuti arah visual blog yang sudah ada; tidak ada draw atau perubahan identitas. Interaksi utama adalah pencarian subjek dan pemilihan posisi foto. Gate editor dengan CSS produksi bersih pada tiga lebar (ruang kanvas menulis kosong merupakan pengecualian `blank-gap`). Kredit foto artikel dikecualikan dari heuristik `eyebrow` karena merupakan atribusi yang diperlukan. Foto pencarian diambil saat dipakai, sehingga tetap perlu ditinjau editor untuk kesesuaian konteks.

Pembaruan pencarian gambar (27 November 2026): 37 pengujian root dan 25 pengujian bot dengan emulator lolos tanpa skip; lint dan build produksi lolos. Browser emulator memverifikasi pencarian Commons nyata, seluruh thumbnail terdecode, kredit terisi, sampul/inline, simpan-buka ulang, draf privat, publikasi, penggantian gambar di tempat tanpa duplikat, serta reset kredit saat URL berubah. Halaman artikel produksi diperiksa di 1440/768/390 px dengan foto terdecode, kredit tertaut, daftar isi, dan tanpa overflow/error runtime. Pemanggilan Gemini baru tidak dilakukan pada produksi untuk pengujian ini; penyisipan gambar bot diverifikasi melalui emulator dan pencarian/HEAD nyata secara terpisah.

Dua artikel bot publik lama diperbarui pada gambar saja dengan prasyarat versi dokumen. Semua node teks dan format dibandingkan persis sebelum commit; judul, tanggal terbit, dan status tidak diubah. `updatedAt` mencatat waktu penggantian. Artikel Juventus memakai [Juventus v Real Madrid, Stadium, Turin, 2013 — forzaq8, CC BY 2.0](https://commons.wikimedia.org/wiki/File:Juventus_v_Real_Madrid,_Champions_League,_Stadium,_Turin,_2013.jpg) sebagai sampul dan [Turin Juventus Stadium 1 — Валерий Дед, CC BY 3.0](https://commons.wikimedia.org/wiki/File:Turin_Juventus_Stadium_1.jpg) di tengah. Artikel Papua memakai [Pacific Blue Crab, Pulau Waigeo — CC0](https://commons.wikimedia.org/wiki/File:Pacific_Blue_Crab,_Pulau_Waigeo,_Raja_Ampat,_West_Papua,_ID_imported_from_iNaturalist_photo_336918876.jpg); metadata pembuat hanya berisi “no rights reserved”. Caption secara eksplisit menyatakan foto tersebut bukan spesies baru yang dibahas. Ketiganya memakai URL Wikimedia yang sudah diperiksa, dengan kredit/sumber langsung di bawah foto.

Komponen mengikuti arah visual blog yang sudah ada; tidak ada draw atau perubahan identitas. Interaksi utama adalah pencarian subjek dan pemilihan posisi foto. Gate editor dengan CSS produksi bersih pada tiga lebar (ruang kanvas menulis kosong merupakan pengecualian `blank-gap`). Kredit foto artikel dikecualikan dari heuristik `eyebrow` karena merupakan atribusi yang diperlukan. Foto pencarian diambil saat dipakai, sehingga tetap perlu ditinjau editor untuk kesesuaian konteks.

`node --test tests/blog.content.test.mjs tests/article.reading.test.mjs` memeriksa kompatibilitas isi lama, URL/atribut aman, serialisasi gambar, teks, sampul dan anchor unik. Suite bot diuji dengan emulator Firestore, termasuk pembuatan draf dengan sampul, deduplikasi dan batas izin worker.

Uji browser emulator meliputi sisip sampul/inline, simpan-buka ulang, reset kredit, URL tidak aman, privasi draf, publikasi, dan fallback gambar gagal. Uji production build meliputi navigasi isi, ukuran teks dan persistensinya, share/clipboard ditolak, progres 100%, thumbnail blog dan pembersihan listener saat meninggalkan halaman. Layout diperiksa pada 320, 390, 768 dan 1440 px.

Gate visual: tidak ada FAIL pada 1440/768/390; satu peringatan heuristik tepi teks desktop diterima karena kolom baca dan daftar isi memang berbeda, sedangkan frame artikel tetap terpusat. Syarat marketing (video, empat gambar, judul promosi pendek dan animasi masuk) dikecualikan secara eksplisit untuk halaman baca artikel singkat. Tidak ada foto tambahan yang tidak relevan atau animasi yang mengganggu membaca.
