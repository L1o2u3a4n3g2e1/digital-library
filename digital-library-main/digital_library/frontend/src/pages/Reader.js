import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiBookmark,
  FiChevronLeft,
  FiChevronRight,
  FiGlobe,
  FiMenu,
  FiMessageSquare,
  FiMinus,
  FiMoon,
  FiPlus,
  FiSun,
} from 'react-icons/fi';
import { MdFormatSize } from 'react-icons/md';
import Navbar from '../components/layout/Navbar';
import AudioPlayer from '../components/audio/AudioPlayer';
import AIAssistant from '../components/ai/AIAssistant';
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../utils/constants';
import { bookService, statsService, translationService } from '../services/api';
import { getBookTextForLanguage } from '../utils/languageSupport';

const FONT_SIZES = [14, 16, 18, 20, 22, 24];

export default function ReadBook() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { language, toggleBookmark, isBookmarked } = useApp();
  const autoAudio = searchParams.get('mode') === 'audio';

  const [book, setBook] = useState(null);
  const [readerLanguage, setReaderLanguage] = useState(language);
  const [translatedVersions, setTranslatedVersions] = useState({});
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [fontSizeIdx, setFontSizeIdx] = useState(2);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [translation, setTranslation] = useState('');
  const [translatingSelection, setTranslatingSelection] = useState(false);
  const [translateTo, setTranslateTo] = useState(language === 'rw' ? 'en' : 'rw');
  const [showLeftPanel, setShowLeftPanel] = useState(() => window.innerWidth >= 1024);
  const [showRightPanel, setShowRightPanel] = useState(() => window.innerWidth >= 1024);
  const [page, setPage] = useState(1);
  const [bookError, setBookError] = useState('');
  const readStartRef = useRef(Date.now());
  const lastTrackedPageRef = useRef(1);
  const progressRef = useRef(0);
  const languageRef = useRef(language);

  useEffect(() => {
    let mounted = true;
    setBookError('');
    bookService
      .get(id)
      .then((data) => {
        if (!mounted || !data) {
          return;
        }

        setBook(data);
        const availableLanguages = data.available_languages || [data.language];
        const preferred = availableLanguages.includes(language)
          ? language
          : data.preferred_language || data.language || 'en';
        setReaderLanguage(preferred);
        setTranslatedVersions({});
        setPage(1);
        readStartRef.current = Date.now();
        lastTrackedPageRef.current = 1;
      })
      .catch((error) => {
        if (mounted) {
          setBookError(error.message || 'Failed to load book');
        }
      });

    return () => {
      mounted = false;
    };
  }, [id, language]);

  const availableLanguages = useMemo(
    () => (book?.available_languages?.length ? book.available_languages : [book?.language || 'en']),
    [book]
  );

  const activeContent = useMemo(() => {
    if (!book) {
      return '';
    }

    if (translatedVersions[readerLanguage]) {
      return translatedVersions[readerLanguage];
    }

    return getBookTextForLanguage(book, readerLanguage);
  }, [book, readerLanguage, translatedVersions]);

  const paragraphs = useMemo(
    () => activeContent.split('\n\n').filter((paragraph) => paragraph.trim().length > 0),
    [activeContent]
  );
  const totalPages = Math.max(1, Math.ceil(paragraphs.length / 2));
  const currentProgress = Math.min(100, Math.round((page / totalPages) * 100));
  const fontSize = FONT_SIZES[fontSizeIdx];
  const bookmarked = book ? isBookmarked(book.id) : false;

  useEffect(() => {
    progressRef.current = currentProgress;
  }, [currentProgress]);

  useEffect(() => {
    languageRef.current = readerLanguage;
  }, [readerLanguage]);

  const trackReading = (bookId, minutesOverride = null) => {
    if (!bookId) {
      return;
    }

    const elapsedMinutes =
      minutesOverride !== null ? minutesOverride : Math.max(0, Math.round((Date.now() - readStartRef.current) / 60000));
    statsService
      .logRead(bookId, elapsedMinutes, progressRef.current, languageRef.current, progressRef.current >= 100)
      .catch(() => {});
  };

  useEffect(() => {
    if (!book?.id) {
      return undefined;
    }

    const activeBookId = book.id;
    return () => {
      const minutes = Math.max(0, Math.round((Date.now() - readStartRef.current) / 60000));
      trackReading(activeBookId, minutes);
    };
  }, [book?.id]);

  useEffect(() => {
    if (!book?.id) {
      return;
    }

    if (page !== lastTrackedPageRef.current) {
      lastTrackedPageRef.current = page;
      statsService.logRead(book.id, 0, currentProgress, readerLanguage, currentProgress >= 100).catch(() => {});
    }
  }, [book, currentProgress, page, readerLanguage]);

  useEffect(() => {
    setTranslateTo(readerLanguage === 'rw' ? 'en' : 'rw');
  }, [readerLanguage]);

  const ensureLanguageContent = async (targetLanguage) => {
    if (!book || translatedVersions[targetLanguage] || availableLanguages.includes(targetLanguage)) {
      return;
    }

    const sourceLanguage = book.language || 'en';
    const sourceText = getBookTextForLanguage(book, sourceLanguage);
    if (!sourceText.trim()) {
      return;
    }

    setLoadingTranslation(true);
    try {
      const result = await translationService.translate(sourceText, sourceLanguage, targetLanguage, book.id);
      const translated = result?.translated || '';
      setTranslatedVersions((prev) => ({ ...prev, [targetLanguage]: translated }));
    } finally {
      setLoadingTranslation(false);
    }
  };

  const changeReaderLanguage = async (nextLanguage) => {
    if (nextLanguage === readerLanguage) {
      return;
    }

    await ensureLanguageContent(nextLanguage);
    setReaderLanguage(nextLanguage);
    setPage(1);
  };

  const handleTextSelect = () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && selection.length > 2) {
      setSelectedText(selection);
    }
  };

  const doTranslate = async () => {
    if (!selectedText || !book) {
      return;
    }

    setTranslatingSelection(true);
    try {
      const result = await translationService.translate(selectedText, readerLanguage, translateTo, book.id);
      setTranslation(result?.translated || '');
    } catch {
      setTranslation(translateTo === 'rw' ? '[rw] Translation unavailable' : '[en] Translation unavailable');
    }
    setTranslatingSelection(false);
  };

  const bg = darkMode ? 'var(--reader-dark-bg)' : 'var(--brand-50)';
  const textColor = darkMode ? 'var(--reader-dark-text)' : 'var(--reader-light-text)';
  const surfaceBg = darkMode ? 'var(--reader-dark-surface)' : '#fff';
  const borderClr = darkMode ? 'var(--brand-950)' : 'var(--brand-100)';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: bg }}>
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          {showLeftPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-shrink-0 overflow-hidden border-r"
              style={{ borderColor: borderClr, background: surfaceBg }}
            >
              <div className="w-[280px] h-full flex flex-col overflow-y-auto p-5">
                <div className="mb-5 flex items-center gap-2">
                  <Link to="/dashboard" className="btn-ghost flex items-center gap-1.5 rounded-xl p-2 text-sm">
                    <FiArrowLeft size={15} />
                    {language === 'rw' ? 'Garuka' : 'Back'}
                  </Link>
                  {book && (
                    <button
                      onClick={() => toggleBookmark(book)}
                      className={`ml-auto rounded-xl p-2 transition-colors ${
                        bookmarked ? 'bg-brand-100 text-brand-600' : 'text-gray-400 hover:bg-brand-50 hover:text-brand-600'
                      }`}
                    >
                      <FiBookmark size={16} className={bookmarked ? 'fill-current' : ''} />
                    </button>
                  )}
                </div>

                {book ? (
                  <>
                    <div className="mb-5 text-center">
                      <div className="mx-auto mb-3 h-40 w-28 overflow-hidden rounded-2xl bg-brand-200 shadow-card">
                        {book.cover ? (
                          <img src={book.cover} alt={book.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-brand-600">
                            {book.title.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h2 className="font-['Playfair_Display'] text-sm font-bold leading-snug" style={{ color: textColor }}>
                        {readerLanguage === 'en' && book.title_en ? book.title_en : book.title}
                      </h2>
                      {book.title_en && readerLanguage === 'rw' && <p className="mt-1 text-xs text-brand-500">{book.title_en}</p>}
                      <p className="mt-1 text-xs text-gray-500">{book.author}</p>
                    </div>

                    <div className="mb-5">
                      <div className="mb-1.5 flex justify-between text-xs text-gray-500">
                        <span>{language === 'rw' ? 'Aho ugeze gusoma' : 'Reading progress'}</span>
                        <span>{currentProgress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-brand-200">
                        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${currentProgress}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        {language === 'rw' ? 'Urupapuro' : 'Page'} {page} {language === 'rw' ? 'muri' : 'of'} {totalPages}
                      </p>
                    </div>

                    <div className="space-y-4 rounded-2xl p-4" style={{ background: darkMode ? 'var(--brand-950)' : 'var(--brand-50)' }}>
                      <p className="text-xs font-semibold text-gray-500">
                        {language === 'rw' ? 'IGENAMITERERE RYO GUSOMA' : 'READING SETTINGS'}
                      </p>
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-xs text-brand-800">
                          <MdFormatSize size={13} />
                          {language === 'rw' ? 'Ingano y\'imyandiko' : 'Font size'}: {fontSize}px
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setFontSizeIdx((value) => Math.max(0, value - 1))}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-200 text-brand-950 transition-colors"
                          >
                            <FiMinus size={12} />
                          </button>
                          <div className="flex flex-1 gap-1">
                            {FONT_SIZES.map((_, index) => (
                              <div
                                key={index}
                                onClick={() => setFontSizeIdx(index)}
                                className="h-1.5 flex-1 cursor-pointer rounded-full transition-all"
                                style={{ background: index <= fontSizeIdx ? 'var(--brand-600)' : 'var(--brand-200)' }}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => setFontSizeIdx((value) => Math.min(FONT_SIZES.length - 1, value + 1))}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-200 text-brand-950 transition-colors"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-brand-800">
                          {darkMode ? <FiMoon size={13} /> : <FiSun size={13} />}
                          {darkMode
                            ? language === 'rw'
                              ? 'Uburyo bwa nijoro'
                              : 'Night mode'
                            : language === 'rw'
                            ? 'Uburyo bw\'amanywa'
                            : 'Day mode'}
                        </span>
                        <button
                          onClick={() => setDarkMode((value) => !value)}
                          className="relative h-5 w-10 rounded-full transition-all"
                          style={{ background: darkMode ? 'var(--brand-600)' : 'var(--brand-200)' }}
                        >
                          <span
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                              darkMode ? 'right-0.5' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-500">{(language === 'rw' ? 'URURIMI' : 'LANGUAGE VIEW')}</p>
                        {loadingTranslation && (
                          <span className="text-[11px] text-brand-500">
                            {language === 'rw' ? 'Turahindura...' : 'Translating...'}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {LANGUAGES.map((item) => {
                          const active = readerLanguage === item.code;
                          const available = availableLanguages.includes(item.code) || !!translatedVersions[item.code];
                          return (
                            <button
                              key={item.code}
                              onClick={() => changeReaderLanguage(item.code)}
                              className={`rounded-xl px-2.5 py-2 text-xs transition-all ${
                                active
                                  ? 'bg-brand-600 text-white'
                                  : 'text-brand-800 hover:bg-brand-50'
                              }`}
                            >
                              {item.flag} {item.label.split(' ')[0]} {!available && ' *'}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-[11px] text-gray-400">
                        {language === 'rw'
                          ? 'Igitabo gifite English/Kinyarwanda view. Iyo view idahari, sisitemu igerageza gusemura content yose.'
                          : 'If a language version is missing, the system attempts a full-book translation view.'}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">{bookError || (language === 'rw' ? 'Turapakira igitabo...' : 'Loading book...')}</p>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: borderClr, background: surfaceBg }}>
            <button onClick={() => setShowLeftPanel((value) => !value)} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-brand-50">
              <FiMenu size={16} />
            </button>
            <div className="flex-1 text-center">
              <span className="text-xs font-medium text-gray-500">
                {language === 'rw' ? 'Urupapuro' : 'Page'} {page} {language === 'rw' ? 'muri' : 'of'} {totalPages}
              </span>
            </div>
            <button onClick={() => setShowRightPanel((value) => !value)} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-brand-50">
              <FiMessageSquare size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 md:px-16 lg:px-24 xl:px-32" onMouseUp={handleTextSelect}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={`${readerLanguage}-${page}`}
              className="mx-auto max-w-2xl"
              style={{ color: textColor, fontSize: `${fontSize}px`, lineHeight: '1.95', fontFamily: 'Georgia, serif' }}
            >
              {bookError ? (
                <p className="text-sm text-red-500">{bookError}</p>
              ) : (
                paragraphs.slice((page - 1) * 2, page * 2).map((paragraph, index) => (
                  <p key={index} className="mb-7 select-text">
                    {paragraph}
                  </p>
                ))
              )}
            </motion.div>
          </div>

          <div className="flex items-center justify-between border-t px-6 py-4" style={{ borderColor: borderClr, background: surfaceBg }}>
            <button
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-brand-600 transition-all disabled:opacity-40"
            >
              <FiChevronLeft />
              {language === 'rw' ? 'Ibanziriza' : 'Previous'}
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setPage(index + 1)}
                  className="h-8 w-8 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: page === index + 1 ? 'var(--brand-600)' : 'transparent',
                    color: page === index + 1 ? 'white' : 'var(--gray-500)',
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-brand-600 transition-all disabled:opacity-40"
            >
              {language === 'rw' ? 'Ikikurikiraho' : 'Next'}
              <FiChevronRight />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showRightPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-shrink-0 overflow-hidden border-l"
              style={{ borderColor: borderClr, background: surfaceBg }}
            >
              <div className="w-[300px] h-full flex flex-col overflow-y-auto space-y-4 p-4">
                <AudioPlayer text={activeContent} lang={readerLanguage} autoPlay={autoAudio} bookId={book?.id} />

                <div className="space-y-3 rounded-2xl border border-brand-100 p-4" style={{ background: darkMode ? 'var(--reader-dark-surface)' : 'var(--brand-50)' }}>
                  <div className="flex items-center gap-2">
                    <FiGlobe size={14} className="text-brand-500" />
                    <p className="text-sm font-semibold text-brand-950">
                      {language === 'rw' ? 'Gusemura' : 'Translate'}
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">
                      {language === 'rw' ? 'Semura kuri' : 'Translate to'}
                    </label>
                    <select value={translateTo} onChange={(event) => setTranslateTo(event.target.value)} className="input-field py-2 text-sm">
                      {LANGUAGES.filter((item) => item.code !== readerLanguage).map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.flag} {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedText && (
                    <div>
                      <p className="mb-1 text-xs text-gray-500">
                        {language === 'rw' ? 'Byatoranyijwe' : 'Selected'}
                      </p>
                      <p className="line-clamp-2 rounded-xl border border-brand-100 bg-white px-3 py-2 text-xs italic text-brand-800">
                        "{selectedText}"
                      </p>
                    </div>
                  )}
                  <button
                    onClick={doTranslate}
                    disabled={!selectedText || translatingSelection}
                    className="btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-xs disabled:opacity-50"
                  >
                    {translatingSelection && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                    {language === 'rw' ? 'Semura ibyatoranyijwe' : 'Translate selected'}
                  </button>
                  {translation && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-brand-100 bg-white px-3 py-3">
                      <p className="text-xs text-brand-950">{translation}</p>
                    </motion.div>
                  )}
                  {!selectedText && (
                    <p className="text-center text-xs text-gray-400">
                      {language === 'rw' ? 'Hitamo inyandiko kugira ngo usemure' : 'Select text to translate'}
                    </p>
                  )}
                </div>

                <div className="flex-1">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-950">
                    <FiMessageSquare size={16} className="text-brand-600" /> {language === 'rw' ? 'Umufasha wa AI' : 'AI Assistant'}
                  </p>
                  <div className="h-64">
                    <AIAssistant floating={false} />
                  </div>
                </div>

                <div className="rounded-2xl border border-brand-100 p-4" style={{ background: darkMode ? 'var(--reader-dark-surface)' : 'var(--brand-50)' }}>
                  <p className="mb-2 text-xs font-semibold text-gray-500">
                    {language === 'rw' ? 'AMANOTISI' : 'NOTES'}
                  </p>
                  <textarea
                    placeholder={language === 'rw' ? 'Andika amanotisi yawe hano...' : 'Write your notes here...'}
                    rows={3}
                    className="w-full resize-none bg-transparent text-xs text-brand-800 focus:outline-none"
                  />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
