import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, HeroSlide } from '../types/tactical';
import { PRODUCTS, HERO_SLIDES, UPSELL_BUNDLE } from '../data/tacticalData';
import { supabase } from '../lib/supabase';
import {
  dbRowToProduct,
  productToDbRow,
  dbRowToHeroSlide,
  heroSlideToDbRow,
  SupabaseProductRow,
  SupabaseHeroSlideRow,
  ProductMetaOverride,
  HeroSlideMetaOverride,
} from '../lib/supabaseMappers';

interface UpsellData {
  id: string;
  name: string;
  tagline: string;
  items: string[];
  totalRegularPrice: number;
  bundlePrice: number;
  savings: number;
  remainingSlots: number;
  endsInMinutes: number;
}

export type DbSyncStatus = 'syncing' | 'synced' | 'empty-fallback' | 'error';

export interface DbMutationResult {
  ok: boolean;
  error?: string;
}

interface StoreContextType {
  products: Product[];
  heroSlides: HeroSlide[];
  tickerText: string;
  upsellBundle: UpsellData;
  dbSyncStatus: DbSyncStatus;
  dbError: string | null;
  supabaseProductCount: number;
  supabaseSlideCount: number;
  lastSyncedAt: string | null;
  refreshFromSupabase: () => Promise<void>;
  seedCatalogToSupabase: () => Promise<DbMutationResult>;
  updateProductPrice: (id: string, price: number, originalPrice: number) => Promise<DbMutationResult>;
  updateProductStock: (id: string, stock: number) => Promise<DbMutationResult>;
  applyBulkDiscount: (
    category: string,
    discountValue: number,
    mode?: 'percent' | 'fixed'
  ) => Promise<{ affectedCount: number; ok: boolean; error?: string }>;
  addProduct: (newProduct: Product) => Promise<DbMutationResult>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<DbMutationResult>;
  deleteProduct: (id: string) => Promise<DbMutationResult>;
  updateHeroSlide: (id: string, updates: Partial<HeroSlide>) => Promise<DbMutationResult>;
  addHeroSlide: (slide: HeroSlide) => Promise<DbMutationResult>;
  deleteHeroSlide: (id: string) => Promise<DbMutationResult>;
  updateTickerText: (text: string) => Promise<DbMutationResult>;
  updateUpsellBundle: (updates: Partial<UpsellData>) => Promise<DbMutationResult>;
  resetToDefaults: () => Promise<DbMutationResult>;
  exportStoreJson: () => string;
  importStoreJson: (jsonStr: string) => Promise<boolean>;
}

