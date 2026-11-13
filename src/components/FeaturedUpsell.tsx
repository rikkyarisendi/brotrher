import React from 'react';
import { ShieldCheck, Check, ArrowRight, Flame, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BRAND_CONFIG } from '../data/tacticalData';

export const FeaturedUpsell: React.FC = () => {
  const { upsellBundle } = useStore();

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const waMessage = [
    'Halo Admin Brotrher Boots Official!',
    `Saya ingin memesan *${upsellBundle.name}* (${formatRupiah(upsellBundle.bundlePrice)}):`,
    ...upsellBundle.items.map((item) => `- ${item}`),
    '',
    'Mohon info ketersediaan ukuran & proses pengirimannya. Terima kasih!',
  ].join('\n');

  const waUrl = `https://wa.me/${BRAND_CONFIG.whatsappDirect}?text=${encodeURIComponent(waMessage)}`;

  return (
    <section id="bundle-upsell" className="py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* iOS Military Glass Container with crisp tactical corners */}
        <div className="military-glass-elevated rounded-xl sm:rounded-2xl p-5 sm:p-8 lg:p-10 border border-[#F8B704]/40 hover:border-[#F8B704] transition-all shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
          
          <div className="absolute inset-x-0 top-0 h-24 specular-sheen pointer-events-none rounded-t-xl sm:rounded-t-2xl" />

          {/* Stamp Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F8B704] text-[#0B0D11] font-display text-xs font-black tracking-widest uppercase chamfer-tactical-sm mb-5 shadow-md">
            <Flame className="w-4 h-4 fill-current" />
            <span>PAKET KOMANDO SISA {upsellBundle.remainingSlots} SLOT HARI INI</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-[#F8FAFC] tracking-tight leading-tight">
                {upsellBundle.name}
              </h2>

              <div className="font-display text-lg sm:text-xl font-bold text-[#F8B704] tracking-wide uppercase">
                {upsellBundle.tagline}
              </div>

              {/* Items included */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">
                PAKET LENGKAP SIAP DINAS TEMPUR:
                </div>
                {upsellBundle.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 military-glass p-3.5 chamfer-tactical-sm text-xs sm:text-sm font-mono text-[#F8FAFC] border border-white/10"
                  >
                    <div className="w-5 h-5 chamfer-tactical-sm bg-[#22C55E]/15 border border-[#22C55E]/60 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Value Box */}
            <div className="lg:col-span-5 military-glass rounded-lg p-6 sm:p-8 flex flex-col justify-between space-y-6 border border-white/15">
              
              <div>
                <div className="text-xs font-mono text-[#64748B] uppercase tracking-widest mb-1">
                  TOTAL HARGA NORMAL:
                </div>
                <div className="text-lg line-through font-mono text-[#64748B]">
                  {formatRupiah(upsellBundle.totalRegularPrice)}
                </div>

                <div className="text-xs font-mono text-[#22C55E] uppercase tracking-widest mt-3">
                  HARGA BUNDLE RESMI:
                </div>
                <div className="font-display text-4xl sm:text-5xl font-black text-[#F8B704] tracking-tight">
                  {formatRupiah(upsellBundle.bundlePrice)}
                </div>

                <div className="mt-2 inline-block px-3 py-1 bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] text-xs font-mono font-bold chamfer-tactical-sm">
                  HEMAT: {formatRupiah(upsellBundle.savings)} + GRATIS GANTUNGAN KUNCI
                </div>
              </div>

              {/* Guarantees */}
              <div className="space-y-2 border-y border-white/10 py-3.5 text-xs font-mono text-[#94A3B8]">
                <div className="flex items-center gap-2 text-[#F8FAFC]">
                  <ShieldCheck className="w-4 h-4 text-[#F8B704]" />
                  <span>Jaminan 100% Produk Asli Brotrher Boots</span>
                </div>
                <div className="flex items-center gap-2 text-[#F8FAFC]">
                  <Sparkles className="w-4 h-4 text-[#22C55E]" />
                  <span>Gratis Ongkir & Bisa COD</span>
                </div>
              </div>

              {/* Action Button: Direct WhatsApp Order */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-4 bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] font-display text-base sm:text-lg font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_22px_rgba(248,183,4,0.4)] active:scale-95 cursor-pointer chamfer-tactical text-center"
              >
                <span>PESAN SEKARANG</span>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </a>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
