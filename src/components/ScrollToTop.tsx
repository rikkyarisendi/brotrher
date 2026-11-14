import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScrollToTopProps {
  // Apakah overlay bawah sedang minimize — dipakai untuk menjaga jarak yang sama
  // antara tombol ini dan overlay, baik saat overlay besar maupun minimize.
  // Di layar sm ke atas tombol tetap di bottom 15px seperti sebelumnya.
  isBarMinimized?: boolean;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({ isBarMinimized = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className={`fixed ${isBarMinimized ? 'bottom-[56px]' : 'bottom-[76px]'} sm:bottom-[15px] right-4 sm:right-6 z-40 w-9 h-9 sm:w-10 sm:h-10 bg-[#12151D]/95 border border-[#94A3B8]/40 hover:border-[#F8B704] text-[#F8B704] hover:text-[#0B0D11] hover:bg-[#F8B704] shadow-[0_8px_20px_rgba(0,0,0,0.75)] hover:shadow-[0_0_22px_rgba(248,183,4,0.6)] transition-all duration-200 group flex items-center justify-center cursor-pointer active:scale-95 chamfer-tactical-sm`}
          aria-label="Scroll kembali ke atas"
          title="Kembali ke atas"
        >
          <ChevronUp className="w-4 h-4 text-[#F8B704] group-hover:text-[#0B0D11] group-hover:-translate-y-0.5 transition-all stroke-[2.5]" />
          <span className="sr-only">Scroll ke atas</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
