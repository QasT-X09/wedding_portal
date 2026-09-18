/**
 * Wedding Gallery & AI Sorting Engine
 * Allows browsing media by AI category, guest name, phase, and downloading ZIP archives.
 */

class WeddingGallery {
  constructor() {
    this.currentCategory = 'all';
    this.currentGuestId = '';
    this.mediaItems = [];
    this.categories = {};
  }

  init() {
    this.setupFilters();
    this.loadMedia();
  }

  setupFilters() {
    const filterContainer = document.getElementById('category-filters');
    if (!filterContainer) return;

    filterContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-pill');
      if (!btn) return;
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.currentCategory = btn.dataset.category || 'all';
      this.render();
    });

    const guestSelect = document.getElementById('filter-guest-select');
    if (guestSelect) {
      guestSelect.addEventListener('change', (e) => {
        this.currentGuestId = e.target.value;
        this.render();
      });
    }

    const zipBtn = document.getElementById('btn-download-zip');
    if (zipBtn) {
      zipBtn.addEventListener('click', () => {
        const url = `/api/export/zip?category=${encodeURIComponent(this.currentCategory)}`;
        window.location.href = url;
      });
    }
  }

  async loadMedia() {
    const grid = document.getElementById('gallery-grid');
    if (grid) grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748B;">Загрузка свадебного альбома...</div>';

    try {
      const resp = await fetch('/api/media');
      if (resp.ok) {
        const data = await resp.json();
        this.mediaItems = data.items;
        this.categories = data.categories;
        this.populateGuestSelect();
        this.render();
      }
    } catch (e) {
      console.error('[Gallery] Failed to fetch media:', e);
    }
  }

  populateGuestSelect() {
    const select = document.getElementById('filter-guest-select');
    if (!select) return;

    // Unique guests
    const guests = {};
    for (let m of this.mediaItems) {
      if (!guests[m.guest_id]) {
        guests[m.guest_id] = m.guest_name;
      }
    }

    select.innerHTML = '<option value="">Все гости (300 гостей)</option>';
    for (let [gid, gname] of Object.entries(guests)) {
      select.innerHTML += `<option value="${gid}">${gname}</option>`;
    }
  }

  render() {
    const grid = document.getElementById('gallery-grid');
    const counter = document.getElementById('gallery-total-counter');
    if (!grid) return;

    let filtered = this.mediaItems;
    if (this.currentCategory !== 'all') {
      filtered = filtered.filter(m => m.category === this.currentCategory);
    }
    if (this.currentGuestId) {
      filtered = filtered.filter(m => m.guest_id === this.currentGuestId);
    }

    if (counter) counter.textContent = `Показано ${filtered.length} из ${this.mediaItems.length} файлов`;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #94A3B8;">
          <div style="font-size: 3rem; margin-bottom: 12px;">📷</div>
          <p style="font-size: 1.2rem; font-weight: 500;">В этой категории пока нет фотографий</p>
          <p style="font-size: 0.95rem; margin-top: 6px;">Гости могут загрузить их прямо сейчас с мобильного телефона!</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(item => {
      const isVid = item.media_type === 'video';
      const thumb = item.thumbnail_url || item.file_url;
      const wishHtml = item.wishes ? `<div style="font-size: 12px; color: #64748B; margin-top: 4px; font-style: italic;">«${item.wishes}»</div>` : '';
      const tagsBadges = (item.tags || []).slice(0, 2).map(t => `<span class="cat-tag">${t.tag} (${Math.round(t.confidence*100)}%)</span>`).join(' ');

      return `
        <div class="media-card" onclick="window.WeddingGalleryInstance.openLightbox('${item.id}')">
          ${isVid 
            ? `<div style="position: relative;">
                <video src="${item.file_url}" style="width: 100%; height: 220px; object-fit: cover;"></video>
                <span style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.7); color: #FFF; font-size: 11px; padding: 2px 6px; border-radius: 4px;">▶ Видео</span>
               </div>`
            : `<img src="${thumb}" loading="lazy" alt="${item.original_filename}" />`
          }
          <div class="media-card-info">
            <div class="guest-pill">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${item.avatar_color || '#D4AF37'};"></span>
              <span>${item.guest_name}</span>
              ${item.table_number ? `<span style="color: #94A3B8; font-size: 11px;">(${item.table_number})</span>` : ''}
            </div>
            ${wishHtml}
            <div style="margin-top: 6px; display: flex; gap: 4px; flex-wrap: wrap;">
              <span class="cat-tag" style="background: #FEF3C7; color: #92400E; font-weight: 600;">${item.category_label || item.category}</span>
              ${tagsBadges}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  openLightbox(mediaId) {
    const item = this.mediaItems.find(m => m.id === mediaId);
    if (!item) return;

    const modal = document.getElementById('gallery-lightbox');
    const content = document.getElementById('lightbox-content');
    if (!modal || !content) return;

    const isVid = item.media_type === 'video';
    content.innerHTML = `
      <div style="max-width: 900px; max-height: 90vh; background: #FFF; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;">
        <div style="background: #000; display: flex; align-items: center; justify-content: center; max-height: 70vh;">
          ${isVid 
            ? `<video src="${item.file_url}" controls autoplay style="max-width: 100%; max-height: 70vh;"></video>`
            : `<img src="${item.file_url}" style="max-width: 100%; max-height: 70vh; object-fit: contain;" />`
          }
        </div>
        <div style="padding: 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="font-size: 18px; color: #1E293B;">${item.guest_name}</h3>
            <p style="font-size: 14px; color: #64748B; margin-top: 4px;">${item.wishes ? `«${item.wishes}»` : 'Счастливого дня свадьбы!'}</p>
            <div style="font-size: 12px; color: #94A3B8; margin-top: 4px;">Сюжет: <strong>${item.category_label}</strong> | Загружено: ${item.created_at}</div>
          </div>
          <div>
            <a href="${item.file_url}" download="${item.original_filename}" class="btn-gold" style="padding: 8px 18px; font-size: 13px; text-decoration: none;">
              💾 Скачать оригинал
            </a>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  closeLightbox() {
    const modal = document.getElementById('gallery-lightbox');
    if (modal) modal.style.display = 'none';
  }
}

window.WeddingGallery = WeddingGallery;
