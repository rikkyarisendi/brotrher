import React from 'react';
import { Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { BRAND_CONFIG } from '../data/tacticalData';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-10 military-glass border-t border-white/10 text-[#94A3B8] text-xs font-mono pt-12 pb-24 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-white/10">
          
          {/* Brand Info with Official Logo Assets (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              {/* Official Icon Emblem Asset */}
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-[#F8B704] flex items-center justify-center p-1.5 shadow-md">
                <img 
                  src={BRAND_CONFIG.iconLogoUrl} 
                  alt="Brotrher Emblem" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Clean Typography Text as requested */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl font-black tracking-wide text-[#F8FAFC]">
                    BROTRHER
                  </span>
                  <span className="font-display text-xs font-black tracking-widest text-[#F8B704] bg-[#F8B704]/10 border border-[#F8B704]/30 px-2 py-0.5 rounded uppercase">
                    BOOTS
                  </span>
                </div>
                <span className="text-[10px] text-[#F8B704] tracking-widest uppercase mt-0.5 font-bold font-mono">
                  Boots Tactical Military
                </span>
              </div>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-md">
              Produsen sepatu PDL, PDH, dan tactical boots kulit sapi asli Indonesia. Melayani pemesanan satuan maupun pengadaan dinas satuan TNI, POLRI, Brimob, Dishub, Satpol PP, dan Security.
            </p>

            <div className="flex flex-col gap-2 pt-2 text-[11px]">
              <div className="flex items-center gap-2 text-[#F8FAFC]">
                <Phone className="w-3.5 h-3.5 text-[#F8B704]" />
                <span>CS & KONSULTASI UKURAN: {BRAND_CONFIG.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[#F8FAFC]">
                <Mail className="w-3.5 h-3.5 text-[#F8B704]" />
                <span>EMAIL: {BRAND_CONFIG.email}</span>
              </div>
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-display text-base font-bold uppercase tracking-wider text-[#F8FAFC]">
             TERHUBUNG DENGAN KAMI
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#temukan-kami" className="hover:text-[#F8B704] transition-colors flex items-center gap-1.5 text-[#F8B704]">
                  • Marketplace & Sosmed &rarr;
                </a>
              </li>
              <li>
                <a href="https://shopee.co.id/brotrherbootsofficial" target="_blank" rel="noopener noreferrer" className="hover:text-[#F8B704] transition-colors">
                  • Shopee
                </a>
              </li>
              <li>
                <a href="https://www.tokopedia.com/brotrherbootsofficial" target="_blank" rel="noopener noreferrer" className="hover:text-[#F8B704] transition-colors">
                  • Tokopedia
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@brotrher_boots" target="_blank" rel="noopener noreferrer" className="hover:text-[#F8B704] transition-colors">
                  • TikTok
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/brotrher_boots" target="_blank" rel="noopener noreferrer" className="hover:text-[#F8B704] transition-colors">
                  • Instagram
                </a>
              </li>
            </ul>
          </div>

          {/* Trust Points (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-display text-base font-bold uppercase tracking-wider text-[#F8FAFC]">
              JAMINAN MUTU RESMI
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span className="text-[#F8FAFC]">100% Kulit Sapi Asli</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span className="text-[#F8FAFC]">Sol Sudah Dijahit Keliling</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span className="text-[#F8FAFC]">Garansi Tukar Ukuran</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span className="text-[#F8FAFC]">Bisa (COD) Seluruh Indonesia</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#64748B]">
          <div className="flex items-center gap-2">
            <img 
              src={BRAND_CONFIG.iconLogoUrl} 
              alt="Icon" 
              className="w-4 h-4 object-contain inline" 
            />
            <span>© {new Date().getFullYear()} BROTRHER BOOTS OFFICIAL ALL RIGHTS RESERVED.</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="hover:text-[#94A3B8] cursor-pointer">GARANSI KULIT SAPI ASLI</span>
            <span>•</span>
            <span className="hover:text-[#94A3B8] cursor-pointer">PANDUAN TUKAR UKURAN</span>
            <span>•</span>
            <span className="hover:text-[#94A3B8] cursor-pointer">PENGIRIMAN COD SE-INDONESIA</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
