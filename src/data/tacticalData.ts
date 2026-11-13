import { Product, HeroSlide } from '../types/tactical';

/**
 * =========================================================================
 * DATA RESMI & ASSET BRAND BROTRHER BOOTS
 * =========================================================================
 * Menggunakan Logo Resmi & Flagship Model MARABUNTA ROCKY
 * =========================================================================
 */

export const BRAND_CONFIG = {
  name: 'BROTRHER BOOTS OFFICIAL',
  brandName: 'BROTRHER',
  tagline: 'SEPATU PDL KULIT SAPI ASLI • SPEK DINAS TNI, POLRI, SECURITY & OUTDOOR',
  website: 'https://brotrher.com',
  phone: '+62 822-1707-4200',
  whatsappDirect: '6282217074200',
  email: 'marketingbrotrher@gmail.com',
  // Official Brand Logos
  logoUrl: '/assets/brand/ICON-LOGO.webp',
  iconLogoUrl: '/assets/brand/ICON-LOGO.webp',
  avatarLogoUrl: '/assets/brand/ICON-LOGO.webp',
  currencySymbol: 'Rp',
  freeShippingThreshold: 500000,
};

// Modular Section Data
export { HERO_SLIDES } from './sections/heroSection';
export { SOCIAL_MARKETPLACE_LINKS } from './sections/socialLinks';
export type { SocialMarketplaceLink } from './sections/socialLinks';


/**
 * =========================================================================
 * ARTIKEL KATALOG SEPATU BROTRHER BOOTS (MODULAR: 1 ARTIKEL = 1 FILE)
 * =========================================================================
 * Setiap artikel sepatu kini tersimpan terpisah di folder: src/data/products/*.ts
 * Untuk mengedit atau menambah artikel baru, buka folder tersebut.
 * =========================================================================
 */
export { PRODUCTS } from "./products";

export const TECH_PILLARS = [
  {
    code: 'SPEK-01',
    title: '100% KULIT SAPI ASLI PILIHAN',
    desc: 'Menggunakan bahan kulit sapi asli tebal, lentur di kaki, tidak pecah-pecah terkena panas dan air saat latihan berat.',
    metric: 'GENUINE LEATHER GRADE A',
  },
  {
    code: 'SPEK-02',
    title: 'SOL SUDAH DIJAHIT KELILING',
    desc: 'Semua sol karet bawah sudah dijahit tembus memutar 360 derajat dengan benang nilon kuat. Tidak gampang mangap atau lepas!',
    metric: '100% JAHIT TEMBUS BAWAH',
  },
  {
    code: 'SPEK-03',
    title: 'RESLETING YKK ORIGINAL',
    desc: 'Memudahkan pakai & lepas sepatu dalam hitungan detik. Resleting YKK buaya asli terkenal bandel, tidak gampang dol atau macet.',
    metric: 'YKK HEAVY-DUTY ZIPPER',
  },
  {
    code: 'SPEK-04',
    title: 'FITGO AUTO-LOCK LACING',
    desc: 'Fitur kawat baja putar otomatis di seri Marabunta Rocky & Fitgo Series. Cukup putar dial 3 detik, sepatu langsung mengunci pas di kaki tanpa tali kendor.',
    metric: 'FITGO AUTO-LOCK SYSTEM',
  },
];

export const OPERATOR_REVIEWS = [
  {
    id: 'rev-1',
    callsign: 'SERDA AGUS K.',
    unit: 'ANGGOTA YONIF / TNI-AD',
    boot: 'Brotrher Marabunta Rocky Fitgo',
    rating: 5,
    date: '1 HARI LALU',
    quote: 'Marabunta Rocky ini gila mantapnya! Tali putar Fitgo kencang dan kokoh. Dipakai patroli dan rayapan solnya mantap gak licin. Kulit sapinya asli kerasa aromanya. Sangat rekomen buat rekan dinas.',
  },
  {
    id: 'rev-2',
    callsign: 'BRIGADIR FAJAR',
    unit: 'KORPS BRIMOB DAERAH',
    boot: 'Brotrher Fitgo Tawon Combat',
    rating: 5,
    date: '3 HARI LALU',
    quote: 'Udah pesanan kedua di official Brotrher. Sepatu Fitgo Tawon ini enteng banget, kaki gak gampang lecet karena peredam jala karetnya empuk. Jahitan solnya rapih tembus sampai dalam.',
  },
  {
    id: 'rev-3',
    callsign: 'KAPTEN HERMAWAN',
    unit: 'DENPOM / POLISI MILITER',
    boot: 'Brotrher Fitgo Mamba PM / TNI',
    rating: 5,
    date: '5 HARI LALU',
    quote: 'Kombinasi hitam kilap dan putih PM-nya rapih dan gagah untuk tugas dinas. Sistem knop putar Fitgo sampingnya sangat membantu pas apel cepat. Pengiriman cepat banget.',
  },
];

export const UPSELL_BUNDLE = {
  id: 'bundle-brotrher-super',
  name: 'PAKET KOMANDO',
  tagline: 'MARABUNTA FITGO + BONUS AKSESORIS KEDINASAN LENGKAP',
  items: [
    'Sepatu PDL Brotrher Marabunta Rocky Fitgo (Rp 695.000)',
    'Kaos Kaki Dinas Militer Tebal Brotrher 2 Pasang (Rp 55.000)',
    'Kit Semir Kilap Instan Cepat Spons Brotrher (Rp 30.000)',
    'Gantungan Kunci Taktis Asli Brotrher Official (Free Gift)',
  ],
  totalRegularPrice: 780000,
  bundlePrice: 710000,
  savings: 70000,
  remainingSlots: 9,
  endsInMinutes: 35,
};
