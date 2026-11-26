# Bot Artikel Trending — versi gratis

Arsitektur aktif: **Firebase Spark + Gemini API free tier + GitHub Actions standard runner pada repo publik**. Tidak memakai Cloud Functions, Cloud Scheduler, OpenAI, Secret Manager, atau service account yang melewati Firestore Security Rules.

Menu `/admin/bot` memakai layout admin yang sama. Hasil bot selalu **draf**, dibuka melalui `/admin?post=ID`, diedit di Tiptap, lalu dipublikasikan oleh admin. Artikel manual dan URL publik lama tetap bekerja.

## Alur dan default

1. Admin menyimpan pengaturan langsung ke Firestore. Rules memvalidasi keanggotaan admin, revisi, kategori, wilayah, hari, waktu, sumber dan batas artikel.
2. “Jalankan Sekarang” menambahkan satu permintaan ke `portfolioBotRequests/{uid}`, lalu memanggil endpoint server `/api/bot/dispatch` untuk memicu workflow langsung. Permintaan yang masih menunggu tidak ditimpa atau digandakan. Tidak ada token GitHub atau key AI di browser.
3. Workflow `.github/workflows/trending-bot.yml` berjalan sekitar setiap 15 menit (`05/20/35/50` setiap jam UTC). Runner memproses antrean dan membaca jadwal Firestore saat berjalan. Mengubah jadwal tidak memerlukan deploy ulang.
4. Sumber yang memenuhi syarat dikirim ke Gemini. Hasil terstruktur divalidasi dan disimpan sebagai draf. Riwayat mencatat dibuat/dilewati/gagal, alasan, dan tautan editor.

Default **nonaktif**, Indonesia, 24 jam, AI/teknologi/pemrograman, satu draf setiap hari pukul **08.00 WIB** (`Asia/Jakarta`). Pengecekan pertama biasanya sekitar 08.05 WIB. Jadwal harian memiliki jendela susulan 60 menit dan paling banyak tiga percobaan gagal per tanggal WIB. Manual tetap tersedia ketika jadwal nonaktif. Batas 1–3 draf per eksekusi juga membatasi panggilan penulisan AI.

**Manual memicu runner langsung jika endpoint dikonfigurasi.** GitHub tetap membutuhkan waktu untuk menyediakan runner dan membaca sumber; artikel tidak dihasilkan di browser. Halaman boleh ditutup setelah antrean tersimpan. Jika pemicu gagal, antrean tetap diproses oleh cron sekitar setiap 15 menit dan UI memberi tautan Run workflow sebagai alternatif. GitHub dapat menunda/menggugurkan cron saat sibuk serta menonaktifkan jadwal repo publik setelah 60 hari tanpa aktivitas; aktifkan kembali lewat GitHub Actions bila diperlukan. Tidak ada commit buatan untuk menyiasati aturan tersebut.

### Pemicu langsung di lokal dan Vercel

- **Lokal (`npm run dev`)**: middleware Vite memakai `GITHUB_BOT_TOKEN` jika diisi; jika kosong, memakai login Git yang sudah tersimpan melalui `git credential fill` tanpa prompt. Keduanya hanya dibaca proses Node. Tidak perlu menjalankan worker AI atau emulator agar tombol lokal dapat memicu bot online.
- **Vercel**: endpoint `api/bot/dispatch.js` membutuhkan environment server **`GITHUB_BOT_TOKEN`**. Gunakan fine-grained token yang dibatasi ke repository ini dengan izin **Actions: read/write**, serta `FIREBASE_PROJECT_ID` atau konfigurasi `VITE_FIREBASE_PROJECT_ID` yang sudah ada. Simpan melalui pengaturan environment Vercel lalu redeploy. Jangan memakai awalan `VITE_` untuk token. Tanpa token, mode antrean terjadwal tetap berjalan.
- Endpoint meneruskan ID token pengguna ke Firestore untuk validasi oleh Firebase dan Security Rules, memeriksa membership admin yang aktif, lalu memastikan UID, request ID dan status antrean cocok. Token tak valid/non-admin ditolak sebelum kredensial GitHub dibaca. Target workflow dan branch tetap di server; request browser tidak dapat menggantinya. Cooldown membatasi pemicu berulang, sementara kunci/concurrency worker tetap mencegah artikel ganda.
- Mode `demo-*` tidak memicu GitHub production; worker emulator tetap dijalankan secara lokal. Tidak ada perubahan rules, secret AI, atau billing Firebase untuk fitur pemicu ini.
- `npm run test:dispatch` memeriksa autentikasi, kepemilikan antrean, duplikasi pemicu, fallback dan kegagalan koneksi.

