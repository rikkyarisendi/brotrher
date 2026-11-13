import React from 'react';
import { Shield, Star, Cpu, Award } from 'lucide-react';
import { TECH_PILLARS } from '../data/tacticalData';

export const TechFeaturesGrid: React.FC = () => {
  const icons = [
    <Shield className="w-6 h-6 text-[#F8B704]" key="shield" />,
    <Star className="w-6 h-6 text-[#F8B704] fill-[#F8B704]/25" key="star" />,
    <Award className="w-6 h-6 text-[#F8B704]" key="award" />,
    <Cpu className="w-6 h-6 text-[#F8B704]" key="cpu" />,
  ];

  return (
    <section id="tech-specs" className="py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 military-glass text-[11px] font-mono font-bold text-[#F8B704] chamfer-tactical-sm uppercase tracking-wider mb-2">
            STANDAR KUALITAS BROTRHER BOOTS
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#F8FAFC] leading-tight">
            KUALITAS TEMPUR KULIT SAPI ASLI
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] font-mono mt-1.5 leading-relaxed max-w-2xl mx-auto">
            Diproduksi langsung oleh pengrajin berpengalaman dengan material pilihan untuk ketahanan tugas dinas harian & operasi lapangan.
          </p>
        </div>

        {/* 4 Pillars Grid in iOS Military Glass */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TECH_PILLARS.map((pillar, idx) => (
            <div
              key={pillar.code}
              className="military-glass-card rounded-lg p-6 transition-all group flex flex-col justify-between border border-white/10"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 chamfer-tactical-sm bg-white/5 border border-white/15 flex items-center justify-center group-hover:border-[#F8B704] transition-colors">
                    {icons[idx]}
                  </div>
                  <span className="text-[11px] font-mono text-[#64748B] tracking-wider">
                    [{pillar.code}]
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold tracking-wide uppercase text-[#F8FAFC] group-hover:text-[#F8B704] transition-colors">
                  {pillar.title}
                </h3>

                <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#64748B]">STANDAR:</span>
                <span className="text-[#F8B704] font-bold">{pillar.metric}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
