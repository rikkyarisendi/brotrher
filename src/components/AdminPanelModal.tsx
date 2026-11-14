import React, { useState, useMemo, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  X,
  Sliders,
  Tag,
  PlusCircle,
  Image as ImageIcon,
  Database,
  Check,
  Trash2,
  Save,
  Search,
  Sparkles,
  Layers,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  Edit3,
  ArrowLeft,
  CheckSquare,
  Square,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  ShieldCheck,
  Mail,
  ShieldAlert,
  CloudUpload,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../lib/supabase';
import { Product, HeroSlide } from '../types/tactical';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEditProduct?: Product | null;
  onClearInitialEditProduct?: () => void;
}

// Exact category names identical to main page catalog
const MAIN_CATEGORIES = [
  { id: 'all', label: 'SEMUA' },
  { id: 'pdl', label: 'PDL' },
  { id: 'pdh', label: 'PDH' },
  { id: 'tali-putar', label: 'TALI PUTAR' },
  { id: 'tali-biasa', label: 'TALI BIASA' },
  { id: 'full-kulit', label: 'FULL KULIT' },
  { id: 'kombinasi-cordura', label: 'KOMBINASI CORDURA' },
];

const ARTICLE_CATEGORY_OPTIONS = [
  { id: 'pdl', label: 'PDL' },
  { id: 'pdh', label: 'PDH' },
  { id: 'tali-putar', label: 'TALI PUTAR' },
  { id: 'tali-biasa', label: 'TALI BIASA' },
  { id: 'full-kulit', label: 'FULL KULIT' },
  { id: 'kombinasi-cordura', label: 'KOMBINASI CORDURA' },
];

const AVAILABLE_SIZES = [38, 39, 40, 41, 42, 43, 44, 45, 46];

interface NumericFieldInputProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  minLiveCommit?: number;
  onCommit: (val: number) => void;
  className?: string;
}

