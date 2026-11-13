import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight, CheckCircle2, Copy } from 'lucide-react';
import { BRAND_CONFIG } from '../data/tacticalData';
import { useStore } from '../context/StoreContext';

interface HeroSliderProps {
  onSelectProduct?: (productId: string) => void;
  onOpenCart?: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ onSelectProduct }) => {
  const { heroSlides } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const safeIndex = Math.min(currentIndex, Math.max(0, heroSlides.length - 1));
  const activeSlide = heroSlides[safeIndex] || heroSlides[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    if (isPaused) return;

    slideTimerRef.current = setTimeout(() => {
      handleNext();
    }, 7000);

    return () => {
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    };
  }, [currentIndex, isPaused]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <section 
      id="promo-hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 tactical-grid-bg"
    >
      {/* Tactical Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-1/4 w-[400px] h-[400px] bg-[#F8B704]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-[#F8B704]/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Main Tactical Glass Container with Concrete Sheen & Chamfered Angles */}
        <div className="military-glass-elevated rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative overflow-hidden border border-white/15">
          
          {/* Top Specular Sheen */}
          <div className="absolute inset-x-0 top-0 h-24 specular-sheen pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />

          {/* Animated Slide Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-center"
            >
              
              {/* IMAGE STAGE (DOMINANT VISUAL): Order-1 on mobile so it commands the top of screen */}
              <div className="order-1 lg:order-2 lg:col-span-7 xl:col-span-8 w-full flex items-center justify-center">
                <div className="relative w-full aspect-[3/2] rounded-xl border border-white/15 bg-[#12151C] overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
                  {/* Main Product Poster from Artboard */}
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.headline}
                    className="w-full h-full object-cover object-center transform group-hover:scale-[1.015] transition-transform duration-700 brightness-100 contrast-105"
                  />
                </div>
              </div>

              {/* MINIMAL CONTENT COLUMN: Order-2 on mobile, clean typographic hierarchy */}
              <div className="order-2 lg:order-1 lg:col-span-5 xl:col-span-4 flex flex-col items-start w-full">
                
                {/* Official Brand Badge & Price Tag */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 h-7 px-3 bg-[#F8B704]/15 border border-[#F8B704]/40 text-[#F8B704] chamfer-tactical-sm text-[11px] font-mono font-bold tracking-wider uppercase backdrop-blur-sm">
                    <img 
                      src={BRAND_CONFIG.iconLogoUrl} 
                      alt="Emblem" 
                      className="w-3.5 h-3.5 object-contain" 
                    />
                    {activeSlide.badge}
                  </span>

                  <span className="inline-flex items-center h-7 px-3 bg-white/5 border border-white/10 text-[#F8B704] chamfer-tactical-sm text-xs font-mono font-black tracking-wide">
                    {activeSlide.priceDisplay}
                  </span>
                </div>

                {/* Big Punchy Headline */}
                <div className="mt-2.5 sm:mt-3 space-y-1">
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-black tracking-tight text-[#F8FAFC] uppercase leading-[1.08]">
                    {activeSlide.headline}
                  </h1>
                  <div className="font-display text-base sm:text-lg lg:text-xl font-bold text-[#F8B704] tracking-wide uppercase">
                    {activeSlide.highlightText}
                  </div>
                </div>

                {/* Brief 1-2 line subtext */}
                <p className="text-xs sm:text-sm text-[#94A3B8] font-normal leading-relaxed mt-2 line-clamp-2 max-w-lg">
                  {activeSlide.subtext}
                </p>

                {/* Quick Specs Chips (Precise 3-Grid) */}
                <div className="grid grid-cols-3 gap-2 w-full max-w-md mt-3 sm:mt-4">
                  {activeSlide.specsHighlight.map((spec, i) => (
                    <div 
                      key={i} 
                      className="bg-white/5 border border-white/10 px-2.5 py-1.5 chamfer-tactical-sm backdrop-blur-md transition-all hover:border-[#F8B704]/40"
                    >
                      <div className="text-[9px] font-mono tracking-wider text-[#64748B] uppercase">
                        {spec.label}
                      </div>
                      <div className="font-display text-xs sm:text-sm font-bold text-[#F8FAFC] tracking-wide mt-0.5 truncate">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action CTA & Promo Voucher (Same Height h-11 for exact baseline precision) */}
                <div className="flex flex-wrap items-center gap-2.5 mt-4 sm:mt-5 w-full">
                  <a
                    href="#catalog"
                    onClick={() => onSelectProduct?.(activeSlide.productId || 'brotrher-marabunta-rocky')}
                    className="h-11 px-6 sm:px-7 bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] font-display text-base font-black tracking-wider uppercase inline-flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-[0_0_20px_rgba(248,183,4,0.3)] cursor-pointer chamfer-tactical shrink-0"
                  >
                    <span>{activeSlide.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  {/* Promo Voucher Copy Pill */}
                  {activeSlide.promoCode && (
                    <button
                      onClick={() => copyCode(activeSlide.promoCode!)}
                      className="h-11 px-3.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#F8B704] text-[#F8FAFC] font-mono text-xs font-bold inline-flex items-center gap-2 chamfer-tactical-sm transition-all cursor-pointer shrink-0"
                      title="Salin voucher diskon"
                    >
                      <span className="text-[#94A3B8]">KODE:</span>
                      <span className="text-[#F8B704] tracking-wider font-extrabold">{activeSlide.promoCode}</span>
                      {copiedCode === activeSlide.promoCode ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#94A3B8]" />
                      )}
                    </button>
                  )}
                </div>

              </div>

            </motion.div>
          </AnimatePresence>

          {/* Slider Controls with 3 Official Model Quick Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 pt-5 sm:pt-6 border-t border-white/10 mt-6 sm:mt-7">
            
            {/* Quick Model Selector Tabs with Thumbnails */}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-2.5 w-full sm:w-auto">
              {heroSlides.map((slide, idx) => {
                const isActive = currentIndex === idx;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-12 flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 text-left transition-all cursor-pointer chamfer-tactical-sm border w-full sm:w-auto ${
                      isActive
                        ? 'bg-[#F8B704]/20 border-[#F8B704] text-[#F8B704] shadow-[0_0_15px_rgba(248,183,4,0.25)]'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded shrink-0 overflow-hidden bg-black/60 border border-white/10">
                      <img 
                        src={slide.image} 
                        alt={slide.featuredTag || slide.headline} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] font-mono text-[#64748B] uppercase leading-none block">
                        SERI 0{idx + 1}
                      </div>
                      <div className="text-xs font-display font-black tracking-wide truncate uppercase block mt-1">
                        {slide.featuredTag || slide.headline}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Next/Prev Arrow Controls with Symmetrical Sizing */}
            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t border-white/5 sm:border-0">
              <span className="text-[11px] font-mono text-[#94A3B8] font-bold tracking-wider px-2">
                0{currentIndex + 1} / 0{heroSlides.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 flex items-center justify-center military-glass hover:bg-white/10 text-[#94A3B8] hover:text-[#F8B704] transition-all cursor-pointer border border-white/10 chamfer-tactical-sm"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 flex items-center justify-center military-glass hover:bg-white/10 text-[#94A3B8] hover:text-[#F8B704] transition-all cursor-pointer border border-white/10 chamfer-tactical-sm"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
