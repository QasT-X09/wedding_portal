import React, { useEffect, useRef } from 'react';

/**
 * FallingPetals - Ultra-Luxury 3-Layer Decoupled HTML5 Canvas Petal Simulation
 *
 * Layers:
 *  1. Background: small (15-25px), slow drift, soft opacity (0.4-0.6), subtle depth.
 *  2. Midground: medium (35-55px), crisp focus, realistic ivory/champagne shading,
 *     full 3D tumbling rotation (rotX, rotY, rotZ) with perspective foreshortening.
 *  3. Foreground: large (75-130px), fast drift, heavy depth-of-field Gaussian blur (7px).
 *
 * Performance:
 *  - Decoupled from React render cycle: 0 state updates on animation frames.
 *  - Offscreen sprite caching: complex petal vectors, gradients, and vein textures
 *    are pre-rendered into high-res offscreen canvases once upon initialization.
 *  - Dual-canvas architecture:
 *      * Canvas A (bg + mid): z-index 10, falls behind interactive cards.
 *      * Canvas B (foreground): z-index 35, falls in front of UI with hardware-accelerated GPU blur.
 *  - Resource guard: stops when tab is hidden or user prefers reduced motion.
 */
export default function FallingPetals() {
  const bgMidCanvasRef = useRef(null);
  const fgCanvasRef = useRef(null);

  useEffect(() => {
    const bgMidCanvas = bgMidCanvasRef.current;
    const fgCanvas = fgCanvasRef.current;
    if (!bgMidCanvas || !fgCanvas) return;

    const bgMidCtx = bgMidCanvas.getContext('2d');
    const fgCtx = fgCanvas.getContext('2d');
    if (!bgMidCtx || !fgCtx) return;

    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;

    const handleMotionChange = (e) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        stopLoop();
        clearCanvases();
      } else {
        startLoop();
      }
    };

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleMotionChange);
    }

    // Canvas sizing with devicePixelRatio support (capped at 2 for performance)
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvases = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      [bgMidCanvas, fgCanvas].forEach((cvs) => {
        cvs.width = width * dpr;
        cvs.height = height * dpr;
        cvs.style.width = `${width}px`;
        cvs.style.height = `${height}px`;
      });

      bgMidCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvases();

    // -------------------------------------------------------------------------
    // OFFSCREEN SPRITE CACHING
    // -------------------------------------------------------------------------
    // Pre-render 3 organic petal shapes at 200x240 resolution for crisp rasterization
    const SPRITE_W = 200;
    const SPRITE_H = 240;

    const createPetalSprite = (type) => {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = SPRITE_W;
      offCanvas.height = SPRITE_H;
      const ctx = offCanvas.getContext('2d');
      if (!ctx) return offCanvas;

      const cx = SPRITE_W / 2;
      const cy = SPRITE_H / 2;

      ctx.save();
      ctx.translate(cx, cy);

      if (type === 0) {
        // Classic broad ivory rose petal (heart-curved crown, tapered base)
        ctx.beginPath();
        ctx.moveTo(0, 85);
        ctx.bezierCurveTo(-45, 80, -85, 40, -85, -20);
        ctx.bezierCurveTo(-85, -75, -40, -95, -5, -88);
        ctx.bezierCurveTo(0, -86, 0, -86, 5, -88);
        ctx.bezierCurveTo(40, -95, 85, -75, 85, -20);
        ctx.bezierCurveTo(85, 40, 45, 80, 0, 85);
        ctx.closePath();

        // Luxury Ivory / Champagne Shading (#FFFFFF -> #F7F2EB -> #E8DECE)
        const grad = ctx.createRadialGradient(0, -30, 15, 0, 10, 100);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.35, '#FAF7F2');
        grad.addColorStop(0.7, '#F2ECE1');
        grad.addColorStop(1, '#E6DAC8');
        ctx.fillStyle = grad;
        ctx.fill();

        // Subtle champagne edge stroke
        ctx.strokeStyle = 'rgba(179, 154, 114, 0.22)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Delicate organic petal veins
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, 80);
        ctx.quadraticCurveTo(-15, 0, -30, -60);
        ctx.moveTo(0, 80);
        ctx.quadraticCurveTo(0, 10, 0, -75);
        ctx.moveTo(0, 80);
        ctx.quadraticCurveTo(15, 0, 30, -60);
        ctx.stroke();
      } else if (type === 1) {
        // Elongated elegant petal with lateral curl
        ctx.beginPath();
        ctx.moveTo(-5, 95);
        ctx.bezierCurveTo(-55, 75, -70, 10, -50, -55);
        ctx.bezierCurveTo(-40, -90, 0, -100, 30, -85);
        ctx.bezierCurveTo(65, -70, 75, -20, 60, 30);
        ctx.bezierCurveTo(45, 75, 15, 95, -5, 95);
        ctx.closePath();

        const grad = ctx.createLinearGradient(-40, -80, 40, 80);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.4, '#F7F2EB');
        grad.addColorStop(0.8, '#EBDDC9');
        grad.addColorStop(1, '#DFCDB6');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = 'rgba(179, 154, 114, 0.18)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Highlight sheen on curled rim
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(-20, -65, 30, 1.2 * Math.PI, 1.7 * Math.PI);
        ctx.stroke();
      } else {
        // Side-profile folded petal with champagne depth shadow
        ctx.beginPath();
        ctx.moveTo(0, 90);
        ctx.bezierCurveTo(-35, 70, -75, 20, -55, -45);
        ctx.bezierCurveTo(-45, -78, -10, -92, 10, -88);
        ctx.bezierCurveTo(45, -80, 55, -25, 40, 35);
        ctx.bezierCurveTo(28, 70, 15, 88, 0, 90);
        ctx.closePath();

        const grad = ctx.createRadialGradient(-10, -20, 10, 5, 20, 90);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, '#FAF6EF');
        grad.addColorStop(0.75, '#EDE3D3');
        grad.addColorStop(1, '#D8C7B0');
        ctx.fillStyle = grad;
        ctx.fill();

        // Inner shadow of fold
        ctx.fillStyle = 'rgba(179, 154, 114, 0.12)';
        ctx.beginPath();
        ctx.moveTo(0, 85);
        ctx.quadraticCurveTo(15, 10, 10, -85);
        ctx.quadraticCurveTo(40, -40, 30, 40);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(179, 154, 114, 0.2)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      ctx.restore();
      return offCanvas;
    };

    // Pre-render 3 petal sprite types
    const petalSprites = [
      createPetalSprite(0),
      createPetalSprite(1),
      createPetalSprite(2),
    ];

    // Pre-render a tiny golden stardust ember sprite
    const emberSprite = document.createElement('canvas');
    emberSprite.width = 32;
    emberSprite.height = 32;
    const emberCtx = emberSprite.getContext('2d');
    if (emberCtx) {
      const g = emberCtx.createRadialGradient(16, 16, 1, 16, 16, 15);
      g.addColorStop(0, '#FFFDF8');
      g.addColorStop(0.2, '#FFE8B2');
      g.addColorStop(0.55, 'rgba(179, 154, 114, 0.55)');
      g.addColorStop(1, 'rgba(179, 154, 114, 0)');
      emberCtx.fillStyle = g;
      emberCtx.fillRect(0, 0, 32, 32);
    }

    // -------------------------------------------------------------------------
    // PARTICLE POPULATION SETUP
    // -------------------------------------------------------------------------
    // Responsive counts: mobile gets fewer particles for optimal GPU headroom
    const isMobile = width < 640;
    const bgCount = isMobile ? 12 : 20;
    const midCount = isMobile ? 14 : 24;
    const fgCount = isMobile ? 4 : 7;
    const emberCount = isMobile ? 16 : 28;

    const createPetal = (layer) => {
      let size, speed, opacity;
      if (layer === 'bg') {
        // Background: 15-25px, slow speed, subtle opacity 0.4-0.6
        size = 15 + Math.random() * 10;
        speed = 0.7 + Math.random() * 0.7;
        opacity = 0.38 + Math.random() * 0.22;
      } else if (layer === 'mid') {
        // Midground: 35-55px, medium speed, crisp focus, opacity 0.8-0.95
        size = 35 + Math.random() * 20;
        speed = 1.6 + Math.random() * 1.0;
        opacity = 0.82 + Math.random() * 0.15;
      } else {
        // Foreground: 75-130px, fast drift, blur bokeh, opacity 0.65-0.85
        size = 75 + Math.random() * 55;
        speed = 2.8 + Math.random() * 1.8;
        opacity = 0.65 + Math.random() * 0.2;
      }

      return {
        layer,
        spriteType: Math.floor(Math.random() * petalSprites.length),
        x: Math.random() * (width + 100) - 50,
        y: Math.random() * (height + 150) - 100,
        size,
        baseSize: size,
        speed,
        opacity,
        // 3D rotation angles (radians)
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        // 3D tumbling angular velocities
        vRotX: (Math.random() - 0.5) * 0.024,
        vRotY: (Math.random() - 0.5) * 0.028,
        vRotZ: (Math.random() - 0.5) * 0.018,
        // Flutter & drift physics
        phase: Math.random() * Math.PI * 2,
        freq: 0.0015 + Math.random() * 0.0018,
        amp: 0.9 + Math.random() * 1.4,
        drift: (Math.random() - 0.35) * 0.4, // Slight natural diagonal breeze
      };
    };

    const createEmber = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 6 + Math.random() * 14,
      speedY: 0.3 + Math.random() * 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      baseOpacity: 0.3 + Math.random() * 0.55,
      pulseFreq: 0.002 + Math.random() * 0.003,
      phase: Math.random() * Math.PI * 2,
    });

    const bgMidPetals = [
      ...Array.from({ length: bgCount }, () => createPetal('bg')),
      ...Array.from({ length: midCount }, () => createPetal('mid')),
    ];
    const fgPetals = Array.from({ length: fgCount }, () => createPetal('fg'));
    const embers = Array.from({ length: emberCount }, () => createEmber());

    // -------------------------------------------------------------------------
    // ANIMATION LOOP (LOCKED 60 FPS VIA RAF, 0 REACT RE-RENDERS)
    // -------------------------------------------------------------------------
    let animId = null;
    let isRunning = false;

    const render = (time) => {
      if (!isRunning) return;

      // 1. Clear both canvases
      bgMidCtx.clearRect(0, 0, width, height);
      fgCtx.clearRect(0, 0, width, height);

      // 2. Render Golden Stardust Embers (on bg canvas for subtle depth)
      embers.forEach((emb) => {
        emb.y += emb.speedY;
        emb.x += emb.speedX;
        if (emb.y > height + 20) emb.y = -20;
        if (emb.x < -20) emb.x = width + 20;
        if (emb.x > width + 20) emb.x = -20;

        const pulse = Math.sin(time * emb.pulseFreq + emb.phase);
        const op = emb.baseOpacity * (0.6 + 0.4 * pulse);

        bgMidCtx.save();
        bgMidCtx.globalAlpha = Math.max(0, Math.min(1, op));
        bgMidCtx.drawImage(
          emberSprite,
          emb.x - emb.size / 2,
          emb.y - emb.size / 2,
          emb.size,
          emb.size
        );
        bgMidCtx.restore();
      });

      // 3. Render Background & Midground Petals
      bgMidPetals.forEach((p) => {
        // Physics update
        p.y += p.speed;
        p.x += Math.sin(time * p.freq + p.phase) * p.amp + p.drift;
        p.rotX += p.vRotX;
        p.rotY += p.vRotY;
        p.rotZ += p.vRotZ;

        // Wrap boundaries
        if (p.y > height + p.size) {
          p.y = -p.size;
          p.x = Math.random() * (width + 80) - 40;
        }
        if (p.x < -p.size * 2) p.x = width + p.size;
        if (p.x > width + p.size * 2) p.x = -p.size;

        // 3D Foreshortening projection
        const scaleX = Math.cos(p.rotX);
        const scaleY = Math.cos(p.rotY);
        // Dim slightly when showing backside
        const isBackside = scaleX * scaleY < 0;
        const currentOpacity = isBackside ? p.opacity * 0.78 : p.opacity;

        bgMidCtx.save();
        bgMidCtx.translate(p.x, p.y);
        bgMidCtx.rotate(p.rotZ);
        bgMidCtx.scale(scaleX, scaleY);
        bgMidCtx.globalAlpha = currentOpacity;

        const sprite = petalSprites[p.spriteType];
        bgMidCtx.drawImage(
          sprite,
          -p.size / 2,
          -p.size / 2,
          p.size,
          p.size * (SPRITE_H / SPRITE_W)
        );
        bgMidCtx.restore();
      });

      // 4. Render Foreground Bokeh Petals (Canvas B with GPU blur)
      fgPetals.forEach((p) => {
        p.y += p.speed;
        p.x += Math.sin(time * p.freq + p.phase) * p.amp + p.drift * 1.5;
        p.rotX += p.vRotX;
        p.rotY += p.vRotY;
        p.rotZ += p.vRotZ;

        if (p.y > height + p.size * 1.5) {
          p.y = -p.size * 1.5;
          p.x = Math.random() * (width + 120) - 60;
        }
        if (p.x < -p.size * 2) p.x = width + p.size;
        if (p.x > width + p.size * 2) p.x = -p.size;

        const scaleX = Math.cos(p.rotX);
        const scaleY = Math.cos(p.rotY);
        const isBackside = scaleX * scaleY < 0;
        const currentOpacity = isBackside ? p.opacity * 0.75 : p.opacity;

        fgCtx.save();
        fgCtx.translate(p.x, p.y);
        fgCtx.rotate(p.rotZ);
        fgCtx.scale(scaleX, scaleY);
        fgCtx.globalAlpha = currentOpacity;

        const sprite = petalSprites[p.spriteType];
        fgCtx.drawImage(
          sprite,
          -p.size / 2,
          -p.size / 2,
          p.size,
          p.size * (SPRITE_H / SPRITE_W)
        );
        fgCtx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (!isRunning && !prefersReducedMotion) {
        isRunning = true;
        animId = requestAnimationFrame(render);
      }
    };

    const stopLoop = () => {
      isRunning = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    const clearCanvases = () => {
      bgMidCtx.clearRect(0, 0, width, height);
      fgCtx.clearRect(0, 0, width, height);
    };

    // Tab visibility handling: pause simulation when tab is backgrounded
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    };

    window.addEventListener('resize', resizeCanvases);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial start
    startLoop();

    return () => {
      stopLoop();
      window.removeEventListener('resize', resizeCanvases);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', handleMotionChange);
      }
    };
  }, []);

  return (
    <>
      {/* Canvas 1: Background & Midground Petals + Stardust Embers (z-index: 10) */}
      <canvas
        ref={bgMidCanvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* Canvas 2: Foreground Bokeh Petals (z-index: 35) with Hardware-Accelerated Depth Blur */}
      <canvas
        ref={fgCanvasRef}
        aria-hidden="true"
        style={{
          filter: 'blur(7px)',
          WebkitFilter: 'blur(7px)',
          willChange: 'transform',
        }}
        className="fixed inset-0 pointer-events-none z-35 w-full h-full"
      />
    </>
  );
}
