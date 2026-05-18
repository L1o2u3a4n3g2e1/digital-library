import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiSearch, FiUpload, FiBookmark, FiClock, FiHeadphones,
  FiSettings, FiLogOut, FiX, FiShield
} from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';

const NAV_ITEMS = [
  { icon: FiGrid, key: 'dashboard', to: '/dashboard', emoji: '🏠' },
  { icon: FiSearch, key: 'books', to: '/search', emoji: '🔍' },
  { icon: FiUpload, key: 'upload', to: '/upload', emoji: '📤' },
  { icon: FiBookmark, key: 'bookmarks', to: '/bookmarks', emoji: '🔖' },
  { icon: FiClock, key: 'history', to: '/history', emoji: '🕐' },
  { icon: FiHeadphones, key: 'audio', to: '/audio', emoji: '🎧' },
];

const BOTTOM_ITEMS = [
  { icon: FiShield, key: 'admin', to: '/admin' },
  { icon: FiSettings, key: 'settings', to: '/settings' },
];

export default function Sidebar() {
  const { language, logout, sidebarOpen, setSidebarOpen, user, lowLiteracy, speakHint } = useApp();
  const { t } = useTranslation(language);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-[#E5E7EB]">
      {/* Logo area */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-[#EDE9FE]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">ML</span>
          </div>
          <span className="font-['Playfair_Display'] font-semibold text-[#2E1065] text-base">
            {t('appName')}
          </span>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="btn-ghost p-1.5 rounded-lg lg:hidden">
          <FiX size={18} />
        </button>
      </div>

      {/* User mini card */}
      {user && (
        <div className="mx-4 my-4 p-3 rounded-2xl bg-gradient-to-r from-[#F5F3FF] to-[#EDE9FE] border border-[#EDE9FE]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#DDD6FE] to-[#8B5CF6] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#2E1065] truncate">{user?.name}</p>
              <p className="text-xs text-[#8B5CF6]">Avid Reader</p>
            </div>
          </div>
        </div>
      )}

      {/* Low Literacy voice banner */}
      {lowLiteracy && (
        <div className="mx-3 mb-2 px-3 py-2 rounded-xl bg-[#7C3AED]/10 border border-[#DDD6FE] flex items-center gap-2">
          <span className="text-lg">🔊</span>
          <p className="text-xs text-[#5B21B6] font-medium">Hover a menu item to hear it</p>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ icon: Icon, key, to, emoji }) => (
          <NavLink key={to} to={to}
            onClick={() => setSidebarOpen(false)}
            onMouseEnter={() => speakHint(t(key))}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 rounded-2xl font-medium transition-all duration-200 group
              ${lowLiteracy ? 'py-4 text-base' : 'py-3 text-sm'}
              ${isActive
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-[0_4px_14px_-2px_rgba(124,58,237,0.35)]'
                : 'text-[#5B21B6] hover:bg-[#F5F3FF] hover:text-[#7C3AED]'
              }`
            }>
            {({ isActive }) => (
              <>
                {lowLiteracy
                  ? <span className="text-xl">{emoji}</span>
                  : <Icon size={18} className={isActive ? 'text-white' : 'text-[#8B5CF6] group-hover:text-[#7C3AED]'} />
                }
                <span>{t(key)}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom items */}
      <div className="px-3 pb-4 space-y-1 border-t border-[#EDE9FE] pt-3">
        {BOTTOM_ITEMS.map(({ icon: Icon, key, to }) => (
          <NavLink key={to} to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200
              ${isActive ? 'bg-[#F5F3FF] text-[#7C3AED]' : 'text-[#6B7280] hover:bg-[#F5F3FF] hover:text-[#7C3AED]'}`
            }>
            <Icon size={17} className="text-[#9CA3AF]" />
            <span>{t(key)}</span>
          </NavLink>
        ))}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200">
          <FiLogOut size={17} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm" />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 z-50 lg:hidden shadow-2xl">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
