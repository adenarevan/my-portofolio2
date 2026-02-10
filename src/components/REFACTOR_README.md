# Struktur Folder Components

Kode LandingPage telah di-refactor menjadi beberapa file terpisah untuk memudahkan maintenance.

## Struktur Folder Baru

```
src/components/
├── LandingPage.jsx          # Main component (import semua sections)
├── Navigation.jsx            # Header navigation component
├── Footer.jsx               # Footer component
├── Icons.jsx                # Semua SVG icon components
├── data.js                  # Data constants (services, projects, testimonials, dll)
└── sections/
    ├── index.js             # Export semua section components
    ├── HeroSection.jsx      # Hero/banner section
    ├── AboutSection.jsx     # About me section
    ├── ServicesSection.jsx  # Services section
    ├── PortfolioSection.jsx # Portfolio/projects section
    ├── WhyChooseMeSection.jsx
    ├── TestimonialsSection.jsx
    ├── CTASection.jsx       # Call-to-action section
    └── ContactSection.jsx   # Contact form & info section
```

## Keuntungan Struktur Baru

1. **Mudah di-maintain**: Setiap component dalam file terpisah
2. **Reusable**: Component dapat digunakan di halaman lain
3. **Organized**: Kode lebih terstruktur dan mudah dinavigasi
4. **Scalable**: Mudah menambah atau memodifikasi section
5. **Clean Code**: File lebih kecil dan fokus pada satu tanggung jawab

## Cara Penggunaan

File utama `LandingPage.jsx` sekarang hanya mengimport dan menyusun component:

```jsx
import Navigation from './Navigation';
import HeroSection from './sections/HeroSection';
// ... dst

const LandingPage = () => {
  return (
    <div>
      <Navigation />
      <HeroSection />
      <AboutSection />
      {/* ... sections lainnya */}
    </div>
  );
};
```

Untuk mengedit section tertentu, cukup buka file yang sesuai di folder `sections/`.

## Update Data

Untuk mengupdate data seperti projects, services, testimonials, dll, edit file `data.js`.

## Update Icons

Untuk menambah atau memodifikasi icons, edit file `Icons.jsx`.
