import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiMic, FiBell, FiUser, FiMenu, FiX, FiLogOut,
  FiSettings, FiBookmark, FiSun, FiMoon, FiGlobe, FiEye
} from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';
import { LANGUAGES } from '../../utils/constants';
import { MOCK_NOTIFICATIONS as NOTIFS } from '../../data/mockData';

export default function Navbar() {
  const { user, logout, language, setLanguage, theme, setTheme, lowLiteracy, setLowLiteracy, setSidebarOpen, sidebarOpen } = useApp();
  const { t } = useTranslation(language);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [listening, setListening] = useState(false);
  const searchRef = useRef(null);
  const unread = NOTIFS.filter(n => !n.read).length;

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = language === 'rw' ? 'rw-RW' : language === 'sw' ? 'sw-KE' : language === 'fr' ? 'fr-FR' : 'en-US';
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const q = e.results[0][0].transcript;
      setSearchQuery(q);
      setListening(false);
      navigate(`/search?q=${encodeURIComponent(q)}`);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
    setSearchOpen(true);
  };

  const isLanding = location.pathname === '/';

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isLanding ? 'glass' : 'bg-white/90 backdrop-blur-lg border-b border-[#EFE5D8]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-3">
            {user && (
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-ghost p-2 rounded-xl lg:hidden">
                {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            )}
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#B08968] to-[#8B6F5A] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-white text-sm font-bold">ML</span>
              </div>
              <span className="hidden sm:block font-['Playfair_Display'] font-semibold text-[#4A3628] text-lg leading-tight">
                {t('appName')}
              </span>
            </Link>
          </div>

          {/* Center: search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B08968]" size={16} />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('search')}
                className="input-field pl-10 pr-10 py-2.5 text-sm h-10"
              />
              <button type="button" onClick={startVoiceSearch}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-[#B08968] hover:text-[#8B6F5A] transition-colors ${listening ? 'animate-mic' : ''}`}>
                <FiMic size={15} />
              </button>
            </form>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1">
            {/* Mobile search */}
            <button onClick={() => setSearchOpen(!searchOpen)} className="btn-ghost p-2 md:hidden">
              <FiSearch size={18} />
            </button>

            {/* Theme toggle */}
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="btn-ghost p-2 rounded-xl hidden sm:flex">
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* Low literacy toggle */}
            <button onClick={() => setLowLiteracy(v => !v)}
              title={t('lowLiteracy')}
              className={`btn-ghost p-2 rounded-xl hidden sm:flex ${lowLiteracy ? 'bg-[#B08968]/15 text-[#8B6F5A]' : ''}`}>
              <FiEye size={18} />
            </button>

            {/* Language */}
            <div className="relative">
              <button onClick={() => { setShowLang(v => !v); setShowNotifs(false); setShowProfile(false); }}
                className="btn-ghost p-2 rounded-xl flex items-center gap-1">
                <FiGlobe size={18} />
                <span className="text-xs font-semibold hidden sm:block uppercase">{language}</span>
              </button>
              <AnimatePresence>
                {showLang && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-card border border-[#EFE5D8] overflow-hidden z-60">
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => { setLanguage(l.code); setShowLang(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#F8F4EE] transition-colors ${language === l.code ? 'text-[#8B6F5A] font-semibold bg-[#F8F4EE]' : 'text-[#4A3628]'}`}>
                        <span className="text-lg">{l.flag}</span> {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button onClick={() => { setShowNotifs(v => !v); setShowProfile(false); setShowLang(false); }}
                    className="btn-ghost p-2 rounded-xl relative">
                    <FiBell size={18} />
                    {unread > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-[#B08968] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread}</span>}
                  </button>
                  <AnimatePresence>
                    {showNotifs && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-card border border-[#EFE5D8] overflow-hidden z-60">
                        <div className="px-4 py-3 border-b border-[#EFE5D8]">
                          <h3 className="font-semibold text-[#4A3628] text-sm">{t('notifications')}</h3>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {NOTIFS.map(n => (
                            <div key={n.id} className={`px-4 py-3 border-b border-[#F8F4EE] hover:bg-[#FDFCFA] transition-colors ${!n.read ? 'bg-[#FDF9F4]' : ''}`}>
                              <p className="text-sm text-[#4A3628]">{n.message}</p>
                              <p className="text-xs text-[#C4B0A0] mt-0.5">{n.time}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile */}
                <div className="relative">
                  <button onClick={() => { setShowProfile(v => !v); setShowNotifs(false); setShowLang(false); }}
                    className="flex items-center gap-2 btn-ghost rounded-xl px-2 py-1.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D8BFAA] to-[#B08968] flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-[#4A3628] hidden sm:block max-w-[80px] truncate">{user?.name}</span>
                  </button>
                  <AnimatePresence>
                    {showProfile && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-card border border-[#EFE5D8] overflow-hidden z-60">
                        <div className="px-4 py-3 border-b border-[#EFE5D8]">
                          <p className="font-semibold text-[#4A3628] text-sm truncate">{user?.name}</p>
                          <p className="text-xs text-[#C4B0A0] truncate">{user?.email}</p>
                        </div>
                        {[
                          { icon: FiUser, label: t('profile'), to: '/profile' },
                          { icon: FiBookmark, label: t('bookmarks'), to: '/bookmarks' },
                          { icon: FiSettings, label: t('settings'), to: '/settings' },
                        ].map(({ icon: Icon, label, to }) => (
                          <Link key={to} to={to} onClick={() => setShowProfile(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#4A3628] hover:bg-[#F8F4EE] transition-colors">
                            <Icon size={15} className="text-[#B08968]" /> {label}
                          </Link>
                        ))}
                        <div className="border-t border-[#EFE5D8]">
                          <button onClick={() => { logout(); navigate('/'); setShowProfile(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                            <FiLogOut size={15} /> {t('logout')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link to="/login" className="btn-ghost text-sm px-3 py-2 hidden sm:inline-flex">{t('login')}</Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">{t('register')}</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pb-3 md:hidden">
              <form onSubmit={handleSearch} className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B08968]" size={16} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('search')} className="input-field pl-10 pr-10 py-2.5 text-sm" autoFocus />
                <button type="button" onClick={startVoiceSearch}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-[#B08968] ${listening ? 'animate-mic' : ''}`}>
                  <FiMic size={15} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
