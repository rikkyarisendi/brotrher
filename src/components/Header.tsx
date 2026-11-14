import React, { useState } from 'react';
import { ShoppingBasket, Menu, X, Zap, ChevronRight, Sliders, ShieldCheck, LogOut } from 'lucide-react';
import { BRAND_CONFIG } from '../data/tacticalData';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  isAdminLoggedIn?: boolean;
  adminEmail?: string;
  onOpenAdmin?: () => void;
  onLogoutAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  isAdminLoggedIn = false,
  adminEmail,
  onOpenAdmin,
  onLogoutAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'KATALOG', href: '#catalog' },
    { label: 'SPEK KULIT', href: '#tech-specs' },
    { label: 'TESTIMONI', href: '#reviews' },
    { label: 'TEMUKAN KAMI', href: '#temukan-kami' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <>
      {/* Top Ticker Bar */}
      <div className="bg-[#0B0D11]/95 border-b border-white/10 text-[11px] font-mono text-[#94A3B8] px-4 sm:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse shrink-0"></span>
            <span className="text-[#22C55E] font-bold truncate">100% KULIT SAPI ASLI</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[#F8B704] font-semibold flex items-center gap-1.5">
              <Zap className="w-3 h-3 fill-[#F8B704]" />
              BISA COD SE-INDONESIA
            </span>
          </div>
        </div>
      </div>

      {/* Main Sticky Header: Architectural Military Glass */}
      <header className="sticky top-0 z-50 w-full bg-[#0B0D11]/95 backdrop-blur-2xl border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo Brand: Official Icon Emblem + Regular Clean Typography (Enlarged) */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <a href="#" className="flex items-center gap-2.5 sm:gap-3.5 group min-w-0">
              {/* Official Icon Emblem Logo - Enlarged */}
              <div className="w-11 h-11 sm:w-13 sm:h-13 lg:w-14 lg:h-14 rounded-lg bg-gradient-to-br from-[#1E232E] to-[#11141A] border border-[#F8B704]/40 flex items-center justify-center p-1 sm:p-1.5 shadow-md group-hover:border-[#F8B704] transition-all group-hover:shadow-[0_0_20px_rgba(248,183,4,0.4)] shrink-0">
                <img 
                  src={BRAND_CONFIG.iconLogoUrl} 
                  alt="Brotrher Emblem" 
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
                />
              </div>

              {/* Clean Typography Text - Enlarged & High Contrast */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-display text-2xl sm:text-3xl lg:text-[32px] font-black tracking-wide text-[#F8FAFC] group-hover:text-[#F8B704] transition-colors leading-none">
                    BROTRHER
                  </span>
                  <span className="font-display text-[10px] sm:text-xs font-black tracking-widest text-[#F8B704] bg-[#F8B704]/15 border border-[#F8B704]/40 px-2 py-0.5 rounded uppercase leading-none">
                    BOOTS
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#94A3B8] leading-none mt-1.5 truncate font-semibold uppercase">
                  Boots Tactical Military
                </div>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-display text-sm font-bold tracking-wider text-[#94A3B8] hover:text-[#F8B704] transition-colors py-1.5 border-b-2 border-transparent hover:border-[#F8B704]"
              >
                {link.label}
              </a>
            ))}

            {isAdminLoggedIn && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="font-display text-sm font-bold tracking-wider text-[#F8B704] hover:text-[#FFC82D] transition-colors py-1.5 border-b-2 border-transparent hover:border-[#F8B704] flex items-center gap-1.5 cursor-pointer"
                title={`Admin aktif: ${adminEmail || 'Operator'}`}
              >
                <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
                <span>ADMIN PANEL</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Quick Order Primary CTA Button with Dual Opposite Chamfer Cuts (Desktop) */}
            <a
              href="#catalog"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] px-5 py-2.5 font-display text-sm font-black uppercase tracking-wider transition-all shadow-[0_0_18px_rgba(248,183,4,0.35)] active:scale-95 cursor-pointer chamfer-tactical"
            >
              <span>PESAN SEKARANG</span>
            </a>

            {/* Loadout / Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 sm:gap-2 bg-white/5 hover:bg-white/10 text-[#F8FAFC] border border-white/15 hover:border-[#F8B704] p-2 sm:px-4 sm:py-2.5 text-xs font-semibold rounded-md transition-all group cursor-pointer"
              aria-label="Buka Keranjang Belanja"
            >
              <ShoppingBasket className="w-4 h-4 text-[#F8B704] group-hover:scale-110 transition-transform shrink-0" />
              <span className="hidden md:inline font-display text-xs tracking-wider uppercase">Keranjang</span>
              <span className="bg-[#F8B704] text-[#0B0D11] font-mono font-black text-[11px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-sm min-w-4 sm:min-w-5 text-center leading-none">
                {cartCount}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/5 text-[#F8FAFC] hover:text-[#F8B704] border border-white/15 rounded-md focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Flush Mobile Menu Dropdown (Anchored directly to header bottom with zero gap) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Click-away backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 top-16 sm:top-20 z-40 bg-black/70 backdrop-blur-sm"
              />

              {/* Flush Dropdown Container */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="lg:hidden absolute top-full inset-x-0 z-50 bg-[#0E1117]/98 backdrop-blur-2xl border-b border-white/15 px-4 sm:px-6 py-4 shadow-[0_25px_50px_rgba(0,0,0,0.95)] max-h-[calc(100vh-70px)] overflow-y-auto"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-1">
                    <span className="text-[10px] font-mono tracking-widest text-[#F8B704] uppercase font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                      MENU
                    </span>
                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1 text-[#94A3B8] hover:text-[#F8B704]"
                      aria-label="Tutup Menu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Admin Active Section in Mobile Menu (Only visible when logged in) */}
                  {isAdminLoggedIn && (
                    <div className="mb-2 p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[10px] font-mono font-bold text-[#22C55E] uppercase">
                              ADMIN SEDANG LOGIN
                            </div>
                            {adminEmail && (
                              <div className="text-[11px] font-mono text-[#F8FAFC] truncate">
                                {adminEmail}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            onOpenAdmin?.();
                          }}
                          className="py-2 px-3 bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] font-display text-xs font-black tracking-wider uppercase rounded flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>ADMIN PANEL</span>
                        </button>

                        {onLogoutAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              onLogoutAdmin();
                            }}
                            className="py-2 px-3 bg-[#EF4444]/15 hover:bg-[#EF4444] text-[#EF4444] hover:text-[#0B0D11] border border-[#EF4444]/40 font-mono text-xs font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>LOGOUT</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3 bg-white/5 hover:bg-[#F8B704] text-[#F8FAFC] hover:text-[#0B0D11] border border-white/10 hover:border-[#F8B704] rounded-md font-display text-sm font-bold tracking-wider transition-all"
                    >
                      <span>{link.label}</span>
                      <ChevronRight className="w-4 h-4 text-[#F8B704] group-hover:text-[#0B0D11]" />
                    </a>
                  ))}

                  <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
                    <a
                      href="https://api.whatsapp.com/send?phone=+6282217074200&text=Halo%20min%20mau%20tanya%20produk%20Brotrher."
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] font-display text-sm font-black tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg cursor-pointer chamfer-tactical"
                    >
                      <span>HUBUNGI KAMI</span>
                    </a>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] px-2 pt-1">
                      <span>CS BROTRHER: {BRAND_CONFIG.phone}</span>
                      <span className="text-[#22C55E] font-bold">100% AMAN & ASLI</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
