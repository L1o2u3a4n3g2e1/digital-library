import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import AuthLayout from '../layouts/AuthLayout';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { MOCK_USER } from '../data/mockData';

export default function Login() {
  const { login, language } = useApp();
  const { t } = useTranslation(language);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 900));
      login({ ...MOCK_USER, email: form.email || MOCK_USER.email, name: 'Anne Louange' }, 'mock-token-123');
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title={t('login')} subtitle="Welcome back to your library">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3">
            {error}
          </motion.div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#5B21B6] mb-1.5">{t('email')}</label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5CF6]" size={16} />
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com" className="input-field pl-10" required />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium text-[#5B21B6]">{t('password')}</label>
            <Link to="/forgot-password" className="text-xs text-[#8B5CF6] hover:text-[#7C3AED] transition-colors">{t('forgotPassword')}</Link>
          </div>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5CF6]" size={16} />
            <input type={showPw ? 'text' : 'password'} value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••" className="input-field pl-10 pr-10" required />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#7C3AED] transition-colors">
              {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
            </button>
          </div>
        </div>

        <motion.button type="submit" disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
          className="btn-primary w-full py-3.5 text-base mt-2">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Signing in…
            </span>
          ) : (
            <span className="flex items-center gap-2">{t('login')} <FiArrowRight /></span>
          )}
        </motion.button>

        {/* Demo hint */}
        <div className="bg-[#F5F3FF] rounded-2xl px-4 py-3 text-center">
          <p className="text-xs text-[#6B7280]">Demo: use any email & password to continue</p>
        </div>

        <p className="text-center text-sm text-[#6B7280]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#7C3AED] font-semibold hover:text-[#5B21B6] transition-colors">{t('register')}</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
