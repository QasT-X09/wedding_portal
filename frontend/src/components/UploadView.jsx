import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, Video as VideoIcon, CheckCircle2, X, Heart, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function UploadView({ currentGuest, setCurrentGuest, onUploadSuccess }) {
  const [name, setName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [wishes, setWishes] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef(null);

  // Register or sign in guest
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const resp = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          table_number: tableNumber.trim(),
          wishes: wishes.trim()
        })
      });

      if (resp.ok) {
        const guestData = await resp.json();
        setCurrentGuest(guestData);
        localStorage.setItem('wedding_guest_session', JSON.stringify(guestData));
      } else {
        alert('Не удалось зарегистрировать гостя');
      }
    } catch (err) {
      alert('Ошибка соединения с сервером');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('wedding_guest_session');
    setCurrentGuest(null);
    setPendingFiles([]);
  };

  const handleFilesSelected = (files) => {
    if (!currentGuest) return;

    const currentPhotos = currentGuest.photos_uploaded || 0;
    const currentVideos = currentGuest.videos_uploaded || 0;

    const newPending = [...pendingFiles];

    for (const f of files) {
      const isVid = f.type.startsWith('video/');
      const isImg = f.type.startsWith('image/');

      if (!isVid && !isImg) {
        alert(`Файл ${f.name} не поддерживается.`);
        continue;
      }

      const pendingPhotos = newPending.filter(i => !i.file.type.startsWith('video/')).length;
      const pendingVideos = newPending.filter(i => i.file.type.startsWith('video/')).length;

      if (!isVid && currentPhotos + pendingPhotos >= 25) {
        alert('Лимит: максимум 25 фотографий от одного гостя');
        break;
      }
      if (isVid && currentVideos + pendingVideos >= 10) {
        alert('Лимит: максимум 10 видеоклипов от одного гостя');
        break;
      }

      newPending.push({
        id: Math.random().toString(36).substring(7),
        file: f,
        isVid,
        previewUrl: URL.createObjectURL(f),
        sizeMb: (f.size / (1024 * 1024)).toFixed(1),
        // Subtle natural rotation like photos dropped on a table
        tilt: (Math.random() * 4 - 2).toFixed(1)
      });
    }

    setPendingFiles(newPending);
  };

  const removePending = (id) => {
    setPendingFiles(prev => prev.filter(item => item.id !== id));
  };

  const handleUpload = async () => {
    if (isUploading || pendingFiles.length === 0 || !currentGuest) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('guest_id', currentGuest.id);

    // Send original raw files directly - NO lossy compression
    for (const item of pendingFiles) {
      formData.append('files', item.file, item.file.name);
    }

    try {
      const resp = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (resp.ok) {
        setPendingFiles([]);
        
        // Refresh guest quota
        const guestResp = await fetch(`/api/guests/${currentGuest.id}`);
        if (guestResp.ok) {
          const updated = await guestResp.json();
          setCurrentGuest(updated);
          localStorage.setItem('wedding_guest_session', JSON.stringify(updated));
        }

        // Soft romantic champagne confetti
        confetti({
          particleCount: 65,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#C5A059', '#EADBCE', '#F4E8DB', '#FFFFFF']
        });

        setShowSuccessModal(true);
        if (onUploadSuccess) onUploadSuccess();
      } else {
        const err = await resp.json();
        alert(`Ошибка: ${err.detail || 'Не удалось отправить'}`);
      }
    } catch (e) {
      alert('Ошибка отправки файлов');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pb-16">
      {!currentGuest ? (
        /* Editorial Guest Invitation Card */
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-8 sm:p-10 rounded-3xl bg-white border border-[#EBE3D7] shadow-[0_15px_35px_rgba(79,65,53,0.06)] text-center overflow-hidden"
        >
          {/* Delicate ribbon line */}
          <div className="w-12 h-[2px] bg-[#C5A059] mx-auto mb-6" />

          <span className="text-[11px] uppercase tracking-[0.2em] text-[#968779] font-medium block mb-2">
            Свадебный день
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2C2724] font-normal mb-3 leading-tight">
            Книга воспоминаний
          </h2>
          <p className="text-xs sm:text-sm text-[#736A62] max-w-xs mx-auto mb-8 font-light leading-relaxed">
            Пожалуйста, представьтесь и поделитесь вашими снимками. Они украсят свадебный экран и останутся с нами навсегда.
          </p>

          <form onSubmit={handleRegister} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-medium text-[#594E46] mb-1 tracking-wider uppercase">
                Ваше имя или семья *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Камила и Данияр"
                className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E5DDD2] text-[#2C2724] placeholder-[#A69C92] text-sm focus:outline-none focus:border-[#B38E46] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#594E46] mb-1 tracking-wider uppercase">
                Номер столика
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Например: Стол №5"
                className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E5DDD2] text-[#2C2724] placeholder-[#A69C92] text-sm focus:outline-none focus:border-[#B38E46] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#594E46] mb-1 tracking-wider uppercase">
                Пожелание молодым
              </label>
              <textarea
                rows={2}
                value={wishes}
                onChange={(e) => setWishes(e.target.value)}
                placeholder="Напишите пару тёплых слов..."
                className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E5DDD2] text-[#2C2724] placeholder-[#A69C92] text-sm focus:outline-none focus:border-[#B38E46] focus:bg-white transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-6 rounded-xl font-medium text-sm text-white bg-[#2C2724] hover:bg-[#3D352F] shadow-lg shadow-[#2C2724]/10 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Открыть альбом</span>
            </button>
          </form>
        </motion.div>
      ) : (
        /* Guest Upload Room */
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Guest Identity Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#EBE3D7] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-serif text-base font-bold shadow-sm"
                style={{ backgroundColor: currentGuest.avatar_color || '#B38E46' }}
              >
                {currentGuest.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-[10px] text-[#968779] tracking-widest uppercase font-medium">Гость</div>
                <div className="font-serif text-lg font-semibold text-[#2C2724] flex items-center gap-2">
                  <span>{currentGuest.name}</span>
                  {currentGuest.table_number && (
                    <span className="text-xs font-sans font-normal px-2 py-0.5 rounded-full bg-[#FAF5EE] text-[#8C6D41] border border-[#EADBCE]">
                      {currentGuest.table_number}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs text-[#968779] hover:text-[#2C2724] underline cursor-pointer"
            >
              Сменить
            </button>
          </div>

          {/* Quota Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-xl bg-white border border-[#EAE2D5] shadow-xs">
              <div className="text-[10px] text-[#968779] uppercase tracking-wider font-medium">Фотографии</div>
              <div className="text-base font-bold text-[#2C2724] mt-0.5">
                {currentGuest.photos_uploaded || 0} <span className="text-xs font-normal text-[#A69C92]">/ 25</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#EAE2D5] shadow-xs">
              <div className="text-[10px] text-[#968779] uppercase tracking-wider font-medium">Видеоролики</div>
              <div className="text-base font-bold text-[#2C2724] mt-0.5">
                {currentGuest.videos_uploaded || 0} <span className="text-xs font-normal text-[#A69C92]">/ 10</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DDD2] shadow-xs">
              <div className="text-[10px] text-[#8C6D41] uppercase tracking-wider font-medium">Качество</div>
              <div className="text-xs font-semibold text-[#524439] mt-1 flex items-center gap-1">
                <span>100% Исходное 4K</span>
              </div>
            </div>
          </div>

          {/* Dropzone Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files.length) {
                handleFilesSelected(Array.from(e.dataTransfer.files));
              }
            }}
            className={`p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-300 ${
              isDragOver
                ? 'border-[#B38E46] bg-[#FAF5EE] scale-[1.01]'
                : 'border-[#DFD5C7] hover:border-[#B38E46] bg-white hover:bg-[#FDFBF7]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  handleFilesSelected(Array.from(e.target.files));
                }
              }}
            />

            <div className="flex flex-col items-center justify-center gap-2.5">
              <div className="w-12 h-12 rounded-full bg-[#FAF5EE] border border-[#EADBCE] text-[#8C6D41] flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <p className="font-serif text-lg font-medium text-[#2C2724]">
                Выберите фото или видео
              </p>
              <p className="text-xs text-[#847B72]">
                До 25 фото и до 10 видео в максимальном исходном качестве
              </p>
            </div>
          </div>

          {/* Polaroid-style Selected Files */}
          <AnimatePresence>
            {pendingFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between text-xs text-[#736A62]">
                  <span>Выбрано к отправке: {pendingFiles.length}</span>
                  <button
                    onClick={() => setPendingFiles([])}
                    className="text-[#968779] hover:text-[#2C2724] underline cursor-pointer"
                  >
                    Очистить
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pendingFiles.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1, rotate: `${item.tilt}deg` }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="polaroid-card relative rounded-md overflow-hidden group"
                    >
                      <img
                        src={item.previewUrl}
                        alt="preview"
                        className="w-full h-24 object-cover rounded-sm bg-[#F5EFEB]"
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-[#736A62] truncate max-w-[80px]">
                          {item.file.name}
                        </span>
                        <span className="text-[9px] text-[#A07C44] font-mono">
                          {item.sizeMb} МБ
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePending(item.id);
                        }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-80 hover:opacity-100 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Submit button */}
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full py-3.5 px-6 rounded-xl font-medium text-sm text-white bg-[#2C2724] hover:bg-[#3D352F] shadow-lg shadow-[#2C2724]/15 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Отправка в оригинальном качестве...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Отправить {pendingFiles.length} фото в свадебный альбом</span>
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-sm w-full p-8 rounded-3xl bg-white border border-[#EBE3D7] shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#FAF5EE] border border-[#EADBCE] text-[#8C6D41] mx-auto flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 fill-[#8C6D41]" />
              </div>
              <h3 className="font-serif text-2xl text-[#2C2724] mb-2 font-normal">
                Сердечно благодарим!
              </h3>
              <p className="text-xs text-[#736A62] mb-6 leading-relaxed">
                Ваши воспоминания бережно сохранены в оригинальном качестве и уже транслируются на экран в зале!
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-[#2C2724] hover:bg-[#3D352F] transition-colors cursor-pointer"
              >
                Готово
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
