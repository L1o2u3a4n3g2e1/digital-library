import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import AuthLayout from '../layouts/AuthLayout';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { authService } from '../services/api';

export default function Register() {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pwStrength = form.password.length >= 8
    ? (form.password.match(/[A-Z]/) && form.password.match(/[0-9]/) ? 'strong' : 'medium')
    : form.password.length > 0
      ? 'weak'
      : '';
  const strengthColors = { weak: 'bg-red-400', medium: 'bg-yellow-400', strong: 'bg-green-400' };
  const strengthWidths = { weak: '33%', medium: '66%', strong: '100%' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError(t('passwordMismatch'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await authService.register(form.name, form.email, form.password);
      if (response.success) {
        localStorage.setItem('ml_pending_email', form.email);
        localStorage.setItem('ml_pending_user', JSON.stringify(response.data));
        if (response.data?.verification_code) {
          localStorage.setItem('ml_pending_verification_code', response.data.verification_code);
        } else {
          localStorage.removeItem('ml_pending_verification_code');
        }
        if (response.data?.email_delivery) {
          localStorage.setItem('ml_pending_delivery', response.data.email_delivery);
        } else {
          localStorage.removeItem('ml_pending_delivery');
        }
        navigate('/verify-email', { state: { email: form.email } });
      }
    } catch (err) {
      setError(err.message || t('registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t('registerTitle')} subtitle={t('registerSubtitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3"
          >
            {error}
          </motion.div>
        )}

        <div>
          <label className="block text-sm font-medium text-brand-800 mb-1.5">{t('name')}</label>
          <div className="relative">
            <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" size={16} />
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder={t('namePlaceholder')}
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-800 mb-1.5">{t('email')}</label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" size={16} />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com"
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-800 mb-1.5">{t('password')}</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" size={16} />
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder={t('passwordMin')}
              className="input-field pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600"
            >
              {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
            </button>
          </div>
          {pwStrength && (
            <div className="mt-2">
              <div className="h-1 bg-brand-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strengthColors[pwStrength]}`} style={{ width: strengthWidths[pwStrength] }} />
              </div>
              <p className="text-xs text-gray-500 mt-1 capitalize">{t(`password${pwStrength.charAt(0).toUpperCase() + pwStrength.slice(1)}`)}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-800 mb-1.5">{t('confirmPassword')}</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" size={16} />
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
              placeholder={t('repeatPassword')}
              className="input-field pl-10"
              required
            />
            {form.confirm && form.password === form.confirm && (
              <FiCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500" size={16} />
            )}
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="btn-primary w-full py-3.5 text-base mt-1"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {t('creatingAccount')}
            </span>
          ) : (
            <span className="flex items-center gap-2">{t('register')} <FiArrowRight /></span>
          )}
        </motion.button>

        <p className="text-center text-sm text-gray-500">
          {t('hasAccount')}{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-800 transition-colors">{t('login')}</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
