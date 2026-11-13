import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'MATERIAL & KUALITAS',
    question: 'Apakah seluruh sepatu Brotrher Boots menggunakan 100% kulit sapi asli?',
    answer: 'Ya, 100% garansi kulit sapi asli pilihan Grade A. Karakter kulit tebal, lentur di kaki, tidak kaku, dan tidak akan pecah-pecah atau retak meskipun sering terkena paparan panas terik matahari maupun genangan air saat latihan di lapangan.',
  },
  {
    id: 'faq-2',
    category: 'KONSTRUKSI SOL',
    question: 'Apakah sol bawah sepatu sudah dijahit keliling tembus ke dalam?',
    answer: 'Benar! Semua sepatu Brotrher Boots sol karet radial bawahnya sudah melalui proses penjahitan melingkar 360 derajat tembus ke dalam menggunakan benang nilon kuat standar militer. Hal ini memastikan sol tidak mudah mangap atau lepas di segala medan operasional.',
  },
  {
    id: 'faq-3',
    category: 'FITUR FITGO SYSTEM',
    question: 'Apa kelebihan sistem tali putar Fitgo dibandingkan tali biasa?',
    answer: 'Sistem Fitgo menggunakan tali kawat baja import anti-putus yang diatur dengan knop rotary dial otomatis. Anda dapat memakai dan mengencangkan sepatu pas di kaki hanya dalam 3 detik, sangat praktis saat panggilan apel cepat maupun tugas siaga mendadak.',
  },
  {
    id: 'faq-4',
    category: 'PEMBAYARAN & COD',
    question: 'Apakah melayani sistem Bayar di Tempat (COD) ke seluruh Indonesia?',
    answer: 'Bisa! Kami melayani sistem COD (Bayar di Tempat) ke seluruh pelosok Nusantara. Anda bisa memesan langsung dan membayar tunai kepada kurir saat paket sepatu sampai di alamat rumah atau markas kesatuan Anda.',
  },
  {
    id: 'faq-5',
    category: 'GARANSI UKURAN',
    question: 'Bagaimana jika ukuran sepatu yang saya terima kebesaran atau kekecilan?',
    answer: 'Tenang, Brotrher Boots memberikan Garansi Tukar Ukuran (Size Exchange). Jika sepatu yang diterima kurang pas di kaki, Anda cukup menghubungi Customer Service kami via WhatsApp untuk proses penukaran size dengan mudah dan cepat.',
  },
  {
    id: 'faq-6',
    category: 'PERAWATAN KULIT',
    question: 'Bagaimana cara merawat sepatu PDL dan PDH kulit Brotrher Boots agar awet?',
    answer: 'Untuk tipe kulit doff, cukup bersihkan debu dengan lap basah lalu gunakan semir padat/cair secara berkala. Untuk tipe super kilap (seperti PDH Jatah & LGR Bravo Kilap), cukup lap dengan kain microfiber halus atau spons basah untuk mengembalikan kilau tanpa perlu disemir manual.',
  },
];

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative border-t border-white/10 bg-[#0B0D11]/60">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F8B704]/15 border border-[#F8B704]/40 text-[#F8B704] text-[11px] font-mono font-bold tracking-wider uppercase chamfer-tactical-sm mb-2.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#F8B704]" />
            <span>INFORMASI & PERTANYAAN POPULER</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#F8FAFC]">
            PANDUAN PEMBELIAN SEPATU PDL KULIT ASLI
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] font-mono mt-2 leading-relaxed max-w-2xl mx-auto">
            Pelajari spesifikasi material, ketahanan sol jahit keliling, fitur tali putar Fitgo, hingga garansi resmi sebelum memesan.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3 sm:space-y-3.5">
          {FAQ_DATA.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className="military-glass border border-white/10 rounded-lg overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(item.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#F8B704] shrink-0" />
                    <div>
                      <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block mb-0.5">
                        // {item.category}
                      </span>
                      <span className="font-display text-sm sm:text-base font-bold text-[#F8FAFC] tracking-wide">
                        {item.question}
                      </span>
                    </div>
                  </div>

                  <div className={`w-8 h-8 rounded chamfer-tactical-sm bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-[#F8B704]/15 border-[#F8B704]/40' : ''}`}>
                    <ChevronDown className={`w-4 h-4 transition-colors ${isOpen ? 'text-[#F8B704]' : 'text-[#94A3B8]'}`} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-white/5 text-xs sm:text-sm text-[#94A3B8] font-normal leading-relaxed">
                        <div className="pl-5 border-l-2 border-[#F8B704]/50 py-1">
                          {item.answer}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Trust Bottom Banner */}
        <div className="mt-8 p-4 rounded-lg bg-[#F8B704]/10 border border-[#F8B704]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#F8B704] shrink-0" />
            <span className="text-xs font-mono font-bold text-[#F8FAFC]">
              BUTUH KONSULTASI UKURAN ATAU PESANAN KESATUAN / GROSIR?
            </span>
          </div>
          <a
            href="https://wa.me/6282123456789?text=Halo%20Admin%20Brotrher%20Boots,%20saya%20ingin%20konsultasi%20sepatu%20PDL"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#F8B704] hover:bg-[#FFC82D] text-[#0B0D11] text-xs font-display font-black uppercase chamfer-tactical-sm transition-all"
          >
            HUBUNGI CS RESMI
          </a>
        </div>

      </div>
    </section>
  );
};
