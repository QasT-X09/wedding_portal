/**
 * Wedding Portal Main Application Controller
 */

class WeddingApp {
  constructor() {
    this.currentGuest = null;
    this.pendingFiles = [];
    this.isUploading = false;
  }

  init() {
    this.setupRouting();
    this.setupPetalsCanvas();
    this.loadGuestSession();
    this.setupUploadHandlers();
    this.setupQRView();

    // Initialize sub-modules
    window.WeddingGalleryInstance = new window.WeddingGallery();
    window.WeddingGalleryInstance.init();

    window.LiveWallInstance = new window.LiveWall();
    window.LiveWallInstance.init();

    // Check hash on load
    this.handleRoute(window.location.hash || '#upload');
  }

  setupRouting() {
    window.addEventListener('hashchange', () => {
      this.handleRoute(window.location.hash || '#upload');
    });

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        window.location.hash = target;
      });
    });
  }

  handleRoute(hash) {
    const tabName = hash.replace('#', '') || 'upload';
    
    // Update nav buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Toggle views
    document.getElementById('view-upload').style.display = (tabName === 'upload') ? 'block' : 'none';
    document.getElementById('view-gallery').style.display = (tabName === 'gallery') ? 'block' : 'none';
    document.getElementById('view-qr').style.display = (tabName === 'qr') ? 'block' : 'none';
    
    const projectorView = document.getElementById('view-live');
    if (tabName === 'live') {
      projectorView.style.display = 'block';
      document.body.style.overflow = 'hidden';
      document.querySelector('.wedding-nav').style.display = 'none';
    } else {
      projectorView.style.display = 'none';
      document.body.style.overflow = 'auto';
      document.querySelector('.wedding-nav').style.display = 'flex';
    }

    if (tabName === 'gallery') {
      window.WeddingGalleryInstance.loadMedia();
    }
  }

  setupPetalsCanvas() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const particles = [];
    for (let i = 0; i < 28; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 5 + 3,
        speedX: Math.sin(Math.random() * Math.PI) * 0.5,
        speedY: Math.random() * 0.8 + 0.4,
        angle: Math.random() * 360,
        spin: (Math.random() - 0.5) * 2,
        color: Math.random() > 0.4 ? 'rgba(212, 175, 55, 0.45)' : 'rgba(244, 114, 182, 0.35)'
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let p of particles) {
        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.spin;

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius, p.radius * 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(render);
    };
    render();
  }

  loadGuestSession() {
    const stored = localStorage.getItem('wedding_guest_session');
    if (stored) {
      try {
        this.currentGuest = JSON.parse(stored);
        this.updateGuestUI();
        this.refreshGuestQuota();
      } catch (e) {
        localStorage.removeItem('wedding_guest_session');
      }
    }
  }

  async refreshGuestQuota() {
    if (!this.currentGuest) return;
    try {
      const resp = await fetch(`/api/guests/${this.currentGuest.id}`);
      if (resp.ok) {
        this.currentGuest = await resp.json();
        localStorage.setItem('wedding_guest_session', JSON.stringify(this.currentGuest));
        this.updateGuestUI();
      }
    } catch (e) {
      console.warn('[Session] Failed to refresh quota:', e);
    }
  }

  updateGuestUI() {
    const guestForm = document.getElementById('guest-form-section');
    const guestInfo = document.getElementById('guest-info-section');
    const nameDisplay = document.getElementById('display-guest-name');
    const photoBadge = document.getElementById('quota-photo-badge');
    const videoBadge = document.getElementById('quota-video-badge');
    const uploadBtn = document.getElementById('btn-start-upload');

    if (this.currentGuest) {
      if (guestForm) guestForm.style.display = 'none';
      if (guestInfo) guestInfo.style.display = 'block';
      if (nameDisplay) nameDisplay.textContent = this.currentGuest.name;
      
      const pCount = this.currentGuest.photos_uploaded || 0;
      const vCount = this.currentGuest.videos_uploaded || 0;
      if (photoBadge) photoBadge.textContent = `📸 Фото: ${pCount} / 25`;
      if (videoBadge) videoBadge.textContent = `🎥 Видео: ${vCount} / 10`;

      if (uploadBtn) {
        const canUpload = (pCount < 25 || vCount < 10);
        uploadBtn.disabled = !canUpload;
      }
    } else {
      if (guestForm) guestForm.style.display = 'block';
      if (guestInfo) guestInfo.style.display = 'none';
    }
  }

  setupUploadHandlers() {
    const regForm = document.getElementById('guest-register-form');
    if (regForm) {
      regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('input-guest-name').value.trim();
        const table = document.getElementById('input-table-number').value.trim();
        const wishes = document.getElementById('input-wishes').value.trim();

        if (!name) return;

        try {
          const resp = await fetch('/api/guests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, table_number: table, wishes })
          });
          if (resp.ok) {
            this.currentGuest = await resp.json();
            localStorage.setItem('wedding_guest_session', JSON.stringify(this.currentGuest));
            this.updateGuestUI();
          }
        } catch (err) {
          alert('Ошибка соединения с сервером');
        }
      });
    }

    const logoutBtn = document.getElementById('btn-change-guest');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('wedding_guest_session');
        this.currentGuest = null;
        this.updateGuestUI();
      });
    }

    const dropzone = document.getElementById('upload-dropzone');
    const fileInput = document.getElementById('file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
          this.handleFilesSelected(Array.from(e.dataTransfer.files));
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
          this.handleFilesSelected(Array.from(e.target.files));
        }
      });
    }

    const uploadBtn = document.getElementById('btn-start-upload');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => this.processUploadQueue());
    }
  }

  handleFilesSelected(files) {
    if (!this.currentGuest) {
      alert('Пожалуйста, сначала введите ваше имя в форме выше!');
      document.getElementById('input-guest-name')?.focus();
      return;
    }

    const currentPhotos = this.currentGuest.photos_uploaded || 0;
    const currentVideos = this.currentGuest.videos_uploaded || 0;

    for (let f of files) {
      const isVid = f.type.startsWith('video/');
      const isImg = f.type.startsWith('image/');

      if (!isVid && !isImg) {
        alert(`Файл ${f.name} не является изображением или видео.`);
        continue;
      }

      // Check against limits
      const pendingPhotos = this.pendingFiles.filter(item => !item.file.type.startsWith('video/')).length;
      const pendingVideos = this.pendingFiles.filter(item => item.file.type.startsWith('video/')).length;

      if (!isVid && (currentPhotos + pendingPhotos >= 25)) {
        alert('Достигнут лимит 25 фото! Больше добавить нельзя.');
        break;
      }
      if (isVid && (currentVideos + pendingVideos >= 10)) {
        alert('Достигнут лимит 10 видео! Больше добавить нельзя.');
        break;
      }

      this.pendingFiles.push({
        id: Math.random().toString(36).substring(7),
        file: f,
        isVid: isVid,
        compressed: null,
        status: 'ready', // 'ready', 'compressing', 'uploading', 'done', 'error'
        previewUrl: URL.createObjectURL(f)
      });
    }

    this.renderQueue();
  }

  renderQueue() {
    const container = document.getElementById('queue-container');
    const queueList = document.getElementById('upload-queue-list');
    const uploadBtn = document.getElementById('btn-start-upload');

    if (!container || !queueList) return;

    if (this.pendingFiles.length === 0) {
      container.style.display = 'none';
      if (uploadBtn) uploadBtn.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    if (uploadBtn) {
      uploadBtn.style.display = 'inline-flex';
      uploadBtn.textContent = `✨ Загрузить ${this.pendingFiles.length} файлов в свадебный альбом`;
    }

    queueList.innerHTML = this.pendingFiles.map(item => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #F8FAFC; border-radius: 12px; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 12px; overflow: hidden;">
          <img src="${item.previewUrl}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px;" />
          <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">
            <div style="font-weight: 600; font-size: 13px; color: #1E293B;">${item.file.name}</div>
            <div style="font-size: 11px; color: #64748B;">
              ${item.isVid ? '🎥 Видео' : '📸 Фото'} • ${(item.file.size/1024/1024).toFixed(1)} МБ
              <span id="status-${item.id}" style="margin-left: 6px; color: #D4AF37; font-weight: 500;">
                ${item.status === 'done' ? '✅ Готово' : item.status === 'compressing' ? '⚙️ Сжатие...' : ''}
              </span>
            </div>
          </div>
        </div>
        <button onclick="window.WeddingAppInstance.removeFromQueue('${item.id}')" style="background: none; border: none; font-size: 18px; color: #94A3B8; cursor: pointer;">✕</button>
      </div>
    `).join('');
  }

  removeFromQueue(id) {
    this.pendingFiles = this.pendingFiles.filter(item => item.id !== id);
    this.renderQueue();
  }

  async processUploadQueue() {
    if (this.isUploading || this.pendingFiles.length === 0 || !this.currentGuest) return;
    this.isUploading = true;

    const uploadBtn = document.getElementById('btn-start-upload');
    if (uploadBtn) {
      uploadBtn.disabled = true;
      uploadBtn.textContent = '⏳ Оптимизация и отправка...';
    }

    const formData = new FormData();
    formData.append('guest_id', this.currentGuest.id);

    // Client-side compression loop
    for (let item of this.pendingFiles) {
      const statusEl = document.getElementById(`status-${item.id}`);
      if (!item.isVid) {
        if (statusEl) statusEl.textContent = '⚙️ Умное сжатие...';
        const compressed = await window.MediaCompressor.compressPhoto(item.file);
        formData.append('files', compressed, compressed.name);
      } else {
        formData.append('files', item.file, item.file.name);
      }
      if (statusEl) statusEl.textContent = '🚀 Отправка...';
    }

    try {
      const resp = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (resp.ok) {
        const result = await resp.json();
        this.pendingFiles = [];
        this.renderQueue();
        await this.refreshGuestQuota();
        this.showSuccessModal();
      } else {
        const err = await resp.json();
        alert(`Ошибка загрузки: ${err.detail || 'Не удалось загрузить'}`);
      }
    } catch (e) {
      alert('Ошибка соединения при отправке файлов');
    } finally {
      this.isUploading = false;
      if (uploadBtn) {
        uploadBtn.disabled = false;
      }
    }
  }

  showSuccessModal() {
    const modal = document.getElementById('upload-success-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  closeSuccessModal() {
    const modal = document.getElementById('upload-success-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  setupQRView() {
    const qrImg = document.getElementById('qr-display-img');
    const qrLink = document.getElementById('qr-link-text');
    if (qrImg) {
      qrImg.src = '/api/qr';
    }
    if (qrLink) {
      qrLink.textContent = window.location.origin;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.WeddingAppInstance = new WeddingApp();
  window.WeddingAppInstance.init();
});
