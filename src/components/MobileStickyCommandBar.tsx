import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Flame, ShieldCheck, Truck, ChevronDown, ChevronUp } from 'lucide-react';

interface MobileStickyCommandBarProps {
  cartItems: any[];
  onOpenCart: () => void;
  onQuickCheckout: () => void;
  isMinimized: boolean;
  onToggleMinimize: (minimized: boolean) => void;
}

export const MobileStickyCommandBar: React.FC<MobileStickyCommandBarProps> = ({
  onOpenCart,
  onQuickCheckout,
  isMinimized,
  onToggleMinimize,
}) => {
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

  // CTA tiap penawaran — sebelumnya semuanya cuma <a href="#catalog">,
  // padahal App sudah menyediakan onOpenCart & onQuickCheckout (buka drawer keranjang).
  const offers = [
    {
      icon: <Flame className="w-4 h-4 text-[#F8B704] fill-[#F8B704] shrink-0 animate-bounce" />,
      tag: 'PROMO HARI INI',
      text: 'DISKON S/D 20% + BONUS KAOS KAKI TEBAL BROTRHER',
      cta: 'KLAIM PROMO',
      action: 'catalog' as const,
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0" />,
      tag: 'GARANSI PABRIK',
      text: '100% KULIT SAPI ASLI • GARANSI TUKAR UKURAN',
      cta: 'PESAN SEKARANG',
      action: 'cart' as const,
    },
    {
      icon: <Truck className="w-4 h-4 text-[#F8B704] shrink-0" />,
      tag: 'KEMUDAHAN ORDER',
      text: 'BISA COD (BAYAR DI TEMPAT) SE-INDONESIA',
      cta: 'AMBIL SEKARANG',
      action: 'checkout' as const,
    },
  ];

  // Auto-looping animation every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [offers.length]);

  const activeOffer = offers[currentOfferIndex];

  return (
    <div className="fixed bottom-3.5 inset-x-3.5 sm:inset-x-8 z-40 pb-[env(safe-area-inset-bottom)] pointer-events-none">
      {/* Saat minimize, pill menempel ke tepi kanan layar (tanpa max-w-4xl) supaya
          berdampingan dengan tombol scroll-to-top; saat maximize, bar tetap
          di tengah dengan lebar max-w-4xl seperti sebelumnya. */}
      <div className={isMinimized ? 'flex justify-end' : 'max-w-4xl mx-auto flex justify-end'}>
        {/* mode="popLayout": bar keluar dan pill masuk BERSAMAAN. Sebelumnya
            mode="wait" menunggu bar selesai hilang dulu baru pill muncul,
            sehingga transisinya terasa kesendat. */}
        <AnimatePresence mode="popLayout">
          {!isMinimized ? (
            /* ================= FULL EXPANDED COMMAND BAR ================= */
            <motion.div
              key="expanded-bar"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="w-full military-glass-dock rounded-lg px-3.5 sm:px-6 py-2.5 sm:py-3 border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.85)] flex items-center justify-between gap-2.5 sm:gap-3 overflow-hidden backdrop-blur-2xl pointer-events-auto"
            >
              {/* Animated Looping Offer Ticker */}
              <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentOfferIndex}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex items-center gap-2 truncate"
                  >
                    {activeOffer.icon}
                    <div className="flex items-center gap-2 truncate">
                      <span className="hidden sm:inline-block px-2.5 py-0.5 chamfer-tactical-sm bg-[#F8B704]/15 border border-[#F8B704]/40 text-[#F8B704] font-mono text-[9px] font-bold uppercase shrink-0">
                        {activeOffer.tag}
                      </span>
                      <span className="font-display text-xs sm:text-base font-extrabold text-[#F8FAFC] tracking-wide truncate uppercase">
                        {activeOffer.text}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Side: CTA Button + Minimize Button */}
              <div className="shrink-0 flex items-center gap-2">
                {activeOffer.action === 'catalog' ? (
                  <a
                    href="#catalog"
                    className="h-9 sm:h-11 px-3.5 sm:px-6 bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] font-display text-xs sm:text-sm font-black tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-[0_0_18px_rgba(248,183,4,0.4)] hover:shadow-[0_0_24px_rgba(248,183,4,0.6)] active:scale-95 transition-all cursor-pointer chamfer-tactical"
                  >
                    <span>{activeOffer.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={activeOffer.action === 'checkout' ? onQuickCheckout : onOpenCart}
                    className="h-9 sm:h-11 px-3.5 sm:px-6 bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] font-display text-xs sm:text-sm font-black tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-[0_0_18px_rgba(248,183,4,0.4)] hover:shadow-[0_0_24px_rgba(248,183,4,0.6)] active:scale-95 transition-all cursor-pointer chamfer-tactical"
                  >
                    <span>{activeOffer.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Minimize Trigger Button */}
                <button
                  type="button"
                  onClick={() => onToggleMinimize(true)}
                  className="p-1.5 sm:p-2 rounded chamfer-tactical-sm bg-black/40 hover:bg-[#F8B704]/20 text-[#94A3B8] hover:text-[#F8B704] border border-white/10 hover:border-[#F8B704]/40 transition-all cursor-pointer"
                  title="Sembunyikan Overlay (Minimize)"
                  aria-label="Sembunyikan Overlay"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* ================= MINIMIZED FLOATING TRIGGER ================= */
            <motion.button
              key="minimized-pill"
              initial={{ opacity: 0, y: 25, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 25, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              type="button"
              onClick={() => onToggleMinimize(false)}
              className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg military-glass-dock border border-[#F8B704]/70 bg-[#0B0D11]/90 shadow-[0_12px_32px_rgba(0,0,0,0.85)] hover:shadow-[0_0_20px_rgba(248,183,4,0.45)] hover:border-[#F8B704] transition-all cursor-pointer group"
              title="Klik untuk membuka penawaran promo"
              aria-label="Buka Promo Hari Ini"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F8B704] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
              </span>
              <Flame className="w-4 h-4 text-[#F8B704] fill-[#F8B704] animate-bounce shrink-0" />
              <span className="font-display text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#F8FAFC] group-hover:text-[#F8B704] transition-colors">
                PROMO HARI INI
              </span>
              <span className="text-[10px] font-mono font-bold text-[#0B0D11] bg-[#F8B704] px-1.5 py-0.5 rounded">
                DISKON
              </span>
              <ChevronUp className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F8B704] group-hover:-translate-y-0.5 transition-all shrink-0" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
