export const profile = {
  name: 'Adena Reis Vanrika', email: 'adenarevan@gmail.com',
  github: 'https://github.com/adenarevan',
  linkedin: 'https://linkedin.com/in/adena-reis-vanrika-0bb104187/',
  whatsapp: 'https://wa.me/6289612142465',
};

// Verified against public source and deployed websites on 26 November 2026.
export const projects = [
  {
    id: 'sipdjd', title: 'SIPDJD', repo: null,
    url: 'https://infrastrukturdaerah.pu.go.id/devsipdjd/beranda',
    category: { id: 'Sistem informasi · Jalan daerah', en: 'Information system · Regional roads' },
    tech: [],
    description: {
      id: 'Sistem Pengelolaan Database Jalan Daerah untuk PFID, Kementerian Pekerjaan Umum. Portal informasi yang mendukung pendataan, verifikasi, dan evaluasi infrastruktur jalan daerah.',
      en: 'A regional road database management system for PFID at Indonesia’s Ministry of Public Works. An information portal supporting regional road data collection, verification, and evaluation.',
    },
    features: {
      id: ['Rekapitulasi nasional dan informasi kondisi jalan', 'Informasi regulasi, panduan, dan kegiatan PFID', 'Portal dua bahasa dan akses sistem instansi'],
      en: ['National summaries and road condition information', 'Regulations, guidance, and PFID activities', 'Bilingual portal and institutional system access'],
    },
    note: { id: 'Repository privat. Pratinjau menampilkan halaman beranda publik.', en: 'Private repository. The preview shows the public homepage.' },
  },
  {
    id: 'crms', title: 'CRMS', repo: null,
    url: 'https://infrastrukturdaerah.pu.go.id/crms/access/auth/login',
    category: { id: 'Sistem informasi · Jalan perkotaan', en: 'Information system · City roads' },
    tech: [],
    description: {
      id: 'City Road Management System pada portal Infrastruktur Daerah Kementerian Pekerjaan Umum. Sistem pengelolaan jalan perkotaan dengan akses akun untuk pengguna instansi.',
      en: 'City Road Management System on the Ministry of Public Works’ regional infrastructure portal. A city road management system with account access for institutional users.',
    },
    features: {
      id: ['Halaman masuk akun pengguna', 'Jalur pengajuan akses pemerintah daerah dan balai', 'Pemulihan akses melalui fitur lupa kata sandi'],
      en: ['User account sign-in page', 'Access requests for local governments and regional offices', 'Account recovery through the forgot-password option'],
    },
    note: { id: 'Repository privat. Pratinjau menampilkan halaman login publik; fitur internal memerlukan akun.', en: 'Private repository. The preview shows the public sign-in page; internal features require an account.' },
  },
  {
    id: 'sinyallab', title: 'SinyalLab Futures', repo: 'btc_price_futures', url: 'https://btc-price-futures.vercel.app',
    category: { id: 'Aplikasi web · Simulasi pasar', en: 'Web application · Market simulation' },
    tech: ['Next.js', 'TypeScript', 'Firebase', 'WebSocket'],
    description: {
      id: 'Workspace riset futures dengan data pasar live, simulasi posisi, dan pencatatan risiko. Menghubungkan stream harga Binance dengan alur paper trading yang diperiksa ulang di server.',
      en: 'A futures research workspace with live market data, simulated positions, and risk tracking. Connects Binance price streams to a paper trading flow revalidated on the server.',
    },
    features: {
      id: ['Harga live melalui WebSocket dengan cadangan REST', 'Simulasi posisi, biaya, funding, dan batas risiko', 'Autentikasi Firebase dan validasi server'],
      en: ['Live WebSocket prices with a REST fallback', 'Simulated positions, fees, funding, and risk limits', 'Firebase authentication and server validation'],
    },
    note: { id: 'Halaman masuk dapat dilihat publik. Workspace khusus pemilik; seluruh transaksi merupakan simulasi.', en: 'The sign-in page is public. The workspace is private; all trades are simulations.' },
  },
  {
    id: 'vis', title: 'VIS Privacy Center', repo: 'privacy-policy-vis', url: 'https://privacy-policy-vis-nu.vercel.app',
    category: { id: 'Website · Konten terstruktur', en: 'Website · Structured content' },
    tech: ['Next.js', 'React', 'TypeScript', 'CSS'],
    description: {
      id: 'Halaman kebijakan privasi untuk Visual Inspection System. Menyusun dokumen panjang menjadi bacaan yang terstruktur, dengan navigasi per bagian dan akses dokumen PDF.',
      en: 'A privacy policy website for Visual Inspection System. Makes a long document easier to navigate, with section links and access to the PDF document.',
    },
    features: { id: ['Navigasi untuk 12 bagian kebijakan', 'Unduh PDF dan tampilan cetak', 'Konten terstruktur dengan TypeScript'], en: ['Navigation across 12 policy sections', 'PDF download and print layout', 'Structured content with TypeScript'] },
    note: { id: 'Website publik dengan dokumen kebijakan berbahasa Inggris.', en: 'A public website with an English-language policy document.' },
  },
  {
    id: 'surya', title: 'Surya Baja Lestari', repo: 'suryabajalestari', url: 'https://suryabajalestari.vercel.app',
    category: { id: 'Website · Profil perusahaan', en: 'Website · Company profile' },
    tech: ['React', 'Tailwind CSS', 'Framer Motion', 'Vite'],
    description: {
      id: 'Website profil usaha konstruksi baja dan bengkel las. Menghadirkan informasi perusahaan, layanan, dan jalur kontak WhatsApp dalam satu website responsif.',
      en: 'A company website for a steel construction and metalwork business. Brings company information, services, and WhatsApp contact into a responsive website.',
    },
    features: { id: ['Profil usaha dan informasi layanan', 'Navigasi satu halaman yang responsif', 'Kontak WhatsApp dan informasi lokasi'], en: ['Company profile and service information', 'Responsive single-page navigation', 'WhatsApp contact and location information'] },
    note: { id: 'Demo mengarah ke website perusahaan di suryabajalestari.com.', en: 'The demo redirects to the company website at suryabajalestari.com.' },
  },
  {
    id: 'alby', title: 'Alby Snack', repo: 'alby-snack', url: 'https://alby-snack.vercel.app',
    category: { id: 'Website · Katalog produk', en: 'Website · Product catalog' },
    tech: ['Next.js', 'React', 'Tailwind CSS', 'Framer Motion'],
    description: {
      id: 'Katalog digital untuk usaha makanan ringan. Pengunjung dapat menyaring menu berdasarkan kategori, melihat harga, lalu membuka WhatsApp dengan pesan produk yang dipilih.',
      en: 'A digital catalog for a local snack business. Visitors can filter the menu by category, browse prices, and open WhatsApp with a message for their selected product.',
    },
    features: { id: ['Filter kategori menu', 'Pesan WhatsApp sesuai produk', 'Informasi lokasi dan jam operasional'], en: ['Menu category filters', 'Product-specific WhatsApp messages', 'Location and opening hours'] },
    note: { id: 'Pemesanan dilanjutkan melalui WhatsApp.', en: 'Orders continue through WhatsApp.' },
  },
];

