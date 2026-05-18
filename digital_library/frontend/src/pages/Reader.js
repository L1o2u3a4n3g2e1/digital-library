import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiBookmark, FiGlobe, FiMinus, FiPlus, FiSun, FiMoon,
  FiChevronLeft, FiChevronRight, FiMenu, FiMessageSquare
} from 'react-icons/fi';
import { MdFormatSize } from 'react-icons/md';
import Navbar from '../components/layout/Navbar';
import AudioPlayer from '../components/audio/AudioPlayer';
import AIAssistant from '../components/ai/AIAssistant';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { MOCK_BOOKS, SAMPLE_TEXT } from '../data/mockData';
import { LANGUAGES } from '../utils/constants';

const FONT_SIZES = [14, 16, 18, 20, 22, 24];

export default function ReadBook() {
  const { id } = useParams();
  const { language, toggleBookmark, isBookmarked } = useApp();
  const { t } = useTranslation(language);
  const book = MOCK_BOOKS.find(b => b.id === Number(id)) || MOCK_BOOKS[0];
  const bookmarked = isBookmarked(book.id);

  const [fontSizeIdx, setFontSizeIdx] = useState(2);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [translation, setTranslation] = useState('');
  const [showTranslate, setShowTranslate] = useState(false);
  const [translateTo, setTranslateTo] = useState('fr');
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(SAMPLE_TEXT.split('\n\n').length);
  const paragraphs = SAMPLE_TEXT.split('\n\n');
  const fontSize = FONT_SIZES[fontSizeIdx];

  const handleTextSelect = () => {
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length > 2) { setSelectedText(sel); setShowTranslate(true); }
  };

  const mockTranslate = () => {
    const mocks = {
      fr: 'Il était une fois, dans une terre où les histoires vivaient dans chaque feuille et pierre…',
      sw: 'Hapo zamani za kale, katika nchi ambapo hadithi ziliishi katika kila jani na jiwe…',
      rw: 'Mu gihe cy\'kera, mu gihugu aho inkuru zatuye mu majani no mu mabuye…',
    };
    setTranslation(mocks[translateTo] || 'Translation not available');
  };

  const bg = darkMode ? '#2A1F18' : '#FFFCF8';
  const textColor = darkMode ? '#E8D9CA' : '#3A2A1A';
  const surfaceBg = darkMode ? '#3A2A18' : '#FFFFFF';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: bg }}>
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <AnimatePresence>
          {showLeftPanel && (
            <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-shrink-0 overflow-hidden border-r"
              style={{ borderColor: darkMode ? '#4A3628' : '#EDD9CB', background: surfaceBg }}>
              <div className="w-[280px] h-full flex flex-col p-5 overflow-y-auto">
                {/* Back + bookmark */}
                <div className="flex items-center gap-2 mb-5">
                  <Link to="/search" className="btn-ghost p-2 rounded-xl text-sm flex items-center gap-1.5">
                    <FiArrowLeft size={15} /> Back
                  </Link>
                  <button onClick={() => toggleBookmark(book)}
                    className={`ml-auto p-2 rounded-xl transition-colors ${bookmarked ? 'text-[#8B6F5A] bg-[#EDD9CB]' : 'text-[#C4B0A0] hover:text-[#8B6F5A] hover:bg-[#F8F4EE]'}`}>
                    <FiBookmark size={16} className={bookmarked ? 'fill-current' : ''} />
                  </button>
                </div>

                {/* Book cover + info */}
                <div className="text-center mb-5">
                  <div className="w-28 h-40 rounded-2xl mx-auto mb-3 overflow-hidden shadow-card"
                    style={{ background: '#D8BFAA' }}>
                    {book.cover && <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />}
                  </div>
                  <h2 className="font-['Playfair_Display'] font-bold text-sm leading-snug" style={{ color: textColor }}>{book.title}</h2>
                  <p className="text-xs mt-1" style={{ color: '#9E8E80' }}>{book.author}</p>
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: '#9E8E80' }}>
                    <span>Reading Progress</span><span>{Math.round((page / totalPages) * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: '#D8BFAA' }}>
                    <div className="h-full rounded-full transition-all" style={{ background: '#8B6F5A', width: `${(page / totalPages) * 100}%` }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#C4B0A0' }}>Page {page} of {totalPages}</p>
                </div>

                {/* Reading settings */}
                <div className="rounded-2xl p-4 space-y-4" style={{ background: darkMode ? '#4A3628' : '#F8F4EE' }}>
                  <p className="text-xs font-semibold" style={{ color: '#9E8E80' }}>READING SETTINGS</p>
                  {/* Font size */}
                  <div>
                    <p className="text-xs mb-2 flex items-center gap-1.5" style={{ color: '#6B5044' }}>
                      <MdFormatSize size={13} /> Font size: {fontSize}px
                    </p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setFontSizeIdx(i => Math.max(0, i - 1))}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: '#D8BFAA', color: '#4A3628' }}>
                        <FiMinus size={12} />
                      </button>
                      <div className="flex-1 flex gap-1">
                        {FONT_SIZES.map((_, i) => (
                          <div key={i} onClick={() => setFontSizeIdx(i)}
                            className="flex-1 h-1.5 rounded-full cursor-pointer transition-all"
                            style={{ background: i <= fontSizeIdx ? '#8B6F5A' : '#D8BFAA' }} />
                        ))}
                      </div>
                      <button onClick={() => setFontSizeIdx(i => Math.min(FONT_SIZES.length - 1, i + 1))}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: '#D8BFAA', color: '#4A3628' }}>
                        <FiPlus size={12} />
                      </button>
                    </div>
                  </div>
                  {/* Dark mode */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs flex items-center gap-1.5" style={{ color: '#6B5044' }}>
                      {darkMode ? <FiMoon size={13} /> : <FiSun size={13} />} {darkMode ? 'Night mode' : 'Day mode'}
                    </span>
                    <button onClick={() => setDarkMode(v => !v)}
                      className="w-10 h-5 rounded-full relative transition-all"
                      style={{ background: darkMode ? '#8B6F5A' : '#D8BFAA' }}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${darkMode ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div className="mt-4">
                  <p className="text-xs font-semibold mb-2" style={{ color: '#9E8E80' }}>LANGUAGE</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {LANGUAGES.map(l => (
                      <button key={l.code} className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs transition-all hover:bg-[#F8F4EE]" style={{ color: '#6B5044' }}>
                        {l.flag} {l.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* CENTER: Reading area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: darkMode ? '#4A3628' : '#EDD9CB', background: surfaceBg }}>
            <button onClick={() => setShowLeftPanel(v => !v)} className="p-1.5 rounded-lg transition-colors hover:bg-[#F8F4EE]" style={{ color: '#9E8E80' }}>
              <FiMenu size={16} />
            </button>
            <div className="flex-1 text-center">
              <span className="text-xs font-medium" style={{ color: '#9E8E80' }}>Page {page} of {totalPages}</span>
            </div>
            <button onClick={() => setShowRightPanel(v => !v)} className="p-1.5 rounded-lg transition-colors hover:bg-[#F8F4EE]" style={{ color: '#9E8E80' }}>
              <FiMessageSquare size={16} />
            </button>
          </div>

          {/* Text content */}
          <div className="flex-1 overflow-y-auto px-6 py-8 md:px-16 lg:px-24 xl:px-32" onMouseUp={handleTextSelect}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={page}
              className="max-w-2xl mx-auto" style={{ color: textColor, fontSize: `${fontSize}px`, lineHeight: '1.95', fontFamily: 'Georgia, serif' }}>
              {paragraphs.slice((page - 1) * 2, page * 2).map((p, i) => (
                <p key={i} className="mb-7 select-text">{p}</p>
              ))}
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: darkMode ? '#4A3628' : '#EDD9CB', background: surfaceBg }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
              style={{ color: '#8B6F5A' }}>
              <FiChevronLeft /> Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
                  style={{ background: page === i + 1 ? '#8B6F5A' : 'transparent', color: page === i + 1 ? 'white' : '#9E8E80' }}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
              style={{ color: '#8B6F5A' }}>
              Next <FiChevronRight />
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <AnimatePresence>
          {showRightPanel && (
            <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 300, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-shrink-0 overflow-hidden border-l"
              style={{ borderColor: darkMode ? '#4A3628' : '#EDD9CB', background: surfaceBg }}>
              <div className="w-[300px] h-full flex flex-col overflow-y-auto p-4 space-y-4">
                {/* Audio player */}
                <AudioPlayer text={SAMPLE_TEXT} lang={language} />

                {/* Translation panel */}
                <div className="rounded-2xl border p-4 space-y-3" style={{ background: darkMode ? '#3A2A18' : '#F8F4EE', borderColor: '#EDD9CB' }}>
                  <div className="flex items-center gap-2">
                    <FiGlobe size={14} className="text-[#B08968]" />
                    <p className="text-sm font-semibold" style={{ color: '#4A3628' }}>Translation</p>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#9E8E80' }}>Translate to</label>
                    <select value={translateTo} onChange={e => setTranslateTo(e.target.value)} className="input-field text-sm py-2">
                      {LANGUAGES.filter(l => l.code !== 'en').map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                    </select>
                  </div>
                  {selectedText && (
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#9E8E80' }}>Selected:</p>
                      <p className="text-xs italic bg-white rounded-xl px-3 py-2 border border-[#EDD9CB] line-clamp-2" style={{ color: '#6B5044' }}>"{selectedText}"</p>
                    </div>
                  )}
                  <button onClick={mockTranslate} disabled={!selectedText}
                    className="btn-primary w-full text-xs py-2.5 disabled:opacity-50">
                    Translate Selected
                  </button>
                  {translation && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl px-3 py-3 border border-[#EDD9CB]">
                      <p className="text-xs" style={{ color: '#4A3628' }}>{translation}</p>
                    </motion.div>
                  )}
                  {!selectedText && <p className="text-xs text-center" style={{ color: '#C4B0A0' }}>Select text to translate</p>}
                </div>

                {/* AI Assistant (embedded) */}
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: '#4A3628' }}>
                    🤖 AI Assistant
                  </p>
                  <div className="h-64">
                    <AIAssistant floating={false} />
                  </div>
                </div>

                {/* Notes */}
                <div className="rounded-2xl border p-4" style={{ borderColor: '#EDD9CB', background: darkMode ? '#3A2A18' : '#FDFCFA' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#9E8E80' }}>NOTES</p>
                  <textarea placeholder="Write your notes here…" rows={3}
                    className="w-full bg-transparent text-xs resize-none focus:outline-none"
                    style={{ color: '#6B5044' }} />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
