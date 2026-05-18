import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMic, FiGrid, FiList, FiX, FiSliders } from 'react-icons/fi';
import MainLayout from '../layouts/MainLayout';
import BookCard from '../components/books/BookCard';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { MOCK_BOOKS } from '../data/mockData';
import { CATEGORIES, LANGUAGES } from '../utils/constants';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Read' },
];

export default function SearchBooks() {
  const [searchParams] = useSearchParams();
  const { language } = useApp();
  const { t } = useTranslation(language);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [layout, setLayout] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ lang: 'all', category: 'all', hasAudio: false, sort: 'relevance' });
  const [listening, setListening] = useState(false);
  const [results, setResults] = useState(MOCK_BOOKS);

  useEffect(() => {
    let filtered = [...MOCK_BOOKS];
    if (query) filtered = filtered.filter(b => b.title.toLowerCase().includes(query.toLowerCase()) || b.author.toLowerCase().includes(query.toLowerCase()));
    if (filters.lang !== 'all') filtered = filtered.filter(b => b.language === filters.lang);
    if (filters.category !== 'all') filtered = filtered.filter(b => b.category === filters.category);
    if (filters.hasAudio) filtered = filtered.filter(b => b.hasAudio);
    if (filters.sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    if (filters.sort === 'popular') filtered.sort((a, b) => b.readers - a.readers);
    setResults(filtered);
  }, [query, filters]);

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = language === 'fr' ? 'fr-FR' : language === 'sw' ? 'sw-KE' : language === 'rw' ? 'rw-RW' : 'en-US';
    r.onstart = () => setListening(true);
    r.onresult = (e) => { setQuery(e.results[0][0].transcript); setListening(false); };
    r.onerror = r.onend = () => setListening(false);
    r.start();
  };

  const activeFiltersCount = [filters.lang !== 'all', filters.category !== 'all', filters.hasAudio].filter(Boolean).length;

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Search header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="section-title text-2xl mb-5">Search Books</h1>

          {/* Big search bar */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B08968]" size={20} />
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder={t('search')}
                className="input-field pl-12 pr-12 py-4 text-base shadow-soft" />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-12 top-1/2 -translate-y-1/2 text-[#C4B0A0] hover:text-[#8B6F5A] transition-colors">
                  <FiX size={16} />
                </button>
              )}
              <button onClick={startVoice}
                className={`absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all
                  ${listening ? 'bg-[#8B6F5A] text-white animate-mic' : 'text-[#B08968] hover:bg-[#F8F4EE]'}`}>
                <FiMic size={16} />
              </button>
            </div>
            <button onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-4 py-4 rounded-2xl border font-medium text-sm transition-all
                ${showFilters || activeFiltersCount > 0 ? 'border-[#8B6F5A] bg-[#8B6F5A] text-white' : 'border-[#D8BFAA] bg-white text-[#6B5044] hover:border-[#B08968]'}`}>
              <FiSliders size={16} />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && <span className="w-5 h-5 bg-white text-[#8B6F5A] rounded-full text-xs font-bold flex items-center justify-center">{activeFiltersCount}</span>}
            </button>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-4 p-5 bg-white rounded-2xl border border-[#EDD9CB] shadow-soft">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Language */}
                    <div>
                      <label className="text-xs font-semibold text-[#6B5044] mb-2 block uppercase tracking-wide">Language</label>
                      <div className="flex flex-wrap gap-1.5">
                        {[{ code: 'all', label: 'All', flag: '🌐' }, ...LANGUAGES].map(l => (
                          <button key={l.code} onClick={() => setFilters(p => ({ ...p, lang: l.code }))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filters.lang === l.code ? 'bg-[#8B6F5A] text-white' : 'bg-[#F8F4EE] text-[#6B5044] hover:bg-[#EDD9CB]'}`}>
                            {l.flag} {l.label || 'All'}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Category */}
                    <div>
                      <label className="text-xs font-semibold text-[#6B5044] mb-2 block uppercase tracking-wide">Category</label>
                      <select value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}
                        className="input-field py-2 text-sm">
                        <option value="all">All Categories</option>
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                      </select>
                    </div>
                    {/* Audio */}
                    <div>
                      <label className="text-xs font-semibold text-[#6B5044] mb-2 block uppercase tracking-wide">Type</label>
                      <button onClick={() => setFilters(p => ({ ...p, hasAudio: !p.hasAudio }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${filters.hasAudio ? 'border-[#8B6F5A] bg-[#F8F4EE] text-[#8B6F5A]' : 'border-[#D8BFAA] text-[#6B5044]'}`}>
                        🎧 Audio only
                      </button>
                    </div>
                    {/* Sort */}
                    <div>
                      <label className="text-xs font-semibold text-[#6B5044] mb-2 block uppercase tracking-wide">Sort by</label>
                      <select value={filters.sort} onChange={e => setFilters(p => ({ ...p, sort: e.target.value }))}
                        className="input-field py-2 text-sm">
                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button onClick={() => setFilters({ lang: 'all', category: 'all', hasAudio: false, sort: 'relevance' })}
                      className="text-sm text-[#9E8E80] hover:text-[#8B6F5A] transition-colors">Clear all filters</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-[#9E8E80]">
            <strong className="text-[#4A3628]">{results.length}</strong> books found
            {query && <> for <em className="text-[#8B6F5A] not-italic font-medium">"{query}"</em></>}
          </p>
          <div className="flex gap-1 bg-[#F8F4EE] rounded-xl p-1">
            {[{ icon: FiGrid, v: 'grid' }, { icon: FiList, v: 'list' }].map(({ icon: Icon, v }) => (
              <button key={v} onClick={() => setLayout(v)}
                className={`p-2 rounded-lg transition-all ${layout === v ? 'bg-white text-[#8B6F5A] shadow-sm' : 'text-[#C4B0A0] hover:text-[#8B6F5A]'}`}>
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-lg font-semibold text-[#4A3628]">{t('noResults')}</p>
            <p className="text-sm text-[#9E8E80] mt-2">{t('trySearch')}</p>
            <button onClick={() => { setQuery(''); setFilters({ lang: 'all', category: 'all', hasAudio: false, sort: 'relevance' }); }}
              className="btn-secondary mt-5 text-sm">Clear search</button>
          </motion.div>
        ) : layout === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((book, i) => <BookCard key={book.id} book={book} index={i} layout="grid" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((book, i) => <BookCard key={book.id} book={book} index={i} layout="list" />)}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
