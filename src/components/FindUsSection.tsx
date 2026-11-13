import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { SOCIAL_MARKETPLACE_LINKS } from '../data/tacticalData';

export const FindUsSection: React.FC = () => {
  // Brand SVGs specifically crafted for clean, high-impact tactical display
  const renderIcon = (platform: string) => {
    switch (platform) {
      case 'shopee':
        return (
          <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-9 sm:h-9 fill-current">
            <path d="M19.5 7.5h-2.1c-.3-2.6-2.5-4.5-5.4-4.5s-5.1 1.9-5.4 4.5H4.5C3.7 7.5 3 8.2 3 9v11c0 .8.7 1.5 1.5 1.5h15c.8 0 1.5-.7 1.5-1.5V9c0-.8-.7-1.5-1.5-1.5zM12 4.8c1.9 0 3.5 1.2 3.8 2.7H8.2c.3-1.5 1.9-2.7 3.8-2.7zm2.4 10.7c-.5.4-1.2.6-2.1.6-.7 0-1.3-.1-1.8-.4-.3-.2-.5-.4-.7-.7l1.1-.9c.3.4.7.6 1.4.6.6 0 1-.2 1.3-.4.2-.2.3-.4.3-.6 0-.3-.1-.5-.4-.7-.2-.1-.6-.3-1.2-.5-1.1-.4-1.7-.7-2.1-1-.4-.4-.6-.8-.6-1.4 0-.7.3-1.3.8-1.7.5-.4 1.2-.6 2.1-.6.7 0 1.3.1 1.8.4.3.2.6.5.8.9l-1.1.9c-.3-.4-.7-.6-1.4-.6-.5 0-.9.1-1.2.3-.2.1-.3.3-.3.6 0 .2.1.4.3.5.2.1.6.3 1.2.5 1.1.4 1.8.7 2.2 1.1.4.4.6.9.6 1.5 0 .7-.3 1.3-.8 1.7z" />
          </svg>
        );
      case 'tokopedia':
        return (
          <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-9 sm:h-9 fill-current">
            <path d="M12 2C7.58 2 4 5.58 4 10c0 2.24.92 4.26 2.41 5.72L12 22l5.59-6.28C19.08 14.26 20 12.24 20 10c0-4.42-3.58-8-8-8zm-3.5 9.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm7 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
          </svg>
        );
      case 'tiktok':
        return (
          <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-9 sm:h-9 fill-current">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.41a6.33 6.33 0 0 0-.85-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 10.82 4.48c1.77-1.77 2.49-4.14 2.49-6.51V8.04a8.16 8.16 0 0 0 3.14.96V6.69z" />
          </svg>
        );
      case 'instagram':
        return (
          <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-9 sm:h-9 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        );
      case 'facebook':
        return (
          <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-9 sm:h-9 fill-current">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      case 'whatsapp':
        return (
          <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-9 sm:h-9 fill-current">
            <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.101-.477-.15-.678.15-.201.301-.778.978-.954 1.179-.176.201-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.676-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.1-.201.05-.376-.025-.526-.075-.15-.678-1.633-.929-2.237-.245-.588-.493-.508-.678-.518-.176-.009-.376-.01-.577-.01s-.527.075-.803.376c-.276.301-1.054 1.03-1.054 2.512s1.079 2.913 1.23 3.114c.15.201 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.721.229 1.377.197 1.895.12.578-.087 1.78-.727 2.031-1.43.251-.703.251-1.306.176-1.43-.075-.125-.276-.201-.577-.351zM12.042 21.921c-1.802 0-3.571-.486-5.127-1.408l-.367-.218-3.81 1 .998-3.714-.239-.381c-1.01-1.608-1.545-3.468-1.545-5.372 0-5.467 4.453-9.92 9.92-9.92 2.65 0 5.141 1.033 7.013 2.906 1.873 1.873 2.905 4.364 2.905 7.014 0 5.467-4.453 9.92-9.92 9.92z" />
          </svg>
        );
      default:
        return <ExternalLink className="w-7 h-7 sm:w-9 sm:h-9" />;
    }
  };

  return (
    <section id="temukan-kami" className="relative py-10 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#0B0D11]/90">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 military-glass-dock rounded-xl p-5 sm:p-7 border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
          
          {/* Left: Heading & Verification Badge in Consistent Brotrher Style */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#F8B704]/10 border border-[#F8B704]/40 flex items-center justify-center text-[#F8B704] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F8B704] animate-pulse" />
                <h2 className="font-display text-lg sm:text-xl font-black uppercase tracking-wider text-[#F8FAFC]">
                  TEMUKAN BROTRHER BOOTS:
                </h2>
              </div>
              <div className="text-xs font-mono text-[#94A3B8] mt-0.5">
                Kanal Resmi Marketplace & Media Sosial Terverifikasi
              </div>
            </div>
          </div>

          {/* Right: Large Desktop Tactical Launcher Buttons with Consistent Gold Theme */}
          <div className="flex items-center flex-wrap justify-center gap-3 sm:gap-4">
            {SOCIAL_MARKETPLACE_LINKS.map((item) => {
              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col items-center justify-center w-16 h-16 sm:w-22 sm:h-22 rounded-xl bg-[#141720] border border-white/12 hover:border-[#F8B704] transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-md hover:shadow-[0_0_24px_rgba(248,183,4,0.35)] cursor-pointer"
                  title={`${item.name} (${item.badge})`}
                  aria-label={item.name}
                >

                  {/* Icon in Consistent Brotrher Gold */}
                  <div className="text-[#F8B704] group-hover:text-[#FFC82D] transition-transform duration-300 group-hover:scale-110">
                    {renderIcon(item.platform)}
                  </div>

                  {/* Clean Monospace Platform Name Underneath */}
                  <span className="text-[10px] sm:text-[11px] font-mono font-black tracking-wider text-[#94A3B8] group-hover:text-[#F8FAFC] transition-colors mt-1 uppercase">
                    {item.shortName || item.name}
                  </span>

                  {/* Micro Tooltip on Hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#0B0D11] border border-[#F8B704]/50 text-[#F8B704] text-[9px] font-mono font-bold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-xl whitespace-nowrap z-30 group-hover:-top-9">
                    {item.badge}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#0B0D11]" />
                  </div>
                </a>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};
