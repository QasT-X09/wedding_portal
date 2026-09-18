import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, X, Heart, Sparkles } from 'lucide-react';

export default function ProjectorView({ onExit }) {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [incomingToast, setIncomingToast] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetch('/api/live/queue?limit=40')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data);
        }
      })
      .catch(err => console.error('[Projector] Failed to load queue:', err));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, 8500);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    const eventSource = new EventSource('/api/live/stream');

    eventSource.addEventListener('new_media', (e) => {
      try {
        const item = JSON.parse(e.data).data;
        setSlides(prev => [item, ...prev]);
        setCurrentIndex(0);

        setIncomingToast(item);
        setTimeout(() => setIncomingToast(null), 6500);
      } catch (err) {
        console.error('[Projector] Error parsing SSE event:', err);
      }
    });

    return () => eventSource.close();
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-[#141210] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header */}
      <div className="relative z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black/70 via-black/30 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
          <h1 className="font-serif text-xl sm:text-2xl text-[#EADBCE] tracking-wider font-normal">
            Свадебный день • Прямой эфир
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {currentSlide?.category_label && (
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#EADBCE] text-xs font-light tracking-wide">
              {currentSlide.category_label}
            </span>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
            title="Полный экран"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onExit}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
            title="Выйти"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Ken Burns Slide */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {currentSlide ? (
            <motion.div
              key={currentSlide.id || currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="w-full h-full flex items-center justify-center"
            >
              {currentSlide.media_type === 'video' ? (
                <video
                  src={currentSlide.file_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-contain max-h-[86vh]"
                />
              ) : (
                <motion.img
                  src={currentSlide.file_url}
                  alt={currentSlide.guest_name}
                  animate={{
                    scale: [1, 1.07, 1.13],
                    x: [0, -10, 10],
                    y: [0, -6, 6]
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut'
                  }}
                  className="w-full h-full object-contain max-h-[88vh] filter drop-shadow-2xl"
                />
              )}
            </motion.div>
          ) : (
            <div className="text-center p-8 max-w-lg">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/10 border border-white/20 text-[#EADBCE] flex items-center justify-center">
                <Heart className="w-6 h-6 fill-[#EADBCE]" />
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#EADBCE] mb-3 font-normal">
                Добро пожаловать на свадьбу!
              </h2>
              <p className="text-[#A3998E] text-sm leading-relaxed font-light">
                Отсканируйте QR-код на столике и поделитесь вашими фотографиями — они сразу появятся на этом экране!
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-20 flex items-end justify-between p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="max-w-xl">
          {currentSlide && (
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-medium text-white">
                  {currentSlide.guest_name}
                </span>
                {currentSlide.table_number && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/15 text-[#EADBCE]">
                    {currentSlide.table_number}
                  </span>
                )}
              </div>
              <p className="text-sm text-[#D4C8BC] italic mt-1 font-light">
                {currentSlide.wishes ? `«${currentSlide.wishes}»` : 'Счастливого дня свадьбы! 💍'}
              </p>
            </motion.div>
          )}
        </div>

        {/* QR Corner Badge */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-xl">
          <img
            src="/api/qr"
            alt="QR"
            className="w-14 h-14 rounded-lg bg-white p-1"
          />
          <div className="hidden sm:block text-left">
            <div className="text-xs font-medium text-white">Поделитесь фото!</div>
            <div className="text-[10px] text-[#A3998E] font-light">Наведите камеру смартфона</div>
          </div>
        </div>
      </div>

      {/* Real-time Toast */}
      <AnimatePresence>
        {incomingToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 p-4 rounded-2xl bg-black/90 backdrop-blur-2xl border border-[#C5A059] shadow-2xl max-w-md w-full mx-4"
          >
            <img
              src={incomingToast.thumbnail_url || incomingToast.file_url}
              alt="preview"
              className="w-14 h-14 rounded-xl object-cover border border-[#C5A059]/50 flex-shrink-0"
            />
            <div className="overflow-hidden">
              <div className="text-[10px] uppercase tracking-widest text-[#C5A059] flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Новое фото от гостя
              </div>
              <div className="font-serif font-medium text-white truncate text-base">
                {incomingToast.guest_name}
              </div>
              <div className="text-xs text-[#D4C8BC] italic truncate mt-0.5 font-light">
                {incomingToast.wishes ? `«${incomingToast.wishes}»` : 'Добавлено новое воспоминание!'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
