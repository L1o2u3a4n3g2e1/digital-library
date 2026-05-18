import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiClock, FiBookOpen, FiHeadphones, FiArrowRight, FiMic, FiZap } from 'react-icons/fi';
import MainLayout from '../layouts/MainLayout';
import BookCard from '../components/books/BookCard';
import AudioPlayer from '../components/audio/AudioPlayer';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { MOCK_BOOKS, MOCK_STATS, SAMPLE_TEXT } from '../data/mockData';
import { CATEGORIES } from '../utils/constants';
import { bookService, statsService } from '../services/api';

const StatCard = ({ icon: Icon, value, label, color }) => (
  <motion.div whileHover={{ y: -3 }} className="card p-5 flex items-center gap-4">
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
      <Icon size={20} style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-bold font-['Playfair_Display'] text-[#4A3628]">{value}</p>
      <p className="text-xs text-[#9E8E80] mt-0.5">{label}</p>
    </div>
  </motion.div>
);

const SectionHeader = ({ title, to, icon: Icon }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={18} className="text-[#B08968]" />}
      <h2 className="section-title">{title}</h2>
    </div>
    {to && (
      <Link to={to} className="flex items-center gap-1 text-sm text-[#B08968] hover:text-[#8B6F5A] font-medium transition-colors">
        See all <FiArrowRight size={14} />
      </Link>
    )}
  </div>
);

export default function Dashboard() {
  const { user, language } = useApp();
  const { t } = useTranslation(language);
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [books, setBooks] = useState(MOCK_BOOKS);
  const [stats, setStats] = useState(MOCK_STATS);

  useEffect(() => {
    bookService.list().then(data => { if (data?.length) setBooks(data); }).catch(() => {});
    statsService.get().then(data => { if (data) setStats(data); }).catch(() => {});
    bookService.recommend().then(data => { if (data?.length) setBooks(prev => [...data, ...prev.filter(b => !data.find(d => d.id === b.id))]); }).catch(() => {});
  }, []);

  const inProgress = books.filter(b => b.progress > 0 && b.progress < 100);
  const recommended = books.filter(b => b.progress === 0).slice(0, 4);
  const trending = books.slice(0, 6);
  const audioBooks = books.filter(b => b.hasAudio).slice(0, 4);

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-10">

        {/* Welcome header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-['Playfair_Display'] font-bold text-[#4A3628]">
              {t('welcome')}, {user?.name?.split(' ')[0] || 'Reader'} 👋
            </h1>
            <p className="text-[#9E8E80] mt-1 text-sm">You've read <strong className="text-[#8B6F5A]">{stats.booksRead} books</strong> — keep going!</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/search')}
              className="btn-ghost flex items-center gap-2 text-sm border border-[#D8BFAA]">
              <FiMic size={15} /> Voice Search
            </button>
            <Link to="/upload" className="btn-primary text-sm">+ Upload Book</Link>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FiBookOpen} value={stats.booksRead} label={t('booksRead')} color="#8B6F5A" />
          <StatCard icon={FiHeadphones} value={`${stats.listeningHours}h`} label={t('listeningTime')} color="#B08968" />
          <StatCard icon={FiZap} value={`${stats.streak} days`} label={t('streak')} color="#D4A574" />
          <StatCard icon={FiTrendingUp} value="78%" label={t('readingProgress')} color="#C9A882" />
        </div>

        {/* Continue Reading */}
        {inProgress.length > 0 && (
          <section>
            <SectionHeader title={t('continueReading')} to="/history" icon={FiClock} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgress.map((book, i) => (
                <motion.div key={book.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -3 }}
                  className="card flex items-center gap-4 p-4 cursor-pointer group"
                  onClick={() => navigate(`/read/${book.id}`)}>
                  <div className="w-14 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#EDD9CB]">
                    {book.cover ? <img src={book.cover} alt={book.title} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#4A3628] text-sm truncate group-hover:text-[#8B6F5A] transition-colors">{book.title}</h3>
                    <p className="text-xs text-[#9E8E80] mt-0.5">{book.author}</p>
                    <div className="mt-2.5">
                      <div className="flex justify-between text-xs text-[#C4B0A0] mb-1"><span>Progress</span><span>{book.progress}%</span></div>
                      <div className="h-1.5 bg-[#EDD9CB] rounded-full"><div className="h-full bg-gradient-to-r from-[#B08968] to-[#8B6F5A] rounded-full" style={{ width: `${book.progress}%` }} /></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Recommended */}
        <section>
          <SectionHeader title={t('recommended')} to="/search" icon={FiZap} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommended.map((book, i) => <BookCard key={book.id} book={book} index={i} />)}
          </div>
        </section>

        {/* Categories */}
        <section>
          <SectionHeader title="Browse by Category" to="/search" />
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === 'all' ? 'bg-[#8B6F5A] text-white' : 'bg-white border border-[#D8BFAA] text-[#6B5044] hover:border-[#B08968]'}`}>
              All
            </button>
            {CATEGORIES.slice(0, 8).map(c => (
              <button key={c.id} onClick={() => setActiveCategory(c.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === c.id ? 'bg-[#8B6F5A] text-white' : 'bg-white border border-[#D8BFAA] text-[#6B5044] hover:border-[#B08968]'}`}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </section>

        {/* Trending */}
        <section>
          <SectionHeader title={t('trending')} to="/search" icon={FiTrendingUp} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {trending.map((book, i) => <BookCard key={book.id} book={book} index={i} />)}
          </div>
        </section>

        {/* Audiobooks + Player */}
        <section>
          <SectionHeader title={t('audiobooks')} to="/audio" icon={FiHeadphones} />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
              {audioBooks.map((book, i) => <BookCard key={book.id} book={book} index={i} layout="list" />)}
            </div>
            <div>
              <AudioPlayer text={SAMPLE_TEXT} lang={language} />
            </div>
          </div>
        </section>

        {/* Reading streak */}
        <section>
          <SectionHeader title="Weekly Reading Activity" />
          <div className="card p-6">
            <div className="flex items-end gap-2 h-24">
              {stats.weeklyReadingMinutes.map((mins, i) => {
                const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
                const maxMins = Math.max(...stats.weeklyReadingMinutes);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(mins / maxMins) * 80}px` }}
                      transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#8B6F5A] to-[#D8BFAA] min-h-[4px]" />
                    <span className="text-[10px] text-[#C4B0A0]">{days[i]}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-[#9E8E80] mt-3 text-center">You read an average of <strong className="text-[#8B6F5A]">41 minutes/day</strong> this week 🎉</p>
          </div>
        </section>

      </div>
    </MainLayout>
  );
}
