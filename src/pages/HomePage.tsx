import React from 'react';
import { QuickDropBanner } from '../components/QuickDropBanner';
import { HeroSlider } from '../components/HeroSlider';
import { ProductCatalog } from '../components/ProductCatalog';
import { FeaturedUpsell } from '../components/FeaturedUpsell';
import { TechFeaturesGrid } from '../components/TechFeaturesGrid';
import { OperatorReviews } from '../components/OperatorReviews';
import { FindUsSection } from '../components/FindUsSection';
import { FaqSection } from '../components/FaqSection';
import { Product } from '../types/tactical';
import { useStore } from '../context/StoreContext';

interface HomePageProps {
  onAddToCart: (product: Product, selectedSize: number) => void;
  onQuickView: (product: Product) => void;
  onOpenCart: () => void;
  isAdminLoggedIn?: boolean;
  onAdminEditProduct?: (product: Product) => void;
}

/**
 * =========================================================================
 * HALAMAN UTAMA (HOMEPAGE) - BROTRHER BOOTS OFFICIAL
 * =========================================================================
 * File ini mengontrol seluruh susunan section yang tampil di halaman depan:
 * 1. QuickDropBanner   : Pengumuman ticker & jatah pengiriman
 * 2. HeroSlider        : Banner promo besar (dikelola di Supabase / StoreContext)
 * 3. ProductCatalog    : Katalog artikel sepatu PDL/PDH dengan filter kategori
 * 4. FeaturedUpsell    : Paket promo bundling & penawaran spesial
 * 5. TechFeaturesGrid  : 4 pilar standar ketahanan militer Brotrher
 * 6. OperatorReviews   : Testimoni asli anggota dinas TNI, Polri, Security
 * 7. FindUsSection     : Temukan Kami (Shopee, Tokopedia, TikTok, IG, FB, WA)
 * 8. FaqSection        : Pertanyaan umum & panduan pemesanan (SEO Rich)
 * =========================================================================
 */
export const HomePage: React.FC<HomePageProps> = ({
  onAddToCart,
  onQuickView,
  onOpenCart,
  isAdminLoggedIn = false,
  onAdminEditProduct,
}) => {
  const { products, heroSlides } = useStore();

  return (
    <div className="flex flex-col">
      {/* 1. Urgent Mission Dispatch Ticker */}
      <QuickDropBanner />

      {/* 2. Hero Slider Promo & Upsell */}
      <HeroSlider
        onSelectProduct={(productId) => {
          const found = products.find((p) => p.id === productId);
          if (found) onQuickView(found);
        }}
        onOpenCart={onOpenCart}
      />

      {/* 3. Product Catalog Grid dengan Filter Tab & Pagination */}
      <ProductCatalog
        onAddToCart={onAddToCart}
        onQuickView={onQuickView}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminEditProduct={onAdminEditProduct}
      />

      {/* 4. Dedicated Upsell & Bundle Section */}
      <FeaturedUpsell />

      {/* 5. Technical Military Standards Spec Grid */}
      <TechFeaturesGrid />

      {/* 6. Real Field Operator Testimonials */}
      <OperatorReviews />

      {/* 7. Temukan Kami di Platform Resmi (Shopee, Tokopedia, TikTok, IG, FB, WA) */}
      <FindUsSection />

      {/* 8. On-Page SEO FAQ & Knowledge Accordion */}
      <FaqSection />
    </div>
  );
};

export default HomePage;
