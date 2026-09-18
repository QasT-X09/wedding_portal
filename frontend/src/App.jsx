import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import CinematicIntro from './components/wedding/CinematicIntro';
import FallingPetals from './components/wedding/FallingPetals';
import WeddingHeader from './components/wedding/WeddingHeader';
import PhotoCarousel3D from './components/wedding/PhotoCarousel3D';
import GalleryCategories from './components/wedding/GalleryCategories';
import WeddingGallery from './components/wedding/WeddingGallery';
import PhotoViewer from './components/wedding/PhotoViewer';
import FavoritesGallery from './components/wedding/FavoritesGallery';
import UploadPhotos from './components/wedding/UploadPhotos';
import WeddingMenu from './components/wedding/WeddingMenu';
import AboutSection from './components/wedding/AboutSection';
import WishesSection from './components/wedding/WishesSection';
import ProjectorView from './components/ProjectorView';
import QRView from './components/QRView';

import { PLACEHOLDER_WEDDING_PHOTOS } from './data/weddingPhotos';

export default function App() {
  // Navigation & View State: 'gallery' | 'favorites' | 'upload' | 'about' | 'wishes' | 'live' | 'qr'
  const [currentView, setCurrentView] = useState('gallery');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Photos & Categories: allPhotos strictly contains guest-uploaded media from /api/media
  const [allPhotos, setAllPhotos] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Все');

  // Favorites (persisted in localStorage)
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('kurmet_balnur_wedding_favorites') || localStorage.getItem('kb_wedding_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Fullscreen PhotoViewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerPhotos, setViewerPhotos] = useState(PLACEHOLDER_WEDDING_PHOTOS);

  const mapBackendCategory = (cat) => {
    const map = {
      toasts: 'Банкет',
      dances: 'Вечеринка',
      group: 'Друзья',
      decor: 'Подготовка',
      cake: 'Банкет',
      portrait: 'Портреты'
    };
    return map[cat] || 'Все';
  };

  // Load photos from backend /api/media
  const loadMedia = async () => {
    try {
      const resp = await fetch('/api/media');
      if (resp.ok) {
        const data = await resp.json();
        const serverItems = (data.items || []).map(item => ({
          id: item.id,
          url: item.file_url,
          thumbnail: item.thumbnail_url || item.file_url,
          title: item.wishes || item.guest_name,
          author: item.guest_name,
          category: mapBackendCategory(item.category),
          aspect: item.width && item.height && (item.width > item.height * 1.3) ? 'wide' : 'portrait',
          wishes: item.wishes,
          date: item.created_at
        }));

        // Bottom gallery displays strictly guest uploads from /api/media
        setAllPhotos(serverItems);
      }
    } catch (err) {
      console.warn('Backend media load error:', err);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('kurmet_balnur_wedding_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (photoId) => {
    setFavorites(prev =>
      prev.includes(photoId) ? prev.filter(id => id !== photoId) : [...prev, photoId]
    );
  };

  // The opening wheel is deliberately reserved for the couple's supplied photos.
  const carouselPhotos = PLACEHOLDER_WEDDING_PHOTOS.slice(0, 10);

  // All photos that can be favorited (includes both guest uploads and curated carousel placeholders)
  const allFavoritablePhotos = useMemo(() => {
    const list = [...allPhotos];
    PLACEHOLDER_WEDDING_PHOTOS.forEach(p => {
      if (!list.some(item => item.id === p.id)) {
        list.push(p);
      }
    });
    return list;
  }, [allPhotos]);

  // Filter bottom photos by selected category (R3)
  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'Все') return allPhotos;
    return allPhotos.filter(p => p.category === activeCategory);
  }, [allPhotos, activeCategory]);

  const handlePrevPhoto = () => {
    setViewerIndex(prev => (prev > 0 ? prev - 1 : viewerPhotos.length - 1));
  };

  const handleNextPhoto = () => {
    setViewerIndex(prev => (prev < viewerPhotos.length - 1 ? prev + 1 : 0));
  };

  // If projector screen is opened
  if (currentView === 'live') {
    return <ProjectorView onExit={() => setCurrentView('gallery')} />;
  }

  return (
    <div className="relative min-h-screen bg-[#0D0C0B] text-[#F5F1E9] overflow-x-clip select-none">
      {/* PERSISTENT 3-LAYER FALLING ROSE PETALS (Runs continuously across Intro, Carousel, & Gallery) */}
      <FallingPetals />

      {/* 1. CINEMATIC SCROLL-DRIVEN INTRO WITH EXPANDING GOLDEN CIRCLE */}
      <CinematicIntro
        onEnterGallery={() => {
          setCurrentView('gallery');
        }}
      />

      {/* 2. PERSISTENT FLOATING STICKY HEADER & CONTENT */}
      <div id="wedding-content-start" className="relative z-20 min-h-screen">
        <WeddingHeader
          currentView={currentView}
          onNavigate={(view) => {
            if (view === 'intro') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              setCurrentView(view);
              const el = document.getElementById('wedding-content-start');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenUpload={() => setCurrentView('upload')}
          onOpenFavorites={() => setCurrentView('favorites')}
          onNavigateGallery={() => {
            setCurrentView('gallery');
            const el = document.getElementById('wedding-content-start');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          favoritesCount={favorites.length}
        />

        {/* 3. MAIN VIEWS SWITCHER */}
        <main className="relative z-10 min-h-[60vh] pt-6">
        <AnimatePresence mode="wait">
          {/* Gallery View */}
          {currentView === 'gallery' && (
            <motion.div
              key="gallery-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* 3D Perspective Photo Arc Carousel (Middle Section) */}
              <PhotoCarousel3D
                photos={carouselPhotos}
                onPhotoClick={(photo, idx) => {
                  const index = idx !== undefined && idx >= 0 ? idx : carouselPhotos.findIndex(p => p.id === photo.id);
                  setViewerPhotos(carouselPhotos);
                  setViewerIndex(index >= 0 ? index : 0);
                  setViewerOpen(true);
                }}
              />

              {/* Guest Chronicle Header */}
              <div className="text-center pt-16 pb-4">
                <h2 className="font-serif text-3xl sm:text-4xl text-[#F5F1E9] font-light tracking-wide">
                  Свадебная фотохроника
                </h2>
                <p className="text-xs uppercase tracking-[0.25em] text-[#B39A72] mt-2 font-medium">
                  Кадры наших гостей
                </p>
              </div>

              {/* Categories */}
              <GalleryCategories
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
              />

              {/* Editorial Masonry Gallery (Exclusively Guest Uploads) */}
              <WeddingGallery
                photos={filteredPhotos}
                onPhotoClick={(idx) => {
                  setViewerPhotos(filteredPhotos);
                  setViewerIndex(idx);
                  setViewerOpen(true);
                }}
                onToggleFavorite={toggleFavorite}
                favorites={favorites}
                onOpenUpload={() => setCurrentView('upload')}
              />
            </motion.div>
          )}

          {/* Favorites View */}
          {currentView === 'favorites' && (
            <motion.div
              key="favorites-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <FavoritesGallery
                photos={allFavoritablePhotos}
                favoriteIds={favorites}
                onPhotoClick={(idx) => {
                  setViewerPhotos(allFavoritablePhotos);
                  setViewerIndex(idx);
                  setViewerOpen(true);
                }}
                onToggleFavorite={toggleFavorite}
                onBackToGallery={() => setCurrentView('gallery')}
              />
            </motion.div>
          )}

          {/* Upload View */}
          {currentView === 'upload' && (
            <motion.div
              key="upload-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <UploadPhotos
                onBackToGallery={() => setCurrentView('gallery')}
                onUploadCompleted={() => {
                  loadMedia();
                }}
              />
            </motion.div>
          )}

          {/* About View */}
          {currentView === 'about' && (
            <motion.div
              key="about-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <AboutSection onBackToGallery={() => setCurrentView('gallery')} />
            </motion.div>
          )}

          {/* Wishes View */}
          {currentView === 'wishes' && (
            <motion.div
              key="wishes-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <WishesSection
                onOpenUpload={() => setCurrentView('upload')}
                onBackToGallery={() => setCurrentView('gallery')}
              />
            </motion.div>
          )}

          {/* QR View */}
          {currentView === 'qr' && (
            <motion.div
              key="qr-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <QRView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 4. FULLSCREEN PHOTO VIEWER (LIGHTBOX) */}
      <PhotoViewer
        photos={viewerPhotos}
        currentIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onPrev={handlePrevPhoto}
        onNext={handleNextPhoto}
        onToggleFavorite={toggleFavorite}
        isFavorite={viewerPhotos[viewerIndex] && favorites.includes(viewerPhotos[viewerIndex].id)}
      />

      {/* 5. FULLSCREEN WEDDING MENU */}
      <WeddingMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(menuId) => {
          if (menuId === 'intro') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setCurrentView(menuId);
            const el = document.getElementById('wedding-content-start');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        favoritesCount={favorites.length}
      />

      {/* 6. EDITORIAL WEDDING FOOTER */}
      <footer className="relative z-10 py-12 border-t border-[#1C1A17] text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          <span className="font-serif text-2xl sm:text-3xl tracking-[0.2em] text-[#B39A72] font-light">
            Kurmet & Balnur
          </span>
          <div className="text-[11px] uppercase tracking-[0.3em] text-[#847B72] font-light">
            A MOMENT TO REMEMBER • 2026
          </div>
          <div className="flex items-center gap-6 mt-2 text-xs text-[#E8E0D2]/70 font-light">
            <button onClick={() => setCurrentView('gallery')} className="hover:text-white cursor-pointer">Галерея</button>
            <span>•</span>
            <button onClick={() => setCurrentView('favorites')} className="hover:text-white cursor-pointer">Избранное</button>
            <span>•</span>
            <button onClick={() => setCurrentView('upload')} className="hover:text-white cursor-pointer">Загрузить фото</button>
            <span>•</span>
            <button onClick={() => setCurrentView('live')} className="hover:text-white cursor-pointer">Проектор</button>
            <span>•</span>
            <button onClick={() => setCurrentView('qr')} className="hover:text-white cursor-pointer">QR карточка</button>
          </div>
        </div>
      </footer>
    </div>
  </div>
  );
}
