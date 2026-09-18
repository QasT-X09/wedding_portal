import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, ArrowLeft } from 'lucide-react';

export default function WishesSection({ onOpenUpload, onBackToGallery }) {
  const [wishes, setWishes] = useState([]);

  useEffect(() => {
    fetch('/api/media')
      .then(r => r.json())
      .then(d => {
        const uniqueWishes = [];
        const seen = new Set();
        for (const item of (d.items || [])) {
          if (item.wishes && !seen.has(item.wishes)) {
            seen.add(item.wishes);
            uniqueWishes.push({
              id: item.id,
              author: item.guest_name,
              table: item.table_number,
              text: item.wishes,
              color: item.avatar_color
            });
          }
        }
        setWishes(uniqueWishes);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32 select-none">
      {onBackToGallery && (
        <button
          onClick={onBackToGallery}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B39A72] hover:text-[#E8E0D2] transition-colors mb-8 cursor-pointer focus-visible:ring-1 focus-visible:ring-[#B39A72] focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Вернуться в галерею</span>
        </button>
      )}

      <div className="text-center max-w-xl mx-auto mb-12">
        <div className="w-10 h-10 rounded-full border border-[#B39A72]/30 flex items-center justify-center mx-auto mb-4 text-[#B39A72]">
          <Heart className="w-5 h-5 fill-[#B39A72]" />
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#F5F1E9] tracking-wider uppercase font-light mb-2">
          ПОЖЕЛАНИЯ
        </h2>
        <p className="text-xs sm:text-sm text-[#847B72] tracking-wide uppercase font-light mb-6">
          Тёплые слова от родных и друзей
        </p>

        <button
          onClick={onOpenUpload}
          className="px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium text-[#0D0C0B] bg-[#B39A72] hover:bg-[#C8AE84] transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Написать пожелание</span>
        </button>
      </div>

      {wishes.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-[#171513] border border-[#2A2622] max-w-md mx-auto">
          <p className="font-serif text-lg text-[#E8E0D2] font-light">Пока нет пожеланий</p>
          <p className="text-xs text-[#847B72] mt-1">Будьте первыми, кто поздравит молодых!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {wishes.map((w, idx) => (
            <motion.div
              key={w.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 rounded-2xl bg-[#171513] border border-[#2A2622] relative"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: w.color || '#B39A72' }}
                />
                <span className="font-serif text-base text-[#F5F1E9] font-medium">{w.author}</span>
                {w.table && (
                  <span className="text-[10px] text-[#B39A72] font-mono px-2 py-0.5 rounded-full bg-[#0D0C0B] border border-[#2A2622]">
                    {w.table}
                  </span>
                )}
              </div>
              <p className="text-sm text-[#D4C8BC] italic font-light leading-relaxed">
                «{w.text}»
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
