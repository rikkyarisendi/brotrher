import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, Shield, Sparkles, ChevronDown, Check, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types/tactical';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';

interface ProductCatalogProps {
  onAddToCart: (product: Product, selectedSize: number) => void;
  onQuickView: (product: Product) => void;
  isAdminLoggedIn?: boolean;
  onAdminEditProduct?: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onAddToCart,
  onQuickView,
  isAdminLoggedIn = false,
  onAdminEditProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'all', label: 'SEMUA' },
    { id: 'pdl', label: 'PDL' },
    { id: 'pdh', label: 'PDH' },
    { id: 'tali-putar', label: 'TALI PUTAR' },
    { id: 'tali-biasa', label: 'TALI BIASA' },
    { id: 'full-kulit', label: 'FULL KULIT' },
    { id: 'kombinasi-cordura', label: 'KOMBINASI CORDURA' },
  ];

  const sortOptions = [
    { id: 'featured', label: 'REKOMENDASI' },
    { id: 'price-low', label: 'HARGA: TERMURAH' },
    { id: 'price-high', label: 'HARGA: TERTINGGI' },
    { id: 'rating', label: 'RATING & ULASAN TERTINGGI' },
  ];

  // Responsive items count: 6 on desktop/tablet, 3 on mobile
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });

  // Category Tabs Scroll Management & Drag-to-Scroll
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkTabsScroll = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  };

  useEffect(() => {
    checkTabsScroll();
    const handleResize = () => {
      checkTabsScroll();
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const amount = direction === 'left' ? -220 : 220;
      tabsContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(checkTabsScroll, 300);
    }
  };

  const handleTabsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (tabsContainerRef.current) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        tabsContainerRef.current.scrollLeft += e.deltaY;
        checkTabsScroll();
      }
    }
  };

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tabsContainerRef.current) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - tabsContainerRef.current.offsetLeft;
    scrollLeftRef.current = tabsContainerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !tabsContainerRef.current) return;
    const x = e.pageX - tabsContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current);
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    tabsContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
    checkTabsScroll();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const [pageSizeChoice, setPageSizeChoice] = useState<'auto' | number | 'all'>('auto');
  const itemsPerPage = useMemo(() => {
    if (pageSizeChoice === 'all') return 999;
    if (typeof pageSizeChoice === 'number') return pageSizeChoice;
    return isMobile ? 4 : 6;
  }, [pageSizeChoice, isMobile]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { products } = useStore();

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'all') {
      result = result.filter(
        (p) => p.category === selectedCategory || p.categories?.includes(selectedCategory)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.specs.material.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Reset to first page when category, search query, or sort order changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, startIndex, endIndex]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const catalogElement = document.getElementById('catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper to generate smart pagination numbers
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (validCurrentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (validCurrentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages);
    }
    return pages;
  }, [totalPages, validCurrentPage]);

  const activeSortLabel = sortOptions.find((o) => o.id === sortBy)?.label || 'REKOMENDASI PABRIKAN';

  return (
    <section id="catalog" className="py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="military-glass rounded-xl p-5 sm:p-7 mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5 border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.4)]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F8B704]/15 border border-[#F8B704]/40 text-[#F8B704] text-[11px] font-mono font-bold tracking-wider uppercase chamfer-tactical-sm mb-2">
              <Shield className="w-3.5 h-3.5 text-[#F8B704]" />
              <span>KATALOG RESMI BROTRHER BOOTS INDONESIA</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-[#F8FAFC] tracking-tight leading-tight">
             SEPATU DINAS PDL / PDH KULIT ASLI
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] font-mono mt-1.5 leading-relaxed">
              PRODUKSI LANGSUNG PABRIKAN • KULIT SAPI ASLI GRADE A • SOL JAHIT KELILING
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="h-9 text-xs font-mono bg-white/5 border border-white/10 px-3.5 chamfer-tactical-sm text-[#94A3B8] inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
              <span>TERSEDIA:</span>
              <span className="text-[#F8B704] font-bold">{filteredProducts.length} MODEL AKTIF</span>
            </div>

            <div className="h-9 text-xs font-mono bg-[#F8B704]/15 border border-[#F8B704]/40 text-[#F8B704] px-3.5 chamfer-tactical-sm font-bold inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BISA BAYAR DI TEMPAT (COD)</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar with Unified h-11 Height */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 sm:gap-4 mb-6 sm:mb-8">
          
          {/* Tactical Category Tabs Container with Scroll Buttons & Drag-to-Scroll */}
          <div className="relative flex items-center min-w-0 max-w-full flex-1 overflow-hidden group">
            
            {/* Scroll Left Arrow Button */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollTabs('left')}
                className="absolute left-0 z-20 h-11 w-9 bg-gradient-to-r from-[#0F1115] via-[#0F1115]/95 to-transparent flex items-center justify-start text-[#F8B704] hover:text-white transition-all cursor-pointer pl-1 drop-shadow-md"
                title="Geser kategori ke kiri"
                aria-label="Geser kategori ke kiri"
              >
                <ChevronLeft className="w-5 h-5 drop-shadow-[0_0_8px_rgba(248,183,4,0.7)]" />
              </button>
            )}

            {/* Scrollable Tabs Track */}
            <div
              ref={tabsContainerRef}
              onScroll={checkTabsScroll}
              onWheel={handleTabsWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scroll-smooth overscroll-x-contain touch-pan-x min-w-0 w-full cursor-grab active:cursor-grabbing select-none scrollbar-none px-0.5"
              style={{
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={(e) => {
                      if (!hasDraggedRef.current) {
                        setSelectedCategory(cat.id);
                        e.currentTarget.scrollIntoView({
                          behavior: 'smooth',
                          block: 'nearest',
                          inline: 'center',
                        });
                      }
                    }}
                    className={`h-11 font-display text-xs sm:text-sm font-bold tracking-wider px-4 sm:px-5 chamfer-tactical-sm whitespace-nowrap transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-[#F8B704] text-[#0B0D11] shadow-[0_0_16px_rgba(248,183,4,0.4)] font-black'
                        : 'military-glass text-[#94A3B8] hover:text-[#F8FAFC] hover:border-white/20'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Arrow Button */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => scrollTabs('right')}
                className="absolute right-0 z-20 h-11 w-9 bg-gradient-to-l from-[#0F1115] via-[#0F1115]/95 to-transparent flex items-center justify-end text-[#F8B704] hover:text-white transition-all cursor-pointer pr-1 drop-shadow-md"
                title="Geser kategori ke kanan"
                aria-label="Geser kategori ke kanan"
              >
                <ChevronRight className="w-5 h-5 drop-shadow-[0_0_8px_rgba(248,183,4,0.7)]" />
              </button>
            )}

          </div>

          {/* Search & Custom Tactical Sort Dropdown */}
          <div className="flex items-center gap-2.5">
            
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari model (mis. Tawon, Lantas, Mamba, PM)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-3.5 military-glass text-xs font-mono text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F8B704] focus:outline-none transition-all chamfer-tactical-sm"
              />
            </div>

            {/* Custom Tactical Sort Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className={`h-11 px-4 military-glass text-xs font-mono text-[#F8FAFC] flex items-center gap-2.5 border transition-all cursor-pointer chamfer-tactical-sm ${
                  sortDropdownOpen ? 'border-[#F8B704] bg-[#1E232E]' : 'border-white/10 hover:border-white/25'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#F8B704]" />
                <span className="font-semibold">{activeSortLabel}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 ${
                    sortDropdownOpen ? 'rotate-180 text-[#F8B704]' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {sortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 w-64 z-30 military-glass-elevated border border-[#F8B704]/40 shadow-[0_16px_40px_rgba(0,0,0,0.85)] p-2 rounded-lg backdrop-blur-2xl"
                  >
                    <div className="text-[10px] font-mono uppercase text-[#64748B] px-3 py-1 border-b border-white/10 mb-1">
                    URUTKAN BERDASARKAN
                    </div>
                    {sortOptions.map((opt) => {
                      const isActive = sortBy === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setSortBy(opt.id);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 chamfer-tactical-sm text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[#F8B704]/15 text-[#F8B704] font-bold'
                              : 'text-[#94A3B8] hover:bg-white/5 hover:text-[#F8FAFC]'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isActive && <Check className="w-3.5 h-3.5 text-[#F8B704]" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

        {/* Product Cards Grid: 1 col on mobile, 2 col on tablet, 3 col on desktop */}
        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onQuickView={onQuickView}
                  isAdminLoggedIn={isAdminLoggedIn}
                  onAdminEditProduct={onAdminEditProduct}
                />
              ))}
            </div>

            {/* Tactical Pagination / Navigator Controls */}
            <div className="mt-10 sm:mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Status Indicator & View Density Selector */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#94A3B8]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#F8B704]" />
                  <span>
                    MENAMPILKAN <strong className="text-[#F8B704]">{startIndex + 1}-{endIndex}</strong> DARI <strong className="text-[#F8FAFC]">{filteredProducts.length}</strong> MODEL
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-0.5 rounded-md text-[11px]">
                  <span className="text-[#64748B] px-1.5 hidden sm:inline">TAMPIL:</span>
                  <button
                    type="button"
                    onClick={() => { setPageSizeChoice('auto'); setCurrentPage(1); }}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      pageSizeChoice === 'auto'
                        ? 'bg-[#F8B704] text-[#0B0D11] font-bold shadow-sm'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {isMobile ? '4' : '6'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPageSizeChoice(12); setCurrentPage(1); }}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      pageSizeChoice === 12
                        ? 'bg-[#F8B704] text-[#0B0D11] font-bold shadow-sm'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    12
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPageSizeChoice(24); setCurrentPage(1); }}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      pageSizeChoice === 24
                        ? 'bg-[#F8B704] text-[#0B0D11] font-bold shadow-sm'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    24
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPageSizeChoice('all'); setCurrentPage(1); }}
                    className={`px-2.5 py-0.5 rounded transition-all cursor-pointer ${
                      pageSizeChoice === 'all'
                        ? 'bg-[#F8B704] text-[#0B0D11] font-black shadow-sm'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    SEMUA ({filteredProducts.length})
                  </button>
                </div>
              </div>

              {/* Tactical Page Navigation Buttons */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Prev Page */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(validCurrentPage - 1)}
                    disabled={validCurrentPage <= 1}
                    className={`h-10 px-3 sm:px-4 text-xs font-mono font-bold chamfer-tactical-sm flex items-center gap-1.5 transition-all ${
                      validCurrentPage <= 1
                        ? 'bg-white/5 text-white/25 border border-white/5 cursor-not-allowed'
                        : 'military-glass text-[#F8FAFC] border-white/15 hover:border-[#F8B704] hover:text-[#F8B704] cursor-pointer'
                    }`}
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">SEBELUMNYA</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {pageNumbers.map((p, idx) => {
                      if (p === '...') {
                        return (
                          <span
                            key={`dots-${idx}`}
                            className="w-8 h-10 flex items-center justify-center text-xs font-mono text-[#64748B]"
                          >
                            ...
                          </span>
                        );
                      }

                      const isCurrent = p === validCurrentPage;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handlePageChange(p as number)}
                          className={`w-9 sm:w-10 h-10 text-xs font-mono font-bold chamfer-tactical-sm transition-all cursor-pointer flex items-center justify-center ${
                            isCurrent
                              ? 'bg-[#F8B704] text-[#0B0D11] border border-[#F8B704] shadow-[0_0_14px_rgba(248,183,4,0.4)] font-black'
                              : 'military-glass text-[#94A3B8] border-white/10 hover:text-[#F8FAFC] hover:border-white/25'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Page */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(validCurrentPage + 1)}
                    disabled={validCurrentPage >= totalPages}
                    className={`h-10 px-3 sm:px-4 text-xs font-mono font-bold chamfer-tactical-sm flex items-center gap-1.5 transition-all ${
                      validCurrentPage >= totalPages
                        ? 'bg-white/5 text-white/25 border border-white/5 cursor-not-allowed'
                        : 'military-glass text-[#F8FAFC] border-white/15 hover:border-[#F8B704] hover:text-[#F8B704] cursor-pointer'
                    }`}
                    title="Halaman Selanjutnya"
                  >
                    <span className="hidden sm:inline">SELANJUTNYA</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="military-glass rounded-3xl p-12 text-center max-w-md mx-auto">
            <SlidersHorizontal className="w-10 h-10 text-[#64748B] mx-auto mb-3" />
            <h4 className="font-display text-xl font-bold uppercase text-[#F8FAFC]">
              SEPATU TIDAK DITEMUKAN
            </h4>
            <p className="text-xs text-[#94A3B8] font-mono mt-1">
              Silakan cari dengan kata kunci lain atau pilih semua kategori.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-5 py-2.5 bg-[#F8B704] text-[#0B0D11] font-display font-bold text-xs uppercase rounded-lg cursor-pointer transition-all hover:bg-[#FFC82D]"
            >
              RESET PENCARIAN
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
