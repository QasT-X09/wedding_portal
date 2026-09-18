import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, Download, Share2, ArrowLeft } from 'lucide-react';

export default function PhotoViewer({
  photos = [],
  currentIndex = 0,
  isOpen = false,
  onClose,
  onPrev,
  onNext,
  onToggleFavorite,
  isFavorite = false
}) {
  const currentPhoto = photos[currentIndex];

  // Keyboard navigation: ArrowLeft, ArrowRight, Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || !currentPhoto) return null;

  const total = photos.length;
  const counterStr = `${String(currentIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Kurmet & Balnur Wedding Photo',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(currentPhoto.url);
      alert('Ссылка на фотографию скопирована!');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        role="dialog"
        aria-modal="true"
        aria-label="Просмотр фотографии"
        className="fixed inset-0 z-50 bg-[#0D0C0B] flex flex-col justify-between select-none"
      >
        {/* Top Header */}
        <div className="relative z-20 flex items-center justify-between px-6 sm:px-12 py-6">
          {/* Mobile Back / Desktop Kurmet & Balnur */}
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="sm:hidden p-2 rounded-full bg-white/10 text-white cursor-pointer focus-visible:ring-2 focus-visible:ring-[#B39A72] focus:outline-none"
              aria-label="Закрыть просмотр"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-serif text-xl sm:text-2xl tracking-[0.18em] text-[#F5F1E9] pl-1 font-light hidden sm:inline">
              Kurmet & Balnur
            </span>
          </div>

          {/* Photo Counter: 09 / 124 */}
          <div className="font-mono text-xs sm:text-sm tracking-widest text-[#B39A72]">
            {counterStr}
          </div>

          {/* Desktop Close */}
          <button
            onClick={onClose}
            className="hidden sm:flex p-2.5 rounded-full border border-[#3A342E] text-[#E8E0D2] hover:text-white hover:border-[#B39A72] focus-visible:ring-2 focus-visible:ring-[#B39A72] focus:outline-none transition-colors cursor-pointer"
            aria-label="Закрыть просмотр"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Stage with Prev/Next buttons */}
        <div className="relative flex-1 flex items-center justify-center px-4 sm:px-16 overflow-hidden">
          {/* Previous arrow */}
          <button
            onClick={onPrev}
            className="absolute left-4 sm:left-8 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white/80 hover:text-white focus-visible:ring-2 focus-visible:ring-[#B39A72] focus:outline-none transition-all cursor-pointer"
            aria-label="Предыдущее фото"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Animated Photo Transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhoto.id || currentIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="relative max-w-5xl max-h-[75vh] flex items-center justify-center"
            >
              <img
                src={currentPhoto.url}
                alt={currentPhoto.title || 'Wedding Photo'}
                className="max-h-[75vh] max-w-full object-contain filter drop-shadow-2xl rounded-sm"
              />
            </motion.div>
          </AnimatePresence>

          {/* Next arrow */}
          <button
            onClick={onNext}
            className="absolute right-4 sm:right-8 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white/80 hover:text-white focus-visible:ring-2 focus-visible:ring-[#B39A72] focus:outline-none transition-all cursor-pointer"
            aria-label="Следующее фото"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Bar Controls */}
        <div className="relative z-20 flex items-center justify-between px-6 sm:px-12 py-6 bg-gradient-to-t from-[#0D0C0B] to-transparent">
          {/* Author & Category metadata */}
          <div>
            <div className="font-serif text-base sm:text-lg text-[#F5F1E9] font-light">
              {currentPhoto.title || currentPhoto.author}
            </div>
            {currentPhoto.category && (
              <div className="text-[11px] text-[#B39A72] uppercase tracking-wider font-light mt-0.5">
                {currentPhoto.category}
              </div>
            )}
          </div>

          {/* Actions: Favorite, Download, Share */}
          <div className="flex items-center gap-3">
            {/* Favorite ♡ */}
            <button
              onClick={() => onToggleFavorite(currentPhoto.id)}
              className="p-3 rounded-full border border-[#3A342E] bg-[#171513] text-[#E8E0D2] hover:border-[#B39A72] focus-visible:ring-2 focus-visible:ring-[#B39A72] focus:outline-none transition-colors cursor-pointer"
              aria-label="В избранное"
              aria-pressed={isFavorite}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFavorite ? 'text-[#B39A72] fill-[#B39A72]' : 'text-[#E8E0D2]'
                }`}
              />
            </button>

            {/* Download */}
            <a
              href={currentPhoto.url}
              download={`wedding_photo_${currentIndex + 1}.jpg`}
              className="p-3 rounded-full border border-[#3A342E] bg-[#171513] text-[#E8E0D2] hover:border-[#B39A72] focus-visible:ring-2 focus-visible:ring-[#B39A72] focus:outline-none transition-colors cursor-pointer no-underline"
              aria-label="Скачать"
            >
              <Download className="w-5 h-5" />
            </a>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-3 rounded-full border border-[#3A342E] bg-[#171513] text-[#E8E0D2] hover:border-[#B39A72] focus-visible:ring-2 focus-visible:ring-[#B39A72] focus:outline-none transition-colors cursor-pointer"
              aria-label="Поделиться"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
