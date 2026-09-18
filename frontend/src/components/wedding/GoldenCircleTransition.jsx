import React, { useMemo } from 'react';
import { motion, useTransform, useReducedMotion } from 'framer-motion';

/**
 * Specular 4-Point Diamond Star Flare Component
 * Renders an authentic luxury astroid diamond glint with needle rays
 */
function DiamondStarFlare({ x, y, size = 22, delay = 0, duration = 2.4, rayLength = 32, shouldReduceMotion = false }) {
  return (
    <motion.g
      transform={`translate(${x}, ${y})`}
      animate={
        shouldReduceMotion
          ? { scale: 1, opacity: 0.9 }
          : {
              scale: [0.82, 1.28, 0.82],
              opacity: [0.75, 1, 0.75],
            }
      }
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay,
            }
      }
      className="pointer-events-none"
    >
      {/* Soft radial glow backing */}
      <circle r={size * 0.8} fill="url(#flareGlow)" opacity={0.65} />

      {/* Primary Horizontal Needle Ray */}
      <line
        x1={-rayLength}
        y1={0}
        x2={rayLength}
        y2={0}
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity={0.9}
      />
      <line
        x1={-rayLength * 1.5}
        y1={0}
        x2={rayLength * 1.5}
        y2={0}
        stroke="#FFE8B2"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity={0.6}
      />

      {/* Primary Vertical Needle Ray */}
      <line
        x1={0}
        y1={-rayLength * 0.85}
        x2={0}
        y2={rayLength * 0.85}
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity={0.9}
      />
      <line
        x1={0}
        y1={-rayLength * 1.25}
        x2={0}
        y2={rayLength * 1.25}
        stroke="#FFE8B2"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity={0.6}
      />

      {/* 45-degree diagonal secondary rays */}
      <line
        x1={-rayLength * 0.38}
        y1={-rayLength * 0.38}
        x2={rayLength * 0.38}
        y2={rayLength * 0.38}
        stroke="#FFF2D6"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity={0.7}
      />
      <line
        x1={rayLength * 0.38}
        y1={-rayLength * 0.38}
        x2={-rayLength * 0.38}
        y2={rayLength * 0.38}
        stroke="#FFF2D6"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity={0.7}
      />

      {/* Astroid diamond core (concave 4-point star) */}
      <path
        d={`M 0,${-size * 0.65} Q 0,0 ${size * 0.65},0 Q 0,0 0,${size * 0.65} Q 0,0 ${-size * 0.65},0 Q 0,0 0,${-size * 0.65} Z`}
        fill="#FFFFFF"
        opacity={0.95}
      />

      {/* Brilliant center core point */}
      <circle r={2} fill="#FFFFFF" />
    </motion.g>
  );
}

/**
 * GoldenCircleTransition
 * 
 * Thin champagne gold circle (#B39A72) with warm glow aura,
 * specular 4-point diamond star flares at radial positions on the ring,
 * and golden stardust particle trail floating around the ring.
 *
 * Driven by Framer Motion smoothProgress (from useScroll + useSpring in CinematicIntro).
 * Progresses from small circle (~260px) -> medium -> large -> beyond viewport (24x scale)
 * across the 260vh scroll container.
 */