const DEFAULT_TICKER =
  'PENGIRIMAN HARI INI • PESANAN SEBELUM JAM 15:00 WIB LANGSUNG DIKIRIM • COD SELURUH INDONESIA';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(HERO_SLIDES);
  const [tickerText, setTickerText] = useState<string>(DEFAULT_TICKER);
  const [upsellBundle, setUpsellBundle] = useState<UpsellData>(UPSELL_BUNDLE);
  const [metaOverrides, setMetaOverrides] = useState<Record<string, ProductMetaOverride>>({});
  const [heroMetaOverrides, setHeroMetaOverrides] = useState<Record<string, HeroSlideMetaOverride>>({});

  const [dbSyncStatus, setDbSyncStatus] = useState<DbSyncStatus>('syncing');
  const [dbError, setDbError] = useState<string | null>(null);
  const [supabaseProductCount, setSupabaseProductCount] = useState<number>(0);
  const [supabaseSlideCount, setSupabaseSlideCount] = useState<number>(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const refreshFromSupabase = useCallback(async () => {
    setDbSyncStatus('syncing');
    setDbError(null);

    try {
      // Fetch store_config, products, and hero_slides concurrently
      const [configRes, productsRes, slidesRes] = await Promise.all([
        supabase.from('store_config').select('key, value'),
        supabase
          .from('products')
          .select('*')
          .order('updated_at', { ascending: false }),
        supabase
          .from('hero_slides')
          .select('*')
          .order('sort_order', { ascending: true }),
      ]);

      if (configRes.error) throw configRes.error;
      if (productsRes.error) throw productsRes.error;
      if (slidesRes.error) throw slidesRes.error;

      // 1. Parse store_config
      let loadedMeta: Record<string, ProductMetaOverride> = {};
      let loadedHeroMeta: Record<string, HeroSlideMetaOverride> = {};
      if (Array.isArray(configRes.data)) {
        for (const item of configRes.data) {
          if (item.key === 'ticker_text' && typeof item.value === 'string' && item.value.trim()) {
            setTickerText(item.value);
          } else if (item.key === 'upsell_bundle' && item.value) {
            try {
              const parsed =
                typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
              if (parsed && typeof parsed === 'object') {
                setUpsellBundle((prev) => ({ ...prev, ...parsed }));
              }
            } catch (_) {}
          } else if (item.key === 'product_meta' && item.value) {
            try {
              const parsed =
                typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
              if (parsed && typeof parsed === 'object') {
                loadedMeta = parsed;
                setMetaOverrides(parsed);
              }
            } catch (_) {}
          } else if (item.key === 'hero_slide_meta' && item.value) {
            try {
              const parsed =
                typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
              if (parsed && typeof parsed === 'object') {
                loadedHeroMeta = parsed;
                setHeroMetaOverrides(parsed);
              }
            } catch (_) {}
          }
        }
      }

      // 2. Parse & merge products safely (never wipe unseeded local products when only 1-few rows exist in DB)
      const allDbProducts = (productsRes.data || []) as SupabaseProductRow[];
      const dbProdMap = new Map<string, SupabaseProductRow>(allDbProducts.map((r) => [r.id, r]));
      const activeDbProducts = allDbProducts.filter((r) => r.is_active !== false);
      setSupabaseProductCount(activeDbProducts.length);

      const localProdIdSet = new Set(PRODUCTS.map((p) => p.id));
      const customDbProducts = activeDbProducts
        .filter((r) => !localProdIdSet.has(r.id))
        .map((r) => dbRowToProduct(r, loadedMeta));

      const mergedLocalProducts: Product[] = [];
      for (const localProd of PRODUCTS) {
        const dbRow = dbProdMap.get(localProd.id);
        if (dbRow) {
          if (dbRow.is_active !== false) {
            mergedLocalProducts.push(dbRowToProduct(dbRow, loadedMeta));
          }
        } else {
          mergedLocalProducts.push(localProd);
        }
      }
      setProducts([...customDbProducts, ...mergedLocalProducts]);

      // 3. Parse & merge hero slides safely
      const allDbSlides = (slidesRes.data || []) as SupabaseHeroSlideRow[];
      const dbSlideMap = new Map<string, SupabaseHeroSlideRow>(allDbSlides.map((s) => [s.id, s]));
      const activeDbSlides = allDbSlides.filter((s) => s.is_active !== false);
      setSupabaseSlideCount(activeDbSlides.length);

      const localSlideIdSet = new Set(HERO_SLIDES.map((s) => s.id));
      const mergedLocalSlides: HeroSlide[] = [];
      for (const localSlide of HERO_SLIDES) {
        const dbRow = dbSlideMap.get(localSlide.id);
        if (dbRow) {
          if (dbRow.is_active !== false) {
            mergedLocalSlides.push(dbRowToHeroSlide(dbRow, loadedHeroMeta));
          }
        } else {
          const override = loadedHeroMeta[localSlide.id];
          mergedLocalSlides.push(
            override
              ? {
                  ...localSlide,
                  priceDisplay: override.priceDisplay ?? localSlide.priceDisplay,
                  discountBadge: override.discountBadge ?? localSlide.discountBadge,
                  featuredTag: override.featuredTag ?? localSlide.featuredTag,
                  productId: override.productId ?? localSlide.productId,
                  promoCode: override.promoCode ?? localSlide.promoCode,
                }
              : localSlide
          );
        }
      }
      const customDbSlides = activeDbSlides
        .filter((s) => !localSlideIdSet.has(s.id))
        .map((s) => dbRowToHeroSlide(s, loadedHeroMeta));
      setHeroSlides([...mergedLocalSlides, ...customDbSlides]);

      setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      setDbSyncStatus(activeDbProducts.length > 0 ? 'synced' : 'empty-fallback');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal terhubung ke server database';
      console.error('Database fetch error:', err);
      setDbError(msg);
      setDbSyncStatus('error');
    }
  }, []);

  useEffect(() => {
    refreshFromSupabase();
  }, [refreshFromSupabase]);

  // Helper to persist product_meta overrides in store_config
  const persistMetaOverrides = async (nextMeta: Record<string, ProductMetaOverride>) => {
    const { error } = await supabase.from('store_config').upsert(
      {
        key: 'product_meta',
        value: JSON.stringify(nextMeta),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
    if (error) {
      console.warn('Could not persist product_meta to store_config:', error.message);
    }
  };

  // Helper to persist hero_slide_meta overrides in store_config
  const persistHeroMetaOverrides = async (nextHeroMeta: Record<string, HeroSlideMetaOverride>) => {
    const { error } = await supabase.from('store_config').upsert(
      {
        key: 'hero_slide_meta',
        value: JSON.stringify(nextHeroMeta),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
    if (error) {
      console.warn('Could not persist hero_slide_meta to store_config:', error.message);
    }
  };

  // Seed / Sync entire local or current catalog into Supabase
  const seedCatalogToSupabase = async (): Promise<DbMutationResult> => {
    setDbSyncStatus('syncing');
    setDbError(null);
    try {
      const sourceProducts = products.length > 0 ? products : PRODUCTS;
      const sourceSlides = heroSlides.length > 0 ? heroSlides : HERO_SLIDES;

      const productRows = sourceProducts.map(productToDbRow);
      const slideRows = sourceSlides.map((s, idx) => heroSlideToDbRow(s, idx));

      const nextHeroMeta: Record<string, HeroSlideMetaOverride> = { ...heroMetaOverrides };
      for (const s of sourceSlides) {
        nextHeroMeta[s.id] = {
          priceDisplay: s.priceDisplay,
          discountBadge: s.discountBadge,
          featuredTag: s.featuredTag,
          productId: s.productId,
          promoCode: s.promoCode,
        };
      }
      setHeroMetaOverrides(nextHeroMeta);

      const { error: prodErr } = await supabase
        .from('products')
        .upsert(productRows, { onConflict: 'id' });
      if (prodErr) throw prodErr;

      const { error: slideErr } = await supabase
        .from('hero_slides')
        .upsert(slideRows, { onConflict: 'id' });
      if (slideErr) throw slideErr;

      const { error: cfgErr } = await supabase.from('store_config').upsert(
        [
          {
            key: 'ticker_text',
            value: tickerText,
            updated_at: new Date().toISOString(),
          },
          {
            key: 'upsell_bundle',
            value: JSON.stringify(upsellBundle),
            updated_at: new Date().toISOString(),
          },
          {
            key: 'hero_slide_meta',
            value: JSON.stringify(nextHeroMeta),
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'key' }
      );
      if (cfgErr) throw cfgErr;

      setSupabaseProductCount(productRows.length);
      setSupabaseSlideCount(slideRows.length);
      setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      setDbSyncStatus('synced');
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyinkronkan data toko';
      setDbError(msg);
      setDbSyncStatus('error');
      return { ok: false, error: msg };
    }
  };

  // Single product price update
  const updateProductPrice = async (
    id: string,
    price: number,
    originalPrice: number
  ): Promise<DbMutationResult> => {
    const orig = Math.max(price, originalPrice);
    const disc = orig > price ? Math.round(((orig - price) / orig) * 100) : 0;

    const existing = products.find((p) => p.id === id);
    const targetProd = existing ? { ...existing, price, originalPrice: orig, discountPercent: disc } : undefined;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, price, originalPrice: orig, discountPercent: disc } : p
      )
    );

    try {
      if (targetProd) {
        const { error } = await supabase
          .from('products')
          .upsert(productToDbRow(targetProd), { onConflict: 'id' });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .update({
            price,
            original_price: orig,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
        if (error) throw error;
      }
      setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan perubahan harga';
      setDbError(msg);
      return { ok: false, error: msg };
    }
  };

  // Quick product stock update
  const updateProductStock = async (
    id: string,
    stockRemaining: number
  ): Promise<DbMutationResult> => {
    const cleanStock = Math.max(0, stockRemaining);
    const existing = products.find((p) => p.id === id);
    const targetProd = existing
      ? { ...existing, stockRemaining: cleanStock, inStock: cleanStock > 0 }
      : undefined;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stockRemaining: cleanStock, inStock: cleanStock > 0 } : p
      )
    );

    try {
      if (targetProd) {
        const { error } = await supabase
          .from('products')
          .upsert(productToDbRow(targetProd), { onConflict: 'id' });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .update({
            stock: cleanStock,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
        if (error) throw error;
      }
      setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan perubahan stok';
      setDbError(msg);
      return { ok: false, error: msg };
    }
  };

  // Bulk / Mass discount engine
  const applyBulkDiscount = async (
    category: string,
    discountValue: number,
    mode: 'percent' | 'fixed' = 'percent'
  ): Promise<{ affectedCount: number; ok: boolean; error?: string }> => {
    let affected = 0;
    const updatedProducts: Product[] = [];

    const nextList = products.map((p) => {
      const matchesCategory =
        category === 'all' ||
        p.category === category ||
        p.categories?.includes(category);

      if (!matchesCategory) return p;

      affected++;
      let newPrice = p.price;
      let newOrig = p.originalPrice || p.price;

      if (mode === 'percent') {
        const percent = Math.min(90, Math.max(0, discountValue));
        newOrig = Math.max(p.originalPrice, p.price);
        newPrice = Math.round(newOrig * (1 - percent / 100));
        newPrice = Math.round(newPrice / 500) * 500;
      } else {
        newPrice = Math.max(10000, discountValue);
        newOrig = Math.max(newOrig, Math.round((newPrice * 1.25) / 1000) * 1000);
      }

      const disc = newOrig > newPrice ? Math.round(((newOrig - newPrice) / newOrig) * 100) : 0;
      const updated: Product = {
        ...p,
        price: newPrice,
        originalPrice: newOrig,
        discountPercent: disc,
      };
      updatedProducts.push(updated);
      return updated;
    });

    setProducts(nextList);

    if (updatedProducts.length === 0) {
      return { affectedCount: 0, ok: true };
    }

    try {
      const rows = updatedProducts.map(productToDbRow);
      const { error } = await supabase.from('products').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      setSupabaseProductCount((prev) => Math.max(prev, rows.length));
      setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      setDbSyncStatus('synced');
      return { affectedCount: affected, ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui harga massal';
      setDbError(msg);
      return { affectedCount: affected, ok: false, error: msg };
    }
  };

  // Add new article
  const addProduct = async (newProduct: Product): Promise<DbMutationResult> => {
    const orig = Math.max(newProduct.price, newProduct.originalPrice || newProduct.price);
    const disc =
      orig > newProduct.price ? Math.round(((orig - newProduct.price) / orig) * 100) : 0;
    const finalProd: Product = {
      ...newProduct,
      originalPrice: orig,
      discountPercent: disc,
      rating: newProduct.rating || 5.0,
      reviewCount: newProduct.reviewCount || 120,
      inStock: newProduct.stockRemaining > 0,
      gallery:
        newProduct.gallery && newProduct.gallery.length > 0
          ? newProduct.gallery
          : [newProduct.image],
    };

    setProducts((prev) => [finalProd, ...prev]);

    const nextMeta: Record<string, ProductMetaOverride> = {
      ...metaOverrides,
      [finalProd.id]: {
        code: finalProd.code,
        specs: finalProd.specs,
        rating: finalProd.rating,
        reviewCount: finalProd.reviewCount,
        isBestSeller: finalProd.isBestSeller,
      },
    };
    setMetaOverrides(nextMeta);

    try {
      const { error } = await supabase
        .from('products')
        .upsert(productToDbRow(finalProd), { onConflict: 'id' });
      if (error) throw error;
      await persistMetaOverrides(nextMeta);
      setSupabaseProductCount((prev) => prev + 1);
      setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      setDbSyncStatus('synced');
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menambahkan produk baru';
      setDbError(msg);
      return { ok: false, error: msg };
    }
  };

  // Edit article
  const updateProduct = async (
    id: string,
    updates: Partial<Product>
  ): Promise<DbMutationResult> => {
    let mergedProduct: Product | undefined;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const merged = { ...p, ...updates };
          if (updates.price !== undefined || updates.originalPrice !== undefined) {
            const orig = Math.max(merged.price, merged.originalPrice);
            merged.originalPrice = orig;
            merged.discountPercent =
              orig > merged.price ? Math.round(((orig - merged.price) / orig) * 100) : 0;
          }
          if (updates.stockRemaining !== undefined) {
            merged.inStock = updates.stockRemaining > 0;
          }
          mergedProduct = merged;
          return merged;
        }
        return p;
      })
    );

    if (!mergedProduct) {
      return { ok: false, error: 'Produk tidak ditemukan' };
    }

    const nextMeta: Record<string, ProductMetaOverride> = {
      ...metaOverrides,
      [id]: {
        code: mergedProduct.code,
        specs: mergedProduct.specs,
        rating: mergedProduct.rating,
        reviewCount: mergedProduct.reviewCount,
        isBestSeller: mergedProduct.isBestSeller,
      },
    };
    setMetaOverrides(nextMeta);

    try {
      const { error } = await supabase
        .from('products')
        .upsert(productToDbRow(mergedProduct), { onConflict: 'id' });
      if (error) throw error;
      await persistMetaOverrides(nextMeta);
      setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      setDbSyncStatus('synced');
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan perubahan produk';
      setDbError(msg);
      return { ok: false, error: msg };
    }
  };

  // Delete article (soft-delete built-in products so local fallback won't resurrect them)
  const deleteProduct = async (id: string): Promise<DbMutationResult> => {
    const existing = products.find((p) => p.id === id);
    const isBuiltIn = PRODUCTS.some((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      if (isBuiltIn && existing) {
        const { error } = await supabase
          .from('products')
          .upsert({ ...productToDbRow(existing), is_active: false }, { onConflict: 'id' });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
      }
      setSupabaseProductCount((prev) => Math.max(0, prev - 1));
      setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus produk';
      setDbError(msg);
      return { ok: false, error: msg };
    }
  };

  // Hero slide actions
  const updateHeroSlide = async (
    id: string,
    updates: Partial<HeroSlide>
  ): Promise<DbMutationResult> => {
    const targetIndex = heroSlides.findIndex((s) => s.id === id);
    if (targetIndex === -1) return { ok: false, error: 'Slide tidak ditemukan' };

    const targetSlide: HeroSlide = { ...heroSlides[targetIndex], ...updates };

    setHeroSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));

    const nextHeroMeta: Record<string, HeroSlideMetaOverride> = {
      ...heroMetaOverrides,
      [id]: {
        priceDisplay: targetSlide.priceDisplay,
        discountBadge: targetSlide.discountBadge,
        featuredTag: targetSlide.featuredTag,
        productId: targetSlide.productId,
        promoCode: targetSlide.promoCode,
      },
    };
    setHeroMetaOverrides(nextHeroMeta);

    try {
      const { error } = await supabase
        .from('hero_slides')
        .upsert(heroSlideToDbRow(targetSlide, targetIndex), { onConflict: 'id' });
      if (error) throw error;
      await persistHeroMetaOverrides(nextHeroMeta);
      setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan perubahan banner';
      setDbError(msg);
      return { ok: false, error: msg };
    }
  };

  const addHeroSlide = async (slide: HeroSlide): Promise<DbMutationResult> => {
    const nextIndex = heroSlides.length;
    setHeroSlides((prev) => [...prev, slide]);

    const nextHeroMeta: Record<string, HeroSlideMetaOverride> = {
      ...heroMetaOverrides,
      [slide.id]: {
        priceDisplay: slide.priceDisplay,
        discountBadge: slide.discountBadge,
        featuredTag: slide.featuredTag,
        productId: slide.productId,
        promoCode: slide.promoCode,
      },
    };
    setHeroMetaOverrides(nextHeroMeta);

    try {
      const { error } = await supabase
        .from('hero_slides')
        .upsert(heroSlideToDbRow(slide, nextIndex), { onConflict: 'id' });
      if (error) throw error;
      await persistHeroMetaOverrides(nextHeroMeta);
      setSupabaseSlideCount((prev) => prev + 1);
      setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menambahkan banner baru';
      setDbError(msg);
      return { ok: false, error: msg };
    }
  };

  const deleteHeroSlide = async (id: string): Promise<DbMutationResult> => {
    if (heroSlides.length <= 1) {
      return { ok: false, error: 'Minimal 1 slide banner harus tetap aktif' };
    }
    const existing = heroSlides.find((s) => s.id === id);
    const isBuiltIn = HERO_SLIDES.some((s) => s.id === id);
    setHeroSlides((prev) => prev.filter((s) => s.id !== id));

    try {
      if (isBuiltIn && existing) {
        const { error } = await supabase
          .from('hero_slides')
          .upsert({ ...heroSlideToDbRow(existing, 0), is_active: false }, { onConflict: 'id' });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('hero_slides').delete().eq('id', id);
        if (error) throw error;
      }
      setSupabaseSlideCount((prev) => Math.max(0, prev - 1));
      setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus banner';
      setDbError(msg);
      return { ok: false, error: msg };
    }
  };

  const updateTickerText = async (text: string): Promise<DbMutationResult> => {
    setTickerText(text);
    try {
      const { error } = await supabase.from('store_config').upsert(
        {
          key: 'ticker_text',
          value: text,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );
      if (error) throw error;
      setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui teks pengumuman';
      setDbError(msg);
      return { ok: false, error: msg };
    }
  };

  const updateUpsellBundle = async (
    updates: Partial<UpsellData>
  ): Promise<DbMutationResult> => {
    const nextBundle = { ...upsellBundle, ...updates };
    setUpsellBundle(nextBundle);

    try {
      const { error } = await supabase.from('store_config').upsert(
        {
          key: 'upsell_bundle',
          value: JSON.stringify(nextBundle),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );
      if (error) throw error;
      setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui paket bundling';
      setDbError(msg);
      return { ok: false, error: msg };
    }
  };

  const resetToDefaults = async (): Promise<DbMutationResult> => {
    setProducts(PRODUCTS);
    setHeroSlides(HERO_SLIDES);
    setTickerText(DEFAULT_TICKER);
    setUpsellBundle(UPSELL_BUNDLE);
    setMetaOverrides({});
    setHeroMetaOverrides({});

    try {
      const productRows = PRODUCTS.map(productToDbRow);
      const slideRows = HERO_SLIDES.map((s, idx) => heroSlideToDbRow(s, idx));

      await supabase.from('products').upsert(productRows, { onConflict: 'id' });
      await supabase.from('hero_slides').upsert(slideRows, { onConflict: 'id' });
      await supabase.from('store_config').upsert(
        [
          { key: 'ticker_text', value: DEFAULT_TICKER, updated_at: new Date().toISOString() },
          { key: 'upsell_bundle', value: JSON.stringify(UPSELL_BUNDLE), updated_at: new Date().toISOString() },
          { key: 'product_meta', value: '{}', updated_at: new Date().toISOString() },
          { key: 'hero_slide_meta', value: '{}', updated_at: new Date().toISOString() },
        ],
        { onConflict: 'key' }
      );
      setSupabaseProductCount(productRows.length);
      setSupabaseSlideCount(slideRows.length);
      setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      setDbSyncStatus('synced');
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mereset data toko';
      setDbError(msg);
      return { ok: false, error: msg };
    }
  };

  const exportStoreJson = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      products,
      heroSlides,
      tickerText,
      upsellBundle,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importStoreJson = async (jsonStr: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        await supabase
          .from('products')
          .upsert(data.products.map(productToDbRow), { onConflict: 'id' });
      }
      if (data.heroSlides && Array.isArray(data.heroSlides)) {
        setHeroSlides(data.heroSlides);
        await supabase
          .from('hero_slides')
          .upsert(
            data.heroSlides.map((s: HeroSlide, i: number) => heroSlideToDbRow(s, i)),
            { onConflict: 'id' }
          );
      }
      if (typeof data.tickerText === 'string') {
        setTickerText(data.tickerText);
        await supabase
          .from('store_config')
          .upsert(
            { key: 'ticker_text', value: data.tickerText, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
          );
      }
      if (data.upsellBundle && typeof data.upsellBundle === 'object') {
        setUpsellBundle(data.upsellBundle);
      }
      await refreshFromSupabase();
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        heroSlides,
        tickerText,
        upsellBundle,
        dbSyncStatus,
        dbError,
        supabaseProductCount,
        supabaseSlideCount,
        lastSyncedAt,
        refreshFromSupabase,
        seedCatalogToSupabase,
        updateProductPrice,
        updateProductStock,
        applyBulkDiscount,
        addProduct,
        updateProduct,
        deleteProduct,
        updateHeroSlide,
        addHeroSlide,
        deleteHeroSlide,
        updateTickerText,
        updateUpsellBundle,
        resetToDefaults,
        exportStoreJson,
        importStoreJson,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
