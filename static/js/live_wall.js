/**
 * Wedding Live Wall & Projector Engine
 * Features:
 * - Ken Burns cinematic pan/zoom animation
 * - Real-time SSE instant push on guest upload
 * - Floating golden sparkles & flower petals
 * - Celebration toast overlay with guest wishes
 */

class LiveWall {
  constructor() {
    this.slides = [];
    this.currentIndex = 0;
    this.intervalId = null;
    this.eventSource = null;
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.audioCtx = null;
  }

  init() {
    this.setupParticles();
    this.loadInitialQueue();
    this.connectSSE();
    this.setupFullscreen();
  }

  setupParticles() {
    this.canvas = document.getElementById('projector-particles');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Create 45 ambient floating golden sparkles and petals
    for (let i = 0; i < 45; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: Math.random() * 0.7 + 0.3,
        opacity: Math.random() * 0.7 + 0.3,
        hue: Math.random() > 0.4 ? 43 : 350 // Gold or Rose petal
      });
    }

    const animate = () => {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let p of this.particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y > this.canvas.height) {
          p.y = -10;
          p.x = Math.random() * this.canvas.width;
        }
        if (p.x > this.canvas.width) p.x = 0;
        if (p.x < 0) p.x = this.canvas.width;

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.opacity})`;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = `hsla(${p.hue}, 80%, 65%, 0.8)`;
        this.ctx.fill();
      }
      requestAnimationFrame(animate);
    };
    animate();
  }

  async loadInitialQueue() {
    try {
      const resp = await fetch('/api/live/queue?limit=40');
      if (resp.ok) {
        this.slides = await resp.json();
        if (this.slides.length > 0) {
          this.displaySlide(this.slides[0]);
          this.startRotation();
        } else {
          this.showEmptyState();
        }
      }
    } catch (e) {
      console.error('[LiveWall] Failed to load queue:', e);
    }
  }

  startRotation() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (this.slides.length === 0) return;
      this.currentIndex = (this.currentIndex + 1) % this.slides.length;
      this.displaySlide(this.slides[this.currentIndex]);
    }, 8500);
  }

  displaySlide(slide) {
    const container = document.getElementById('slide-container');
    const guestLabel = document.getElementById('projector-guest-name');
    const wishLabel = document.getElementById('projector-guest-wish');
    const catLabel = document.getElementById('projector-category-badge');

    if (!container || !slide) return;

    // Smooth fade transition
    container.style.opacity = '0';
    setTimeout(() => {
      if (slide.media_type === 'video') {
        container.innerHTML = `
          <video class="slide-img" autoplay muted loop playsinline src="${slide.file_url}"></video>
        `;
      } else {
        container.innerHTML = `
          <img class="slide-img" src="${slide.file_url}" alt="${slide.guest_name || 'Wedding'}" />
        `;
      }

      if (guestLabel) guestLabel.textContent = slide.guest_name || 'Гость свадьбы';
      if (wishLabel) {
        wishLabel.textContent = slide.wishes ? `«${slide.wishes}»` : 'Счастливого дня свадьбы! 💍';
      }
      if (catLabel) {
        catLabel.textContent = slide.category_label || '✨ Свадебный момент';
      }

      container.style.opacity = '1';
    }, 400);
  }

  showEmptyState() {
    const container = document.getElementById('slide-container');
    const guestLabel = document.getElementById('projector-guest-name');
    const wishLabel = document.getElementById('projector-guest-wish');

    if (container) {
      container.innerHTML = `
        <div style="text-align: center; color: #FAF8F5;">
          <h1 style="font-size: 3.5rem; font-family: 'Playfair Display', serif; color: var(--gold); margin-bottom: 1rem;">
            Добро пожаловать на свадьбу!
          </h1>
          <p style="font-size: 1.5rem; opacity: 0.85; max-width: 600px; margin: 0 auto;">
            Отсканируйте QR-код на столике и загрузите ваши первые фотографии — они сразу появятся здесь!
          </p>
        </div>
      `;
    }
    if (guestLabel) guestLabel.textContent = 'Ожидание первых фото гостей...';
    if (wishLabel) wishLabel.textContent = 'Сканируйте QR на столе 📱';
  }

  connectSSE() {
    if (this.eventSource) this.eventSource.close();
    this.eventSource = new EventSource('/api/live/stream');

    this.eventSource.addEventListener('new_media', (e) => {
      try {
        const item = JSON.parse(e.data).data;
        console.log('[LiveWall] New media received:', item);
        this.onNewUpload(item);
      } catch (err) {
        console.error('[LiveWall] Error parsing event:', err);
      }
    });

    this.eventSource.onerror = () => {
      console.warn('[LiveWall] SSE connection lost, reconnecting in 5s...');
      setTimeout(() => this.connectSSE(), 5000);
    };
  }

  onNewUpload(item) {
    // Add to slides list at front
    this.slides.unshift(item);
    this.currentIndex = 0;

    // Immediately show this new slide!
    this.displaySlide(item);

    // Trigger toast notification
    this.showIncomingToast(item);

    // Restart rotation timer
    this.startRotation();
  }

  showIncomingToast(item) {
    const toast = document.getElementById('live-incoming-toast');
    const toastName = document.getElementById('toast-guest-name');
    const toastWish = document.getElementById('toast-guest-wish');
    const toastThumb = document.getElementById('toast-thumb');

    if (!toast) return;

    if (toastName) toastName.textContent = `Новое фото: ${item.guest_name}`;
    if (toastWish) toastWish.textContent = item.wishes ? `«${item.wishes}»` : 'Загружено новое воспоминание!';
    if (toastThumb) toastThumb.src = item.thumbnail_url || item.file_url;

    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 6000);
  }

  setupFullscreen() {
    const btn = document.getElementById('btn-fullscreen');
    if (btn) {
      btn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => console.log(err));
        } else {
          document.exitFullscreen().catch(err => console.log(err));
        }
      });
    }
  }
}

window.LiveWall = LiveWall;