export default function GoldenCircleTransition({ smoothProgress }) {
  const shouldReduceMotion = useReducedMotion();

  // SVG coordinate dimensions
  const SVG_SIZE = 600;
  const CENTER = SVG_SIZE / 2;
  const RADIUS = 176;

  // Scale progression: small circle (~260-280px) -> medium -> large -> 24x beyond viewport
  const circleScale = useTransform(
    smoothProgress,
    [0, 0.15, 0.45, 0.75, 1],
    [1, 1.06, 2.8, 9.5, 24]
  );

  // Smooth opacity curve: visible through intro, holds through expansion, gently dissolves past viewport
  const circleOpacity = useTransform(
    smoothProgress,
    [0, 0.15, 0.7, 0.95, 1],
    [0.95, 1, 0.95, 0.35, 0]
  );

  // Stroke width subtly expands for perspective weight
  const strokeWidth = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [1.5, 2.2, 3.2]
  );

  // Flare & stardust fade out slightly earlier so ring itself leads the transition
  const glintsOpacity = useTransform(
    smoothProgress,
    [0, 0.22, 0.55],
    [1, 0.85, 0]
  );

  // Ambient aura expands and blooms on scroll
  const glowScale = useTransform(
    smoothProgress,
    [0, 0.4, 0.8],
    [1, 1.5, 2.4]
  );
  const glowOpacity = useTransform(
    smoothProgress,
    [0, 0.3, 0.7, 1],
    [0.45, 0.75, 0.5, 0]
  );

  // 5 Specular Star Flares at radial positions matching wedding-reference.png
  // 1: Top-left (~10 o'clock, -60 deg), 2: Top (~11:45, -15 deg), 3: Upper-right (~1:30, 42 deg),
  // 4: Lower-right (~4:15, 126 deg), 5: Lower-left (~7:30, 218 deg)
  const starGlints = useMemo(() => {
    const glintAngles = [
      { angleDeg: -60, size: 26, rayLength: 36, delay: 0.1, duration: 2.2 }, // Major star flare
      { angleDeg: -15, size: 18, rayLength: 24, delay: 0.8, duration: 2.5 },
      { angleDeg: 42, size: 22, rayLength: 30, delay: 1.3, duration: 2.0 },
      { angleDeg: 126, size: 20, rayLength: 26, delay: 0.5, duration: 2.7 },
      { angleDeg: 218, size: 17, rayLength: 22, delay: 1.1, duration: 2.3 },
    ];

    return glintAngles.map((cfg, i) => {
      const rad = (cfg.angleDeg * Math.PI) / 180;
      return {
        id: `star-glint-${i}`,
        x: CENTER + RADIUS * Math.cos(rad),
        y: CENTER + RADIUS * Math.sin(rad),
        ...cfg,
      };
    });
  }, [CENTER, RADIUS]);

  // Golden stardust particle trail around the ring circumference
  const stardustParticles = useMemo(() => {
    const particles = [];
    const count = 42;
    // Deterministic pseudo-random distribution around ring perimeter
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + ((i * 17) % 7) * 0.08;
      // Clustered within ±24px of the ring perimeter
      const radialOffset = ((i * 31) % 48) - 24;
      const r = RADIUS + radialOffset;
      const x = CENTER + r * Math.cos(angle);
      const y = CENTER + r * Math.sin(angle);
      const size = 1.4 + ((i * 13) % 20) * 0.12; // 1.4px to 3.8px
      const baseOpacity = 0.35 + ((i * 19) % 55) * 0.01;
      const duration = 2.0 + ((i * 23) % 18) * 0.1;
      const delay = ((i * 7) % 20) * 0.1;

      particles.push({
        id: `stardust-${i}`,
        x,
        y,
        size,
        baseOpacity,
        duration,
        delay,
        color: i % 3 === 0 ? '#FFFFFF' : i % 2 === 0 ? '#FFE8B2' : '#D4AF37',
      });
    }
    return particles;
  }, [CENTER, RADIUS]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
      {/* 1. WARM AMBIENT GLOW AURA (Radial Champagne Bloom) */}
      <motion.div
        style={{
          scale: glowScale,
          opacity: glowOpacity,
        }}
        className="absolute w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-full pointer-events-none"
      >
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(179,154,114,0.32)_0%,rgba(179,154,114,0.12)_45%,transparent_70%)] blur-[40px] sm:blur-[60px]" />
      </motion.div>

      {/* 2. CINEMATIC DIAGONAL GODRAY / LIGHT SWEEP (Matching Reference Image) */}
      <motion.div
        style={{ opacity: circleOpacity }}
        className="absolute w-[600px] h-[600px] pointer-events-none -rotate-25 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08)_0%,rgba(179,154,114,0.04)_40%,transparent_70%)] blur-2xl"
      />

      {/* 3. SCROLL-SCALED GOLDEN CIRCLE & SPECULAR GLINTS CONTAINER */}
      <motion.div
        style={{
          scale: circleScale,
          opacity: circleOpacity,
          transformOrigin: 'center center',
          willChange: 'transform, opacity',
        }}
        className="relative w-[310px] h-[310px] sm:w-[470px] sm:h-[470px] lg:w-[560px] lg:h-[560px] flex items-center justify-center pointer-events-none select-none"
      >
        <svg
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Champagne Gold Gradient for the Ring */}
            <linearGradient id="champagneGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CDB58E" />
              <stop offset="25%" stopColor="#F7EEDF" />
              <stop offset="50%" stopColor="#B39A72" />
              <stop offset="75%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#A88E65" />
            </linearGradient>

            {/* Radiant Soft Glow Filter */}
            <filter id="goldRingGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur1" />
              <feGaussianBlur stdDeviation="8" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Flare Center Glow Gradient */}
            <radialGradient id="flareGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="35%" stopColor="#FFE8B2" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#B39A72" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#B39A72" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Halo Glow Ring (Subtle blurred outer aura) */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="rgba(179, 154, 114, 0.4)"
            strokeWidth="7"
            opacity="0.6"
            filter="url(#goldRingGlow)"
          />

          {/* Secondary Soft Rim */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="rgba(247, 238, 223, 0.6)"
            strokeWidth="3"
            opacity="0.75"
          />

          {/* Primary High-Precision Vector Ring */}
          <motion.circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="url(#champagneGoldGrad)"
            style={{ strokeWidth }}
          />

          {/* GOLDEN STARDUST PARTICLE TRAIL (Floating around the circumference) */}
          <motion.g style={{ opacity: glintsOpacity }}>
            {stardustParticles.map((pt) => (
              <motion.circle
                key={pt.id}
                cx={pt.x}
                cy={pt.y}
                r={pt.size}
                fill={pt.color}
                animate={
                  shouldReduceMotion
                    ? { opacity: pt.baseOpacity, scale: 1, y: 0 }
                    : {
                        opacity: [pt.baseOpacity * 0.5, pt.baseOpacity * 1.3, pt.baseOpacity * 0.5],
                        scale: [0.8, 1.3, 0.8],
                        y: [0, pt.size > 2.5 ? -3 : 2, 0],
                      }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        duration: pt.duration,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: pt.delay,
                      }
                }
              />
            ))}
          </motion.g>

          {/* SPECULAR 4-POINT DIAMOND STAR FLARES (Along ring circumference) */}
          <motion.g style={{ opacity: glintsOpacity }}>
            {starGlints.map((glint) => (
              <DiamondStarFlare
                key={glint.id}
                x={glint.x}
                y={glint.y}
                size={glint.size}
                delay={glint.delay}
                duration={glint.duration}
                rayLength={glint.rayLength}
                shouldReduceMotion={shouldReduceMotion}
              />
            ))}
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}
