export interface SocialMarketplaceLink {
  id: string;
  name: string;
  shortName: string;
  platform: 'tiktok' | 'instagram' | 'facebook' | 'shopee' | 'tokopedia' | 'whatsapp';
  category: 'social' | 'marketplace' | 'direct';
  handle: string;
  url: string;
  badge: string;
  description: string;
  color: string;
  highlightText?: string;
}

/**
 * =========================================================================
 * LINK RESMI TEMUKAN KAMI (MARKETPLACE & MEDIA SOSIAL)
 * =========================================================================
 * Seluruh tautan menggunakan palet warna resmi brand Brotrher Boots (#F8B704)
 * agar tampil seragam, taktis, dan konsisten.
 * =========================================================================
 */
export const SOCIAL_MARKETPLACE_LINKS: SocialMarketplaceLink[] = [
  {
    id: 'shopee',
    name: 'Shopee Official Store',
    shortName: 'SHOPEE',
    platform: 'shopee',
    category: 'marketplace',
    handle: 'brotrherbootsofficial',
    url: 'https://shopee.co.id/brotrherbootsofficial',
    badge: 'SHOPEE MALL',
    description: 'Bisa COD bayar di tempat, Gratis Ongkir Xtra & Voucher Diskon.',
    color: '#F8B704',
    highlightText: 'GRATIS ONGKIR & COD',
  },
  {
    id: 'tokopedia',
    name: 'Tokopedia Official',
    shortName: 'TOKOPEDIA',
    platform: 'tokopedia',
    category: 'marketplace',
    handle: 'brotrherboots',
    url: 'https://www.tokopedia.com/brotrherbootsofficial',
    badge: 'POWER MERCHANT',
    description: 'Cicilan 0%, Bebas Ongkir se-Indonesia & Perlindungan Pembeli Terpercaya.',
    color: '#F8B704',
    highlightText: 'BEBAS ONGKIR SE-INDONESIA',
  },
  {
    id: 'tiktok',
    name: 'TikTok Official',
    shortName: 'TIKTOK',
    platform: 'tiktok',
    category: 'social',
    handle: '@brotrherboots',
    url: 'https://www.tiktok.com/@brotrher_boots',
    badge: 'TIKTOK SHOP',
    description: 'Tonton video uji ketangguhan sepatu, review sol jahit, dan diskon live streaming.',
    color: '#F8B704',
    highlightText: 'LIVE REVIEW SETIAP HARI',
  },
  {
    id: 'instagram',
    name: 'Instagram Official',
    shortName: 'INSTAGRAM',
    platform: 'instagram',
    category: 'social',
    handle: '@brotrherboots',
    url: 'https://www.instagram.com/brotrher_boots',
    badge: 'OFFICIAL IG',
    description: 'Katalog foto resolusi tinggi, testimoni dinas TNI/POLRI, dan update artikel baru.',
    color: '#F8B704',
    highlightText: 'TESTIMONI REKAN DINAS',
  },
  {
    id: 'facebook',
    name: 'Facebook Page',
    shortName: 'FACEBOOK',
    platform: 'facebook',
    category: 'social',
    handle: 'Brotrher Boots Official',
    url: 'https://www.facebook.com/brotrher_boots',
    badge: 'HALAMAN RESMI',
    description: 'Komunitas pengguna sepatu taktis dinas se-Indonesia & info pemesanan satuan / korps.',
    color: '#F8B704',
    highlightText: 'KOMUNITAS TAKTIS',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp CS Fast Response',
    shortName: 'WHATSAPP',
    platform: 'whatsapp',
    category: 'direct',
    handle: '+62 822-1707-4200',
    url: 'https://api.whatsapp.com/send?phone=6282217074200&text=Halo%20Admin%20Brotrher%20Boots,%20saya%20ingin%20tanya%20sepatu%20PDL/PDH',
    badge: 'CS WHATSAPP',
    description: 'Tanya panduan ukuran (size chart), konsultasi spek korps, dan pembelian langsung.',
    color: '#F8B704',
    highlightText: 'FAST RESPONSE 24/7',
  },
];
