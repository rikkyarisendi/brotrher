import React, { useState, useEffect } from 'react';
import { Flame, Clock, Truck, ShieldCheck, Sparkles } from 'lucide-react';

export const QuickDropBanner: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 48,
    seconds: 22,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDigits = (val: number) => String(val).padStart(2, '0');

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
      <div className="max-w-7xl mx-auto military-glass rounded-lg py-2.5 sm:py-3 px-4 sm:px-6 border border-white/10 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Left: Limited Promo Timer (Option 2) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F8B704]/15 border border-[#F8B704]/40 text-[#F8B704] chamfer-tactical-sm text-[11px] font-mono font-bold">
              <Flame className="w-3.5 h-3.5 text-[#F8B704] fill-[#F8B704] animate-bounce" />
              <span>PROMO TERBATAS HARI INI</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#F8FAFC] font-mono">
              <Clock className="w-3.5 h-3.5 text-[#F8B704]" />
              <span className="text-[#94A3B8] font-bold">BERAKHIR DALAM:</span>
              <span className="bg-black/50 border border-[#F8B704]/30 text-[#F8B704] px-2 py-0.5 chamfer-tactical-sm font-black">
                {formatDigits(timeLeft.hours)}
              </span>
              <span className="text-[#F8B704] font-bold">:</span>
              <span className="bg-black/50 border border-[#F8B704]/30 text-[#F8B704] px-2 py-0.5 chamfer-tactical-sm font-black">
                {formatDigits(timeLeft.minutes)}
              </span>
              <span className="text-[#F8B704] font-bold">:</span>
              <span className="bg-black/50 border border-[#F8B704]/30 text-[#F8B704] px-2 py-0.5 chamfer-tactical-sm font-black">
                {formatDigits(timeLeft.seconds)}
              </span>
            </div>
          </div>

          {/* Center: Real Brotrher Bonus & Specs */}
          <div className="hidden lg:flex items-center gap-5 text-[#94A3B8] font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-[#F8FAFC]">
              <Sparkles className="w-3.5 h-3.5 text-[#F8B704]" />
              FREE KAOS KAKI TEBAL + KEYCHAIN BROTRHER
            </span>
            <span className="flex items-center gap-1.5 text-[#22C55E]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
              100% KULIT SAPI ASLI
            </span>
          </div>

          {/* Right: COD Notice */}
          <div className="text-[11px] font-mono text-[#F8FAFC] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
            <span>TERSEDIA PEMBAYARAN <strong className="text-[#F8B704]">COD (BAYAR DI TEMPAT)</strong></span>
          </div>

        </div>
      </div>
    </div>
  );
};