## Yang tetap gratis dan batasnya

- Database/login tetap Firebase Spark dalam kuota yang tersedia; tidak ada upgrade billing dari script ini.
- `gemini-3.1-flash-lite` dipilih karena input/output teks tersedia dalam free tier saat diperiksa **26 November 2026**. Pilih project Gemini tanpa paid billing. Batas/rate limit dapat berubah; HTTP 429 dicatat sebagai kegagalan, bukan dialihkan ke provider berbayar. Bahan sumber publik dikirim ke Gemini; free tier dapat menggunakan input/output untuk perbaikan produk.
- GitHub Actions memakai `ubuntu-latest` standar pada **repo publik**, tanpa larger runner, unggahan artifact atau penyimpanan artikel sebagai artifact. Repo privat mengikuti kuota plan pemilik.

Rujukan: [Gemini pricing](https://aistudio.google.com/docs/pricing#gemini-3.1-flash-lite), [GitHub billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions), [batas schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), [Firebase Spark](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).

## Setup online

Kode/workflow dan rules dalam repo perlu dipublikasikan sebelum bot dapat dipakai online. Script setup memiliki mode inspeksi dan guard persetujuan; tidak berjalan otomatis saat build.

1. Buat key **Gemini** pada project free tier di [Google AI Studio](https://aistudio.google.com/api-keys). Ini berbeda dari `firebaseConfig.apiKey` yang publik. Tambahkan ke [repository secrets](https://github.com/adenarevan/my-portofolio2/settings/secrets/actions) dengan nama **`GEMINI_API_KEY`**. Jangan commit atau mengirim nilai key lewat chat.
2. Siapkan dependency lokal: `npm ci` di root dan `npm ci` di folder `bot`. Firebase CLI harus login sebagai pemilik ADENA; Git Credential Manager harus sudah memiliki akses admin ke `adenarevan/my-portofolio2`.
3. Jalankan inspeksi yang **tidak mengubah production**:

   ```powershell
   node scripts/setup-free-bot.cjs --check
   ```

   Inspeksi memeriksa repo publik, akses GitHub, nama secret, rules yang sedang aktif, dan kompilasi rules kandidat. Nilai secret tidak dibaca. Rules aktif harus cocok dengan baseline blog yang telah ditinjau (`bot/setup/initial-blog.rules`) atau rules target. Jika project ADENA/BTC punya perubahan lain, gabungkan dan tinjau perubahan tersebut terlebih dahulu; script berhenti pada baseline yang tidak dikenal.

4. Setelah **persetujuan eksplisit untuk push workflow, penerapan rules dan akun bot khusus**, publish kode yang ditinjau ke default branch `main`, lalu jalankan:

   ```powershell
   node scripts/setup-free-bot.cjs --apply --confirm-production-rules-and-worker
   ```

   Script akan:
   - Membuat/memperbarui hanya akun khusus `portfolio-bot@adena.invalid`; menolak mengganti akun yang terdaftar sebagai admin.
   - Membuat password acak dan langsung menyimpannya terenkripsi sebagai GitHub secret **`FIREBASE_BOT_PASSWORD`**. Password tidak dicetak atau ditulis ke file.
   - Mengaktifkan `portfolioBotWorkers/{uid}.enabled = true` dan menerapkan rules yang sudah dikompilasi. Akun admin manusia dan rules default collection lain dipertahankan.
   - Mengisi repository variables `FIREBASE_PROJECT_ID`, `FIREBASE_API_KEY` (konfigurasi Web App publik), `FIREBASE_BOT_EMAIL`, `GEMINI_MODEL`, dan terakhir `TRENDING_BOT_CONFIGURED=true`.

   Workflow tetap melewati job sampai variable `TRENDING_BOT_CONFIGURED` bernilai `true`. Pengaturan jadwal di Firestore tetap default nonaktif; script tidak mengaktifkannya. Tidak ada setup billing, IAM service account, API Cloud Functions atau pembayaran.

5. Jalankan **Actions → Bot Artikel Trending → Run workflow** untuk pengecekan awal. Di admin akan terlihat waktu runner terakhir terhubung. Klik “Jalankan Sekarang”; jika pemicu langsung tersedia, workflow mulai tanpa menunggu cron. Tombol “Mulai runner sekarang” dapat memicu antrean yang sudah tersimpan. Tinjau draf dan sumber sebelum mengaktifkan jadwal harian.

Jika memakai project/repo lain, sesuaikan konstanta pada script setup, URL Actions pada halaman admin, dan baseline rules yang telah ditinjau. Jangan menggunakan password admin manusia sebagai password runner.

## Batas akses akun bot

Akun bot login dengan Firebase Authentication biasa dan **tetap tunduk pada Security Rules**. Tidak memakai Firebase Admin SDK di runtime. Password hanya ada di GitHub Secrets.

- Bot boleh membaca data blog, termasuk draf manual untuk mencegah duplikat, dan menulis log/lease/riwayat/heartbeat bot.
- Bot hanya dapat **membuat artikel baru** dengan ID `bot_<hash>`, status `draft`, `publishedAt: null`, penulis admin yang valid, timestamp server, dan provenance worker.
- Bot tidak dapat menerbitkan, mengubah, atau menghapus artikel; tidak dapat mengubah pengaturan, memberi peran admin/worker, atau mengakses collection BTC/lainnya.
- Admin dapat mengubah pengaturan yang tervalidasi, menambahkan antrean untuk UID-nya sendiri, membaca hasil, serta mengedit dan menerbitkan artikel. Provenance bot dipertahankan.
- Pengunjung tidak dapat membaca draf, antrean, pengaturan, status atau log bot.

Rules baru perlu diterapkan di production; kode frontend saja tidak memperbaiki penolakan izin. Aktivasi rules project bersama memerlukan persetujuan dan perbandingan versi aktif. Script tidak menghapus index aplikasi lain.

## Sumber dan kualitas tulisan

[Google Trends API](https://developers.google.com/search/apis/trends) masih memerlukan penerimaan alpha; implementasi memakai **konsensus RSS**, bukan volume pencarian atau peringkat tren Google.

Katalog server: ANTARA Tekno (`https://www.antaranews.com/rss/tekno.xml`), CNN Indonesia (`https://www.cnnindonesia.com/teknologi/rss`), CNBC Indonesia (`https://www.cnbcindonesia.com/tech/rss`), TechCrunch (`https://techcrunch.com/feed/`) dan The Verge (`https://www.theverge.com/rss/index.xml`). Seluruh endpoint merespons HTTP 200 saat dicek. Beberapa feed alternatif memberi 403/404 dan tidak digunakan.

Respons HTTP 200 belum menjamin feed masih baru. Log kini mencatat jumlah entri dalam rentang waktu dan tanggal terbaru. Bila feed ANTARA Tekno tertinggal atau gagal, bot juga memeriksa RSS Terkini resmi ANTARA (`https://www.antaranews.com/rss/terkini.xml`), lalu menerapkan kategori dan wilayah yang sama. Sumber cadangan tetap satu grup ANTARA, sehingga tidak dihitung sebagai penerbit independen tambahan. Filter Indonesia bisa sah menghasilkan nol draf jika hanya grup CNN/CNBC yang mempunyai liputan baru; Global memperluas sumber liputan, sementara bahasa penulisan tetap Indonesia.

Halaman admin menampilkan hasil permintaan yang selesai (termasuk jumlah entri yang gugur dan tautan draf) dan menyembunyikan pesan pemicu yang sudah tidak berlaku. “Runner dipicu” tidak berarti draf sudah dibuat.

Indonesia berarti liputan dari penerbit Indonesia, bukan pengukuran lokasi pembaca. Kandidat disaring berdasarkan waktu publikasi, kata kunci kategori, wilayah penerbit dan kemiripan judul/versi. Minimal dua grup penerbit independen harus menyediakan bahan terbaca; CNN/CNBC digrupkan konservatif sebagai satu grup. Halaman yang gagal dibaca hanya boleh digantikan ringkasan RSS jika tersedia minimal 180 karakter. Maksimal tiga penerbit dibaca per topik dan 4.000 karakter bahan per sumber; tidak melewati login/paywall atau pemblokiran.

Gemini menghasilkan JSON yang diperiksa struktur, panjang, slug dan ID sumbernya. Server menyisipkan tautan yang benar-benar diambil, bukan URL buatan AI. Instruksi di dalam sumber diperlakukan sebagai data tidak tepercaya. Validasi tautan/struktur tidak menjamin setiap klaim faktual: admin tetap meninjau draf.

Gangguan sementara Gemini HTTP 500/502/503/504 dicoba paling banyak tiga kali per permintaan penulisan, dengan jeda 1 lalu 2 detik. HTTP 429, autentikasi dan hasil yang tidak valid tidak diputar ulang otomatis. Ini tidak menggandakan penyimpanan draf; transaksi dan ID topik tetap menjadi penjaga deduplikasi.

Riwayat topik/URL permanen, ID artikel deterministik, lease global, dan transaksi atomik mencegah pengulangan serta konflik manual/jadwal. Jika proses berhenti setelah draf committed, retry mempertahankan draf itu. Kemiripan judul adalah heuristik; kejadian dengan judul sangat berbeda tetap perlu ditinjau. Arsip blog/riwayat dibaca bertahap 200 dokumen, sehingga penggunaan Firestore bertambah mengikuti arsip.

Field artikel lama tetap dipakai, dengan tambahan opsional `slug`, `metaDescription`, `sources`, dan `bot`. Isi tetap `tiptap:v1:`. Collection bot: `portfolioBotSettings`, `portfolioBotRequests`, `portfolioBotRuns`, `portfolioBotLocks`, `portfolioBotTopics`, `portfolioBotStatus`, `portfolioBotWorkers`.

## Development dan verifikasi

Node 22 dan Java 21 direkomendasikan. Jalankan `npm run dev:bot` untuk **Auth dan Firestore emulator saja**. Tidak memerlukan Functions emulator.

Frontend: `.env.emulator.local` memakai project `demo-portfolio-blog`, konfigurasi Web App demo dan `VITE_FIREBASE_EMULATORS=true`; jalankan `npm run dev -- --mode emulator`.

Runner lokal dapat dijalankan dengan env pada `bot/.env.local` (diabaikan git) dan `node --env-file=bot/.env.local bot/src/index.js`. Isi dari `bot/.env.example`, lalu untuk emulator tambahkan:

```dotenv
FIREBASE_PROJECT_ID=demo-portfolio-blog
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
BOT_TEST_SCENARIO=success
```

Buat akun worker/grant dan admin **di emulator**. `BOT_TEST_SCENARIO=success|empty|failure` memakai bahan/AI fixture hanya jika project `demo-` dan kedua emulator lokal aktif. Hapus flag untuk mencoba Gemini sungguhan dengan key development. Flag fixture tidak diisi dalam workflow GitHub.

```powershell
$env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8080'
npm.cmd run test:bot
node --test tests/blog.rules.test.mjs
npm.cmd run test:content
npm.cmd run lint
npm.cmd run build
```

Test bot menggunakan project terisolasi `demo-portfolio-bot-tests`; rules tests memakai `demo-portfolio-blog`. Data masing-masing demo dihapus sebelum kasus. Jangan mengarahkan env test ke production. Tanpa emulator, kasus integrasi dilewati; unit parser/AI/settings tetap berjalan.

Verifikasi mencakup Gemini request/schema/429, jadwal dinamis, filter dan consensus, sumber gagal, duplikat, retry, crash recovery, worker yang kehilangan izin, batas penulisan, antrean dan heartbeat, rules admin/worker/pengunjung, pembuatan manual, editor, dan publikasi. AI sungguhan serta workflow online baru dapat diverifikasi setelah secret, rules dan kode dipasang. Tidak ada artikel uji yang dibuat di production saat implementasi.
