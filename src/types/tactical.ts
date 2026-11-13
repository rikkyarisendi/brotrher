export interface ProductSpec {
  material: string;
  outsole: string;
  zipper: string;
  lacing: string;
  safety: string;
  craftsmanship: string;
}

export interface ProductCallout {
  label: string;
  top: string;
  left?: string;
  right?: string;
}

export type ProductCategory = 'pdl' | 'pdh' | 'tali-putar' | 'tali-biasa' | 'full-kulit' | 'kombinasi-cordura';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: ProductCategory | string;
  categories?: (ProductCategory | string)[];
  categoryLabel: string;
  tagline: string;
  price: number;
  originalPrice: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  isDropAlert?: boolean;
  isBestSeller?: boolean;
  inStock: boolean;
  stockRemaining: number;
  image: string;
  gallery: string[];
  specs: ProductSpec;
  sizes: number[];
  badge?: string;
  callouts?: ProductCallout[];
}

export interface HeroSlide {
  id: string;
  badge: string;
  headline: string;
  highlightText: string;
  subtext: string;
  specsHighlight: { label: string; value: string }[];
  promoCode?: string;
  ctaText: string;
  image: string;
  priceDisplay: string;
  discountBadge?: string;
  featuredTag?: string;
  productId?: string;
  callouts?: string[];
}

export interface CartItem {
  product: Product;
  selectedSize: number;
  quantity: number;
}
