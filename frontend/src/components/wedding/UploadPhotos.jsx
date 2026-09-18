import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Check, X, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function UploadPhotos({ onBackToGallery, onUploadCompleted }) {
  const [guestName, setGuestName] = useState(() => {
    try {
      const stored = localStorage.getItem('wedding_guest_session');
      return stored ? JSON.parse(stored).name || '' : '';
    } catch {
      return '';
    }
  });
  const [tableNumber, setTableNumber] = useState('');
  const [wishes, setWishes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const isVideo = (file) => file.type.startsWith('video/');
    const photos = files.filter((file) => !isVideo(file));
    const videos = files.filter(isVideo);
    const selectedPhotos = selectedFiles.filter((item) => !isVideo(item.file)).length;
    const selectedVideos = selectedFiles.filter((item) => isVideo(item.file)).length;

    if (selectedPhotos + photos.length > 25 || selectedVideos + videos.length > 10) {
      alert('Один гость может загрузить до 25 фото и до 10 видео.');
      e.target.value = '';
      return;
    }

    const oversized = files.find((file) =>
      isVideo(file)
        ? file.size > 500 * 1024 * 1024
        : file.size > 30 * 1024 * 1024
    );
    if (oversized) {
      alert(`${oversized.name}: максимум ${isVideo(oversized) ? '500 МБ для видео' : '30 МБ для фото'}.`);
      e.target.value = '';
      return;
    }

    const newItems = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      sizeMb: (file.size / (1024 * 1024)).toFixed(1)
    }));

    setSelectedFiles(prev => [...prev, ...newItems]);
    e.target.value = '';
  };

  const removeFile = (id) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert('Пожалуйста, выберите хотя бы одну фотографию.');
      return;
    }
    if (!guestName.trim()) {
      alert('Пожалуйста, введите ваше имя.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Ensure guest is created or fetched
      const guestRes = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: guestName.trim(),
          table_number: tableNumber.trim(),
          wishes: wishes.trim()
        })
      });
      const guestData = await guestRes.json();
      localStorage.setItem('wedding_guest_session', JSON.stringify(guestData));

      // 2. Upload files in full 100% original quality
      const formData = new FormData();
      formData.append('guest_id', guestData.id);
      for (const item of selectedFiles) {
        formData.append('files', item.file, item.file.name);
      }

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (uploadRes.ok) {
        setUploadSuccess(true);
        setSelectedFiles([]);
        
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#B39A72', '#E8E0D2', '#FFFFFF']
        });

        if (onUploadCompleted) onUploadCompleted();
      } else {
        const err = await uploadRes.json();
        alert(`Ошибка загрузки: ${err.detail || 'Попробуйте снова'}`);
      }
    } catch (err) {
      alert('Ошибка соединения с сервером при загрузке');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 pb-32 select-none">
      {/* Back button */}
      <button
        onClick={onBackToGallery}
        className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B39A72] hover:text-[#E8E0D2] transition-colors mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Вернуться в галерею</span>
      </button>

      {/* Success View */}
      {uploadSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 px-6 rounded-2xl bg-[#171513] border border-[#B39A72]/40 shadow-2xl"
        >
          <div className="w-14 h-14 rounded-full border border-[#B39A72] flex items-center justify-center mx-auto mb-6 text-[#B39A72]">
            <Check className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#F5F1E9] tracking-widest uppercase font-light mb-3">
            СПАСИБО!
          </h2>
          <p className="text-xs sm:text-sm text-[#847B72] tracking-wider uppercase font-light leading-relaxed mb-8">
            Ваши фотографии<br />успешно загружены.
          </p>
          <button
            onClick={() => setUploadSuccess(false)}
            className="px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium text-[#0D0C0B] bg-[#B39A72] hover:bg-[#C8AE84] transition-all cursor-pointer shadow-md"
          >
            Загрузить ещё
          </button>
        </motion.div>
      ) : (
        /* Upload Form View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 sm:p-10 rounded-2xl bg-[#171513] border border-[#2A2622] shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#F5F1E9] tracking-widest uppercase font-light mb-2 leading-tight">
              ПОДЕЛИТЕСЬ<br />СВОИМ МОМЕНТОМ
            </h2>
            <p className="text-xs sm:text-sm text-[#847B72] tracking-wider uppercase font-light">
              Загрузите фотографии,<br />которые вы сделали сегодня.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#847B72] mb-1.5 font-light">
                Ваше имя или семья *
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Иван и Мария"
                className="w-full px-4 py-3 rounded-lg bg-[#0D0C0B] border border-[#2A2622] text-[#F5F1E9] placeholder-[#59524A] text-sm focus:outline-none focus:border-[#B39A72] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#847B72] mb-1.5 font-light">
                Номер столика
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Стол №3"
                className="w-full px-4 py-3 rounded-lg bg-[#0D0C0B] border border-[#2A2622] text-[#F5F1E9] placeholder-[#59524A] text-sm focus:outline-none focus:border-[#B39A72] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#847B72] mb-1.5 font-light">
                Пожелание молодым
              </label>
              <textarea
                rows={2}
                value={wishes}
                onChange={(e) => setWishes(e.target.value)}
                placeholder="Пара тёплых слов в книгу пожеланий..."
                className="w-full px-4 py-3 rounded-lg bg-[#0D0C0B] border border-[#2A2622] text-[#F5F1E9] placeholder-[#59524A] text-sm focus:outline-none focus:border-[#B39A72] transition-colors resize-none"
              />
            </div>

            {/* Dropzone button */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 p-8 border border-dashed border-[#B39A72]/50 hover:border-[#B39A72] rounded-xl text-center cursor-pointer bg-[#0D0C0B]/60 hover:bg-[#0D0C0B] transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/heic,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-10 h-10 rounded-full border border-[#B39A72]/40 group-hover:border-[#B39A72] text-[#B39A72] flex items-center justify-center mx-auto mb-3 transition-colors">
                <ArrowUp className="w-5 h-5" />
              </div>
              <div className="font-serif text-sm tracking-widest uppercase text-[#E8E0D2] group-hover:text-white font-medium">
                ВЫБРАТЬ ФОТО И ВИДЕО
              </div>
              <p className="text-[10px] text-[#847B72] uppercase tracking-wider mt-1 font-light">
                До 25 фото (30 МБ) и 10 видео (500 МБ) в исходном качестве
              </p>
            </div>

            {/* Selected Files Thumbnails */}
            <AnimatePresence>
              {selectedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-2"
                >
                  <div className="flex items-center justify-between text-xs text-[#847B72]">
                    <span>Выбрано: {selectedFiles.length}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles([])}
                      className="text-[#B39A72] hover:text-white"
                    >
                      Очистить
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                    {selectedFiles.map((item) => (
                      <div
                        key={item.id}
                        className="relative aspect-square rounded-md overflow-hidden bg-black border border-[#2A2622]"
                      >
                        {item.file.type.startsWith('video/') ? (
                          <video src={item.previewUrl} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={item.previewUrl} alt="Предпросмотр" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(item.id)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isUploading || selectedFiles.length === 0}
              className="w-full mt-4 py-3.5 px-6 rounded-full font-medium text-xs tracking-widest uppercase text-[#0D0C0B] bg-[#B39A72] hover:bg-[#C8AE84] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#B39A72]/20 cursor-pointer flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#0D0C0B] border-t-transparent rounded-full animate-spin" />
                  <span>ЗАГРУЗКА В 4K...</span>
                </>
              ) : (
                <span>ЗАГРУЗИТЬ</span>
              )}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
