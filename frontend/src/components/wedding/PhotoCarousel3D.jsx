import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** A genuine rotating 3D ring. MotionValues animate without React render loops. */
export default function PhotoCarousel3D({ photos = [], onPhotoClick }) {
  const autoRotationRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const lastWheelTimeRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const shouldReduceMotion = useReducedMotion();
  const [windowWidth, setWindowWidth] = useState(typeof window === 'undefined' ? 1200 : window.innerWidth);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRotation = useMotionValue(0);
  const ringRotation = useMotionValue(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const cardWidth = isMobile ? 176 : isTablet ? 230 : 280;
  const cardHeight = isMobile ? 246 : isTablet ? 320 : 380;
  const stageHeight = isMobile ? 415 : isTablet ? 510 : 600;
  const radius = isMobile ? 255 : isTablet ? 340 : 430;
  const displayPhotos = useMemo(() => (isMobile ? photos.slice(0, 5) : photos), [isMobile, photos]);
  const totalCount = displayPhotos.length;

  const stopAutoRotation = useCallback(() => {
    autoRotationRef.current?.stop();
    autoRotationRef.current = null;
    window.clearTimeout(resumeTimerRef.current);
  }, []);

  const startAutoRotation = useCallback(() => {
    if (shouldReduceMotion || totalCount < 2) return;
    autoRotationRef.current?.stop();
    autoRotationRef.current = animate(carouselRotation, carouselRotation.get() + 360, {
      duration: isMobile ? 34 : 42,
      ease: 'linear',
      repeat: Infinity,
    });
  }, [carouselRotation, isMobile, shouldReduceMotion, totalCount]);

  const resumeAutoRotation = useCallback(() => {
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(startAutoRotation, 1400);
  }, [startAutoRotation]);

  useEffect(() => {
    startAutoRotation();
    const ringControls = shouldReduceMotion ? null : animate(ringRotation, 360, {
      duration: 76, ease: 'linear', repeat: Infinity,
    });
    return () => {
      stopAutoRotation();
      ringControls?.stop();
      window.clearTimeout(resumeTimerRef.current);
    };
  }, [ringRotation, shouldReduceMotion, startAutoRotation, stopAutoRotation]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(totalCount - 1, 0)));
  }, [totalCount]);

  const rotateBy = useCallback((direction) => {
    if (totalCount < 2) return;
    stopAutoRotation();
    carouselRotation.set(carouselRotation.get() + direction * (360 / totalCount));
    setActiveIndex((current) => (current - direction + totalCount) % totalCount);
    resumeAutoRotation();
  }, [carouselRotation, resumeAutoRotation, stopAutoRotation, totalCount]);

  const handlePointerDown = (event) => {
    stopAutoRotation();
    pointerRef.current = { x: event.clientX, y: event.clientY, active: true };
    if (event.pointerType !== 'touch') event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerUp = (event) => {
    if (!pointerRef.current.active) return;
    const deltaX = event.clientX - pointerRef.current.x;
    const deltaY = event.clientY - pointerRef.current.y;
    pointerRef.current.active = false;
    if (event.pointerType !== 'touch') event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (Math.abs(deltaX) > 34 && Math.abs(deltaX) > Math.abs(deltaY)) {
      rotateBy(deltaX < 0 ? -1 : 1);
    } else {
      resumeAutoRotation();
    }
  };

  const handleWheel = (event) => {
    if (Math.abs(event.deltaY) < 18) return;
    const now = performance.now();
    if (now - lastWheelTimeRef.current < 420) return;
    lastWheelTimeRef.current = now;
    rotateBy(event.deltaY > 0 ? -1 : 1);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (event.key === 'ArrowLeft') rotateBy(1);
      if (event.key === 'ArrowRight') rotateBy(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rotateBy]);

  if (!totalCount) return null;

  return (
    <section className="relative w-full overflow-hidden bg-[#0D0C0B] select-none" aria-label="3D Photo Carousel">
      <div
        className="relative mx-auto flex w-full items-center justify-center touch-pan-y"
        style={{ height: `${stageHeight}px`, perspective: '1200px', perspectiveOrigin: '50% 42%' }}
        role="region"
        aria-roledescription="carousel"
        aria-label="3D Photo Carousel"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={resumeAutoRotation}
        onWheel={handleWheel}
      >
        <div className="pointer-events-none absolute inset-x-0 top-[12%] mx-auto h-[72%] max-w-5xl rounded-full bg-[radial-gradient(ellipse,rgba(179,154,114,0.15)_0%,rgba(179,154,114,0.04)_46%,transparent_72%)] blur-[90px]" />

        <motion.div
          className="pointer-events-none absolute bottom-7 left-1/2 z-10 h-[118px] w-[320px] -translate-x-1/2 sm:bottom-10 sm:h-[175px] sm:w-[590px] lg:h-[210px] lg:w-[780px]"
          style={{ rotateZ: shouldReduceMotion ? 0 : ringRotation }}
        >
          <div className="relative h-full w-full rounded-full" style={{
            transform: 'perspective(650px) rotateX(74deg)',
            border: '1px solid rgba(179, 154, 114, 0.48)',
            boxShadow: '0 0 28px 5px rgba(179, 154, 114, 0.22), inset 0 0 20px rgba(179, 154, 114, 0.14)',
          }}>
            <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-[#f1dbb8] shadow-[0_0_12px_3px_rgba(179,154,114,0.8)]" />
          </div>
        </motion.div>

        <motion.div className="relative z-20" style={{
          width: `${cardWidth}px`, height: `${cardHeight}px`,
          rotateY: shouldReduceMotion ? 0 : carouselRotation,
          transformStyle: 'preserve-3d',
        }}>
          {displayPhotos.map((photo, index) => {
            const angle = (360 / totalCount) * index;
            return (
              <div key={photo.id} className="absolute inset-0" style={{
                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                transformStyle: 'preserve-3d', backfaceVisibility: 'hidden',
              }}>
                <button
                  type="button"
                  tabIndex={index === activeIndex ? 0 : -1}
                  onClick={() => onPhotoClick?.(photo, index)}
                  className="h-full w-full overflow-hidden rounded-2xl border border-[#B39A72]/35 bg-[#171513] shadow-[0_18px_48px_rgba(0,0,0,0.72)] transition-colors hover:border-[#d7bc92] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B39A72]"
                  aria-label="Открыть фотографию"
                >
                  <img src={photo.thumbnail || photo.url} alt="" draggable={false} loading={index < 3 ? 'eager' : 'lazy'} className="h-full w-full object-cover [filter:brightness(.82)]" />
                </button>
              </div>
            );
          })}
        </motion.div>

        <button type="button" onClick={() => rotateBy(1)} className="absolute left-3 top-1/2 z-30 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[#B39A72]/45 bg-[#171513]/70 text-[#E8E0D2] backdrop-blur hover:border-[#d7bc92] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B39A72] sm:left-7" aria-label="Предыдущее фото">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => rotateBy(-1)} className="absolute right-3 top-1/2 z-30 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[#B39A72]/45 bg-[#171513]/70 text-[#E8E0D2] backdrop-blur hover:border-[#d7bc92] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B39A72] sm:right-7" aria-label="Следующее фото">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
