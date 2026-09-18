import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Tv, Images, QrCode } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'upload', label: 'Добавить фото', icon: Camera },
    { id: 'gallery', label: 'Свадебный альбом', icon: Images },
    { id: 'live', label: 'Проектор в зале', icon: Tv },
    { id: 'qr', label: 'QR карточка', icon: QrCode },
  ];

  return (
    <header className="sticky top-4 z-40 w-full max-w-3xl mx-auto px-4 mb-8">
      <div className="flex items-center justify-between p-2 rounded-full bg-white/85 backdrop-blur-xl border border-[#E9E1D6] shadow-[0_4px_25px_rgba(79,65,53,0.06)]">
        {/* Brand / Monogram */}
        <div className="flex items-center gap-2.5 pl-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FAF5EE] border border-[#D9C8B2] text-[#8C6D41] shadow-inner font-serif text-base font-bold">
            W
          </div>
          <div className="hidden sm:block">
            <span className="font-serif text-base font-medium text-[#2C2724] tracking-wide">
              Свадебный Альбом
            </span>
          </div>
        </div>

        {/* Animated Tabs */}
        <nav className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 flex items-center gap-1.5 outline-none cursor-pointer ${
                  isActive ? 'text-[#3E342B] font-semibold' : 'text-[#847B72] hover:text-[#2C2724]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeWarmTab"
                    className="absolute inset-0 rounded-full bg-[#F5EFEB] border border-[#DFD5C7] shadow-sm"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-[#A07C44]' : 'text-[#A3998E]'}`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
