import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function WeddingMenu({ isOpen, onClose, onNavigate, favoritesCount = 0 }) {
  // Close menu on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const menuItems = [
    { id: 'intro', label: 'Главная', sub: 'Начало истории' },
    { id: 'gallery', label: 'Галерея', sub: 'Все свадебные кадры' },
    { id: 'favorites', label: `Избранное (${favoritesCount})`, sub: 'Ваши любимые моменты' },
    { id: 'upload', label: 'Загрузить фото', sub: 'Поделиться снимками' },
    { id: 'about', label: 'О свадьбе', sub: '15 сентября 2026' },
    { id: 'wishes', label: 'Пожелания', sub: 'Тёплые слова гостей' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label="Меню навигации"
          className="fixed inset-0 z-50 bg-[#0D0C0B]/95 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-12 select-none"
        >
          {/* Top Bar inside Menu */}
          <div className="flex items-center justify-between">
            <span className="font-serif text-xl sm:text-2xl tracking-[0.18em] text-[#F5F1E9] pl-1 font-light">
              Kurmet & Balnur
            </span>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full border border-[#B39A72]/30 text-[#E8E0D2] hover:text-white hover:border-[#B39A72] focus-visible:ring-2 focus-visible:ring-[#B39A72] focus:outline-none transition-colors cursor-pointer"
              aria-label="Закрыть меню"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items with Staggered Entrance */}
          <div className="max-w-2xl mx-auto w-full my-auto py-8">
            <div className="space-y-4 sm:space-y-6">
              {menuItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05, duration: 0.4 }}
                >
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className="group w-full flex items-baseline justify-between text-left transition-colors cursor-pointer border-b border-[#2A2622] pb-3 focus-visible:ring-1 focus-visible:ring-[#B39A72] focus:outline-none rounded-sm px-1.5"
                  >
                    <span className="font-serif text-2xl sm:text-4xl text-[#F5F1E9] group-hover:text-[#B39A72] transition-colors tracking-wide">
                      {item.label}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[#847B72] group-hover:text-[#E8E0D2] transition-colors font-light">
                      {item.sub}
                    </span>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom Footer info */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#847B72] font-light">
            <span>Kurmet & Balnur • Wedding Celebration 2026</span>
            <span>Любовь в каждом моменте</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
