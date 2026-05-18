import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMic, FiHeadphones, FiGlobe, FiBookOpen, FiArrowRight, FiCheck } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { CATEGORIES, LANGUAGES } from '../utils/constants';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } };

const FEATURES = [
  { icon: FiMic, title: 'Voice Search', desc: 'Search for any book using your voice in 4 languages', color: '#DDD6FE' },
  { icon: FiHeadphones, title: 'Audio Reading', desc: 'Listen to books with AI-generated narration', color: '#C9A88E' },
  { icon: FiGlobe, title: 'Instant Translation', desc: 'Translate any text between English, Français, Kiswahili & Kinyarwanda', color: '#BA9272' },
  { icon: FiBookOpen, title: 'Low Literacy Mode', desc: 'Simplified interface with larger text and voice guidance for all readers', color: '#8B5CF6' },
];

const STATS = [
  { value: '5,000+', label: 'Books Available' },
  { value: '4', label: 'Languages' },
  { value: '50K+', label: 'Active Readers' },
  { value: '98%', label: 'Accessibility Score' },
];

export default function Landing() {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const [hoveredCat, setHoveredCat] = useState(null);

  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F3FF] via-[#F3E8DE] to-[#EDE9FE]" />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#DDD6FE]/25 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-[#8B5CF6]/15 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              {/* Language badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {LANGUAGES.map((l, i) => (
                  <motion.span key={l.code} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-medium text-[#7C3AED] border border-[#DDD6FE]/50 shadow-sm">
                    {l.flag} {l.label}
                  </motion.span>
                ))}
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#2E1065] leading-tight mb-6 whitespace-pre-line">
                {t('heroTitle')}
              </h1>
              <p className="text-lg text-[#5B21B6] leading-relaxed mb-8 max-w-lg">{t('heroSub')}</p>

              <div className="flex flex-wrap gap-3">
                <Link to="/register">
                  <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                    className="btn-primary text-base px-7 py-3.5 gap-2">
                    {t('startReading')} <FiArrowRight />
                  </motion.button>
                </Link>
                <Link to="/search">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="btn-secondary text-base px-7 py-3.5">
                    {t('learnMore')}
                  </motion.button>
                </Link>
              </div>

              {/* Voice hint */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="mt-8 flex items-center gap-3 text-sm text-[#6B7280]">
                <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 flex items-center justify-center animate-mic">
                  <FiMic size={14} className="text-[#7C3AED]" />
                </div>
                <span>Say <em className="text-[#7C3AED] font-medium not-italic">"Find me a health book in Kinyarwanda"</em></span>
              </motion.div>
            </motion.div>

            {/* Hero illustration */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-sm">
                {/* Main card */}
                <div className="glass rounded-3xl p-6 shadow-[0_20px_60px_-10px_rgba(124,58,237,0.25)] animate-float">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center text-white font-bold text-lg">ML</div>
                    <div>
                      <p className="font-semibold text-[#2E1065] text-sm">Multilingual Library</p>
                      <p className="text-xs text-[#6B7280]">AI-Powered Reading</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[{ title: 'Atomic Habits', lang: '🇬🇧', progress: 65 }, { title: 'Ubuzima Bwiza', lang: '🇷🇼', progress: 80 }, { title: 'L\'Étranger', lang: '🇫🇷', progress: 30 }].map((b, i) => (
                      <div key={i} className="bg-[#F5F3FF] rounded-2xl p-3 flex items-center gap-3">
                        <div className="w-9 h-12 rounded-lg bg-gradient-to-br from-[#DDD6FE] to-[#8B5CF6] flex items-center justify-center text-white text-lg flex-shrink-0">📖</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#2E1065] truncate">{b.title}</p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <div className="flex-1 h-1 bg-[#DDD6FE] rounded-full"><div className="h-full bg-[#7C3AED] rounded-full" style={{ width: `${b.progress}%` }} /></div>
                            <span className="text-[10px] text-[#6B7280]">{b.progress}%</span>
                          </div>
                        </div>
                        <span className="text-base">{b.lang}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Floating badges */}
                <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 -right-4 glass rounded-2xl px-3 py-2 shadow-card">
                  <p className="text-xs font-semibold text-[#7C3AED]">🎧 Audio Ready</p>
                </motion.div>
                <motion.div animate={{ y: [4, -4, 4] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-4 -left-4 glass rounded-2xl px-3 py-2 shadow-card">
                  <p className="text-xs font-semibold text-[#7C3AED]">🌍 4 Languages</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }} className="text-center">
                <p className="font-['Playfair_Display'] text-3xl font-bold text-[#7C3AED]">{s.value}</p>
                <p className="text-sm text-[#6B7280] mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-[#EDE9FE] text-[#7C3AED] text-xs font-semibold rounded-full mb-4">WHY CHOOSE US</span>
            <h2 className="text-4xl font-['Playfair_Display'] font-bold text-[#2E1065]">Built for Every Reader</h2>
            <p className="text-[#6B7280] mt-3 max-w-xl mx-auto">Inclusive, accessible, and powered by AI — designed for all literacy levels across Africa and beyond.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="card p-6 text-center group">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: `${f.color}30` }}>
                  <f.icon size={24} style={{ color: f.color }} />
                </div>
                <h3 className="font-semibold text-[#2E1065] mb-2">{f.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-['Playfair_Display'] font-bold text-[#2E1065]">Explore by Topic</h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CATEGORIES.map((c, i) => (
              <motion.div key={c.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                whileHover={{ scale: 1.04, y: -3 }}
                onHoverStart={() => setHoveredCat(c.id)} onHoverEnd={() => setHoveredCat(null)}
                className={`cursor-pointer p-4 rounded-2xl text-center transition-all duration-200 border
                  ${hoveredCat === c.id ? 'shadow-card border-transparent' : 'border-[#E5E7EB] bg-[#FAFAFF] hover:bg-white'}`}
                style={{ background: hoveredCat === c.id ? `${c.color}20` : undefined }}>
                <span className="text-2xl">{c.icon}</span>
                <p className="text-xs font-medium text-[#5B21B6] mt-2">{c.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ACCESSIBILITY SECTION */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#2E1065] to-[#5B21B6] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full border-2 border-white/30" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full border-2 border-white/20" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <span className="inline-block px-4 py-1.5 bg-white/15 text-[#DDD6FE] text-xs font-semibold rounded-full mb-5">ACCESSIBILITY FIRST</span>
            <h2 className="text-4xl font-['Playfair_Display'] font-bold mb-4">Low Literacy Mode</h2>
            <p className="text-[#DDD6FE] text-lg mb-8 max-w-2xl mx-auto">One click transforms the entire interface — larger text, dominant icons, voice guidance, and simplified navigation. Because everyone deserves to read.</p>
            <div className="flex flex-wrap justify-center gap-4">
              {['Larger Text', 'Voice Guidance', 'Simple Navigation', 'High Contrast', 'Icon-First UI'].map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm text-[#EDE9FE]">
                  <FiCheck size={13} className="text-[#DDD6FE]" /> {f}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link to="/register">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-2 bg-[#DDD6FE] text-[#2E1065] font-semibold px-8 py-3.5 rounded-2xl hover:bg-[#C9A88E] transition-colors shadow-lg">
                  {t('startReading')} <FiArrowRight />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
