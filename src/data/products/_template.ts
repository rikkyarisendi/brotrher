/**
 * ============================================================================
 * TEMPLATE ARTIKEL SEPATU BROTRHER BOOTS
 * ============================================================================
 * CARA MENAMBAH ARTIKEL BARU:
 * 1. Duplikat file ini dan beri nama sesuai model, misal: 'sepatu-baru.ts'
 * 2. Sesuaikan data di bawah (id, kode, nama, harga, gambar, spek)
 * 3. Buka file 'src/data/products/index.ts':
 *    - Tambahkan: import sepatuBaru from './sepatu-baru';
 *    - Masukkan 'sepatuBaru' ke dalam array PRODUCTS
 * ============================================================================
 */

import { Product } from '../../types/tactical';

export const product: Product = {
  // ID unik produk, diawali dengan 'brotrher-' (huruf kecil & tanda hubung)
  id: 'brotrher-nama-model-baru',

  // Kode unik artikel pendek untuk display badge
  code: 'BR-NEW',

  // Nama resmi artikel sepatu
  name: 'BROTRHER NAMA MODEL BARU',

  // Kategori utama: 'pdl' | 'pdh' | 'tali-putar' | 'tali-biasa' | 'full-kulit'
  category: 'pdl',

  // Kategori filter (bisa lebih dari satu agar muncul saat tab diklik)
  // Pilihan: 'pdl', 'pdh', 'tali-putar', 'tali-biasa', 'full-kulit'
  categories: ['pdl', 'tali-putar', 'full-kulit'],

  // Label teks kategori di atas judul (PDL / PDH)
  categoryLabel: 'PDL',

  // Deskripsi singkat keunggulan & fungsi sepatu
  tagline: 'Sepatu dinas taktis kualitas premium kulit sapi asli dengan konstruksi sol jahit keliling tembus dalam.',

  // Harga jual setelah diskon (angka murni tanpa titik)
  price: 685000,

  // Harga coret sebelum diskon
  originalPrice: 850000,

  // Persentase diskon
  discountPercent: 19,

  // Nilai rating bintang ulasan (1.0 - 5.0)
  rating: 5.0,

  // Jumlah ulasan pembeli
  reviewCount: 1420,

  // Beri nilai true jika ingin badge BEST SELLER atau DROP ALERT
  isBestSeller: true,
  isDropAlert: false,

  // Ketersediaan stok
  inStock: true,
  stockRemaining: 12,

  // Badge teks di atas foto (contoh: 'FREE KEYCHAIN + KAOS KAKI')
  badge: 'FREE KEYCHAIN + KAOS KAKI',

  // Path gambar produk
  image: '/assets/products/Bronson.webp',
  gallery: [
    '/assets/products/Bronson.webp',
  ],

  // Spesifikasi teknis sepatu
  specs: {
    material: '100% Kulit Sapi Asli Grade A Pilihan',
    outsole: 'Sol Karet Radial Anti-Slip Tahan Minyak & Lumpur',
    zipper: 'Resleting YKK Buaya / Fitgo Rotary Knop',
    lacing: 'Tali Kawat Baja Import / Tali Biasa Taktis',
    safety: 'Pelindung Ankle, Tumit & Busa Leher Tebal',
    craftsmanship: 'Sol Dijahit Melingkar Tembus Dalam 360°',
  },

  // Pilihan ukuran sepatu yang tersedia
  sizes: [39, 40, 41, 42, 43, 44, 45],
};

export default product;
