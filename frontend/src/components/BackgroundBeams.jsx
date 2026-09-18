import React, { useEffect, useRef } from 'react';

export default function BackgroundBeams() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Floating romantic rose petals & soft champagne particles
    const petals = Array.from({ length: 24 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: Math.random() * 0.4 + 0.2,
      angle: Math.random() * 360,
      spin: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.4 + 0.15,
      isRose: Math.random() > 0.5
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let p of petals) {
        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.spin;

        if (p.y > canvas.height + 10) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);

        if (p.isRose) {
          // Delicate pink/rose petal
          ctx.fillStyle = `rgba(235, 175, 168, ${p.opacity})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.radius, p.radius * 1.8, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Warm champagne gold sparkle
          ctx.fillStyle = `rgba(218, 185, 130, ${p.opacity * 0.8})`;
          ctx.beginPath();
          ctx.arc(0, 0, p.radius * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Soft warm silk ambient lighting */}
      <div className="absolute top-[-15%] left-[25%] w-[650px] h-[650px] rounded-full bg-[#F4E8DB]/45 blur-[140px]" />
      <div className="absolute bottom-[-10%] right-[20%] w-[550px] h-[550px] rounded-full bg-[#EADBCE]/35 blur-[130px]" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
