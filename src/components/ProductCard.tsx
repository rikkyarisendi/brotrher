import React, { useState } from 'react';
import { Eye, Check, ShoppingBasket, Edit3 } from 'lucide-react';
import { Product } from '../types/tactical';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, selectedSize: number) => void;
  onQuickView: (product: Product) => void;
  isAdminLoggedIn?: boolean;
  onAdminEditProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
  isAdminLoggedIn = false,
  onAdminEditProduct,
}) => {
  const [justAdded, setJustAdded] = useState(false);

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const handleAdd = () => {
    // Default standard size 42
    onAddToCart(product, 42);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div className="military-glass-card rounded-lg overflow-hidden flex flex-col justify-between group relative border border-white/10 hover:border-[#F8B704]/40">
      
      {/* Top Specular Sheen */}
      <div className="absolute inset-x-0 top-0 h-16 specular-sheen pointer-events-none rounded-t-lg" />

      {/* Media & Details */}
      <div>
        
        {/* Product Image Frame */}
        <div className="relative aspect-4/3 bg-[#0E1015] overflow-hidden border-b border-white/10">
          
          {/* Badge Overlay (Top Left: Only Promo Badge) */}
          {product.badge && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="bg-[#F8B704] text-[#0B0D11] font-display text-[10px] font-black px-2 py-0.5 uppercase tracking-wider chamfer-tactical-sm shadow-md block">
                {product.badge}
              </span>
            </div>
          )}

          {/* Stock Counter Pill (Bottom Right: Minimal with Radar Pulse) */}
          <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none">
            <span className="bg-black/85 border border-[#22C55E]/30 text-[#4ADE80] text-[9.5px] font-mono font-bold px-2 py-0.5 flex items-center gap-1.5 rounded-sm backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-80" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]" />
              </span>
              <span>SISA {product.stockRemaining} PASANG</span>
            </span>
          </div>

          {/* Top-Right Action Controls: Admin Edit (only when logged in) + Quick View */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
            {isAdminLoggedIn && onAdminEditProduct && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdminEditProduct(product);
                }}
                className="h-7 px-2 rounded bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] border border-[#0B0D11]/20 font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all backdrop-blur-md cursor-pointer shadow-md"
                title="Edit Produk (Khusus Admin)"
                aria-label="Edit Produk"
              >
                <Edit3 className="w-3 h-3" />
                <span>EDIT</span>
              </button>
            )}

            <button
              onClick={() => onQuickView(product)}
              className="p-1.5 rounded bg-black/75 hover:bg-[#F8B704] text-[#94A3B8] hover:text-[#0B0D11] border border-white/15 transition-all backdrop-blur-md cursor-pointer shadow-sm group/eye"
              title="Lihat Detail Cepat"
              aria-label="Detail Produk Cepat"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Product Image */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-95 contrast-105"
            loading="lazy"
            decoding="async"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#13161C] via-transparent to-transparent opacity-70 pointer-events-none" />
        </div>

        {/* Content Body */}
        <div className="p-5">
          
          <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] mb-1">
            <span className="text-[#F8B704] font-bold">[{product.code}]</span>
            <span className="uppercase tracking-wider text-[#94A3B8]">{product.categoryLabel}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC] group-hover:text-[#F8B704] transition-colors leading-tight line-clamp-1 uppercase">
            {product.name}
          </h3>

          {/* Tagline */}
          <p className="text-xs text-[#94A3B8] mt-1.5 line-clamp-2 leading-relaxed font-normal">
            {product.tagline}
          </p>

          {/* Price Block */}
          <div className="mt-3.5 flex items-baseline gap-2.5">
            <span className="font-display text-2xl sm:text-3xl font-black text-[#F8B704] tracking-tight">
              {formatRupiah(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-[#64748B] line-through font-mono">
                {formatRupiah(product.originalPrice)}
              </span>
            )}
            {Boolean(product.discountPercent && product.discountPercent > 0) && (
              <span className="text-[10px] font-mono font-bold text-[#22C55E] bg-[#22C55E]/15 border border-[#22C55E]/30 px-2 py-0.5 chamfer-tactical-sm">
                DISKON {product.discountPercent}%
              </span>
            )}
          </div>

        </div>

      </div>

      {/* Specs Footer & Action Button */}
      <div>
        <div className="border-t border-white/10 bg-black/25 px-5 py-3 text-[11px] font-mono grid grid-cols-2 gap-2 text-[#94A3B8]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-[#64748B]">BAHAN:</span>
            <span
              className={`font-semibold truncate ${
                product.categories?.includes('kombinasi-cordura') ||
                product.specs.material.toLowerCase().includes('cordura') ||
                product.specs.material.toLowerCase().includes('webbing')
                  ? 'text-[#38BDF8]'
                  : 'text-[#F8FAFC]'
              }`}
              title={product.specs.material}
            >
              {product.categories?.includes('kombinasi-cordura') ||
              product.specs.material.toLowerCase().includes('cordura') ||
              product.specs.material.toLowerCase().includes('webbing')
                ? 'Kulit + Cordura'
                : 'Full Kulit Sapi'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-[#64748B]">TALI:</span>
            <span className="text-[#F8B704] font-semibold truncate" title={product.specs.lacing}>
              {product.categories?.includes('tali-putar') || product.name.toLowerCase().includes('fitgo')
                ? 'Tali Putar (Fitgo)'
                : product.id === 'brotrher-pdh-sus' || product.specs.lacing.toLowerCase().includes('slip-on')
                ? 'Slip-on / Resleting'
                : 'Tali Biasa'}
            </span>
          </div>
        </div>

        {/* Clean Full-Width Tactical Amber Action Button: Pesan Sekarang with Dual Opposite Chamfer */}
        <div className="p-4 bg-white/5 border-t border-white/10">
          <button
            onClick={handleAdd}
            className={`w-full h-12 chamfer-tactical font-display text-base font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
              justAdded
                ? 'bg-[#22C55E] text-[#0B0D11]'
                : 'bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] hover:shadow-[0_0_20px_rgba(248,183,4,0.5)] active:scale-[0.98]'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>DITAMBAHKAN KE KERANJANG</span>
              </>
            ) : (
              <>
                <ShoppingBasket className="w-4 h-4 fill-current" />
                <span>MASUKAN KERANJANG</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
