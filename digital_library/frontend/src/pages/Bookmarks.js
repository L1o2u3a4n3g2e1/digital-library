import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookmark, FiSearch, FiTrash2 } from 'react-icons/fi';
import MainLayout from '../layouts/MainLayout';
import BookCard from '../components/books/BookCard';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';

export default function Bookmarks() {
  const { bookmarks, toggleBookmark, language } = useApp();
  const { t } = useTranslation(language);
  const [search, setSearch] = useState('');
  const [layout, setLayout] = useState('grid');

  const filtered = bookmarks.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#EDD9CB] flex items-center justify-center">
              <FiBookmark size={18} className="text-[#8B6F5A] fill-current" />
            </div>
            <h1 className="section-title text-2xl">{t('bookmarks')}</h1>
          </div>
          <p className="text-sm text-[#9E8E80]">{bookmarks.length} saved book{bookmarks.length !== 1 ? 's' : ''}</p>
        </motion.div>

        {bookmarks.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-24 card">
            <div className="w-20 h-20 rounded-3xl bg-[#F8F4EE] flex items-center justify-center mx-auto mb-5">
              <FiBookmark size={32} className="text-[#D8BFAA]" />
            </div>
            <h2 className="text-lg font-['Playfair_Display'] font-semibold text-[#4A3628] mb-2">No bookmarks yet</h2>
            <p className="text-sm text-[#9E8E80] max-w-xs mx-auto">Start bookmarking books you want to read later by tapping the bookmark icon on any book card.</p>
          </motion.div>
        ) : (
          <>
            <div className="relative mb-6">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B08968]" size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search your bookmarks…" className="input-field pl-10" />
            </div>

            {filtered.length === 0 ? (
              <p className="text-center text-[#9E8E80] py-12">No bookmarks match your search.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimatePresence>
                  {filtered.map((book, i) => (
                    <motion.div key={book.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}>
                      <BookCard book={book} index={i} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