const NumericFieldInput: React.FC<NumericFieldInputProps> = ({
  value,
  min = 0,
  max,
  step = 1,
  minLiveCommit = 0,
  onCommit,
  className = '',
}) => {
  const [text, setText] = useState<string>(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setText(String(value));
    }
  }, [value, focused]);

  const clamp = (n: number) => {
    let v = isNaN(n) ? value : n;
    if (min !== undefined) v = Math.max(min, v);
    if (max !== undefined) v = Math.min(max, v);
    return v;
  };

  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={text}
      onFocus={() => setFocused(true)}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        if (raw.trim() !== '') {
          const parsed = Number(raw);
          if (!isNaN(parsed) && parsed >= minLiveCommit) {
            onCommit(clamp(parsed));
          }
        }
      }}
      onBlur={() => {
        setFocused(false);
        if (text.trim() === '') {
          setText(String(value));
          return;
        }
        const finalVal = clamp(Number(text));
        setText(String(finalVal));
        if (finalVal !== value) {
          onCommit(finalVal);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
      }}
      className={className}
    />
  );
};

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  initialEditProduct,
  onClearInitialEditProduct,
}) => {
  const {
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
  } = useStore();

  // Supabase Auth Session State
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(false);

  // Login Form States
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginInfo, setLoginInfo] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Password Change States (Supabase Auth updateUser)
  const [newAuthPass, setNewAuthPass] = useState('');
  const [confirmAuthPass, setConfirmAuthPass] = useState('');
  const [credMsg, setCredMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Toast / Sync Status feedback
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSeedingDb, setIsSeedingDb] = useState(false);

  const [activeTab, setActiveTab] = useState<'pricing' | 'edit-product' | 'new-product' | 'banners' | 'backup'>('pricing');

  // Pricing Tab States
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [bulkCategory, setBulkCategory] = useState('all');
  const [bulkPercent, setBulkPercent] = useState<number>(20);
  const [bulkMode, setBulkMode] = useState<'percent' | 'fixed'>('percent');
  const [bulkFixedPrice, setBulkFixedPrice] = useState<number>(188000);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editGalleryInputs, setEditGalleryInputs] = useState<string[]>([]);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);

  // New Product Form State
  const initialNewProduct: Product = {
    id: '',
    code: '',
    name: '',
    category: 'pdl',
    categories: ['pdl', 'tali-putar', 'full-kulit'],
    categoryLabel: 'PDL',
    tagline: '',
    price: 685000,
    originalPrice: 855000,
    discountPercent: 20,
    rating: 5.0,
    reviewCount: 340,
    isBestSeller: true,
    inStock: true,
    stockRemaining: 15,
    badge: 'NEW ARRIVAL',
    image: '/assets/products/Bronson.webp',
    gallery: ['/assets/products/Bronson.webp'],
    specs: {
      material: '100% Kulit Sapi Asli Grade A Tebal 1.8mm',
      outsole: 'Sol Karet Radial Komando Anti-Slip Jahit Keliling',
      zipper: 'Fitgo Rotary Dial Fast System',
      lacing: 'Tali Putar (Kawat Baja Fitgo)',
      safety: 'Bantalan Busa Leher Kaki Empuk & Bumper Pelindung Jari',
      craftsmanship: 'Sol Karet Konstruksi Jahit Melingkar 360° Tembus Dalam',
    },
    sizes: [39, 40, 41, 42, 43, 44, 45],
  };

  const [newProd, setNewProd] = useState<Product>(initialNewProduct);
  const [galleryInputs, setGalleryInputs] = useState<string[]>(['/assets/products/Bronson.webp']);
  const [productCreatedMsg, setProductCreatedMsg] = useState(false);

  // Banner editing state
  const [bannerSuccessMsg, setBannerSuccessMsg] = useState<string | null>(null);
  const [tickerDraft, setTickerDraft] = useState<string>(tickerText);
  const [slideDrafts, setSlideDrafts] = useState<Record<string, HeroSlide>>({});
  const [savingSlideId, setSavingSlideId] = useState<string | null>(null);
  const [upsellDraft, setUpsellDraft] = useState(upsellBundle);
  const [isSavingUpsell, setIsSavingUpsell] = useState(false);

  useEffect(() => {
    setTickerDraft(tickerText);
  }, [tickerText]);

  useEffect(() => {
    setUpsellDraft(upsellBundle);
  }, [upsellBundle]);

  useEffect(() => {
    const map: Record<string, HeroSlide> = {};
    for (const s of heroSlides) {
      map[s.id] = { ...s };
    }
    setSlideDrafts(map);
  }, [heroSlides]);

  // Open directly into requested product edit form when triggered from ProductCard (Admin only)
  useEffect(() => {
    if (isOpen && session && initialEditProduct) {
      const latest = products.find((p) => p.id === initialEditProduct.id) || initialEditProduct;
      setEditingProduct({ ...latest });
      const gal = latest.gallery && latest.gallery.length > 0 ? [...latest.gallery] : [latest.image];
      setEditGalleryInputs(gal);
      setEditSuccessMsg(null);
      setActiveTab('edit-product');
      onClearInitialEditProduct?.();
    }
  }, [isOpen, session, initialEditProduct, products, onClearInitialEditProduct]);

  // Subscribe to Supabase Auth session
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setAuthLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setAuthLoading(false);
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
        setActiveTab('backup');
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Filtered products for Pricing tab
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        categoryFilter === 'all' ||
        p.category === categoryFilter ||
        p.categories?.includes(categoryFilter);
      const matchSearch =
        searchFilter.trim() === '' ||
        p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.code.toLowerCase().includes(searchFilter.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, categoryFilter, searchFilter]);

  if (!isOpen) return null;

  const notifyFeedback = (type: 'success' | 'error', text: string) => {
    setActionFeedback({ type, text });
    setTimeout(() => {
      setActionFeedback((curr) => (curr?.text === text ? null : curr));
    }, 4500);
  };

  // Supabase Auth Sign-In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginInfo(null);
    setIsSigningIn(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: inputEmail.trim(),
        password: inputPassword,
      });

      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setLoginError('Email atau password tidak valid.');
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          setLoginError('Email akun belum diverifikasi.');
        } else {
          setLoginError(error.message);
        }
        return;
      }

      if (data.session) {
        setSession(data.session);
        setInputPassword('');
        await refreshFromSupabase();
      }
    } catch (err) {
      setLoginError('Gagal terhubung ke server autentikasi.');
      console.error(err);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Supabase Password Reset Email
  const handleResetPasswordEmail = async () => {
    setLoginError(null);
    setLoginInfo(null);
    const email = inputEmail.trim();
    if (!email) {
      setLoginError('Masukkan alamat email admin Anda terlebih dahulu untuk mengirim link reset.');
      return;
    }

    setIsSigningIn(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/bromindash`,
      });
      if (error) {
        setLoginError(error.message);
      } else {
        setLoginInfo(`Tautan reset password telah dikirim ke ${email}. Periksa kotak masuk/spam Anda.`);
      }
    } catch (err) {
      setLoginError('Gagal mengirim email reset password.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Supabase Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setInputPassword('');
    onClose();
  };

  // Update Password via Supabase Auth
  const handleUpdateSupabasePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredMsg(null);

    if (newAuthPass.length < 8) {
      setCredMsg({ type: 'error', text: 'Password baru minimal 8 karakter!' });
      return;
    }
    if (!/[A-Za-z]/.test(newAuthPass) || !/[0-9]/.test(newAuthPass)) {
      setCredMsg({ type: 'error', text: 'Password baru wajib kombinasi huruf dan angka!' });
      return;
    }
    if (newAuthPass !== confirmAuthPass) {
      setCredMsg({ type: 'error', text: 'Konfirmasi password baru tidak cocok!' });
      return;
    }

    setIsUpdatingPass(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newAuthPass });
      if (error) {
        setCredMsg({ type: 'error', text: error.message });
      } else {
        setCredMsg({ type: 'success', text: 'Password akun admin berhasil diperbarui!' });
        setNewAuthPass('');
        setConfirmAuthPass('');
        setIsPasswordRecovery(false);
      }
    } catch (err) {
      setCredMsg({ type: 'error', text: 'Terjadi kesalahan saat memperbarui password.' });
    } finally {
      setIsUpdatingPass(false);
    }
  };

  // Seed / Sync all products & banners into cloud database
  const handleSeedToSupabase = async () => {
    setIsSeedingDb(true);
    const res = await seedCatalogToSupabase();
    setIsSeedingDb(false);
    if (res.ok) {
      notifyFeedback('success', `Berhasil menyinkronkan ${products.length} produk & ${heroSlides.length} banner ke server toko!`);
    } else {
      notifyFeedback('error', `Gagal sinkronisasi data: ${res.error}`);
    }
  };

  // Handle starting edit on a product
  const handleStartEditProduct = (prod: Product) => {
    setEditingProduct({ ...prod });
    const gal = prod.gallery && prod.gallery.length > 0 ? [...prod.gallery] : [prod.image];
    setEditGalleryInputs(gal);
    setEditSuccessMsg(null);
    setActiveTab('edit-product');
  };

  // Handle saving product edits
  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const validGallery = editGalleryInputs.filter((url) => url.trim().length > 0);
    const mainImg = validGallery[0] || editingProduct.image;
    const orig = Math.max(editingProduct.price, editingProduct.originalPrice || editingProduct.price);
    const disc = orig > editingProduct.price ? Math.round(((orig - editingProduct.price) / orig) * 100) : 0;

    const updatedData: Partial<Product> = {
      name: editingProduct.name,
      code: editingProduct.code,
      category: editingProduct.categories?.find((c) => c === 'pdl' || c === 'pdh') || editingProduct.category || 'pdl',
      categories: editingProduct.categories || ['pdl'],
      categoryLabel: (editingProduct.categories?.find((c) => c === 'pdl' || c === 'pdh') || 'PDL').toUpperCase(),
      tagline: editingProduct.tagline,
      price: editingProduct.price,
      originalPrice: orig,
      discountPercent: disc,
      stockRemaining: editingProduct.stockRemaining,
      inStock: editingProduct.stockRemaining > 0,
      badge: editingProduct.badge,
      image: mainImg,
      gallery: validGallery.length > 0 ? validGallery : [mainImg],
      specs: { ...editingProduct.specs },
      sizes: editingProduct.sizes && editingProduct.sizes.length > 0 ? editingProduct.sizes : [39, 40, 41, 42, 43, 44],
    };

    const res = await updateProduct(editingProduct.id, updatedData);
    if (res.ok) {
      setEditSuccessMsg(`Perubahan pada "${editingProduct.name}" tersimpan & langsung live di website!`);
      notifyFeedback('success', `Artikel "${editingProduct.name}" berhasil disimpan.`);
    } else {
      notifyFeedback('error', `Gagal menyimpan perubahan: ${res.error}`);
    }
    setTimeout(() => {
      setEditSuccessMsg(null);
    }, 4000);
  };

  const handleApplyBulk = async () => {
    const val = bulkMode === 'percent' ? bulkPercent : bulkFixedPrice;
    const res = await applyBulkDiscount(bulkCategory, val, bulkMode);
    if (res.ok) {
      setBulkSuccessMsg(`Berhasil memperbarui harga ${res.affectedCount} produk!`);
      notifyFeedback('success', `Diskon massal ${res.affectedCount} produk berhasil disimpan.`);
    } else {
      notifyFeedback('error', `Update massal gagal disimpan: ${res.error}`);
    }
    setTimeout(() => setBulkSuccessMsg(null), 3500);
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalId =
      newProd.id.trim() ||
      'brotrher-' + newProd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const finalCode =
      newProd.code.trim() ||
      'BR-' + newProd.name.slice(0, 3).toUpperCase();

    const created: Product = {
      ...newProd,
      id: finalId,
      code: finalCode,
      gallery: galleryInputs.filter((g) => g.trim().length > 0),
      image: galleryInputs[0] || newProd.image,
    };

    const res = await addProduct(created);
    if (res.ok) {
      setProductCreatedMsg(true);
      notifyFeedback('success', `Artikel baru "${created.name}" berhasil diterbitkan!`);
      setTimeout(() => {
        setProductCreatedMsg(false);
        setActiveTab('pricing');
      }, 1500);
    } else {
      notifyFeedback('error', `Gagal menambah produk: ${res.error}`);
    }
  };

  const handleExport = () => {
    const jsonStr = exportStoreJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brotrher_store_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = await importStoreJson(content);
        if (ok) {
          notifyFeedback('success', 'Data cadangan berhasil dipulihkan ke server toko!');
        } else {
          notifyFeedback('error', 'Format file JSON tidak valid atau gagal sinkron.');
        }
      }
    };
    reader.readAsText(file);
  };

  const toggleCategoryInArray = (currentCategories: string[] | undefined, catId: string): string[] => {
    const list = currentCategories ? [...currentCategories] : [];
    const index = list.indexOf(catId);
    if (index > -1) {
      if (list.length === 1) return list;
      list.splice(index, 1);
    } else {
      list.push(catId);
    }
    return list;
  };

  const toggleSizeInArray = (currentSizes: number[] | undefined, size: number): number[] => {
    const list = currentSizes ? [...currentSizes] : [];
    const index = list.indexOf(size);
    if (index > -1) {
      if (list.length === 1) return list;
      list.splice(index, 1);
    } else {
      list.push(size);
      list.sort((a, b) => a - b);
    }
    return list;
  };

  // =========================================================================
  // RENDER SCREEN 1: SUPABASE AUTHENTICATION GATEWAY (NO HARDCODED CREDENTIALS)
  // =========================================================================
  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
        <div className="military-glass-elevated border border-[#F8B704]/40 rounded-2xl p-8 flex flex-col items-center gap-3">
          <RefreshCw className="w-7 h-7 text-[#F8B704] animate-spin" />
          <span className="text-xs font-mono text-[#94A3B8]">Memverifikasi sesi admin...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
        <div className="w-full max-w-md military-glass-elevated border-2 border-[#F8B704]/40 rounded-2xl p-6 sm:p-8 flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative overflow-hidden">
          
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#F8B704]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-center transition-all cursor-pointer"
            title="Keluar / Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E232E] to-[#11141A] border-2 border-[#F8B704] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(248,183,4,0.35)] mb-4">
              <Lock className="w-8 h-8 text-[#F8B704]" />
            </div>

            <span className="text-[10px] font-mono font-bold tracking-widest text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30 px-2.5 py-0.5 rounded uppercase">
              PORTAL ADMIN • AKSES TERBATAS
            </span>

            <h2 className="font-display text-xl sm:text-2xl font-black tracking-wide text-[#F8FAFC] uppercase mt-2.5">
              BROTRHER COMMAND CENTER
            </h2>

            <p className="text-xs font-mono text-[#94A3B8] mt-1.5 leading-relaxed">
              Masuk menggunakan email dan password admin resmi untuk mengelola produk, harga, dan banner toko.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] text-xs font-mono flex items-center gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {loginInfo && (
            <div className="mb-4 p-3 rounded-lg bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] text-xs font-mono flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{loginInfo}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] mb-1 font-semibold">
                EMAIL ADMIN
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  autoFocus
                  disabled={isSigningIn}
                  placeholder="nama@email.com"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-black/70 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-mono text-[#94A3B8] font-semibold">
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={handleResetPasswordEmail}
                  disabled={isSigningIn}
                  className="text-[10px] font-mono text-[#F8B704] hover:underline cursor-pointer"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isSigningIn}
                  placeholder="Masukkan password admin..."
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  className="w-full h-10 pl-9 pr-10 rounded-lg bg-black/70 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full h-11 bg-[#F8B704] hover:bg-[#FFC82D] disabled:bg-neutral-800 disabled:text-neutral-500 text-[#0B0D11] font-display font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(248,183,4,0.3)] mt-2"
            >
              {isSigningIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>MEMVERIFIKASI...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>MASUK COMMAND CENTER</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] hover:underline cursor-pointer"
            >
              &larr; Batalkan dan Kembali ke Toko
            </button>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER SCREEN 2: AUTHENTICATED ADMIN COMMAND CENTER
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      
      <div className="w-full max-w-6xl h-[95dvh] sm:h-[92vh] max-h-[900px] military-glass-elevated border border-[#F8B704]/40 rounded-xl flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
        
        {/* Top Header Bar */}
        <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-white/10 bg-[#0B0D11] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-[#F8B704]/10 border border-[#F8B704]/40 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4 sm:w-5 sm:h-5 text-[#F8B704]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm sm:text-lg font-black tracking-wider text-[#F8FAFC] uppercase truncate">
                  BROTRHER COMMAND CENTER
                </h2>
                <span className="text-[10px] font-mono bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 px-2 py-0.5 rounded font-bold hidden sm:inline shrink-0">
                  SERVER AKTIF
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-mono text-[#94A3B8] truncate">
                {supabaseProductCount > 0 ? `${supabaseProductCount} produk & ${supabaseSlideCount} banner tersimpan` : 'Menggunakan katalog bawaan'}
                {lastSyncedAt ? ` • Sinkron ${lastSyncedAt}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-[#94A3B8]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
              <span className="text-[#F8FAFC] font-bold truncate max-w-[180px]">{session.user.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#EF4444]/10 hover:bg-[#EF4444] text-[#EF4444] hover:text-[#0B0D11] border border-[#EF4444]/30 text-xs font-mono font-bold transition-all cursor-pointer"
              title="Keluar dari Akun Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LOGOUT</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-center transition-all cursor-pointer"
              title="Tutup Panel"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-3 sm:px-5 border-b border-white/10 bg-[#11141A] flex items-center gap-1.5 sm:gap-2 overflow-x-auto touch-pan-x shrink-0 py-2">
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'pricing'
                ? 'bg-[#F8B704] text-[#0B0D11] shadow-md font-black'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>HARGA & STOK ({products.length})</span>
          </button>

          <button
            onClick={() => {
              if (!editingProduct && products.length > 0) {
                handleStartEditProduct(products[0]);
              } else {
                setActiveTab('edit-product');
              }
            }}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'edit-product'
                ? 'bg-[#F8B704] text-[#0B0D11] shadow-md font-black'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>
              EDIT PRODUK {editingProduct ? `(${editingProduct.name.split(' ').slice(0, 2).join(' ')})` : ''}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('new-product')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'new-product'
                ? 'bg-[#F8B704] text-[#0B0D11] shadow-md font-black'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>TAMBAH ARTIKEL</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'banners'
                ? 'bg-[#F8B704] text-[#0B0D11] shadow-md font-black'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>BANNER DEPAN</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ml-auto shrink-0 ${
              activeTab === 'backup'
                ? 'bg-[#F8B704] text-[#0B0D11] shadow-md font-black'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>AKUN & DATABASE</span>
          </button>
        </div>

        {/* Status & Toast Bar */}
        {(dbSyncStatus === 'empty-fallback' || dbError || actionFeedback || isPasswordRecovery) && (
          <div className="px-3.5 sm:px-5 py-2.5 bg-[#090B0F] border-b border-white/10 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono shrink-0">
            {isPasswordRecovery && (
              <div className="text-[#F8B704] flex items-center gap-2 font-bold">
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>Mode Pemulihan Password Aktif: Silakan buat password baru di tab AKUN & DATABASE.</span>
              </div>
            )}

            {actionFeedback ? (
              <div
                className={`flex items-center gap-2 font-bold ${
                  actionFeedback.type === 'success' ? 'text-[#22C55E]' : 'text-[#EF4444]'
                }`}
              >
                {actionFeedback.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{actionFeedback.text}</span>
              </div>
            ) : dbError ? (
              <div className="flex items-center gap-2 text-[#EF4444]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Gangguan Koneksi: {dbError}</span>
              </div>
            ) : dbSyncStatus === 'empty-fallback' ? (
              <div className="flex items-center gap-2 text-[#F8B704]">
                <Database className="w-4 h-4 shrink-0" />
                <span>
                  Data server belum disinkronkan. Saat ini menampilkan katalog bawaan toko.
                </span>
              </div>
            ) : null}

            {dbSyncStatus === 'empty-fallback' && (
              <button
                onClick={handleSeedToSupabase}
                disabled={isSeedingDb}
                className="px-3 py-1.5 bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] font-bold rounded flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSeedingDb ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CloudUpload className="w-3.5 h-3.5" />
                )}
                <span>{isSeedingDb ? 'MENYINKRONKAN...' : `SINKRONKAN ${products.length} PRODUK KE SERVER`}</span>
              </button>
            )}
          </div>
        )}

        {/* Tab Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-6 bg-[#0E1116] space-y-5">
          
          {/* TAB 1: KELOLA HARGA & DISKON */}
          {activeTab === 'pricing' && (
            <div className="space-y-5">
              
              {/* Campaign / Bulk Discount Tool Card */}
              <div className="p-4 sm:p-5 rounded-xl military-glass border border-[#F8B704]/30 bg-gradient-to-r from-[#181D26] via-[#12151C] to-[#181D26]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-[#F8B704] shrink-0" />
                    <div>
                      <h4 className="font-display text-sm font-black text-[#F8FAFC] tracking-wider uppercase">
                        ALAT DISKON MASSAL CEPAT (CAMPAIGN ENGINE)
                      </h4>
                      <p className="text-xs font-mono text-[#94A3B8]">
                        Ubah harga puluhan produk sekaligus dan langsung live di website
                      </p>
                    </div>
                  </div>

                  {bulkSuccessMsg && (
                    <div className="text-xs font-mono bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in">
                      <Check className="w-4 h-4" />
                      <span>{bulkSuccessMsg}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                      KATEGORI TARGET
                    </label>
                    <select
                      value={bulkCategory}
                      onChange={(e) => setBulkCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                    >
                      {MAIN_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                      TIPE PENETAPAN
                    </label>
                    <select
                      value={bulkMode}
                      onChange={(e) => setBulkMode(e.target.value as 'percent' | 'fixed')}
                      className="w-full h-10 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                    >
                      <option value="percent">Potongan Persen (% OFF)</option>
                      <option value="fixed">Set Harga Pas / Rata (Rp)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                      {bulkMode === 'percent' ? 'BESARAN DISKON (%)' : 'HARGA JUAL TARGET (RP)'}
                    </label>
                    {bulkMode === 'percent' ? (
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={90}
                          value={bulkPercent}
                          onChange={(e) => setBulkPercent(Number(e.target.value))}
                          className="w-full h-10 px-3 rounded bg-black/60 border border-[#F8B704]/40 font-mono font-bold text-xs text-[#F8B704] focus:border-[#F8B704] outline-none"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-mono text-[#94A3B8] font-bold">%</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="number"
                          step={1000}
                          value={bulkFixedPrice}
                          onChange={(e) => setBulkFixedPrice(Number(e.target.value))}
                          className="w-full h-10 pl-8 pr-3 rounded bg-black/60 border border-[#F8B704]/40 font-mono font-bold text-xs text-[#F8B704] focus:border-[#F8B704] outline-none"
                        />
                        <span className="absolute left-2.5 top-2.5 text-xs font-mono text-[#94A3B8] font-bold">Rp</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={handleApplyBulk}
                      className="w-full h-10 bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] font-display font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>TERAPKAN SEKARANG</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Price List (Responsive: Cards on Mobile, Scrollable Table on Tablet/Desktop) */}
              <div className="military-glass border border-white/10 rounded-xl overflow-hidden">
                <div className="p-3.5 sm:p-4 border-b border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#11141A]">
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <h3 className="font-display font-black text-sm uppercase text-[#F8FAFC]">
                      DAFTAR PRODUK & PENYESUAIAN LIVE
                    </h3>
                    <span className="text-[10px] font-mono text-[#F8B704] bg-[#F8B704]/10 border border-[#F8B704]/30 px-2 py-0.5 rounded font-bold shrink-0">
                      {filteredProducts.length} ARTIKEL
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-56">
                      <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-3" />
                      <input
                        type="text"
                        placeholder="Cari nama atau SKU..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full h-9 pl-8 pr-3 rounded bg-black/60 border border-white/10 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                      />
                    </div>

                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="h-9 px-2 rounded bg-black/60 border border-white/10 text-xs font-mono text-[#94A3B8] focus:border-[#F8B704] outline-none"
                    >
                      {MAIN_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* MOBILE CARD VIEW (Mudah di-scroll ke atas/bawah di HP tanpa geser kiri-kanan) */}
                <div className="md:hidden divide-y divide-white/10">
                  {filteredProducts.map((p) => {
                    const discPct =
                      p.discountPercent ||
                      (p.originalPrice > p.price
                        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                        : 0);

                    return (
                      <div key={p.id} className="p-3.5 space-y-3 bg-[#0E1116]/60">
                        {/* Header Card: Foto, Nama, SKU, & Tombol Aksi */}
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded border border-white/10 shrink-0 bg-black"
                            />
                            <div className="min-w-0">
                              <div className="font-display font-bold text-sm text-[#F8FAFC] uppercase leading-tight truncate">
                                {p.name}
                              </div>
                              <div className="text-[10px] font-mono text-[#64748B] mt-0.5 truncate">
                                [{p.code}] {p.badge ? `• ${p.badge}` : ''}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {p.categories?.map((cId) => {
                                  const found = MAIN_CATEGORIES.find((mc) => mc.id === cId);
                                  if (!found || found.id === 'all') return null;
                                  return (
                                    <span
                                      key={cId}
                                      className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white/5 border border-white/10 text-[#94A3B8]"
                                    >
                                      {found.label}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleStartEditProduct(p)}
                              className="px-2 py-1 text-[11px] font-mono font-bold bg-[#F8B704]/10 hover:bg-[#F8B704] text-[#F8B704] hover:text-[#0B0D11] border border-[#F8B704]/40 rounded transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>EDIT</span>
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Yakin ingin menghapus artikel ${p.name}?`)) {
                                  const res = await deleteProduct(p.id);
                                  if (res.ok) notifyFeedback('success', `Artikel ${p.name} berhasil dihapus.`);
                                  else notifyFeedback('error', `Gagal menghapus produk: ${res.error}`);
                                }
                              }}
                              className="p-1.5 text-[#EF4444]/80 hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded transition-all cursor-pointer"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Baris Input Harga, Diskon & Stok di HP */}
                        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                          <div>
                            <label className="block text-[9px] text-[#94A3B8] mb-1">HARGA NORMAL</label>
                            <div className="relative">
                              <span className="absolute left-2 top-2 text-[11px] text-[#64748B]">Rp</span>
                              <NumericFieldInput
                                value={p.originalPrice}
                                step={1000}
                                minLiveCommit={10000}
                                onCommit={async (nextOrig) => {
                                  const res = await updateProductPrice(p.id, p.price, nextOrig);
                                  if (!res.ok) notifyFeedback('error', `Gagal menyimpan perubahan: ${res.error}`);
                                }}
                                className="w-full h-8 pl-7 pr-2 rounded bg-black/60 border border-white/10 text-xs text-[#94A3B8] focus:border-[#F8B704] outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] text-[#F8B704] font-bold mb-1">HARGA JUAL (PROMO)</label>
                            <div className="relative">
                              <span className="absolute left-2 top-2 text-[11px] text-[#F8B704] font-bold">Rp</span>
                              <NumericFieldInput
                                value={p.price}
                                step={1000}
                                minLiveCommit={10000}
                                onCommit={async (nextPrice) => {
                                  const res = await updateProductPrice(p.id, nextPrice, p.originalPrice);
                                  if (!res.ok) notifyFeedback('error', `Gagal menyimpan perubahan: ${res.error}`);
                                }}
                                className="w-full h-8 pl-7 pr-2 rounded bg-black/60 border border-[#F8B704]/40 font-bold text-[#F8B704] text-xs focus:border-[#F8B704] outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1 font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#94A3B8]">STOK:</span>
                            <NumericFieldInput
                              value={p.stockRemaining}
                              min={0}
                              onCommit={async (nextStock) => {
                                const res = await updateProductStock(p.id, nextStock);
                                if (!res.ok) notifyFeedback('error', `Gagal menyimpan stok: ${res.error}`);
                              }}
                              className="w-16 h-8 text-center rounded bg-black/60 border border-white/15 text-xs text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                            />
                            <span className="text-[10px] text-[#64748B]">pasang</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[#22C55E] font-bold">DISKON:</span>
                            <div className="relative w-16">
                              <NumericFieldInput
                                value={discPct}
                                min={0}
                                max={95}
                                onCommit={async (pct) => {
                                  const baseOrig = Math.max(p.originalPrice || p.price, p.price, 1000);
                                  const nextPrice =
                                    pct === 0
                                      ? baseOrig
                                      : Math.max(1000, Math.round((baseOrig * (1 - pct / 100)) / 100) * 100);
                                  const res = await updateProductPrice(p.id, nextPrice, baseOrig);
                                  if (!res.ok) notifyFeedback('error', `Gagal menyimpan diskon: ${res.error}`);
                                }}
                                className="w-full h-8 pl-2 pr-5 text-center rounded bg-[#22C55E]/10 border border-[#22C55E]/40 text-xs font-bold text-[#22C55E] focus:border-[#22C55E] outline-none"
                              />
                              <span className="absolute right-2 top-2 text-[10px] font-bold text-[#22C55E]">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* DESKTOP/TABLET TABLE VIEW (Dengan horizontal pan support) */}
                <div className="hidden md:block overflow-x-auto touch-pan-x max-h-[520px]">
                  <table className="w-full min-w-[860px] text-left font-mono text-xs border-collapse">
                    <thead className="sticky top-0 bg-[#0B0D11] text-[#94A3B8] text-[10px] uppercase border-b border-white/10 z-10">
                      <tr>
                        <th className="py-3 px-4">ARTIKEL PRODUK</th>
                        <th className="py-3 px-4">KATEGORI</th>
                        <th className="py-3 px-4">HARGA NORMAL (CORET)</th>
                        <th className="py-3 px-4">HARGA JUAL (PROMO)</th>
                        <th className="py-3 px-3 text-center">DISKON (%)</th>
                        <th className="py-3 px-4 text-center">STOK</th>
                        <th className="py-3 px-4 text-right">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredProducts.map((p) => {
                        const discPct =
                          p.discountPercent ??
                          (p.originalPrice > p.price
                            ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                            : 0);
                        return (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-12 h-12 object-cover rounded border border-white/10 shrink-0 bg-black"
                              />
                              <div>
                                <div className="font-display font-bold text-sm text-[#F8FAFC] group-hover:text-[#F8B704] transition-colors uppercase">
                                  {p.name}
                                </div>
                                <div className="text-[10px] text-[#64748B]">
                                  [{p.code}] {p.badge ? `• ${p.badge}` : ''}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-[10px]">
                            <div className="flex flex-wrap gap-1 max-w-[170px]">
                              {p.categories?.map((cId) => {
                                const found = MAIN_CATEGORIES.find((mc) => mc.id === cId);
                                if (!found || found.id === 'all') return null;
                                return (
                                  <span
                                    key={cId}
                                    className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white/5 border border-white/10 text-[#94A3B8]"
                                  >
                                    {found.label}
                                  </span>
                                );
                              })}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="relative w-32">
                              <span className="absolute left-2.5 top-2 text-xs text-[#64748B]">Rp</span>
                              <NumericFieldInput
                                value={p.originalPrice}
                                step={1000}
                                minLiveCommit={10000}
                                onCommit={async (nextOrig) => {
                                  const res = await updateProductPrice(p.id, p.price, nextOrig);
                                  if (!res.ok) notifyFeedback('error', `Gagal menyimpan perubahan: ${res.error}`);
                                }}
                                className="w-full h-8 pl-8 pr-2 rounded bg-black/60 border border-white/10 text-xs text-[#94A3B8] focus:border-[#F8B704] outline-none"
                              />
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="relative w-36">
                              <span className="absolute left-2.5 top-2 text-xs text-[#F8B704] font-bold">Rp</span>
                              <NumericFieldInput
                                value={p.price}
                                step={1000}
                                minLiveCommit={10000}
                                onCommit={async (nextPrice) => {
                                  const res = await updateProductPrice(p.id, nextPrice, p.originalPrice);
                                  if (!res.ok) notifyFeedback('error', `Gagal menyimpan perubahan: ${res.error}`);
                                }}
                                className="w-full h-8 pl-8 pr-2 rounded bg-black/60 border border-[#F8B704]/40 font-bold text-[#F8B704] text-xs focus:border-[#F8B704] outline-none"
                              />
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <div className="relative w-16 mx-auto">
                              <NumericFieldInput
                                value={discPct}
                                min={0}
                                max={95}
                                onCommit={async (pct) => {
                                  const baseOrig = Math.max(p.originalPrice || p.price, p.price, 1000);
                                  const nextPrice =
                                    pct === 0
                                      ? baseOrig
                                      : Math.max(1000, Math.round((baseOrig * (1 - pct / 100)) / 100) * 100);
                                  const res = await updateProductPrice(p.id, nextPrice, baseOrig);
                                  if (!res.ok) notifyFeedback('error', `Gagal menyimpan diskon: ${res.error}`);
                                }}
                                className="w-full h-8 pl-1.5 pr-5 text-center rounded bg-[#22C55E]/10 border border-[#22C55E]/40 text-xs font-bold text-[#22C55E] focus:border-[#22C55E] outline-none"
                              />
                              <span className="absolute right-1.5 top-2 text-[10px] font-bold text-[#22C55E]">%</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <NumericFieldInput
                              value={p.stockRemaining}
                              min={0}
                              onCommit={async (nextStock) => {
                                const res = await updateProductStock(p.id, nextStock);
                                if (!res.ok) notifyFeedback('error', `Gagal menyimpan stok: ${res.error}`);
                              }}
                              className="w-16 h-8 text-center rounded bg-black/60 border border-white/10 text-xs text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                            />
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleStartEditProduct(p)}
                                className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F8B704]/10 hover:bg-[#F8B704] text-[#F8B704] hover:text-[#0B0D11] border border-[#F8B704]/40 rounded transition-all cursor-pointer flex items-center gap-1"
                                title="Edit Lengkap Artikel Ini"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>EDIT</span>
                              </button>

                              <button
                                onClick={async () => {
                                  if (window.confirm(`Yakin ingin menghapus artikel ${p.name}?`)) {
                                    const res = await deleteProduct(p.id);
                                    if (res.ok) notifyFeedback('success', `Artikel ${p.name} berhasil dihapus.`);
                                    else notifyFeedback('error', `Gagal menghapus produk: ${res.error}`);
                                  }
                                }}
                                className="p-1.5 text-[#EF4444]/70 hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded transition-all cursor-pointer"
                                title="Hapus Produk"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredProducts.length === 0 && (
                  <div className="p-8 text-center text-xs font-mono text-[#64748B]">
                    Tidak ada produk yang cocok dengan pencarian.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: EDIT PRODUK */}
          {activeTab === 'edit-product' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="military-glass border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#11141A]">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#F8B704]" />
                  <span className="text-xs font-mono font-bold text-[#F8FAFC] uppercase">
                    PILIH ARTIKEL YANG INGIN DIEDIT:
                  </span>
                </div>
                <select
                  value={editingProduct?.id || ''}
                  onChange={(e) => {
                    const found = products.find((p) => p.id === e.target.value);
                    if (found) handleStartEditProduct(found);
                  }}
                  className="w-full sm:w-80 h-9 px-3 rounded bg-black/60 border border-[#F8B704]/40 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name} - Rp {p.price.toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>
              </div>

              {editingProduct ? (
                <form onSubmit={handleSaveProductEdit} className="space-y-6">
                  {editSuccessMsg && (
                    <div className="p-4 bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] rounded-xl flex items-center justify-between gap-3 font-mono text-sm animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 stroke-[3]" />
                        <span>{editSuccessMsg}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('pricing')}
                        className="px-3 py-1 bg-[#22C55E] text-[#0B0D11] text-xs font-bold rounded"
                      >
                        Lihat di Tabel &rarr;
                      </button>
                    </div>
                  )}

                  <div className="military-glass border border-[#F8B704]/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#181D26] to-[#0E1116]">
                    <div className="flex items-center gap-3">
                      <img
                        src={editingProduct.image}
                        alt={editingProduct.name}
                        className="w-12 h-12 rounded object-cover border border-[#F8B704]/40 bg-black"
                      />
                      <div>
                        <div className="text-[10px] font-mono text-[#F8B704] font-bold uppercase tracking-wider">
                          SEDANG MENGEDIT ARTIKEL:
                        </div>
                        <h3 className="font-display font-black text-base text-[#F8FAFC] uppercase">
                          {editingProduct.name}
                        </h3>
                        <div className="text-[11px] font-mono text-[#94A3B8]">
                          KODE SKU: <span className="text-[#F8FAFC] font-bold">{editingProduct.code}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('pricing')}
                        className="px-3 py-2 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Kembali ke Tabel</span>
                      </button>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] font-display font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>SIMPAN PERUBAHAN</span>
                      </button>
                    </div>
                  </div>

                  <div className="military-glass border border-white/10 rounded-xl p-5 space-y-4">
                    <h4 className="font-display text-sm font-black text-[#F8B704] uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      <span>1. INFORMASI DASAR PRODUK</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                          NAMA ARTIKEL *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full h-10 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                          KODE SKU PRODUK *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProduct.code}
                          onChange={(e) => setEditingProduct({ ...editingProduct, code: e.target.value })}
                          className="w-full h-10 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#94A3B8] mb-2">
                        KATEGORI PRODUK (Sama dengan Halaman Utama) *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {ARTICLE_CATEGORY_OPTIONS.map((cat) => {
                          const isChecked = editingProduct.categories?.includes(cat.id);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                const nextCats = toggleCategoryInArray(editingProduct.categories, cat.id);
                                setEditingProduct({
                                  ...editingProduct,
                                  categories: nextCats,
                                });
                              }}
                              className={`p-2.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-[#F8B704]/20 border-[#F8B704] text-[#F8B704]'
                                  : 'bg-black/40 border-white/10 text-[#94A3B8] hover:border-white/20'
                              }`}
                            >
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-[#F8B704] shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-[#64748B] shrink-0" />
                              )}
                              <span>{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                        RINGKASAN KEUNGGULAN / TAGLINE
                      </label>
                      <textarea
                        rows={2}
                        value={editingProduct.tagline}
                        onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                        className="w-full p-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                      />
                    </div>
                  </div>

                  <div className="military-glass border border-white/10 rounded-xl p-5 space-y-4">
                    <h4 className="font-display text-sm font-black text-[#F8B704] uppercase tracking-wider flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span>2. HARGA SHOPEE & STOK GUDANG</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                          HARGA NORMAL (CORET)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-[#64748B] font-mono">Rp</span>
                          <input
                            type="number"
                            step={1000}
                            required
                            value={editingProduct.originalPrice}
                            onChange={(e) => {
                              const orig = Number(e.target.value);
                              const disc = orig > editingProduct.price ? Math.round(((orig - editingProduct.price) / orig) * 100) : 0;
                              setEditingProduct({ ...editingProduct, originalPrice: orig, discountPercent: disc });
                            }}
                            className="w-full h-10 pl-9 pr-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                          HARGA JUAL (PROMO) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-[#F8B704] font-mono font-bold">Rp</span>
                          <input
                            type="number"
                            step={1000}
                            required
                            value={editingProduct.price}
                            onChange={(e) => {
                              const price = Number(e.target.value);
                              const orig = editingProduct.originalPrice || price;
                              const disc = orig > price ? Math.round(((orig - price) / orig) * 100) : 0;
                              setEditingProduct({ ...editingProduct, price, discountPercent: disc });
                            }}
                            className="w-full h-10 pl-9 pr-3 rounded bg-black/60 border border-[#F8B704]/40 font-bold text-[#F8B704] text-xs font-mono focus:border-[#F8B704] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#22C55E] font-bold mb-1">
                          DISKON PRODUK (%)
                        </label>
                        <div className="relative">
                          <NumericFieldInput
                            value={editingProduct.discountPercent || 0}
                            min={0}
                            max={95}
                            onCommit={(pct) => {
                              const baseOrig = Math.max(editingProduct.originalPrice || editingProduct.price, editingProduct.price, 1000);
                              const nextPrice =
                                pct === 0
                                  ? baseOrig
                                  : Math.max(1000, Math.round((baseOrig * (1 - pct / 100)) / 100) * 100);
                              setEditingProduct({
                                ...editingProduct,
                                originalPrice: baseOrig,
                                price: nextPrice,
                                discountPercent: pct,
                              });
                            }}
                            className="w-full h-10 pl-3 pr-8 rounded bg-[#22C55E]/10 border border-[#22C55E]/40 font-bold text-[#22C55E] text-xs font-mono focus:border-[#22C55E] outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-[#22C55E] font-mono font-bold">%</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                          SISA STOK (PASANG)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={editingProduct.stockRemaining}
                          onChange={(e) => {
                            const stock = Number(e.target.value);
                            setEditingProduct({ ...editingProduct, stockRemaining: stock, inStock: stock > 0 });
                          }}
                          className="w-full h-10 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                          BADGE PROMO
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: BEST SELLER / FREE KAOS KAKI"
                          value={editingProduct.badge || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                          className="w-full h-10 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-[#94A3B8]">Kalkulasi Otomatis:</span>
                        <span className="text-[#22C55E] font-bold">
                          Diskon {editingProduct.discountPercent || 0}% OFF
                        </span>
                        <span className="text-[#64748B]">•</span>
                        <span className="text-[#F8B704]">
                          Hemat Rp {((editingProduct.originalPrice || 0) - editingProduct.price).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${editingProduct.inStock ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#EF4444]/15 text-[#EF4444]'}`}>
                        {editingProduct.inStock ? 'STATUS: TERSEDIA (IN STOCK)' : 'STATUS: HABIS'}
                      </span>
                    </div>
                  </div>

                  <div className="military-glass border border-white/10 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-sm font-black text-[#F8B704] uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>3. FOTO PRODUK & GALERI MULTI-SUDUT ({editGalleryInputs.length} FOTO)</span>
                      </h4>

                      <button
                        type="button"
                        onClick={() => setEditGalleryInputs([...editGalleryInputs, ''])}
                        className="text-xs font-mono text-[#F8B704] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Tambah Sudut Foto</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {editGalleryInputs.map((img, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-black/40 border border-white/10">
                          <img
                            src={img}
                            alt={`Preview ${idx}`}
                            className="w-12 h-12 rounded object-cover border border-white/10 bg-black shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.opacity = '0.3';
                            }}
                          />

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-mono text-[#F8B704] font-bold">
                                {idx === 0 ? 'FOTO UTAMA (COVER KATALOG)' : `FOTO DETAIL #${idx + 1}`}
                              </span>
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...editGalleryInputs];
                                    const [moved] = next.splice(idx, 1);
                                    next.unshift(moved);
                                    setEditGalleryInputs(next);
                                  }}
                                  className="text-[10px] font-mono text-[#38BDF8] hover:underline cursor-pointer"
                                >
                                  Jadikan Foto Utama
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={img}
                              placeholder="Path gambar (e.g. /assets/products/Bellator.webp) atau URL"
                              onChange={(e) => {
                                const next = [...editGalleryInputs];
                                next[idx] = e.target.value;
                                setEditGalleryInputs(next);
                              }}
                              className="w-full h-8 px-2.5 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                            />
                          </div>

                          {editGalleryInputs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setEditGalleryInputs(editGalleryInputs.filter((_, i) => i !== idx))}
                              className="p-2 text-[#EF4444] hover:bg-[#EF4444]/15 rounded cursor-pointer shrink-0"
                              title="Hapus Sudut Ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="military-glass border border-white/10 rounded-xl p-5 space-y-4">
                    <h4 className="font-display text-sm font-black text-[#F8B704] uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-4 h-4" />
                      <span>4. SPESIFIKASI TAKTIKAL SEPATU</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                          MATERIAL KULIT
                        </label>
                        <input
                          type="text"
                          value={editingProduct.specs.material}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              specs: { ...editingProduct.specs, material: e.target.value },
                            })
                          }
                          className="w-full h-9 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                          SOL KARET BAWAH (OUTSOLE)
                        </label>
                        <input
                          type="text"
                          value={editingProduct.specs.outsole}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              specs: { ...editingProduct.specs, outsole: e.target.value },
                            })
                          }
                          className="w-full h-9 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                          TALI PENGENCANG (LACING)
                        </label>
                        <input
                          type="text"
                          value={editingProduct.specs.lacing}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              specs: { ...editingProduct.specs, lacing: e.target.value },
                            })
                          }
                          className="w-full h-9 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                          RESLETING / ZIPPER
                        </label>
                        <input
                          type="text"
                          value={editingProduct.specs.zipper}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              specs: { ...editingProduct.specs, zipper: e.target.value },
                            })
                          }
                          className="w-full h-9 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                          KEAMANAN & KONSTRUKSI JAHITAN
                        </label>
                        <input
                          type="text"
                          value={editingProduct.specs.craftsmanship}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              specs: { ...editingProduct.specs, craftsmanship: e.target.value },
                            })
                          }
                          className="w-full h-9 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="military-glass border border-white/10 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-sm font-black text-[#F8B704] uppercase tracking-wider flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>5. CHECKLIST UKURAN SEPATU TERSEDIA</span>
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, sizes: [...AVAILABLE_SIZES] })}
                          className="text-[10px] font-mono text-[#38BDF8] hover:underline"
                        >
                          Pilih Semua (38-46)
                        </button>
                        <span className="text-[#64748B]">•</span>
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, sizes: [39, 40, 41, 42, 43, 44] })}
                          className="text-[10px] font-mono text-[#38BDF8] hover:underline"
                        >
                          Standar (39-44)
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {AVAILABLE_SIZES.map((sz) => {
                        const isSelected = editingProduct.sizes?.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => {
                              const nextSizes = toggleSizeInArray(editingProduct.sizes, sz);
                              setEditingProduct({ ...editingProduct, sizes: nextSizes });
                            }}
                            className={`w-12 h-10 rounded font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#F8B704] text-[#0B0D11] shadow-md'
                                : 'bg-black/50 text-[#64748B] border border-white/10 hover:border-white/20'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 h-12 bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] font-display font-black text-sm uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(248,183,4,0.4)]"
                    >
                      <Save className="w-5 h-5 stroke-[2.5]" />
                      <span>SIMPAN PERUBAHAN</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('pricing')}
                      className="h-12 px-6 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] border border-white/15"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          )}

          {/* TAB 3: TAMBAH ARTIKEL BARU */}
          {activeTab === 'new-product' && (
            <form onSubmit={handleCreateProductSubmit} className="space-y-6 max-w-4xl mx-auto">
              {productCreatedMsg && (
                <div className="p-4 bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] rounded-xl flex items-center gap-3 font-mono text-sm animate-in fade-in">
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Artikel baru berhasil disimpan dan langsung tampil di katalog!</span>
                </div>
              )}

              <div className="military-glass border border-white/10 rounded-xl p-5 space-y-4">
                <h4 className="font-display text-sm font-black text-[#F8B704] uppercase tracking-wider flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  <span>INFORMASI DASAR PRODUK BARU</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                      NAMA ARTIKEL *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: BROTRHER COMMANDO ROCKY"
                      value={newProd.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const code = 'BR-' + name.slice(0, 3).toUpperCase();
                        setNewProd({ ...newProd, name, code });
                      }}
                      className="w-full h-10 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                      KODE SKU PRODUK
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: BR-BCR"
                      value={newProd.code}
                      onChange={(e) => setNewProd({ ...newProd, code: e.target.value })}
                      className="w-full h-10 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#94A3B8] mb-2">
                    KATEGORI (Sama dengan Halaman Utama) *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ARTICLE_CATEGORY_OPTIONS.map((cat) => {
                      const isChecked = newProd.categories?.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            const nextCats = toggleCategoryInArray(newProd.categories, cat.id);
                            setNewProd({
                              ...newProd,
                              categories: nextCats,
                              category: nextCats.find((c) => c === 'pdl' || c === 'pdh') || nextCats[0] || 'pdl',
                              categoryLabel: (nextCats.find((c) => c === 'pdl' || c === 'pdh') || nextCats[0] || 'pdl').toUpperCase(),
                            });
                          }}
                          className={`p-2.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-[#F8B704]/20 border-[#F8B704] text-[#F8B704]'
                              : 'bg-black/40 border-white/10 text-[#94A3B8] hover:border-white/20'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#F8B704] shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-[#64748B] shrink-0" />
                          )}
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                    RINGKASAN KEUNGGULAN / TAGLINE
                  </label>
                  <textarea
                    rows={2}
                    value={newProd.tagline}
                    onChange={(e) => setNewProd({ ...newProd, tagline: e.target.value })}
                    placeholder="Contoh: Sepatu PDL laras tinggi dengan tali kawat putar Fitgo, sol radial jahit tembus keliling..."
                    className="w-full p-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                  />
                </div>
              </div>

              <div className="military-glass border border-white/10 rounded-xl p-5 space-y-4">
                <h4 className="font-display text-sm font-black text-[#F8B704] uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>HARGA SHOPEE & STOK GUDANG</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                      HARGA NORMAL (CORET)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-[#64748B] font-mono">Rp</span>
                      <input
                        type="number"
                        step={1000}
                        required
                        value={newProd.originalPrice}
                        onChange={(e) => {
                          const orig = Number(e.target.value);
                          const disc = orig > newProd.price ? Math.round(((orig - newProd.price) / orig) * 100) : 0;
                          setNewProd({ ...newProd, originalPrice: orig, discountPercent: disc });
                        }}
                        className="w-full h-10 pl-9 pr-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                      HARGA JUAL (PROMO) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-[#F8B704] font-mono font-bold">Rp</span>
                      <input
                        type="number"
                        step={1000}
                        required
                        value={newProd.price}
                        onChange={(e) => {
                          const price = Number(e.target.value);
                          const disc = newProd.originalPrice > price ? Math.round(((newProd.originalPrice - price) / newProd.originalPrice) * 100) : 0;
                          setNewProd({ ...newProd, price, discountPercent: disc });
                        }}
                        className="w-full h-10 pl-9 pr-3 rounded bg-black/60 border border-[#F8B704]/40 font-bold text-[#F8B704] text-xs font-mono focus:border-[#F8B704] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#22C55E] font-bold mb-1">
                      DISKON PRODUK (%)
                    </label>
                    <div className="relative">
                      <NumericFieldInput
                        value={newProd.discountPercent || 0}
                        min={0}
                        max={95}
                        onCommit={(pct) => {
                          const baseOrig = Math.max(newProd.originalPrice || newProd.price, newProd.price, 1000);
                          const nextPrice =
                            pct === 0
                              ? baseOrig
                              : Math.max(1000, Math.round((baseOrig * (1 - pct / 100)) / 100) * 100);
                          setNewProd({ ...newProd, originalPrice: baseOrig, price: nextPrice, discountPercent: pct });
                        }}
                        className="w-full h-10 pl-3 pr-8 rounded bg-[#22C55E]/10 border border-[#22C55E]/40 font-bold text-[#22C55E] text-xs font-mono focus:border-[#22C55E] outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-[#22C55E] font-mono font-bold">%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                      SISA STOK (PASANG)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newProd.stockRemaining}
                      onChange={(e) => setNewProd({ ...newProd, stockRemaining: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                      BADGE PROMO
                    </label>
                    <input
                      type="text"
                      placeholder="SUPER KILAP / FREE BONUS"
                      value={newProd.badge}
                      onChange={(e) => setNewProd({ ...newProd, badge: e.target.value })}
                      className="w-full h-10 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="military-glass border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-sm font-black text-[#F8B704] uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>FOTO PRODUK & GALERI SUDUT</span>
                  </h4>

                  <button
                    type="button"
                    onClick={() => setGalleryInputs([...galleryInputs, ''])}
                    className="text-xs font-mono text-[#F8B704] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tambah Sudut Foto</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {galleryInputs.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#64748B] w-20">
                        {idx === 0 ? 'FOTO UTAMA' : `SUDUT #${idx + 1}`}
                      </span>
                      <input
                        type="text"
                        placeholder="Path lokal (e.g. /assets/products/Bellator.webp) atau URL gambar"
                        value={img}
                        onChange={(e) => {
                          const updated = [...galleryInputs];
                          updated[idx] = e.target.value;
                          setGalleryInputs(updated);
                        }}
                        className="flex-1 h-9 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                      />
                      {galleryInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setGalleryInputs(galleryInputs.filter((_, i) => i !== idx))}
                          className="p-2 text-[#EF4444] hover:bg-[#EF4444]/15 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-12 bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] font-display font-black text-sm uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(248,183,4,0.4)]"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>SIMPAN & TERBITKAN PRODUK</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: BANNER & SECTION HALAMAN UTAMA */}
          {activeTab === 'banners' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {bannerSuccessMsg && (
                <div className="p-3 bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] rounded-xl flex items-center gap-2 font-mono text-xs animate-in fade-in">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{bannerSuccessMsg}</span>
                </div>
              )}

              <div className="military-glass border border-white/10 rounded-xl p-5 space-y-3">
                <h4 className="font-display text-sm font-black text-[#F8B704] uppercase tracking-wider">
                  TEKS PENGUMUMAN BERJALAN
                </h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={tickerDraft}
                    onChange={(e) => setTickerDraft(e.target.value)}
                    className="flex-1 h-10 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                  />
                  <button
                    onClick={async () => {
                      const res = await updateTickerText(tickerDraft);
                      if (res.ok) {
                        setBannerSuccessMsg('Teks pengumuman berhasil disimpan!');
                        setTimeout(() => setBannerSuccessMsg(null), 2500);
                      } else {
                        notifyFeedback('error', `Gagal simpan pengumuman: ${res.error}`);
                      }
                    }}
                    className="px-4 h-10 bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] text-xs font-mono font-black uppercase rounded transition-all cursor-pointer shrink-0"
                  >
                    Simpan
                  </button>
                </div>
              </div>

              <div className="military-glass border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-display text-sm font-black text-[#F8B704] uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>BANNER PROMO HALAMAN DEPAN (HERO SECTION)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={async () => {
                      const newSlide: HeroSlide = {
                        id: `slide-${Date.now()}`,
                        badge: 'KOLEKSI TERBARU',
                        headline: 'BROTRHER TACTICAL EDITION',
                        highlightText: '100% KULIT SAPI ASLI',
                        subtext: 'Sepatu dinas lapangan kualitas pabrikan dengan sol karet dijahit keliling.',
                        specsHighlight: [
                          { label: 'LACING', value: 'FITGO AUTO-LOCK' },
                          { label: 'MATERIAL', value: '100% KULIT SAPI' },
                          { label: 'OUTSOLE', value: 'RUBBER ANTI-SLIP' },
                        ],
                        ctaText: 'LIHAT KATALOG',
                        priceDisplay: 'Rp 685.000',
                        image: '/assets/products/Bronson.webp',
                      };
                      const res = await addHeroSlide(newSlide);
                      if (res.ok) notifyFeedback('success', 'Slide banner baru berhasil ditambahkan.');
                      else notifyFeedback('error', `Gagal tambah slide: ${res.error}`);
                    }}
                    className="text-xs font-mono text-[#F8B704] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tambah Slide Banner</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {heroSlides.map((originalSlide, sIdx) => {
                    const slide = slideDrafts[originalSlide.id] || originalSlide;
                    const linkedProduct = slide.productId
                      ? products.find((p) => p.id === slide.productId)
                      : undefined;

                    const updateDraft = (patch: Partial<HeroSlide>) => {
                      setSlideDrafts((prev) => ({
                        ...prev,
                        [slide.id]: { ...slide, ...patch },
                      }));
                    };

                    const saveSlide = async (overridePatch?: Partial<HeroSlide>) => {
                      const payload = overridePatch ? { ...slide, ...overridePatch } : slide;
                      if (overridePatch) {
                        setSlideDrafts((prev) => ({
                          ...prev,
                          [slide.id]: payload,
                        }));
                      }
                      setSavingSlideId(slide.id);
                      const res = await updateHeroSlide(slide.id, payload);
                      setSavingSlideId(null);
                      if (res.ok) {
                        setBannerSuccessMsg(`Slide #${sIdx + 1} (${payload.headline}) berhasil disimpan!`);
                        notifyFeedback('success', `Banner Slide #${sIdx + 1} tersimpan & langsung live.`);
                        setTimeout(() => setBannerSuccessMsg(null), 3000);
                      } else {
                        notifyFeedback('error', `Gagal menyimpan banner: ${res.error}`);
                      }
                    };

                    return (
                      <div key={slide.id} className="p-4 rounded-lg bg-black/40 border border-white/10 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                          <span className="font-mono text-xs font-bold text-[#F8B704]">
                            SLIDE #{sIdx + 1}: {slide.headline}
                          </span>
                          <div className="flex items-center gap-3">
                            {heroSlides.length > 1 && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const res = await deleteHeroSlide(slide.id);
                                  if (!res.ok) notifyFeedback('error', `Gagal hapus slide: ${res.error}`);
                                }}
                                className="text-[#EF4444] text-xs font-mono hover:underline cursor-pointer"
                              >
                                Hapus Slide
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono text-[#94A3B8] mb-0.5">
                              JUDUL HEADLINE
                            </label>
                            <input
                              type="text"
                              value={slide.headline}
                              onChange={(e) => updateDraft({ headline: e.target.value })}
                              className="w-full h-9 px-2.5 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-[#94A3B8] mb-0.5">
                              SUB-HIGHLIGHT
                            </label>
                            <input
                              type="text"
                              value={slide.highlightText}
                              onChange={(e) => updateDraft({ highlightText: e.target.value })}
                              className="w-full h-9 px-2.5 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-[#F8B704] font-bold mb-0.5">
                              HARGA DISPLAY DI HERO SECTION
                            </label>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                placeholder="Contoh: Rp 695.000"
                                value={slide.priceDisplay}
                                onChange={(e) => updateDraft({ priceDisplay: e.target.value })}
                                className="flex-1 h-9 px-2.5 rounded bg-black/60 border border-[#F8B704]/40 text-xs font-mono font-bold text-[#F8B704] focus:border-[#F8B704] outline-none"
                              />
                              {linkedProduct && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    saveSlide({
                                      priceDisplay: `Rp ${linkedProduct.price.toLocaleString('id-ID')}`,
                                    })
                                  }
                                  className="px-2.5 h-9 rounded bg-[#F8B704]/15 hover:bg-[#F8B704] text-[#F8B704] hover:text-[#0B0D11] border border-[#F8B704]/40 text-[10px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap"
                                  title={`Ambil harga terbaru dari ${linkedProduct.name} (Rp ${linkedProduct.price.toLocaleString('id-ID')})`}
                                >
                                  Samakan Produk
                                </button>
                              )}
                            </div>
                            {linkedProduct && (
                              <p className="text-[10px] font-mono text-[#64748B] mt-1">
                                Harga produk terhubung saat ini:{' '}
                                <span className="text-[#94A3B8]">
                                  Rp {linkedProduct.price.toLocaleString('id-ID')}
                                </span>
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-[#94A3B8] mb-0.5">
                              PRODUK TERHUBUNG (TOMBOL CTA)
                            </label>
                            <select
                              value={slide.productId || ''}
                              onChange={(e) => {
                                const nextProdId = e.target.value || undefined;
                                updateDraft({ productId: nextProdId });
                              }}
                              className="w-full h-9 px-2.5 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                            >
                              <option value="">-- Tidak terhubung ke produk --</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  [{p.code}] {p.name} (Rp {p.price.toLocaleString('id-ID')})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-[#94A3B8] mb-0.5">
                              BADGE KATEGORI (KIRI ATAS)
                            </label>
                            <input
                              type="text"
                              value={slide.badge}
                              onChange={(e) => updateDraft({ badge: e.target.value })}
                              className="w-full h-9 px-2.5 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-[#94A3B8] mb-0.5">
                              TEKS TOMBOL CTA
                            </label>
                            <input
                              type="text"
                              value={slide.ctaText}
                              onChange={(e) => updateDraft({ ctaText: e.target.value })}
                              className="w-full h-9 px-2.5 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-mono text-[#94A3B8] mb-0.5">
                              PATH GAMBAR BANNER
                            </label>
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={slide.image}
                                onChange={(e) => updateDraft({ image: e.target.value })}
                                className="flex-1 h-9 px-2.5 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                              />
                              <img src={slide.image} alt="Preview" className="w-9 h-9 rounded border border-white/10 object-cover" />
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-mono text-[#94A3B8] mb-0.5">
                              DESKRIPSI SLIDE
                            </label>
                            <textarea
                              rows={2}
                              value={slide.subtext}
                              onChange={(e) => updateDraft({ subtext: e.target.value })}
                              className="w-full p-2.5 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            disabled={savingSlideId === slide.id}
                            onClick={() => saveSlide()}
                            className="h-9 px-4 bg-[#F8B704] hover:bg-[#FFC82D] disabled:opacity-60 text-[#0B0D11] font-display font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>
                              {savingSlideId === slide.id ? 'MENYIMPAN...' : `Simpan Slide #${sIdx + 1}`}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PAKET KOMANDO (UPSELL BUNDLE) EDITOR */}
              <div className="military-glass border border-[#F8B704]/30 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-display text-sm font-black text-[#F8B704] uppercase tracking-wider flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span>PAKET KOMANDO (UPSELL BUNDLE)</span>
                    </h4>
                    <p className="text-[11px] font-mono text-[#94A3B8] mt-0.5">
                      Atur judul, daftar item, harga bundle, dan sisa slot Paket Komando langsung ke database server.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-[#94A3B8] mb-0.5">
                      JUDUL PAKET KOMANDO
                    </label>
                    <input
                      type="text"
                      value={upsellDraft.name}
                      onChange={(e) => setUpsellDraft({ ...upsellDraft, name: e.target.value })}
                      className="w-full h-9 px-2.5 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#94A3B8] mb-0.5">
                      TAGLINE / SUBJUDUL PROMO
                    </label>
                    <input
                      type="text"
                      value={upsellDraft.tagline}
                      onChange={(e) => setUpsellDraft({ ...upsellDraft, tagline: e.target.value })}
                      className="w-full h-9 px-2.5 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-[#94A3B8] mb-0.5">
                      HARGA NORMAL (CORET)
                    </label>
                    <NumericFieldInput
                      value={upsellDraft.totalRegularPrice}
                      step={1000}
                      minLiveCommit={10000}
                      onCommit={(val) => {
                        const savings = Math.max(0, val - upsellDraft.bundlePrice);
                        setUpsellDraft({ ...upsellDraft, totalRegularPrice: val, savings });
                      }}
                      className="w-full h-9 px-2.5 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#94A3B8] focus:border-[#F8B704] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#F8B704] font-bold mb-0.5">
                      HARGA BUNDLE RESMI
                    </label>
                    <NumericFieldInput
                      value={upsellDraft.bundlePrice}
                      step={1000}
                      minLiveCommit={10000}
                      onCommit={(val) => {
                        const savings = Math.max(0, upsellDraft.totalRegularPrice - val);
                        setUpsellDraft({ ...upsellDraft, bundlePrice: val, savings });
                      }}
                      className="w-full h-9 px-2.5 rounded bg-black/60 border border-[#F8B704]/40 text-xs font-mono font-bold text-[#F8B704] focus:border-[#F8B704] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#22C55E] font-bold mb-0.5">
                      NOMINAL HEMAT
                    </label>
                    <NumericFieldInput
                      value={upsellDraft.savings}
                      step={1000}
                      min={0}
                      onCommit={(val) => setUpsellDraft({ ...upsellDraft, savings: val })}
                      className="w-full h-9 px-2.5 rounded bg-[#22C55E]/10 border border-[#22C55E]/40 text-xs font-mono font-bold text-[#22C55E] focus:border-[#22C55E] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#94A3B8] mb-0.5">
                      SISA SLOT HARI INI
                    </label>
                    <NumericFieldInput
                      value={upsellDraft.remainingSlots}
                      min={0}
                      onCommit={(val) => setUpsellDraft({ ...upsellDraft, remainingSlots: val })}
                      className="w-full h-9 px-2.5 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-mono text-[#94A3B8] uppercase">
                      DAFTAR ITEM DALAM PAKET ({upsellDraft.items.length})
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setUpsellDraft({
                          ...upsellDraft,
                          items: [...upsellDraft.items, 'Item Paket Baru'],
                        })
                      }
                      className="text-xs font-mono text-[#F8B704] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Tambah Item</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {upsellDraft.items.map((itemText, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={itemText}
                          onChange={(e) => {
                            const nextItems = [...upsellDraft.items];
                            nextItems[idx] = e.target.value;
                            setUpsellDraft({ ...upsellDraft, items: nextItems });
                          }}
                          className="flex-1 h-9 px-2.5 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                        />
                        {upsellDraft.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setUpsellDraft({
                                ...upsellDraft,
                                items: upsellDraft.items.filter((_, i) => i !== idx),
                              })
                            }
                            className="p-2 text-[#EF4444] hover:bg-[#EF4444]/15 rounded cursor-pointer shrink-0"
                            title="Hapus Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={isSavingUpsell}
                    onClick={async () => {
                      setIsSavingUpsell(true);
                      const cleanedItems = upsellDraft.items.filter((it) => it.trim().length > 0);
                      const payload = {
                        ...upsellDraft,
                        items: cleanedItems.length > 0 ? cleanedItems : upsellDraft.items,
                      };
                      const res = await updateUpsellBundle(payload);
                      setIsSavingUpsell(false);
                      if (res.ok) {
                        setBannerSuccessMsg('Paket Komando berhasil diperbarui & langsung live!');
                        notifyFeedback('success', 'Perubahan Paket Komando tersimpan.');
                        setTimeout(() => setBannerSuccessMsg(null), 3000);
                      } else {
                        notifyFeedback('error', `Gagal menyimpan Paket Komando: ${res.error}`);
                      }
                    }}
                    className="h-9 px-4 bg-[#F8B704] hover:bg-[#FFC82D] disabled:opacity-60 text-[#0B0D11] font-display font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingUpsell ? 'MENYIMPAN...' : 'Simpan Paket Komando'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AKUN & DATABASE (RINGKAS & MUDAH DIPAHAMI) */}
          {activeTab === 'backup' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              
              {/* Card 1: Akun & Ganti Password */}
              <div className="military-glass border border-[#F8B704]/40 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <div className="w-9 h-9 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/40 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display text-sm font-black uppercase text-[#F8FAFC]">
                      AKUN & KEAMANAN ADMIN
                    </h4>
                    <p className="text-xs font-mono text-[#94A3B8] truncate">
                      Masuk sebagai <span className="text-[#F8B704] font-bold">{session.user.email}</span>
                    </p>
                  </div>
                </div>

                {credMsg && (
                  <div
                    className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
                      credMsg.type === 'success'
                        ? 'bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E]'
                        : 'bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444]'
                    }`}
                  >
                    {credMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                    <span>{credMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateSupabasePassword} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                        PASSWORD BARU (MIN. 8 KARAKTER)
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Kombinasi huruf & angka..."
                        value={newAuthPass}
                        onChange={(e) => setNewAuthPass(e.target.value)}
                        className="w-full h-9 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                        ULANGI PASSWORD BARU
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Ketik ulang password..."
                        value={confirmAuthPass}
                        onChange={(e) => setConfirmAuthPass(e.target.value)}
                        className="w-full h-9 px-3 rounded bg-black/60 border border-white/15 text-xs font-mono text-[#F8FAFC] focus:border-[#F8B704] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingPass}
                    className="w-full h-10 bg-[#F8B704] hover:bg-[#FFC82D] disabled:opacity-50 text-[#0B0D11] font-display font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isUpdatingPass ? 'MENYIMPAN...' : 'SIMPAN PASSWORD BARU'}</span>
                  </button>
                </form>
              </div>

              {/* Card 2: Status & Sinkronisasi Toko */}
              <div className="military-glass border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h4 className="font-display text-sm font-black uppercase text-[#F8FAFC] flex items-center gap-2">
                      <Database className="w-4 h-4 text-[#F8B704]" />
                      <span>STATUS DATA TOKO</span>
                    </h4>
                    <p className="text-[11px] font-mono text-[#94A3B8] mt-0.5">
                      Semua perubahan harga & stok otomatis tersimpan ke server
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2.5 py-1 rounded font-bold shrink-0 ${
                      dbSyncStatus === 'synced'
                        ? 'bg-[#22C55E]/15 text-[#22C55E]'
                        : dbSyncStatus === 'error'
                        ? 'bg-[#EF4444]/15 text-[#EF4444]'
                        : 'bg-[#F8B704]/15 text-[#F8B704]'
                    }`}
                  >
                    {dbSyncStatus === 'synced'
                      ? 'TERHUBUNG'
                      : dbSyncStatus === 'error'
                      ? 'GANGGUAN'
                      : 'SIAP SINKRON'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                    <div className="text-[#94A3B8] text-[10px]">PRODUK TERSIMPAN</div>
                    <div className="text-lg font-bold text-[#F8FAFC]">{supabaseProductCount} artikel</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                    <div className="text-[#94A3B8] text-[10px]">BANNER PROMO</div>
                    <div className="text-lg font-bold text-[#F8FAFC]">{supabaseSlideCount} slide</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={handleSeedToSupabase}
                    disabled={isSeedingDb}
                    className="flex-1 py-2.5 px-4 bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] font-mono font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CloudUpload className="w-4 h-4" />
                    <span>{isSeedingDb ? 'MENYINKRONKAN...' : 'SINKRONKAN DATA KATALOG'}</span>
                  </button>

                  <button
                    onClick={refreshFromSupabase}
                    className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-[#F8FAFC] font-mono font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer border border-white/15"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>MUAT ULANG</span>
                  </button>
                </div>
              </div>

              {/* Card 3: Cadangan & Reset Ringkas */}
              <div className="military-glass border border-white/10 rounded-xl p-5 space-y-4">
                <h4 className="font-display text-sm font-black uppercase text-[#F8FAFC]">
                  CADANGAN & PEMULIHAN DATA
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handleExport}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-[#F8FAFC] font-mono font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer border border-white/15"
                  >
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD BACKUP</span>
                  </button>

                  <label className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-[#F8FAFC] font-mono font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer border border-white/15">
                    <Upload className="w-4 h-4" />
                    <span>PULIHKAN FILE BACKUP</span>
                    <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                  </label>
                </div>

                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-[11px] font-mono text-[#94A3B8]">
                    Kembalikan seluruh harga, stok, dan banner ke data bawaan awal toko.
                  </p>
                  <button
                    onClick={async () => {
                      if (window.confirm('Yakin ingin mengembalikan seluruh data toko ke pengaturan awal?')) {
                        const res = await resetToDefaults();
                        if (res.ok) notifyFeedback('success', 'Data toko berhasil dikembalikan ke pengaturan awal!');
                        else notifyFeedback('error', `Gagal reset data: ${res.error}`);
                      }
                    }}
                    className="px-4 py-2 bg-[#EF4444]/15 hover:bg-[#EF4444] text-[#EF4444] hover:text-[#0B0D11] border border-[#EF4444]/40 font-mono text-xs font-bold rounded-lg cursor-pointer transition-all shrink-0"
                  >
                    Reset Data Awal
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
