import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiBookOpen,
  FiHeadphones,
  FiLayers,
  FiMic,
  FiSearch,
  FiTrendingUp,
  FiZap,
} from 'react-icons/fi';
import MainLayout from '../layouts/MainLayout';
import AudioPlayer from '../components/audio/AudioPlayer';
import CategoryCard from '../components/categories/CategoryCard';
import { useApp } from '../context/AppContext';
import { CATEGORIES, getCategoryLabel } from '../utils/constants';
import { bookService, statsService } from '../services/api';
import { detectSpokenLanguage, getBookTextForLanguage, labelForLanguage, recognitionCodeFor } from '../utils/languageSupport';

const StatCard = ({ icon: Icon, label, value, hint }) => (
  <motion.div whileHover={{ y: -3 }} className="card flex items-center gap-4 p-5">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
      <Icon size={20} />
    </div>
    <div>
      <p className="font-['Playfair_Display'] text-2xl font-bold text-brand-950">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-brand-500">{hint}</p>}
    </div>
  </motion.div>
);

const SectionHeader = ({ title, subtitle, actionTo, actionLabel }) => (
  <div className="mb-5 flex items-end justify-between gap-4">
    <div>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
    {actionTo && (
      <Link
        to={actionTo}
        className="flex items-center gap-1 text-sm font-medium text-brand-500 transition-colors hover:text-brand-600"
      >
        {actionLabel}
        <FiArrowRight size={14} />
      </Link>
    )}
  </div>
);


