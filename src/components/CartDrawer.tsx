import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CartItem } from '../types/tactical';
import { BRAND_CONFIG } from '../data/tacticalData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, size: number, newQty: number) => void;
  onRemoveItem: (productId: string, size: number) => void;
  onClearCart: () => void;
}

const CartDrawerDialog: React.FC<CartDrawerProps> = ({
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Lock background scroll when drawer is open and restore on unmount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow || 'unset';
    };
  }, []);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discountAmount = Math.round(subtotal * (appliedDiscount / 100));
  const finalTotal = subtotal - discountAmount;

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'BROTRHER10' || code === 'GEN6OFFICIAL') {
      setAppliedDiscount(10);
      setPromoMessage('Voucher Diskon 10% Resmi Aktif!');
    } else if (code) {
      setPromoMessage('Kode tidak valid.');
    }
  };

  const handleCheckoutWhatsApp = () => {
    const itemLines = items.map(
      (it) => `- ${it.product.name} (Ukuran ${it.selectedSize}) x ${it.quantity} = ${formatRupiah(it.product.price * it.quantity)}`
    ).join('%0A');

    const discountLine = appliedDiscount > 0 ? `%0APotongan Diskon (${appliedDiscount}%): -${formatRupiah(discountAmount)}` : '';

    const message = `Halo CS Brotrher Boots Official!%0ASaya ingin memesan produk sepatu kulit asli berikut:%0A%0A${itemLines}${discountLine}%0A%0ATotal Akhir: ${formatRupiah(finalTotal)}%0A%0AMohon info ketersediaan stok & proses pengirimannya. Terima kasih!`;

    const waUrl = `https://wa.me/${BRAND_CONFIG.whatsappDirect}?text=${message}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#0B0D11]/85 backdrop-blur-md"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-screen max-w-md military-glass-elevated border-l border-white/15 shadow-2xl flex flex-col justify-between"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-white/10 bg-black/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F8B704] animate-pulse"></span>
              <h3 className="font-display text-xl font-extrabold uppercase text-[#F8FAFC] tracking-wider">
                KERANJANG PESANAN ({items.reduce((acc, it) => acc + it.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg military-glass text-[#94A3B8] hover:text-[#F8B704] transition-all cursor-pointer"
              aria-label="Tutup Keranjang"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 mx-auto rounded-full military-glass flex items-center justify-center text-[#64748B] mb-3">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h4 className="font-display text-xl font-bold uppercase text-[#F8FAFC]">
                  KERANJANG MASIH KOSONG
                </h4>
                <p className="text-xs font-mono text-[#94A3B8] mt-1 max-w-xs mx-auto">
                  Pilih sepatu Brotrher Boots kulit asli untuk memulai pesanan.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-6 py-3 bg-[#F8B704] text-[#0B0D11] font-display font-black text-sm uppercase chamfer-tactical shadow-lg cursor-pointer"
                >
                  LIHAT KATALOG PRODUK
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}`}
                  className="military-glass p-3.5 rounded-lg flex gap-3.5 items-center border border-white/10 relative group"
                >
                  <div className="w-16 h-16 rounded-md bg-black/40 border border-white/10 overflow-hidden shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#F8B704] font-bold">
                        [{item.product.code}]
                      </span>
                      <button
                        onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                        className="text-[#64748B] hover:text-[#EF4444] transition-colors cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-display text-base font-bold text-[#F8FAFC] truncate uppercase">
                      {item.product.name}
                    </h4>

                    <div className="text-[11px] font-mono text-[#22C55E] font-semibold">
                      Ukuran Dipilih: <span className="text-[#F8FAFC] font-bold">{item.selectedSize}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-display text-base font-extrabold text-[#F8B704]">
                        {formatRupiah(item.product.price * item.quantity)}
                      </span>

                      <div className="flex items-center border border-white/15 chamfer-tactical-sm bg-white/5">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                          className="p-1 hover:text-[#F8B704] transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs px-2 font-bold text-[#F8FAFC]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                          className="p-1 hover:text-[#F8B704] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Totals and Action */}
          {items.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-black/40 space-y-3">
              {/* Promo Code Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kode Voucher (Coba: BROTRHER10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 h-9 px-3.5 military-glass text-xs font-mono text-[#F8FAFC] uppercase placeholder-[#64748B] focus:border-[#F8B704] focus:outline-none chamfer-tactical-sm"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-4 bg-white/10 hover:bg-white/15 text-[#F8B704] text-xs font-mono font-bold border border-white/10 chamfer-tactical-sm cursor-pointer transition-colors"
                >
                  GUNAKAN
                </button>
              </div>

              {promoMessage && (
                <div className="text-[11px] font-mono text-[#22C55E] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                  <span>{promoMessage}</span>
                </div>
              )}

              {/* Subtotal & Final */}
              <div className="space-y-1 text-xs font-mono pt-1">
                <div className="flex justify-between text-[#94A3B8]">
                  <span>SUBTOTAL PESANAN:</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-[#22C55E]">
                    <span>DISKON VOUCHER ({appliedDiscount}%):</span>
                    <span>-{formatRupiah(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-[#F8FAFC] pt-1.5 border-t border-white/10">
                  <span>TOTAL PEMBAYARAN:</span>
                  <span className="text-[#F8B704] font-display text-2xl font-black">
                    {formatRupiah(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Direct Order Button with Dual Opposite Chamfer Cuts */}
              <button
                onClick={handleCheckoutWhatsApp}
                className="w-full h-12 bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] font-display text-base font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_22px_rgba(248,183,4,0.4)] cursor-pointer chamfer-tactical"
              >
                <span>PESAN SEKARANG VIA WHATSAPP</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-[10px] text-center font-mono text-[#64748B]">
                * Pengiriman langsung dari pusat produksi Brotrher Boots. Bisa COD.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export const CartDrawer: React.FC<CartDrawerProps> = (props) => {
  return (
    <AnimatePresence>
      {props.isOpen && <CartDrawerDialog {...props} />}
    </AnimatePresence>
  );
};
