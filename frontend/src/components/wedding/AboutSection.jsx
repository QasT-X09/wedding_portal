import React from 'react';
import { Calendar, MapPin, Sparkles, Heart } from 'lucide-react';

export default function AboutSection({ onBackToGallery }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32 text-center select-none">
      <div className="w-10 h-10 rounded-full border border-[#B39A72]/30 flex items-center justify-center mx-auto mb-4 text-[#B39A72]">
        <Heart className="w-5 h-5 fill-[#B39A72]" />
      </div>

      <span className="text-[11px] uppercase tracking-[0.25em] text-[#B39A72] font-medium block mb-2">
        НАША ИСТОРИЯ
      </span>
      <h2 className="font-serif text-4xl sm:text-5xl text-[#F5F1E9] font-light mb-6 tracking-wide">
        О свадьбе Kurmet & Balnur
      </h2>
      <p className="text-sm sm:text-base text-[#847B72] max-w-lg mx-auto mb-12 font-light leading-relaxed">
        День, когда две судьбы соединились в одну прекрасную историю. Спасибо каждому из вас за то, что разделили с нами этот священный момент счастья.
      </p>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-left">
        <div className="p-6 rounded-2xl bg-[#171513] border border-[#2A2622]">
          <Calendar className="w-5 h-5 text-[#B39A72] mb-3" />
          <h3 className="font-serif text-lg text-[#F5F1E9] font-medium">Дата</h3>
          <p className="text-xs text-[#847B72] mt-1">15 сентября 2026 года</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#171513] border border-[#2A2622]">
          <MapPin className="w-5 h-5 text-[#B39A72] mb-3" />
          <h3 className="font-serif text-lg text-[#F5F1E9] font-medium">Локация</h3>
          <p className="text-xs text-[#847B72] mt-1">Банкетный комплекс «Grand Palace»</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#171513] border border-[#2A2622]">
          <Sparkles className="w-5 h-5 text-[#B39A72] mb-3" />
          <h3 className="font-serif text-lg text-[#F5F1E9] font-medium">Дресс-код</h3>
          <p className="text-xs text-[#847B72] mt-1">Black Tie & Champagne Elegance</p>
        </div>
      </div>

      <button
        onClick={onBackToGallery}
        className="px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium text-[#0D0C0B] bg-[#B39A72] hover:bg-[#C8AE84] transition-all cursor-pointer shadow-md"
      >
        Вернуться в галерею
      </button>
    </div>
  );
}
