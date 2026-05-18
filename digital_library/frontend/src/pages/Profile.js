import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiBookOpen, FiHeadphones, FiBookmark, FiStar, FiCamera, FiEye, FiMoon, FiSun } from 'react-icons/fi';
import MainLayout from '../layouts/MainLayout';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { MOCK_BOOKS, MOCK_STATS } from '../data/mockData';
import { LANGUAGES } from '../utils/constants';

const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#7C3AED] hover:bg-[#F5F3FF]'}`}>
    {children}
  </button>
);

export default function Profile() {
  const { user, language, setLanguage, theme, setTheme, lowLiteracy, setLowLiteracy, highContrast, setHighContrast, bookmarks } = useApp();
  useTranslation(language);
  const [tab, setTab] = useState('activity');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Reader');

  const recentBooks = MOCK_BOOKS.filter(b => b.progress > 0);

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Profile header card */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="card p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#DDD6FE] to-[#7C3AED] flex items-center justify-center text-white text-4xl font-['Playfair_Display'] font-bold shadow-card">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="absolute inset-0 rounded-3xl bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <FiCamera size={20} className="text-white" />
              </div>
            </div>

            {/* Name & stats */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-3 justify-center sm:justify-start mb-1">
                {editing ? (
                  <input value={name} onChange={e => setName(e.target.value)} onBlur={() => setEditing(false)} autoFocus
                    className="input-field py-1 px-3 text-lg font-bold max-w-[200px]" />
                ) : (
                  <h1 className="text-2xl font-['Playfair_Display'] font-bold text-[#2E1065]">{name}</h1>
                )}
                <button onClick={() => setEditing(v => !v)} className="text-[#9CA3AF] hover:text-[#7C3AED] transition-colors"><FiEdit2 size={15} /></button>
              </div>
              <p className="text-sm text-[#6B7280] mb-4">{user?.email}</p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-6">
                {[
                  { icon: FiBookOpen, value: MOCK_STATS.booksRead, label: 'Books Read' },
                  { icon: FiHeadphones, value: `${MOCK_STATS.listeningHours}h`, label: 'Listened' },
                  { icon: FiBookmark, value: bookmarks.length, label: 'Bookmarks' },
                  { icon: FiStar, value: `${MOCK_STATS.streak}d`, label: 'Streak' },
                ].map(({ icon: Icon, value, label }, i) => (
                  <div key={i} className="text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <Icon size={14} className="text-[#8B5CF6]" />
                      <span className="font-bold text-[#2E1065] text-lg font-['Playfair_Display']">{value}</span>
                    </div>
                    <p className="text-xs text-[#9CA3AF]">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Level badge */}
            <div className="text-center">
              <div className="px-4 py-2 bg-gradient-to-r from-[#EDE9FE] to-[#DDD6FE] rounded-2xl border border-[#A78BFA]">
                <p className="text-xs text-[#7C3AED] font-medium">Level</p>
                <p className="font-['Playfair_Display'] font-bold text-[#2E1065]">{MOCK_STATS.level}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-[#EDE9FE] overflow-x-auto">
          {[['activity', '📊 Activity'], ['settings', '⚙️ Settings'], ['badges', '🏆 Badges']].map(([v, l]) => (
            <TabBtn key={v} active={tab === v} onClick={() => setTab(v)}>{l}</TabBtn>
          ))}
        </div>

        {/* Tab content */}
        <AnimatedTab active={tab === 'activity'}>
          <div className="space-y-6">
            {/* Weekly chart */}
            <div className="card p-6">
              <h3 className="section-title text-base mb-5">Reading This Week</h3>
              <div className="flex items-end gap-2 h-28">
                {MOCK_STATS.weeklyReadingMinutes.map((mins, i) => {
                  const days = ['M','T','W','T','F','S','S'];
                  const max = Math.max(...MOCK_STATS.weeklyReadingMinutes);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${(mins / max) * 96}px` }}
                        transition={{ delay: i * 0.06, duration: 0.5 }}
                        className="w-full rounded-t-lg min-h-[4px]"
                        style={{ background: i === 6 ? '#7C3AED' : 'linear-gradient(to top, #8B5CF6, #DDD6FE)' }} />
                      <span className="text-[10px] text-[#9CA3AF]">{days[i]}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-center text-[#6B7280] mt-3">Avg <strong className="text-[#7C3AED]">41 min/day</strong></p>
            </div>

            {/* Recent books */}
            <div className="card p-6">
              <h3 className="section-title text-base mb-4">Recently Read</h3>
              <div className="space-y-3">
                {recentBooks.map((book, i) => (
                  <div key={book.id} className="flex items-center gap-4">
                    <div className="w-10 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ background: '#DDD6FE' }}>
                      {book.cover && <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2E1065] truncate">{book.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-[#EDE9FE] rounded-full"><div className="h-full bg-[#7C3AED] rounded-full" style={{ width: `${book.progress}%` }} /></div>
                        <span className="text-xs text-[#6B7280] flex-shrink-0">{book.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedTab>

        <AnimatedTab active={tab === 'settings'}>
          <div className="card p-6 space-y-6">
            <h3 className="section-title text-base">Preferences</h3>

            {/* Language */}
            <div>
              <label className="text-sm font-medium text-[#5B21B6] mb-3 block">Preferred Language</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => setLanguage(l.code)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-medium transition-all
                      ${language === l.code ? 'border-[#7C3AED] bg-[#F5F3FF] text-[#7C3AED]' : 'border-[#DDD6FE] text-[#5B21B6] hover:border-[#8B5CF6]'}`}>
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              {[
                { key: 'theme', icon: theme === 'dark' ? FiMoon : FiSun, label: 'Dark Mode', desc: 'Switch to dark reading theme', value: theme === 'dark', toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') },
                { key: 'lowLiteracy', icon: FiEye, label: 'Low Literacy Mode', desc: 'Larger text, simpler UI, voice guidance', value: lowLiteracy, toggle: () => setLowLiteracy(v => !v) },
                { key: 'highContrast', icon: FiEye, label: 'High Contrast', desc: 'Enhanced contrast for better visibility', value: highContrast, toggle: () => setHighContrast(v => !v) },
              ].map(({ key, icon: Icon, label, desc, value, toggle }) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-[#FAFAFF] border border-[#EDE9FE]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center"><Icon size={16} className="text-[#8B5CF6]" /></div>
                    <div>
                      <p className="text-sm font-medium text-[#2E1065]">{label}</p>
                      <p className="text-xs text-[#6B7280]">{desc}</p>
                    </div>
                  </div>
                  <button onClick={toggle} className={`w-12 h-6 rounded-full relative transition-all duration-200 ${value ? 'bg-[#7C3AED]' : 'bg-[#DDD6FE]'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${value ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </AnimatedTab>

        <AnimatedTab active={tab === 'badges'}>
          <div className="card p-6">
            <h3 className="section-title text-base mb-5">Achievements</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { icon: '📚', label: 'First Book', earned: true },
                { icon: '🔥', label: '7-Day Streak', earned: true },
                { icon: '🌍', label: 'Multilingual', earned: true },
                { icon: '🎧', label: 'Audio Listener', earned: true },
                { icon: '📝', label: '10 Books Read', earned: false },
                { icon: '⭐', label: 'Top Reader', earned: false },
                { icon: '🌟', label: '30-Day Streak', earned: false },
                { icon: '🏆', label: 'Library Master', earned: false },
              ].map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                  className={`card p-4 text-center ${b.earned ? '' : 'opacity-40 grayscale'}`}>
                  <span className="text-3xl">{b.icon}</span>
                  <p className="text-xs font-medium text-[#2E1065] mt-2">{b.label}</p>
                  {b.earned && <span className="text-xs text-[#8B5CF6] mt-1 block">Earned</span>}
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedTab>
      </div>
    </MainLayout>
  );
}

function AnimatedTab({ active, children }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
