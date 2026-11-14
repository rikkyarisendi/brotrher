import { Product, HeroSlide, ProductSpec } from '../types/tactical';
import { PRODUCTS, HERO_SLIDES } from '../data/tacticalData';

export interface SupabaseProductRow {
  id: string;
  name: string;
  category: string | null;
  tags: string[] | null;
  price: number;
  original_price: number | null;
  stock: number | null;
  description: string | null;
  image: string | null;
  images: string[] | null;
  sizes: number[] | null;
  badge: string | null;
  is_active?: boolean | null;
  updated_at?: string | null;
}

export interface SupabaseHeroSlideRow {
  id: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  badge: string | null;
  cta_text: string | null;
  cta_link: string | null;
  image: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
  updated_at?: string | null;
}

export interface ProductMetaOverride {
  code?: string;
  specs?: ProductSpec;
  rating?: number;
  reviewCount?: number;
  isBestSeller?: boolean;
}

const localProductMap = new Map<string, Product>(PRODUCTS.map((p) => [p.id, p]));
const localSlideMap = new Map<string, HeroSlide>(HERO_SLIDES.map((s) => [s.id, s]));

function synthesizeSpecsFromTags(tags: string[], existing?: ProductSpec): ProductSpec {
  const isTaliPutar = tags.includes('tali-putar');
  const isCordura = tags.includes('kombinasi-cordura');

  return {
    material:
      existing?.material ||
      (isCordura
        ? 'Kulit Sapi Asli Grade A + Kanvas Cordura Waterproof'
        : '100% Full Kulit Sapi Asli Grade A Tebal 1.8mm'),
    outsole: existing?.outsole || 'Sol Karet Radial Komando Anti-Slip Jahit Keliling',
    zipper:
      existing?.zipper ||
      (isTaliPutar ? 'Fitgo Rotary Dial Fast System' : 'Resleting Samping YKK Heavy Duty'),
    lacing:
      existing?.lacing ||
      (isTaliPutar ? 'Tali Putar (Kawat Baja Fitgo)' : 'Tali Biasa Waxed'),
    safety: existing?.safety || 'Bantalan Busa Leher Kaki Empuk & Bumper Pelindung Jari',
    craftsmanship:
      existing?.craftsmanship || 'Sol Karet Konstruksi Jahit Melingkar 360° Tembus Dalam',
  };
}

export function dbRowToProduct(
  row: SupabaseProductRow,
  metaOverrides?: Record<string, ProductMetaOverride>
): Product {
  const localMatch = localProductMap.get(row.id);
  const override = metaOverrides?.[row.id];

  const categories =
    Array.isArray(row.tags) && row.tags.length > 0
      ? row.tags
      : localMatch?.categories || [row.category || 'pdl'];

  const primaryCat =
    row.category ||
    categories.find((c) => c === 'pdl' || c === 'pdh') ||
    localMatch?.category ||
    'pdl';

  const price = Number(row.price) || localMatch?.price || 0;
  const orig = Math.max(price, Number(row.original_price) || localMatch?.originalPrice || price);
  const discountPercent = orig > price ? Math.round(((orig - price) / orig) * 100) : 0;
  const stockRemaining =
    typeof row.stock === 'number' ? Math.max(0, row.stock) : localMatch?.stockRemaining ?? 10;

  const gallery =
    Array.isArray(row.images) && row.images.length > 0
      ? row.images
      : row.image
      ? [row.image]
      : localMatch?.gallery || ['/assets/products/Bronson.webp'];

  const image = row.image || gallery[0] || localMatch?.image || '/assets/products/Bronson.webp';

  const sizes =
    Array.isArray(row.sizes) && row.sizes.length > 0
      ? row.sizes.map(Number).filter((n) => !isNaN(n))
      : localMatch?.sizes || [39, 40, 41, 42, 43, 44];

  const code =
    override?.code ||
    localMatch?.code ||
    'BR-' + (row.name || 'PRD').replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();

  const specs = synthesizeSpecsFromTags(categories, override?.specs || localMatch?.specs);

  return {
    id: row.id,
    code,
    name: row.name || localMatch?.name || 'BROTRHER BOOTS',
    category: primaryCat,
    categories,
    categoryLabel: primaryCat.toUpperCase(),
    tagline: row.description ?? localMatch?.tagline ?? '',
    price,
    originalPrice: orig,
    discountPercent,
    rating: override?.rating ?? localMatch?.rating ?? 5.0,
    reviewCount: override?.reviewCount ?? localMatch?.reviewCount ?? 150,
    isBestSeller: override?.isBestSeller ?? localMatch?.isBestSeller ?? true,
    inStock: stockRemaining > 0,
    stockRemaining,
    image,
    gallery,
    specs,
    sizes,
    badge: row.badge ?? localMatch?.badge,
    callouts: localMatch?.callouts,
  };
}

