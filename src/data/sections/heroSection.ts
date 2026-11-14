import { HeroSlide } from '../../types/tactical';

/**
 * =========================================================================
 * KONFIGURASI HERO SLIDER HALAMAN UTAMA (BANNER UTAMA)
 * =========================================================================
 * Anda bisa mengubah foto, judul, diskon, dan teks promo banner di sini.
 * Setiap slide mewakili 1 banner promo yang berganti otomatis di bagian atas.
 * =========================================================================
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-marabunta',
    badge: 'SEPATU PDL TALI PUTAR',
    headline: 'MARABUNTA ROCKY',
    highlightText: 'SISTEM TALI PUTAR DENGAN KAWAT BAJA',
    subtext: 'Bahan 100% Kulit Sapi Asli pilihan berpadu Kanvas Cordura Waterproof. Sol Rubber Anti-Slip dengan konstruksi jahit keliling melingkar tembus dalam.',
    specsHighlight: [
      { label: 'LACING', value: 'FITGO AUTO-LOCK' },
      { label: 'MATERIAL', value: '100% KULIT SAPI' },
      { label: 'OUTSOLE', value: 'RUBBER ANTI-SLIP' },
    ],
    ctaText: 'PESAN MARABUNTA ROCKY',
    priceDisplay: 'Rp 657.900',
    discountBadge: 'FLAGSHIP EDITION',
    featuredTag: 'MARABUNTA ROCKY',
    image: '/assets/products/slide1-marabunta.webp',
    productId: 'brotrher-marabunta-rocky',
    callouts: [
      'Fitgo Lacing System',
      'Tali Baja Import',
      'Cordura Canvas Waterproof',
      'Kulit Sapi Asli',
      'Rubber Anti-Slip',
    ],
  },
  {
    id: 'slide-fitgo-tawon',
    badge: 'SEPATU PDL MOTIF TAWON',
    headline: 'BROTRHER FITGO TAWON',
    highlightText: 'JALA KARET TAWON + FITGO',
    subtext: 'Inovasi jala karet motif sarang lebah (Tawon) pelindung benturan ekstra. Dilengkapi sistem tali putar Fitgo kawat baja import dan tapak sol rubber anti-slip tahan licin.',
    specsHighlight: [
      { label: 'LACING', value: 'FITGO AUTO-LOCK' },
      { label: 'UPPER', value: 'JALA KARET TAWON' },
      { label: 'OUTSOLE', value: 'RUBBER RADIAL' },
    ],
    ctaText: 'PESAN FITGO TAWON',
    priceDisplay: 'Rp 668.000',
    discountBadge: 'TERLARIS TAWON',
    featuredTag: 'FITGO TAWON',
    image: '/assets/products/slide3-tawon.webp',
    productId: 'brotrher-fitgo-tawon-black',
    callouts: [
      'Fitgo Lacing System',
      'Tali Baja Import',
      'Cordura Canvas Waterproof',
      'Jala Karet Motif Tawon',
      'Kulit Sapi Asli',
      'Rubber Anti-Slip',
    ],
  },
  {
    id: 'slide-fitgo-lantas',
    badge: 'SEPATU PDH TALI PUTAR',
    headline: 'FITGO LANTAS',
    highlightText: 'BONUS KEYCHAIN RESMI BROTRHER',
    subtext: 'Sepatu PDL Taktis potongan mid-cut lincah dirancang khusus untuk mobilitas Polantas, Dishub & tugas dinas operasional harian. Kulit sapi asli berpadu jala tawon fleksibel.',
    specsHighlight: [
      { label: 'LACING', value: 'FITGO AUTO-LOCK' },
      { label: 'EDISI', value: 'POLANTAS & DINAS' },
      { label: 'AKSESORIS', value: 'KEYCHAIN BROTRHER' },
    ],
    ctaText: 'PESAN FITGO LANTAS',
    priceDisplay: 'Rp 667.900',
    discountBadge: 'EDISI DINAS LANTAS',
    featuredTag: 'FITGO LANTAS',
    image: '/assets/products/slide2-lantas.webp',
    productId: 'brotrher-fitgo-lantas-6inch',
    callouts: [
      'Fitgo Lacing System',
      'Tali Baja Import',
      'Cordura Canvas Waterproof',
      'Jala Karet Motif Tawon',
      'Kulit Sapi Asli',
      'Rubber Anti-Slip',
    ],
  },
];
