import React from 'react';
import { motion } from 'framer-motion';
import { WEDDING_CATEGORIES } from '../../data/weddingPhotos';

export default function GalleryCategories({ activeCategory, onSelectCategory }) {
  return (
    <div className="w-full border-b border-[#2A2622] py-4 mb-8 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-start sm:justify-center gap-2 sm:gap-6 min-w-max">
        {WEDDING_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`relative px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors cursor-pointer outline-none ${
                isActive ? 'text-[#F5F1E9] font-medium' : 'text-[#847B72] hover:text-[#E8E0D2]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeWeddingCategoryUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#B39A72]"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
