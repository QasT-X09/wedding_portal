import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Download, ArrowLeft } from 'lucide-react';

export default function FavoritesGallery({
  photos = [],
  favoriteIds = [],
  onPhotoClick,
  onToggleFavorite,
  onBackToGallery
}) {
  const favoritePhotos = photos.filter(p => favoriteIds.includes(p.id));

  const handleDownloadAllFavorites = () => {
    // Trigger download of favorites as ZIP or batch download
    window.location.href = '/api/export/zip';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Back button */}
      <button
        onClick={onBackToGallery}
        className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B39A72] hover:text-[#E8E0D2] transition-colors mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Вернуться в галерею</span>
      </button>

      {/* Header Section */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <div className="w-10 h-10 rounded-full border border-[#B39A72]/30 flex items-center justify-center mx-auto mb-4 text-[#B39A72]">
          <Heart className="w-5 h-5 fill-[#B39A72]" />
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#F5F1E9] tracking-wider uppercase font-light mb-2">
          ИЗБРАННОЕ
        </h2>
        <p className="text-xs sm:text-sm text-[#847B72] tracking-wide uppercase font-light mb-6">
          Ваши любимые моменты
        </p>

        {favoritePhotos.length > 0 && (
          <div className="flex items-center justify-center gap-4">
            <span className="text-xs text-[#E8E0D2] font-mono px-3 py-1 rounded-full border border-[#2A2622] bg-[#171513]">
              {favoritePhotos.length} {favoritePhotos.length === 1 ? 'фотография' : 'фотографий'}
            </span>
            <button
              onClick={handleDownloadAllFavorites}
              className="px-5 py-2 rounded-full text-xs uppercase tracking-wider font-medium text-[#0D0C0B] bg-[#B39A72] hover:bg-[#C8AE84] transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>СКАЧАТЬ ИЗБРАННОЕ</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {favoritePhotos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-4 max-w-md mx-auto border border-[#221F1C] rounded-2xl bg-[#171513]/40"
        >
          <Heart className="w-8 h-8 text-[#B39A72]/40 mx-auto mb-4" />
          <h3 className="font-serif text-2xl text-[#E8E0D2] font-light mb-2">
            Здесь пока пусто
          </h3>
          <p className="text-xs sm:text-sm text-[#847B72] leading-relaxed font-light">
            Добавляйте фотографии в избранное, нажимая на сердечко ♡, чтобы сохранить свои самые любимые моменты.
          </p>
        </motion.div>
      ) : (
        /* Favorites Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritePhotos.map((photo, idx) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative aspect-[4/3] rounded-sm overflow-hidden bg-[#171513] cursor-pointer"
              onClick={() => onPhotoClick(photos.findIndex(p => p.id === photo.id))}
            >
              <img
                src={photo.thumbnail || photo.url}
                alt={photo.title || 'Wedding moment'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(photo.id);
                    }}
                    className="p-2 rounded-full bg-black/60 text-[#B39A72] hover:text-white"
                  >
                    <Heart className="w-4 h-4 fill-[#B39A72]" />
                  </button>
                </div>
                <div>
                  <p className="font-serif text-sm text-[#F5F1E9]">{photo.title || photo.author}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
