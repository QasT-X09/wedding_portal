import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Upload } from 'lucide-react';

export default function WeddingGallery({
  photos = [],
  onPhotoClick,
  onToggleFavorite,
  favorites = [],
  onOpenUpload
}) {
  if (photos.length === 0) {
    return (
      <div className="py-24 px-4 text-center max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-full border border-[#B39A72]/40 bg-[#171513] flex items-center justify-center mx-auto mb-5 text-[#B39A72] shadow-lg shadow-[#B39A72]/10">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl text-[#F5F1E9] font-light mb-3">
          Галерея воспоминаний гостей
        </h3>
        <p className="text-xs sm:text-sm text-[#847B72] font-light leading-relaxed mb-6">
          Будьте первыми, кто поделится фотографиями с этого особенного дня. Все снимки сразу отобразятся в общем альбоме.
        </p>
        {onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="px-6 py-2.5 rounded-full bg-[#B39A72] hover:bg-[#C8AE84] text-[#0D0C0B] text-xs uppercase tracking-wider font-medium transition-all shadow-md cursor-pointer"
          >
            Загрузить первые фото
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
      {/* Editorial Asymmetrical Masonry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {photos.map((photo, index) => {
          const isFav = favorites.includes(photo.id);
          const patternIndex = index % 5;

let colSpanClass = "lg:col-span-4";

if (patternIndex === 0) {
  colSpanClass = "lg:col-span-8";
} else if (patternIndex === 1) {
  colSpanClass = "lg:col-span-4";
} else if (patternIndex === 2 || patternIndex === 3) {
  colSpanClass = "lg:col-span-6";
} else if (patternIndex === 4) {
  colSpanClass = "lg:col-span-12";
}
          // Asymmetrical editorial column span pattern
          // 0 -> wide (col-span-8), 1 -> tall (col-span-4), 2 -> medium (col-span-6), etc.

          return (
            <motion.div
              key={photo.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
              className={`group relative w-full overflow-hidden rounded-sm bg-[#171513] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#B39A72] focus:outline-none ${colSpanClass}`}
              tabIndex={0}
              role="button"
              aria-label={`Фотография: ${photo.title || photo.author || 'Свадебный кадр'}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPhotoClick(index);
                }
              }}
              onClick={() => onPhotoClick(index)}
            >
              {/* Image with subtle zoom on hover */}
              <div className="w-full flex items-center justify-center overflow-hidden bg-[#171513]">
  <img
    src={photo.url}
    alt={photo.title || 'Wedding moment'}
    loading="lazy"
    decoding="async"
    className="block max-w-full max-h-[72vh] w-auto h-auto object-contain transition-transform duration-700 ease-out group-hover:scale-[1.01] filter brightness-[0.96] group-hover:brightness-100"
  />
</div>

              {/* Minimalist Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                {/* Top Favorite Heart */}
                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(photo.id);
                    }}
                    className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:border-[#B39A72] focus-visible:ring-1 focus-visible:ring-[#B39A72] focus:outline-none transition-colors cursor-pointer"
                    aria-label={isFav ? "Удалить из избранного" : "В избранное"}
                    aria-pressed={isFav}
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        isFav ? 'text-[#B39A72] fill-[#B39A72]' : 'text-white'
                      }`}
                    />
                  </button>
                </div>

                {/* Bottom Caption */}
                <div>
                  <div className="font-serif text-lg text-[#F5F1E9] font-light leading-snug">
                    {photo.title || photo.author}
                  </div>
                  {photo.wishes && (
                    <p className="text-xs text-[#E8E0D2]/80 italic mt-1 font-light line-clamp-1">
                      «{photo.wishes}»
                    </p>
                  )}
                  {photo.category && (
                    <span className="inline-block text-[10px] text-[#B39A72] tracking-widest uppercase font-mono mt-2">
                      {photo.category}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
