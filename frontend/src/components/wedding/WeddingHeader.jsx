import React from 'react';
import { Heart, Upload, Menu } from 'lucide-react';

export default function WeddingHeader({
  currentView = 'gallery',
  onNavigate,
  onOpenMenu,
  onOpenUpload,
  onOpenFavorites,
  onNavigateGallery,
  favoritesCount = 0
}) {
  const handleLogoClick = () => {
    if (onNavigate) {
      onNavigate('intro');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGallery = () => {
    if (onNavigateGallery) {
      onNavigateGallery();
    } else if (onNavigate) {
      onNavigate('gallery');
    }
  };

  const handleFavorites = () => {
    if (onOpenFavorites) {
      onOpenFavorites();
    } else if (onNavigate) {
      onNavigate('favorites');
    }
  };

  const handleUpload = () => {
    if (onOpenUpload) {
      onOpenUpload();
    } else if (onNavigate) {
      onNavigate('upload');
    }
  };

  const handleMenu = () => {
    if (onOpenMenu) {
      onOpenMenu();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0D0C0B]/75 backdrop-blur-md border-b border-[#B39A72]/15 px-3 sm:px-8 md:px-12 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Kurmet & Balnur editorial serif logo */}
        <button
          onClick={handleLogoClick}
          className="font-serif text-base sm:text-2xl text-[#F5F1E9] tracking-[0.14em] sm:tracking-[0.22em] pl-1 hover:text-[#B39A72] transition-colors duration-300 cursor-pointer font-light whitespace-nowrap focus-visible:ring-1 focus-visible:ring-[#B39A72] focus:outline-none rounded-sm"
          aria-label="На главную: Kurmet & Balnur"
        >
          Kurmet & Balnur
        </button>

        {/* Right-side actions: ГАЛЕРЕЯ, ♡ (with favorites badge), ЗАГРУЗИТЬ, MENU */}
        <div className="flex items-center gap-1.5 sm:gap-4 md:gap-6 shrink-0">
          
          {/* ГАЛЕРЕЯ */}
          <button
            onClick={handleGallery}
            className={`text-[11px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors duration-200 cursor-pointer font-medium py-1 px-1.5 sm:px-2 rounded focus-visible:ring-1 focus-visible:ring-[#B39A72] focus:outline-none ${
              currentView === 'gallery'
                ? 'text-[#B39A72]'
                : 'text-[#E8E0D2] hover:text-[#B39A72]'
            }`}
            aria-label="Свадебная галерея"
          >
            ГАЛЕРЕЯ
          </button>

          {/* ♡ (Favorites with badge) */}
          <button
            onClick={handleFavorites}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer text-xs focus-visible:ring-1 focus-visible:ring-[#B39A72] focus:outline-none ${
              currentView === 'favorites'
                ? 'border-[#B39A72] bg-[#B39A72]/15 text-white'
                : 'border-[#3A342E]/80 bg-[#171513]/60 text-[#E8E0D2] hover:border-[#B39A72]/60 hover:text-white'
            }`}
            aria-label={`Избранное: ${favoritesCount}`}
            title="Избранные фотографии"
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${favoritesCount > 0 ? 'text-[#B39A72] fill-[#B39A72]' : 'text-[#E8E0D2]'}`} />
            {favoritesCount > 0 && (
              <span className="font-mono text-[11px] sm:text-xs text-[#B39A72] font-semibold">{favoritesCount}</span>
            )}
          </button>

          {/* ЗАГРУЗИТЬ */}
          <button
            onClick={handleUpload}
            className="px-2.5 sm:px-4 py-1.5 rounded-full bg-[#B39A72] hover:bg-[#C5AD85] text-[#0D0C0B] text-[11px] sm:text-xs font-medium tracking-wider uppercase transition-all duration-200 shadow-sm shadow-[#B39A72]/20 hover:shadow-[#B39A72]/40 cursor-pointer flex items-center gap-1.5 focus-visible:ring-1 focus-visible:ring-[#B39A72] focus:outline-none"
            aria-label="Загрузить фото"
            title="Загрузить фото"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ЗАГРУЗИТЬ</span>
          </button>

          {/* MENU */}
          <button
            onClick={handleMenu}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-[#3A342E]/80 bg-[#171513]/60 text-[#E8E0D2] hover:text-white hover:border-[#B39A72]/60 transition-all duration-200 cursor-pointer flex items-center gap-1.5 focus-visible:ring-1 focus-visible:ring-[#B39A72] focus:outline-none"
            aria-label="Меню навигации"
            title="Меню"
          >
            <Menu className="w-4 h-4 text-[#E8E0D2]" />
            <span className="hidden md:inline text-xs uppercase tracking-[0.15em] font-medium">MENU</span>
          </button>
        </div>

      </div>
    </header>
  );
}
