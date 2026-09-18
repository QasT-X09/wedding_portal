import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';

export default function LightboxModal({ item, onClose }) {
  if (!item) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1816]/85 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', duration: 0.35 }}
          className="relative max-w-4xl w-full max-h-[92vh] rounded-2xl bg-white border border-[#EBE3D7] shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Media Player / Full Photo */}
          <div className="flex-1 bg-[#12100E] flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-hidden">
            {item.media_type === 'video' ? (
              <video
                src={item.file_url}
                controls
                autoPlay
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : (
              <img
                src={item.file_url}
                alt={item.original_filename}
                className="max-w-full max-h-[70vh] object-contain"
              />
            )}
          </div>

          {/* Details Bar */}
          <div className="p-5 sm:p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-[#EAE2D5]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-serif text-xl font-medium text-[#2C2724]">
                  {item.guest_name}
                </span>
                {item.table_number && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAF5EE] text-[#8C6D41] border border-[#EADBCE]">
                    {item.table_number}
                  </span>
                )}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#736A62] border border-[#E5DDD2]">
                  {item.category_label || item.category}
                </span>
              </div>
              <p className="text-xs text-[#736A62] italic font-light">
                {item.wishes ? `«${item.wishes}»` : 'Счастливого дня свадьбы! 💍'}
              </p>
            </div>

            <a
              href={item.file_url}
              download={item.original_filename}
              className="px-5 py-2.5 rounded-xl font-medium text-xs text-white bg-[#2C2724] hover:bg-[#3D352F] shadow-sm transition-all flex items-center gap-2 cursor-pointer no-underline flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать в 4K качестве</span>
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
