import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { OPERATOR_REVIEWS, BRAND_CONFIG } from '../data/tacticalData';

export const OperatorReviews: React.FC = () => {
  return (
    <section id="reviews" className="py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="military-glass rounded-xl p-5 sm:p-7 mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5 border border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F8B704]/15 border border-[#F8B704]/40 text-[#F8B704] text-[11px] font-mono font-bold tracking-wider uppercase chamfer-tactical-sm mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F8B704]" />
              <span>TESTIMONI PEMBELI TERVERIFIKASI</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-[#F8FAFC] tracking-tight leading-tight">
              ULASAN REKAN DINAS & OPERATOR
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] font-mono mt-1.5 leading-relaxed">
              Ulasan asli dari rekan dinas TNI, POLRI & instansi kedinasan se-Indonesia.
            </p>
          </div>

          <div className="h-10 inline-flex items-center gap-2 text-xs font-mono military-glass px-4 chamfer-tactical-sm text-[#94A3B8] border border-white/10 shrink-0">
            <div className="flex text-[#F8B704]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#F8B704]" />
              ))}
            </div>
            <span className="text-[#F8FAFC] font-bold">4.9 / 5.0</span>
            <span className="text-[#64748B]">(12.000+ ULASAN RESMI)</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OPERATOR_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="military-glass-card rounded-lg p-6 flex flex-col justify-between transition-all border border-white/10"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-[#F8B704] gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#F8B704]" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-[#F8B704] bg-[#F8B704]/15 border border-[#F8B704]/30 px-2.5 py-0.5 chamfer-tactical-sm font-bold">
                    {rev.date}
                  </span>
                </div>

                <p className="text-sm text-[#F8FAFC] leading-relaxed mb-6 font-normal">
                  "{rev.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-display text-base font-bold text-[#F8B704] tracking-wide uppercase">
                    {rev.callsign}
                  </div>
                  <div className="text-[10px] font-mono text-[#94A3B8] tracking-wider uppercase">
                    {rev.unit}
                  </div>
                </div>

                <div className="text-[10px] font-mono text-[#64748B] text-right">
                  <div className="text-[#22C55E] flex items-center gap-1 justify-end font-semibold">
                    <ShieldCheck className="w-3 h-3 text-[#22C55E]" /> TERVERIFIKASI
                  </div>
                  <div className="truncate max-w-[130px] text-[#94A3B8]">{rev.boot}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
