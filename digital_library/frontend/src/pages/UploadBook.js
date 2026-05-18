import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFile, FiImage, FiX, FiCheck, FiMic } from 'react-icons/fi';
import MainLayout from '../layouts/MainLayout';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { CATEGORIES, LANGUAGES } from '../utils/constants';

export default function UploadBook() {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const coverRef = useRef(null);
  const [file, setFile] = useState(null);
  const [, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', language: 'en', category: 'fiction', description: '', generateAudio: true, enableSTT: false, allowTranslation: true });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.type === 'application/pdf' || f.type === 'text/plain')) setFile(f);
  };

  const handleCover = (e) => {
    const f = e.target.files[0];
    if (f) { setCover(f); setCoverPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 80));
      setProgress(i);
    }
    setDone(true);
    setUploading(false);
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  if (done) return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center p-10 card max-w-sm mx-auto">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <FiCheck size={36} className="text-green-500" />
          </motion.div>
          <h2 className="text-xl font-['Playfair_Display'] font-bold text-[#4A3628] mb-2">Book Uploaded!</h2>
          <p className="text-sm text-[#9E8E80]">Your book is being processed. Redirecting…</p>
        </motion.div>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="section-title text-2xl mb-1">{t('uploadBook')}</h1>
          <p className="text-sm text-[#9E8E80] mb-8">Share knowledge with the world in any language</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
          {/* Left: File upload */}
          <div className="lg:col-span-2 space-y-5">
            {/* Drop zone */}
            <motion.div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileRef.current?.click()}
              animate={{ borderColor: dragging ? '#8B6F5A' : file ? '#B08968' : '#D8BFAA', background: dragging ? '#F8F4EE' : 'white' }}
              className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${file ? 'border-[#B08968]' : 'hover:border-[#B08968] hover:bg-[#FDFCFA]'}`}>
              <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden" onChange={e => setFile(e.target.files[0])} />
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="w-16 h-16 rounded-2xl bg-[#F8F4EE] flex items-center justify-center mx-auto mb-3">
                      <FiFile size={28} className="text-[#8B6F5A]" />
                    </div>
                    <p className="font-semibold text-[#4A3628]">{file.name}</p>
                    <p className="text-xs text-[#9E8E80] mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                      className="mt-3 flex items-center gap-1 text-xs text-red-400 hover:text-red-500 mx-auto">
                      <FiX size={12} /> Remove
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <motion.div animate={{ y: dragging ? -8 : [0, -6, 0] }} transition={dragging ? {} : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-16 h-16 rounded-2xl bg-[#F8F4EE] flex items-center justify-center mx-auto mb-4">
                      <FiUpload size={28} className="text-[#B08968]" />
                    </motion.div>
                    <p className="font-semibold text-[#4A3628]">{t('dragDrop')}</p>
                    <p className="text-sm text-[#9E8E80] mt-1">{t('orBrowse')}</p>
                    <p className="text-xs text-[#C4B0A0] mt-3">Supports PDF, TXT up to 50MB</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Book details */}
            <div className="card p-6 space-y-4">
              <h3 className="font-semibold text-[#4A3628]">Book Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#6B5044] mb-1.5 block">{t('titleLabel')} *</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Enter book title" className="input-field" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B5044] mb-1.5 block">{t('author')} *</label>
                  <input value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
                    placeholder="Author name" className="input-field" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B5044] mb-1.5 block">{t('language')}</label>
                  <select value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))} className="input-field">
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B5044] mb-1.5 block">{t('category')}</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input-field">
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#6B5044] mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of the book…" rows={3} className="input-field resize-none" />
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-5">
            {/* Cover upload */}
            <div className="card p-5">
              <h3 className="font-semibold text-[#4A3628] mb-3 text-sm">Cover Image</h3>
              <div onClick={() => coverRef.current?.click()}
                className="aspect-[2/3] rounded-2xl border-2 border-dashed border-[#D8BFAA] overflow-hidden cursor-pointer hover:border-[#B08968] transition-colors bg-[#F8F4EE] flex items-center justify-center">
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCover} />
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <FiImage size={24} className="text-[#C4B0A0] mx-auto mb-2" />
                    <p className="text-xs text-[#C4B0A0]">Click to upload cover</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI options */}
            <div className="card p-5 space-y-3">
              <h3 className="font-semibold text-[#4A3628] text-sm">AI Features</h3>
              {[
                { key: 'generateAudio', icon: '🎧', label: t('generateAudio'), desc: 'Auto-create narration' },
                { key: 'enableSTT', icon: '🎙️', label: t('enableSTT'), desc: 'Enable voice search' },
                { key: 'allowTranslation', icon: '🌍', label: 'Auto Translation', desc: 'Translate to all languages' },
              ].map(({ key, icon, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-1">
                  <div className="flex items-start gap-2.5">
                    <span className="text-base mt-0.5">{icon}</span>
                    <div>
                      <p className="text-sm font-medium text-[#4A3628]">{label}</p>
                      <p className="text-xs text-[#9E8E80]">{desc}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setForm(p => ({ ...p, [key]: !p[key] }))}
                    className={`w-11 h-6 rounded-full transition-all duration-200 relative flex-shrink-0 ${form[key] ? 'bg-[#8B6F5A]' : 'bg-[#D8BFAA]'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${form[key] ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>

            {/* Voice upload hint */}
            <div className="card p-4 bg-[#F8F4EE] border-[#EDD9CB]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#8B6F5A]/10 flex items-center justify-center animate-mic">
                  <FiMic size={16} className="text-[#8B6F5A]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#4A3628]">Voice Dictation</p>
                  <p className="text-xs text-[#9E8E80]">Speak your book aloud to upload</p>
                </div>
              </div>
            </div>

            {/* Upload button */}
            <motion.button type="submit" disabled={!file || uploading}
              whileHover={{ scale: !file || uploading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? (
                <div className="w-full">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Uploading… {progress}%
                  </div>
                  <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : (
                <span className="flex items-center gap-2"><FiUpload size={16} /> {t('uploadBook')}</span>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