export const repositories = [
  { name: 'btc_price_futures', group: 'application', tech: 'TypeScript', description: { id: 'Riset pasar dan simulasi futures.', en: 'Market research and futures simulation.' } },
  { name: 'privacy-policy-vis', group: 'website', tech: 'TypeScript', description: { id: 'Website kebijakan privasi Visual Inspection System.', en: 'Visual Inspection System privacy website.' } },
  { name: 'restoran-frontend', group: 'application', tech: 'JavaScript', description: { id: 'Frontend React untuk sistem restoran QR.', en: 'React frontend for a QR restaurant system.' } },
  { name: 'restoran-api', group: 'backend', tech: 'PHP', description: { id: 'API Laravel untuk menu, pesanan, dan pembayaran.', en: 'Laravel API for menus, orders, and payments.' } },
  { name: 'suryabajalestari', group: 'website', tech: 'JavaScript', description: { id: 'Profil usaha konstruksi baja.', en: 'Steel construction company website.' } },
  { name: 'alby-snack', group: 'website', tech: 'JavaScript', description: { id: 'Katalog makanan dengan pemesanan WhatsApp.', en: 'Snack catalog with WhatsApp ordering.' } },
  { name: 'laravel-react', group: 'backend', tech: 'PHP', description: { id: 'Eksplorasi Laravel, Inertia, dan autentikasi.', en: 'Laravel, Inertia, and authentication exploration.' } },
  { name: 'laravel-download', group: 'backend', tech: 'PHP', description: { id: 'Repository aplikasi berbasis Laravel.', en: 'A Laravel application repository.' } },
  { name: 'my-portofolio', group: 'website', tech: 'JavaScript', description: { id: 'Website portofolio personal.', en: 'Personal portfolio website.' } },
  { name: 'my-portofolio2', group: 'website', tech: 'JavaScript', description: { id: 'Eksplorasi website portofolio lainnya.', en: 'Another personal portfolio exploration.' } },
  { name: 'react-fe-test', group: 'other', tech: 'Repository', description: { id: 'Repository latihan frontend.', en: 'Frontend exercise repository.' } },
  { name: 'adenarevan', group: 'other', tech: 'Profile', description: { id: 'README profil GitHub.', en: 'GitHub profile README.' } },
];

