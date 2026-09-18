import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FolderArchive, Play, Heart } from 'lucide-react';
import LightboxModal from './LightboxModal';

export default function GalleryView() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [activeItem, setActiveItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/media');
      if (resp.ok) {
        const data = await resp.json();
        setItems(data.items || []);
        setCategories(data.categories || {});
      }
    } catch (e) {
      console.error('[Gallery] Failed to fetch media:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const guestList = Array.from(
    new Map(items.map(item => [item.guest_id, item.guest_name])).entries()
  );

  const filtered = items.filter(item => {
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchGuest = !selectedGuestId || item.guest_id === selectedGuestId;
    return matchCategory && matchGuest;
  });

  const categoryButtons = [
    { id: 'all', label: 'Все кадры' },
    { id: 'toasts', label: '🥂 Тосты' },
    { id: 'dances', label: '💃 Танцы' },
    { id: 'group', label: '👥 Гости' },
    { id: 'decor', label: '💍 Детали' },
    { id: 'cake', label: '🎂 Торт' },
    { id: 'portrait', label: '👰 Портреты' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-20">
      {/* Top Header & Filters */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EBE3D7] shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#968779] font-medium block mb-1">
              Галерея воспоминаний
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#2C2724] font-normal">
              Свадебный Альбом
            </h2>
            <p className="text-xs text-[#736A62] mt-1 font-light">
              {filtered.length} из {items.length} фото и видео в оригинальном 4K разрешении
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Guest filter */}
            <select
              value={selectedGuestId}
              onChange={(e) => setSelectedGuestId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E5DDD2] text-xs text-[#2C2724] focus:outline-none focus:border-[#B38E46] cursor-pointer"
            >
              <option value="">Все гости ({items.length} файлов)</option>
              {guestList.map(([gid, gname]) => (
                <option key={gid} value={gid}>{gname}</option>
              ))}
            </select>

            {/* ZIP Download */}
            <a
              href={`/api/export/zip?category=${selectedCategory}`}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#2C2724] hover:bg-[#3D352F] transition-all flex items-center gap-2 no-underline shadow-sm"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Скачать архив</span>
            </a>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categoryButtons.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer outline-none ${
                  isActive ? 'text-[#3E342B] font-semibold' : 'text-[#847B72] hover:text-[#2C2724]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryWarmPill"
                    className="absolute inset-0 rounded-full bg-[#FAF5EE] border border-[#EADBCE] shadow-xs"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gallery Polaroid Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-[#847B72] text-sm">
          Открываем альбом...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#EBE3D7] max-w-md mx-auto">
          <Heart className="w-8 h-8 text-[#C5A059]/50 mx-auto mb-3" />
          <h3 className="font-serif text-xl text-[#2C2724] mb-1 font-normal">
            В этой категории пока нет снимков
          </h3>
          <p className="text-xs text-[#736A62]">
            Гости могут загрузить их прямо сейчас со своих смартфонов!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item, index) => {
            const isVid = item.media_type === 'video';
            const thumb = item.thumbnail_url || item.file_url;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.02 }}
                onClick={() => setActiveItem(item)}
                className="polaroid-card rounded-xl cursor-pointer"
              >
                {/* Photo frame */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#F5EFEB] rounded-sm relative">
                  {isVid ? (
                    <>
                      <video
                        src={item.file_url}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/80 text-[#2C2724] flex items-center justify-center shadow-md">
                          <Play className="w-4 h-4 ml-0.5" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={thumb}
                      alt={item.original_filename}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#EBE3D7] text-[10px] font-medium text-[#736A62]">
                    {item.category_label || item.category}
                  </div>
                </div>

                {/* Polaroid caption */}
                <div className="pt-2.5 px-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-[#2C2724] font-medium">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.avatar_color || '#B38E46' }}
                    />
                    <span className="truncate">{item.guest_name}</span>
                    {item.table_number && (
                      <span className="text-[10px] text-[#968779] flex-shrink-0">
                        ({item.table_number})
                      </span>
                    )}
                  </div>
                  {item.wishes && (
                    <p className="text-[11px] text-[#736A62] italic truncate mt-0.5 font-light">
                      «{item.wishes}»
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      <LightboxModal item={activeItem} onClose={() => setActiveItem(null)} />
    </div>
  );
}
