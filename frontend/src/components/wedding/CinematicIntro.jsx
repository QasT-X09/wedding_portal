import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import GoldenCircleTransition from './GoldenCircleTransition';

/**
 * CinematicIntro - PAGE 1 Luxury Wedding Intro
 *
 * Matching wedding-reference.png:
 *  - Deep black atmosphere with warm champagne golden radial aura (#0D0C0B, #B39A72)
 *  - GoldenCircleTransition: thin champagne circle, specular 4-point diamond star flares,
 *    and golden stardust particle trail.
 *  - Scroll-driven scaling via Framer Motion useScroll, useTransform, useSpring (stiffness: 85, damping: 26).
 *  - Scale progression: ~260px -> medium -> large -> 24x beyond viewport across 260vh container.
 *  - Center Editorial Typography:
 *      * "Kurmet & Balnur" in high-fashion editorial serif (Cormorant Garamond, tracking 0.2em, font-light).
 *      * Subtle diamond separator ✦
 *      * "OUR STORY" (uppercase, wide tracking).
 *      * "A MOMENT TO REMEMBER" (uppercase, wide tracking).
 *  - Bottom Scroll Indicator:
 *      * Vertical hairline indicator, "SCROLL", and downward chevron ∨.
 *  - COMPLETE REMOVAL OF PAGE 2 INTERMEDIATE PREVIEW:
 *      * Zero preview photo cards. The circle expands to envelop the screen,
 *        transitioning directly toward the 3D Carousel.
 */
export default function CinematicIntro({ onEnterGallery }) {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll tracking across the 260vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Spring physics for buttery 60 FPS scroll damping (stiffness ~85, damping ~26)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 26,
    mass: 0.25,
    restDelta: 0.0005,
  });

  // Hero typography fades out gracefully on scroll
  const textOpacity = useTransform(smoothProgress, [0.03, 0.22], [1, 0]);
  const textScale = useTransform(smoothProgress, [0.03, 0.22], [1, 0.93]);
  const textY = useTransform(smoothProgress, [0.03, 0.22], [0, -32]);

  // Bottom scroll guidance indicator fades out immediately on first scroll
  const hintOpacity = useTransform(smoothProgress, [0, 0.08], [1, 0]);

  const scrollToNextSection = () => {
    if (onEnterGallery) {
      onEnterGallery();
    }
    const targetEl = document.getElementById('wedding-content-start');
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({
        top: window.innerHeight * 2.6,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div ref={containerRef} className="relative h-[260vh] w-full bg-transparent">
      {/* Sticky Fullscreen Stage */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-grain select-none">
        
        {/* Layered cinematic illumination: concentrated flare at the upper-right
            edge of the ring plus a restrained vignette, like the supplied artwork. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_74%_18%,rgba(151,105,53,0.24),transparent_23%),radial-gradient(ellipse_at_21%_72%,rgba(91,59,29,0.18),transparent_30%),radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.58)_100%)] pointer-events-none" />
        <div className="absolute w-[70vw] max-w-[1050px] aspect-square rounded-full bg-[radial-gradient(circle,rgba(179,154,114,0.14)_0%,rgba(179,154,114,0.04)_48%,transparent_72%)] blur-[110px] pointer-events-none" />

        {/* 1. THE SIGNATURE GOLDEN CIRCLE & SPECULAR GLINTS SYSTEM */}
        <GoldenCircleTransition smoothProgress={smoothProgress} />

        {/* 2. CENTER EDITORIAL TYPOGRAPHY MATCHING REFERENCE */}
        <motion.div
          style={{
            opacity: textOpacity,
            scale: textScale,
            y: textY,
          }}
          className="relative z-30 text-center px-4 flex flex-col items-center pointer-events-auto"
        >
          {/* "Kurmet & Balnur" in high-fashion editorial serif */}
          <h1 className="font-serif text-[clamp(2.5rem,8.2vw,10.5rem)] font-light text-[#f8f0e5] tracking-[0.075em] sm:tracking-[0.105em] pl-[0.075em] sm:pl-[0.105em] mb-3 text-center leading-[0.86] whitespace-nowrap drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            Kurmet &amp; Balnur
          </h1>

          {/* Subtle Diamond Separator ✦ */}
          <div className="flex items-center justify-center gap-3 my-3 sm:my-5 text-[#B39A72]/85">
            <span className="w-12 sm:w-20 h-px bg-[#B39A72]/45" />
            <span className="text-[10px] sm:text-xs tracking-widest">✦</span>
            <span className="w-12 sm:w-20 h-px bg-[#B39A72]/45" />
          </div>

          {/* "OUR STORY" (Uppercase, wide tracking) */}
          <div className="text-[10px] sm:text-xs tracking-[0.48em] text-[#d9bea0] uppercase font-medium pl-[0.48em] mb-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
            OUR STORY
          </div>

          {/* "A MOMENT TO REMEMBER" (Uppercase, wide tracking) */}
          <p className="text-[11px] sm:text-xs md:text-sm tracking-[0.32em] text-[#E8E0D2]/80 uppercase font-light pl-[0.32em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
            A MOMENT TO REMEMBER
          </p>
        </motion.div>

        {/* 3. BOTTOM SCROLL INDICATOR MATCHING REFERENCE */}
        <motion.div
          style={{ opacity: hintOpacity }}
          onClick={scrollToNextSection}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              scrollToNextSection();
            }
          }}
          tabIndex={0}
          className="absolute bottom-8 sm:bottom-10 z-30 flex flex-col items-center gap-2 cursor-pointer text-[#B39A72]/80 hover:text-[#B39A72] focus-visible:ring-1 focus-visible:ring-[#B39A72] focus:outline-none rounded transition-colors"
          role="button"
          aria-label="Scroll to explore our wedding story"
        >
          {/* Vertical hairline indicator */}
          <div className="w-[1px] h-8 sm:h-10 bg-gradient-to-b from-transparent via-[#B39A72]/60 to-[#B39A72]" />

          {/* SCROLL uppercase tracked text */}
          <span className="text-[9px] sm:text-[10px] tracking-[0.38em] uppercase font-light text-[#B39A72] pl-[0.38em]">
            SCROLL
          </span>

          {/* Downward chevron ∨ */}
          <motion.div
            animate={shouldReduceMotion ? { y: 0 } : { y: [0, 4, 0] }}
            transition={shouldReduceMotion ? { duration: 0 } : { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="text-xs text-[#B39A72]"
          >
            <svg
              className="w-3.5 h-3.5 stroke-current"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