export default function Dashboard() {
  const { user, language } = useApp();
  const navigate = useNavigate();
  const isRw = language === 'rw';
  const [books, setBooks] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [stats, setStats] = useState({
    booksRead: 0,
    booksStarted: 0,
    listeningHours: 0,
    streak: 0,
    readingProgress: 0,
    totalReadingMinutes: 0,
    weeklyReadingMinutes: [0, 0, 0, 0, 0, 0, 0],
    topCategory: null,
  });
  const [voiceState, setVoiceState] = useState({
    listening: false,
    mode: null,
    transcript: '',
    interim: '',
    detectedLanguage: 'unknown',
    error: '',
  });

  useEffect(() => {
    bookService.list().then((data) => setBooks(Array.isArray(data) ? data : [])).catch(() => {});
    bookService.recommend().then((data) => setRecommended(Array.isArray(data) ? data : [])).catch(() => {});
    statsService.get().then((data) => data && setStats((prev) => ({ ...prev, ...data }))).catch(() => {});
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = {};
    CATEGORIES.forEach((cat) => {
      counts[cat.id] = books.filter((book) => book.category === cat.id).length;
    });
    return counts;
  }, [books]);

  const featuredAudioBook = useMemo(
    () => recommended[0] || books.find((book) => book.hasAudio) || null,
    [books, recommended]
  );
  const weeklyMax = Math.max(...stats.weeklyReadingMinutes, 1);
  const weeklyAverage = Math.round(
    stats.weeklyReadingMinutes.reduce((sum, value) => sum + value, 0) / Math.max(stats.weeklyReadingMinutes.length, 1)
  );
  const dayLabels = isRw ? ['Mbe', 'Kab', 'Gat', 'Kan', 'Gna', 'Gta', 'Cyu'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const topCategoryLabel = stats.topCategory ? getCategoryLabel(stats.topCategory, language) : null;

  const startVoiceCapture = (mode) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceState((prev) => ({
        ...prev,
        error: isRw ? 'Browser yawe ntishyigikira voice recognition.' : 'Your browser does not support voice recognition.',
      }));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = recognitionCodeFor(mode);
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setVoiceState({
        listening: true,
        mode,
        transcript: '',
        interim: '',
        detectedLanguage: mode,
        error: '',
      });
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const phrase = event.results[index][0].transcript;
        if (event.results[index].isFinal) {
          finalText += `${phrase} `;
        } else {
          interimText += `${phrase} `;
        }
      }

      const transcript = finalText.trim();
      const fallback = (transcript || interimText).trim();
      const detectedLanguage = detectSpokenLanguage(fallback);

      setVoiceState((prev) => ({
        ...prev,
        transcript: transcript || prev.transcript,
        interim: interimText.trim(),
        detectedLanguage,
      }));
    };

    recognition.onerror = () => {
      setVoiceState((prev) => ({
        ...prev,
        listening: false,
        error: isRw ? 'Voice recognition yanze. Ongera ugerageze.' : 'Voice recognition failed. Please try again.',
      }));
    };

    recognition.onend = () => {
      setVoiceState((prev) => {
        const finalTranscript = (prev.transcript || prev.interim).trim();
        if (finalTranscript) {
          statsService.logVoice(finalTranscript, prev.detectedLanguage).catch(() => {});
        }

        return {
          ...prev,
          transcript: finalTranscript,
          interim: '',
          listening: false,
        };
      });
    };

    recognition.start();
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-10 p-6">
        <motion.section
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.18),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f8f6ff_55%,#eef8ff_100%)] p-8 shadow-soft"
        >
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                <FiLayers size={12} />
                {isRw ? 'Isomero ry\'indimi ebyiri' : 'Bilingual library'}
              </p>
              <h1 className="max-w-3xl font-['Playfair_Display'] text-4xl font-bold text-brand-950">
                {isRw
                  ? `Murakaza neza, ${user?.name?.split(' ')[0] || 'Musomyi'}`
                  : `Welcome back, ${user?.name?.split(' ')[0] || 'Reader'}`}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
                {isRw
                  ? 'Twubatse dashboard ifite ibitabo nyabyo: buri cyiciro gifite ebooks 3 z\'Icyongereza hamwe n\'igitabo 1 cy\'Ikinyarwanda.'
                  : 'This dashboard now runs on a real category catalog: each shelf carries 3 English ebooks and 1 Kinyarwanda reader edition.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/search" className="btn-primary text-sm">
                  {isRw ? 'Fungura isomero' : 'Open library'}
                </Link>
                <Link to="/search?lang=rw" className="btn-secondary text-sm">
                  {isRw ? 'Shakisha Ikinyarwanda' : 'Browse Kinyarwanda'}
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                icon={FiBookOpen}
                value={stats.booksRead}
                label={isRw ? 'Ibitabo byarangiye' : 'Books completed'}
                hint={isRw ? `${stats.booksStarted} watangiye` : `${stats.booksStarted} started`}
              />
              <StatCard
                icon={FiHeadphones}
                value={`${stats.listeningHours}h`}
                label={isRw ? 'Igihe cyo kumva' : 'Listening hours'}
                hint={isRw ? 'Audio nyayo ya browser' : 'Real browser audio playback'}
              />
              <StatCard
                icon={FiZap}
                value={`${stats.streak}d`}
                label={isRw ? 'Iminsi ikurikirana' : 'Reading streak'}
                hint={isRw ? `${stats.totalReadingMinutes} iminota yose` : `${stats.totalReadingMinutes} total minutes`}
              />
              <StatCard
                icon={FiTrendingUp}
                value={`${stats.readingProgress}%`}
                label={isRw ? 'Aho ugeze gusoma' : 'Average reading progress'}
                hint={topCategoryLabel ? (isRw ? `Icyiciro cya mbere: ${topCategoryLabel}` : `Top category: ${topCategoryLabel}`) : ''}
              />
            </div>
          </div>
        </motion.section>

        <section>
          <SectionHeader
            title={isRw ? 'Ivugururira mu Byiciro' : 'Browse by Category'}
            subtitle={isRw ? 'Gushyiraho ibyiciro byose kandi guhitamo ibyihiga byawe.' : 'Explore all categories and find books that interest you.'}
            actionTo="/search"
            actionLabel={isRw ? 'Shakisha' : 'Advanced search'}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                bookCount={categoryCounts[category.id] || 0}
                language={language}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
            <SectionHeader
              title={isRw ? 'Isesengura ry\'icyumweru' : 'Weekly reading analytics'}
              subtitle={
                isRw
                  ? 'Nta mibare ihimbano irimo hano; byose biva ku minota yo gusoma no kumva.'
                  : 'No hype analytics here. These numbers come from your actual reading and listening logs.'
              }
            />
            <div className="flex h-28 items-end gap-2">
              {stats.weeklyReadingMinutes.map((minutes, index) => (
                <div key={dayLabels[index]} className="flex flex-1 flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(8, (minutes / weeklyMax) * 96)}px` }}
                    className="w-full rounded-t-xl bg-gradient-to-t from-brand-600 to-brand-300"
                  />
                  <span className="text-[10px] text-gray-400">{dayLabels[index]}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-brand-50 p-4">
                <p className="text-xs text-gray-500">{isRw ? 'Impuzandengo' : 'Average'}</p>
                <p className="mt-1 text-lg font-semibold text-brand-950">
                  {weeklyAverage} {isRw ? 'iminota/umunsi' : 'min/day'}
                </p>
              </div>
              <div className="rounded-2xl bg-brand-50 p-4">
                <p className="text-xs text-gray-500">{isRw ? 'Aho ugeze gusoma' : 'Reading progress'}</p>
                <p className="mt-1 text-lg font-semibold text-brand-950">{stats.readingProgress}%</p>
              </div>
              <div className="rounded-2xl bg-brand-50 p-4">
                <p className="text-xs text-gray-500">{isRw ? 'Amasemura' : 'Translations used'}</p>
                <p className="mt-1 text-lg font-semibold text-brand-950">{stats.translationsUsed || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
            <SectionHeader
              title={isRw ? 'Audiobook iri hafi' : 'Audio-ready spotlight'}
              subtitle={
                isRw
                  ? 'Iyi player ikoresha text nyayo ya buku yatoranyijwe kandi igatanga analytics yo kumva.'
                  : 'This player uses the selected book text and logs real listening activity.'
              }
            />
            {featuredAudioBook ? (
              <>
                <div className="mb-4 rounded-2xl bg-brand-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-500">
                    {featuredAudioBook.category}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-brand-950">{featuredAudioBook.title}</h3>
                  {featuredAudioBook.title_en && <p className="text-sm text-brand-500">{featuredAudioBook.title_en}</p>}
                  <p className="mt-2 text-sm text-gray-500">{featuredAudioBook.author}</p>
                </div>
                <AudioPlayer
                  bookId={featuredAudioBook.id}
                  text={getBookTextForLanguage(featuredAudioBook, language)}
                  lang={language}
                />
              </>
            ) : (
              <p className="text-sm text-gray-500">
                {isRw ? 'Nta gitabo cy\'amajwi kiraboneka.' : 'No audio book is available yet.'}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
          <SectionHeader
            title={isRw ? 'Kwakira ijwi mu gihe nyacyo' : 'Live voice recognition'}
            subtitle={
              isRw
                ? 'Vuga mu Cyongereza cyangwa mu Kinyarwanda, dashboard ikwereke ibyo wavuze kandi ibibike muri analytics.'
                : 'Speak in English or Kinyarwanda and the dashboard will show what you said and log it into analytics.'
            }
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => startVoiceCapture('en')}
              className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                voiceState.listening && voiceState.mode === 'en'
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-brand-200 bg-brand-50 text-brand-900 hover:border-brand-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiMic size={16} />
                <span className="font-semibold">{isRw ? 'Vuga Icyongereza' : 'Speak English'}</span>
              </div>
              <p className={`mt-2 text-xs ${voiceState.listening && voiceState.mode === 'en' ? 'text-white/80' : 'text-gray-500'}`}>
                {isRw ? 'Recognition mode: en-US' : 'Recognition mode: en-US'}
              </p>
            </button>
            <button
              onClick={() => startVoiceCapture('rw')}
              className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                voiceState.listening && voiceState.mode === 'rw'
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-brand-200 bg-brand-50 text-brand-900 hover:border-brand-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiMic size={16} />
                <span className="font-semibold">{isRw ? 'Vuga Ikinyarwanda' : 'Speak Kinyarwanda'}</span>
              </div>
              <p className={`mt-2 text-xs ${voiceState.listening && voiceState.mode === 'rw' ? 'text-white/80' : 'text-gray-500'}`}>
                {isRw ? 'Recognition mode: rw-RW' : 'Recognition mode: rw-RW'}
              </p>
            </button>
          </div>

          <div className="mt-5 rounded-2xl bg-brand-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-500">
                  {voiceState.listening
                    ? isRw
                      ? 'Turatega amatwi'
                      : 'Listening now'
                    : isRw
                    ? 'Ibisohoka'
                    : 'Transcript'}
                </p>
                <p className="mt-2 text-sm font-medium text-brand-950">
                  {voiceState.transcript || voiceState.interim || (isRw ? 'Vuga ubu kugira ngo tubyandike hano.' : 'Start speaking and your words will appear here.')}
                </p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-600">
                {labelForLanguage(voiceState.detectedLanguage, language)}
              </div>
            </div>

            {voiceState.error && <p className="mt-3 text-xs text-red-500">{voiceState.error}</p>}

            {(voiceState.transcript || voiceState.interim) && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => navigate(`/search?q=${encodeURIComponent(voiceState.transcript || voiceState.interim)}`)}
                  className="btn-primary flex items-center gap-2 text-xs"
                >
                  <FiSearch size={12} />
                  {isRw ? 'Shakisha ibyo wavuze' : 'Search what you said'}
                </button>
              </div>
            )}
          </div>
        </section>

      </div>
    </MainLayout>
  );
}
