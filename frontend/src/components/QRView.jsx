import React from 'react';
import { motion } from 'framer-motion';
import { Printer } from 'lucide-react';

export default function QRView() {
  const publicUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const qrUrl = `/api/qr?url=${encodeURIComponent(publicUrl)}`;

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#968779] font-medium block mb-1">
          Для каждого столика
        </span>
        <h2 className="font-serif text-3xl text-[#2C2724] font-normal mb-2">
          Карточка для стола
        </h2>
        <p className="text-xs text-[#736A62] max-w-xs mx-auto mb-8 font-light leading-relaxed">
          Распечатайте или поставьте на столы гостей — при сканировании камера сразу откроет страницу загрузки!
        </p>

        {/* Physical Stationery Table Card Mockup */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-[#E2DAD0] shadow-[0_15px_35px_rgba(79,65,53,0.08)] text-center relative overflow-hidden mb-6">
          {/* Subtle gold ribbon top accent */}
          <div className="w-10 h-[2px] bg-[#C5A059] mx-auto mb-5" />

          <div className="font-serif text-2xl sm:text-3xl font-medium text-[#2C2724] mb-1">
            Свадебный день
          </div>
          <div className="text-[11px] text-[#968779] tracking-[0.2em] uppercase font-medium mb-6">
            Поделитесь вашими кадрами
          </div>

          <div className="w-52 h-52 mx-auto mb-6 p-3 rounded-2xl bg-[#FAF8F5] border border-[#EBE3D7] flex items-center justify-center shadow-inner">
            <img
              src={qrUrl}
              alt="Свадебный QR Код"
              className="w-full h-full object-contain"
            />
          </div>

          <p className="font-serif text-base font-medium text-[#2C2724]">
            Наведите камеру телефона
          </p>
          <p className="text-xs text-[#847B72] mt-1 font-light">
            Фотографии моментально появятся на проекторе в зале
          </p>

          <div className="text-[11px] text-[#A07C44] font-mono mt-3 break-all opacity-80">
            {publicUrl}
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="py-3 px-6 rounded-xl text-xs font-semibold text-white bg-[#2C2724] hover:bg-[#3D352F] shadow-md transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Распечатать карточку</span>
        </button>
      </motion.div>
    </div>
  );
}