export const copy = {
  id: {
    skip: 'Langsung ke konten', navigation: 'Navigasi utama', language: 'Bahasa', close: 'Tutup', talk: 'Hubungi saya',
    nav: [{ href: '#portfolio', label: 'Proyek' }, { href: '#about', label: 'Tentang' }, { href: '#services', label: 'Keahlian' }],
    heroDescription: 'Web developer di Jakarta. Saya membangun aplikasi dengan React, Next.js, dan Laravel, dari antarmuka hingga API.',
    seeWork: 'Lihat proyek', workTitle: 'Proyek pilihan', workIntro: 'Sistem informasi infrastruktur, aplikasi, dan website bisnis. Jelajahi proyek dan pendekatan di baliknya.',
    source: 'Source code', privateRepo: 'Repository privat', visit: 'Buka website', screenshot: 'Tampilan website asli', preview: 'Pilih pratinjau proyek', features: 'Fitur utama',
    archiveTitle: 'Arsip GitHub', archiveIntro: 'Seluruh repository publik, dari aplikasi hingga eksplorasi. Pilih bidang untuk menelusuri kodenya.',
    filters: [{ id: 'all', label: 'Semua' }, { id: 'application', label: 'Aplikasi' }, { id: 'website', label: 'Website' }, { id: 'backend', label: 'Backend' }, { id: 'other', label: 'Lainnya' }],
    resultCount: 'repository', archiveSource: 'Lihat di GitHub', archiveToggle: 'Lihat seluruh repository', archiveClose: 'Tutup arsip',
    restaurantTitle: 'Sistem restoran QR', restaurantDescription: 'Satu alur pemesanan, dua repository. Antarmuka React terhubung ke API Laravel untuk mengelola menu, membuat pesanan, dan memproses pembayaran melalui Midtrans.',
    restaurantFrontend: 'React, Tailwind CSS, QR code', restaurantBackend: 'Laravel, Sanctum, Midtrans', restaurantLink: 'Lihat repository',
    aboutTitle: 'Tentang saya', aboutStatement: 'Saya Adena, web developer yang menghubungkan antarmuka dengan alur data.',
    aboutDescription: 'Proyek saya mencakup sistem informasi infrastruktur jalan, website usaha, pemesanan restoran, dan simulasi data pasar. Saya bekerja di frontend dengan React dan Next.js, serta mengembangkan API dengan Laravel. Bagi saya, antarmuka dan alur data perlu dirancang bersama.',
    portraitAlt: 'Adena Reis Vanrika', focus: 'Fokus', focusValue: 'Full-stack web development', approach: 'Berbasis di', approachValue: 'Jakarta, Indonesia', linkedin: 'Terhubung di LinkedIn',
    servicesTitle: 'Keahlian', servicesIntro: 'Teknologi dan pendekatan yang saya gunakan di proyek, dari pengalaman pengguna sampai integrasi layanan.', discussService: 'Diskusikan kebutuhan Anda', stack: 'Teknologi dalam proyek saya',
    services: [
      { id: 'web', title: 'Aplikasi web', description: 'Membangun alur kerja aplikasi yang menghubungkan antarmuka, autentikasi, dan data.', items: ['React, Next.js, dan TypeScript', 'Firebase Authentication dan Firestore', 'Data pasar melalui WebSocket dan REST API'] },
      { id: 'frontend', title: 'Website bisnis', description: 'Membantu usaha menampilkan layanan dan produk melalui website yang nyaman diakses dari ponsel.', items: ['Company profile dengan React dan Tailwind CSS', 'Katalog dengan filter kategori', 'Integrasi kontak dan pemesanan WhatsApp'] },
      { id: 'api', title: 'Backend & integrasi', description: 'Menyusun endpoint dan menghubungkan layanan eksternal dengan kebutuhan frontend.', items: ['API Laravel untuk menu dan pesanan', 'Autentikasi dengan Laravel Sanctum', 'Integrasi pembayaran Midtrans'] },
    ],
    contactTitle: 'Mari bekerja sama.', contactDescription: 'Punya proyek web, kebutuhan pengembangan, atau peluang kolaborasi? Saya terbuka untuk membicarakannya.', briefTitle: 'Ceritakan kebutuhan Anda', nameLabel: 'Nama', namePlaceholder: 'Nama Anda', serviceLabel: 'Kebutuhan proyek', messageLabel: 'Pesan', messagePlaceholder: 'Ceritakan tujuan, lingkup pekerjaan, dan waktu yang Anda rencanakan.',
    sendBrief: 'Siapkan email', formNote: 'Membuka aplikasi email dengan pesan Anda. Pesan dikirim melalui aplikasi tersebut.', formGreeting: 'Halo Adena,', mailSubject: 'Diskusi pengembangan web', mailStatus: 'Aplikasi email akan terbuka dengan pesan Anda. Jika tidak terbuka, gunakan alamat email di samping.', copyEmail: 'Salin email', copied: 'Email tersalin', copyFallback: 'Salin alamat ini: adenarevan@gmail.com',
    footerLine: 'Dari ide, menjadi aplikasi.', backTop: 'Kembali ke atas', footerCredit: 'Web developer · Jakarta',
  },
  en: {
    skip: 'Skip to content', navigation: 'Main navigation', language: 'Language', close: 'Close', talk: 'Get in touch',
    nav: [{ href: '#portfolio', label: 'Projects' }, { href: '#about', label: 'About' }, { href: '#services', label: 'Expertise' }],
    heroDescription: 'Web developer based in Jakarta. I build with React, Next.js, and Laravel, connecting interfaces with the APIs behind them.',
    seeWork: 'View projects', workTitle: 'Selected projects', workIntro: 'Infrastructure information systems, applications, and business websites. Explore the projects and the approach behind them.',
    source: 'Source code', privateRepo: 'Private repository', visit: 'Visit website', screenshot: 'Actual website preview', preview: 'Select a project preview', features: 'Key features',
    archiveTitle: 'GitHub archive', archiveIntro: 'Every public repository, from applications to experiments. Select a category to explore the source.',
    filters: [{ id: 'all', label: 'All' }, { id: 'application', label: 'Applications' }, { id: 'website', label: 'Websites' }, { id: 'backend', label: 'Backend' }, { id: 'other', label: 'Other' }],
    resultCount: 'repositories', archiveSource: 'View on GitHub', archiveToggle: 'View every repository', archiveClose: 'Close archive',
    restaurantTitle: 'QR restaurant system', restaurantDescription: 'One ordering flow across two repositories. A React interface connects to a Laravel API for menus, order creation, and payment processing through Midtrans.',
    restaurantFrontend: 'React, Tailwind CSS, QR code', restaurantBackend: 'Laravel, Sanctum, Midtrans', restaurantLink: 'View repository',
    aboutTitle: 'About me', aboutStatement: 'I’m Adena, a web developer connecting interfaces with the data behind them.',
    aboutDescription: 'My projects span road infrastructure information systems, business websites, restaurant ordering, and market data simulation. I build frontends with React and Next.js and develop APIs with Laravel. I believe interfaces and data flows should be designed together.',
    portraitAlt: 'Adena Reis Vanrika', focus: 'Focus', focusValue: 'Full-stack web development', approach: 'Based in', approachValue: 'Jakarta, Indonesia', linkedin: 'Connect on LinkedIn',
    servicesTitle: 'Expertise', servicesIntro: 'The technologies and approaches I use in my projects, from user experience to service integrations.', discussService: 'Discuss your project', stack: 'Technologies in my projects',
    services: [
      { id: 'web', title: 'Web applications', description: 'Building application workflows that bring interfaces, authentication, and data together.', items: ['React, Next.js, and TypeScript', 'Firebase Authentication and Firestore', 'Market data through WebSocket and REST APIs'] },
      { id: 'frontend', title: 'Business websites', description: 'Helping businesses present services and products through websites that work well on phones.', items: ['Company websites with React and Tailwind CSS', 'Catalogs with category filters', 'WhatsApp contact and ordering integrations'] },
      { id: 'api', title: 'Backend & integrations', description: 'Developing endpoints and connecting external services to frontend workflows.', items: ['Laravel APIs for menus and orders', 'Laravel Sanctum authentication', 'Midtrans payment integration'] },
    ],
    contactTitle: 'Let’s work together.', contactDescription: 'Have a web project, development need, or collaboration in mind? I’d be glad to hear about it.', briefTitle: 'Tell me what you need', nameLabel: 'Name', namePlaceholder: 'Your name', serviceLabel: 'Project needs', messageLabel: 'Message', messagePlaceholder: 'Share your goals, the scope of work, and your planned timeline.',
    sendBrief: 'Prepare email', formNote: 'Opens your email app with your message. You send the message from that app.', formGreeting: 'Hi Adena,', mailSubject: 'Web development discussion', mailStatus: 'Your email app will open with your message. If it does not open, use the email address alongside this form.', copyEmail: 'Copy email', copied: 'Email copied', copyFallback: 'Copy this address: adenarevan@gmail.com',
    footerLine: 'From an idea to an application.', backTop: 'Back to top', footerCredit: 'Web developer · Jakarta',
  },
};