export function productToDbRow(product: Product): SupabaseProductRow {
  const tags =
    product.categories && product.categories.length > 0
      ? product.categories
      : [product.category || 'pdl'];

  return {
    id: product.id,
    name: product.name,
    category: product.category || 'pdl',
    tags,
    price: Number(product.price) || 0,
    original_price: Math.max(Number(product.price) || 0, Number(product.originalPrice) || 0),
    stock: Math.max(0, Number(product.stockRemaining) || 0),
    description: product.tagline || '',
    image: product.image || product.gallery?.[0] || '',
    images:
      product.gallery && product.gallery.length > 0
        ? product.gallery
        : product.image
        ? [product.image]
        : [],
    sizes: product.sizes && product.sizes.length > 0 ? product.sizes : [39, 40, 41, 42, 43, 44],
    badge: product.badge || null,
    is_active: true,
    updated_at: new Date().toISOString(),
  };
}

export function dbRowToHeroSlide(row: SupabaseHeroSlideRow): HeroSlide {
  const localMatch = localSlideMap.get(row.id);

  return {
    id: row.id,
    badge: row.badge || localMatch?.badge || 'SEPATU PDL TAKTIKAL',
    headline: row.title || localMatch?.headline || 'BROTRHER BOOTS',
    highlightText: row.subtitle || localMatch?.highlightText || '100% KULIT SAPI ASLI',
    subtext: row.description || localMatch?.subtext || '',
    specsHighlight: localMatch?.specsHighlight || [
      { label: 'LACING', value: 'FITGO AUTO-LOCK' },
      { label: 'MATERIAL', value: '100% KULIT SAPI' },
      { label: 'OUTSOLE', value: 'RUBBER ANTI-SLIP' },
    ],
    ctaText: row.cta_text || localMatch?.ctaText || 'LIHAT PRODUK',
    priceDisplay: localMatch?.priceDisplay || 'PROMO SPESIAL',
    discountBadge: localMatch?.discountBadge,
    featuredTag: localMatch?.featuredTag || row.title || undefined,
    image: row.image || localMatch?.image || '/assets/products/Bronson.webp',
    // cta_link dari database hanya dipakai kalau mengarah ke produk yang benar-benar ada;
    // kalau tidak (mis. 'brotrher-fitgo-tawon'), pakai productId lokal yang sudah benar.
    productId:
      row.cta_link && !row.cta_link.startsWith('#') && localProductMap.has(row.cta_link)
        ? row.cta_link
        : localMatch?.productId,
    callouts: localMatch?.callouts,
  };
}

export function heroSlideToDbRow(slide: HeroSlide, index: number): SupabaseHeroSlideRow {
  return {
    id: slide.id,
    title: slide.headline,
    subtitle: slide.highlightText,
    description: slide.subtext,
    badge: slide.badge,
    cta_text: slide.ctaText,
    cta_link: slide.productId || '#catalog',
    image: slide.image,
    is_active: true,
    sort_order: index,
    updated_at: new Date().toISOString(),
  };
}
