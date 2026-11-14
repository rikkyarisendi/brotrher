import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ShoppingBasket, ShieldCheck, Sparkles, MessageCircleQuestion } from 'lucide-react';
import { Product } from '../types/tactical';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, selectedSize: number) => void;
}

interface QuickViewModalDialogProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, selectedSize: number) => void;
}

const QuickViewModalDialog: React.FC<QuickViewModalDialogProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [activeImg, setActiveImg] = useState<string>(product.image);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<number>(() => {
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes.includes(42) ? 42 : product.sizes[0];
    }
    return 42;
  });

  // Lock background scroll when modal dialog is mounted, unlock on unmount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow || 'unset';
    };
  }, []);

  // Update active image and selected size if product changes
  useEffect(() => {
    setActiveImg(product.image);
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes.includes(42) ? 42 : product.sizes[0]);
    }
  }, [product.image, product.sizes]);

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const handleAdd = () => {
    onAddToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  const availableSizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : [39, 40, 41, 42, 43, 44, 45];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#0B0D11]/85 backdrop-blur-md"
      />

      {/* Modal Positioning Container */}
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-6 py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl my-auto military-glass-elevated rounded-lg border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.9)] overflow-hidden z-10"
        >
          {/* Close Button - Exact same visual weight as Icon Views */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-30 p-1.5 rounded bg-black/75 hover:bg-[#F8B704] text-[#94A3B8] hover:text-[#0B0D11] border border-white/15 transition-all backdrop-blur-md cursor-pointer shadow-sm"
            aria-label="Tutup Modal"
            title="Tutup Modal"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] sm:max-h-none overflow-y-auto">
            {/* Left: Product Images Stage */}
            <div className="md:col-span-6 bg-black/40 p-5 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
              <div className="relative aspect-square w-full rounded-lg border border-white/10 overflow-hidden bg-[#11141A]">
                <img
                  src={activeImg}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Thumbnails */}
              {product.gallery && product.gallery.length > 1 && (
                <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                  {product.gallery.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImg(img)}
                      className={`w-16 h-16 chamfer-tactical-sm border overflow-hidden shrink-0 transition-all cursor-pointer ${
                        activeImg === img ? 'border-[#F8B704] ring-2 ring-[#F8B704]' : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumb ${i}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badge */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
                <span className="flex items-center gap-1.5 text-[#22C55E]">
                  <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                  100% KULIT SAPI ASLI
                </span>
                <span className="text-[#F8B704]">JAHIT KELILING 360°</span>
              </div>
            </div>

            {/* Right: Technical Specs & Action */}
            <div className="md:col-span-6 p-5 sm:p-7 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#F8B704] uppercase">
                  <span>[{product.code}]</span>
                  <span>•</span>
                  <span>{product.categoryLabel}</span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-extrabold uppercase text-[#F8FAFC] tracking-tight mt-1">
                  {product.name}
                </h3>

                <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                  {product.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-3.5 flex items-baseline gap-3">
                  <span className="font-display text-2xl sm:text-3xl font-black text-[#F8B704]">
                    {formatRupiah(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-[#64748B] line-through font-mono">
                      {formatRupiah(product.originalPrice)}
                    </span>
                  )}
                  {product.discountPercent && (
                    <span className="text-[10px] font-mono font-bold text-[#22C55E] bg-[#22C55E]/15 border border-[#22C55E]/30 px-2 py-0.5 chamfer-tactical-sm">
                      HEMAT {product.discountPercent}%
                    </span>
                  )}
                </div>

                {/* Interactive Size Selector */}
                <div className="mt-4 p-3 rounded-lg bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#F8FAFC] tracking-wider uppercase flex items-center gap-1.5">
                      <span>PILIH UKURAN (SIZE):</span>
                    </span>
                    <span className="text-xs font-mono text-[#F8B704] font-bold">
                      TERPILIH: SIZE {selectedSize}
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {availableSizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`py-2 text-xs font-mono font-bold rounded transition-all border cursor-pointer ${
                          selectedSize === sz
                            ? 'bg-[#F8B704] text-[#0B0D11] border-[#F8B704] font-black shadow-[0_0_12px_rgba(248,183,4,0.4)]'
                            : 'bg-[#181B22] text-[#94A3B8] border-white/10 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specifications Grid - Rapi, Terstruktur, Terbaca Jelas */}
                <div className="mt-4 p-3.5 rounded-lg military-glass border border-white/10 space-y-2.5">
                  <div className="text-[10px] font-mono font-bold text-[#F8B704] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-[#F8B704]" />
                    <span>SPESIFIKASI ASLI BROTRHER BOOTS:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-black/30 border border-white/5">
                      <div className="text-[10px] text-[#94A3B8] uppercase">Bahan Kulit:</div>
                      <div className="text-[#F8FAFC] font-semibold mt-0.5 text-[11px] leading-snug">
                        {product.specs.material}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-black/30 border border-white/5">
                      <div className="text-[10px] text-[#94A3B8] uppercase">Sol Bawah:</div>
                      <div className="text-[#F8FAFC] font-semibold mt-0.5 text-[11px] leading-snug">
                        {product.specs.outsole}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-[#22C55E]/10 border border-[#22C55E]/30">
                      <div className="text-[10px] text-[#22C55E] uppercase flex items-center gap-1 font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        Konstruksi Sol:
                      </div>
                      <div className="text-[#22C55E] font-bold mt-0.5 text-[11px] leading-snug">
                        {product.specs.craftsmanship}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-black/30 border border-white/5">
                      <div className="text-[10px] text-[#94A3B8] uppercase">Sistem Tali / Fitur:</div>
                      <div className="text-[#F8B704] font-semibold mt-0.5 text-[11px] leading-snug">
                        {product.specs.zipper || product.specs.lacing}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CS Size Confirmation Note */}
                <div className="mt-3 p-2.5 rounded bg-white/5 border border-white/10 flex items-center gap-2.5 text-[11px] font-mono text-[#94A3B8]">
                  <MessageCircleQuestion className="w-4 h-4 text-[#F8B704] shrink-0" />
                  <span>
                    Jika ragu ukuran kaki, CS kami siap bantu panduan ukur via WA setelah klik pesan.
                  </span>
                </div>
              </div>

              {/* Action Button: Pesan Sekarang with Selected Size */}
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleAdd}
                  className={`w-full h-12 chamfer-tactical font-display text-sm sm:text-base font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    added
                      ? 'bg-[#22C55E] text-[#0B0D11]'
                      : 'bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] shadow-[0_0_20px_rgba(248,183,4,0.45)]'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>SIZE {selectedSize} MASUK PESANAN</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBasket className="w-4 h-4 fill-current" />
                      <span>PESAN SEKARANG (SIZE {selectedSize})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  return (
    <AnimatePresence>
      {product && (
        <QuickViewModalDialog
          product={product}
          onClose={onClose}
          onAddToCart={onAddToCart}
        />
      )}
    </AnimatePresence>
  );
};
