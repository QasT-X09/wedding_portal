import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, Sparkles, MoveHorizontal } from 'lucide-react';

export default function CylindricalCarousel({
  photos = [],
  onPhotoClick,
  onToggleFavorite,
  favorites = [],
  title = "Моменты вечности",
  subtitle = "3D Панорама любви"
}) {
  const containerRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // Responsive resize tracking
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Geometry dimensions based on breakpoint
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const cardWidth = isMobile ? 165 : isTablet ? 210 : 260;
  const cardHeight = isMobile ? 240 : isTablet ? 300 : 370;
  const perspective = isMobile ? 750 : isTablet ? 950 : 1200;

  // Cylinder slot preparation: ensure 8 to 10 slots
  const slotCount = Math.min(Math.max(photos.length > 0 ? photos.length : 8, 8), 10);
  const items = useMemo(() => {
    if (!photos || photos.length === 0) return [];
    const list = [];
    for (let i = 0; i < slotCount; i++) {
      list.push(photos[i % photos.length]);
    }
    return list;
  }, [photos, slotCount]);

  // Radius calculation: R = (w/2) / tan(pi / N) + gap
  const anglePerItem = 360 / slotCount;
  const radius = useMemo(() => {
    const halfAngleRad = Math.PI / slotCount;
    return Math.round((cardWidth / 2) / Math.tan(halfAngleRad)) + (isMobile ? 12 : 24);
  }, [cardWidth, slotCount, isMobile]);

  // 1. Scroll-driven rotation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rawScrollAngle = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const smoothScrollAngle = useSpring(rawScrollAngle, {
    stiffness: 65,
    damping: 24,
    restDelta: 0.001
  });

  // 2. Manual drag / swipe rotation
  const manualAngle = useMotionValue(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const totalDragDistRef = useRef(0);
  const rafIdRef = useRef(null);

  const stopInertia = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const startInertia = useCallback(() => {
    stopInertia();
    const friction = 0.93;
    const tick = () => {
      velocityRef.current *= friction;
      manualAngle.set(manualAngle.get() + velocityRef.current * 16 * 0.4);
      if (Math.abs(velocityRef.current) > 0.005) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        rafIdRef.current = null;
      }
    };
    rafIdRef.current = requestAnimationFrame(tick);
  }, [manualAngle, stopInertia]);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      stopInertia();
    };
  }, [stopInertia]);

  const handlePointerDown = (e) => {
    stopInertia();
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    totalDragDistRef.current = 0;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dt = Math.max(now - lastTimeRef.current, 1);
    const dx = e.clientX - lastXRef.current;
    totalDragDistRef.current += Math.abs(dx);

    velocityRef.current = dx / dt;
    lastXRef.current = e.clientX;
    lastTimeRef.current = now;

    // Sensitivity: 0.38 deg per pixel
    manualAngle.set(manualAngle.get() + dx * 0.38);
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already released
    }
    startInertia();
  };

  // Combine scroll + manual angles seamlessly
  const combinedAngle = useTransform(
    [smoothScrollAngle, manualAngle],
    ([scrollDeg, manDeg]) => scrollDeg + manDeg
  );

  const cylinderTransform = useTransform(
    combinedAngle,
    (angle) => `rotateX(-5deg) rotateY(${angle}deg)`
  );

  // Buttons to spin left/right
  const spinStep = (direction) => {
    stopInertia();
    manualAngle.set(manualAngle.get() + direction * anglePerItem);
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden py-16 sm:py-24 bg-[#0D0C0B] select-none"
    >
      {/* Background Champagne Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full bg-[#B39A72]/10 blur-[130px] pointer-events-none" />

      {/* Section Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#B39A72]/30 bg-[#171513]/60 mb-3 text-[10px] uppercase tracking-[0.3em] text-[#B39A72] font-medium">
          <Sparkles className="w-3 h-3" />
          <span>{subtitle}</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl text-[#F5F1E9] tracking-wide font-light">
          {title}
        </h2>
        <p className="text-xs text-[#847B72] tracking-[0.2em] uppercase mt-2 font-light flex items-center justify-center gap-2">
          <MoveHorizontal className="w-3.5 h-3.5 text-[#B39A72]" />
          <span>Вращайте свайпом или прокруткой</span>
        </p>
      </div>

      {/* 3D Stage Container */}
      <div
        className="relative w-full h-[380px] sm:h-[460px] lg:h-[520px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
        style={{ perspective: `${perspective}px`, perspectiveOrigin: '50% 50%' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Rotating Cylinder Hub */}
        <motion.div
          style={{
            transform: cylinderTransform,
            transformStyle: 'preserve-3d',
            width: cardWidth,
            height: cardHeight
          }}
          className="relative flex items-center justify-center"
        >
          {items.map((photo, index) => {
            const isFav = favorites.includes(photo.id);
            const cardAngle = index * anglePerItem;

            return (
              <div
                key={`${photo.id}-${index}`}
                style={{
                  position: 'absolute',
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  transform: `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
                className="group rounded-xl overflow-hidden bg-[#171513] border border-[#B39A72]/30 hover:border-[#B39A72] shadow-2xl transition-all duration-300 pointer-events-auto"
                onClick={() => {
                  if (totalDragDistRef.current > 6) return;
                  if (onPhotoClick) onPhotoClick(photo);
                }}
              >
                {/* Photo Image */}
                <div className="w-full h-full relative overflow-hidden bg-[#121110]">
                  <img
                    src={photo.thumbnail || photo.url}
                    alt={photo.title || 'Wedding memory'}
                    loading="lazy"
                    draggable={false}
                    className="w-full h-full object-cover filter brightness-[0.92] group-hover:brightness-105 group-hover:scale-105 transition-all duration-500"
                  />

                  {/* Top Bar with Favorite Heart */}
                  <div className="absolute top-3 right-3 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleFavorite) onToggleFavorite(photo.id);
                      }}
                      className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20 hover:border-[#B39A72] text-white transition-colors cursor-pointer"
                      aria-label="В избранное"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors ${
                          isFav ? 'text-[#B39A72] fill-[#B39A72]' : 'text-white'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Bottom Vignette & Metadata */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end pointer-events-none">
                    <div className="font-serif text-sm sm:text-base text-[#F5F1E9] font-light leading-snug line-clamp-1">
                      {photo.title || photo.author || 'Kurmet & Balnur'}
                    </div>
                    {photo.category && (
                      <span className="text-[9px] uppercase tracking-widest text-[#B39A72] font-mono mt-1">
                        {photo.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Floor Shadow / Golden Reflection */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[300px] sm:w-[480px] h-[30px] rounded-full bg-[#B39A72]/15 blur-2xl pointer-events-none" />
      </div>

      {/* Manual Step Controls */}
      <div className="relative z-10 flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => spinStep(-1)}
          className="p-2.5 rounded-full border border-[#2A2622] bg-[#171513]/80 hover:border-[#B39A72] text-[#E8E0D2] hover:text-white transition-all cursor-pointer"
          aria-label="Назад"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#847B72] font-mono">
          3D КОЛЬЦО
        </span>
        <button
          onClick={() => spinStep(1)}
          className="p-2.5 rounded-full border border-[#2A2622] bg-[#171513]/80 hover:border-[#B39A72] text-[#E8E0D2] hover:text-white transition-all cursor-pointer"
          aria-label="Вперед"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
