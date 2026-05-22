import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiPhone } from 'react-icons/fi';
import AuthLayout from '../layouts/AuthLayout';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { authService } from '../services/api';

const setSafeLocalStorage = (key, value) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {}
};

export default function Login() {
  const { login, language } = useApp();
  const { t } = useTranslation(language);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [guestPhone, setGuestPhone] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedEmail = form.email.trim().toLowerCase();
      const response = await authService.login(normalizedEmail, form.password, form.rememberMe);

      if (response?.success) {
        login(response.data.user, response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    const clean = guestPhone.replace(/\s/g, '');
    if (!clean || clean.length < 9) {
      setGuestError(t('phoneInvalid'));
      return;
    }

    setGuestError('');
    setGuestLoading(true);

    try {
      const response = await authService.registerGuest(clean);
      if (response?.success) {
        setSafeLocalStorage('ml_guest_phone', response.data.phone || clean);
        setSafeLocalStorage('ml_guest_delivery', response.data.sms_delivery || '');
        setSafeLocalStorage('ml_guest_verification_code', response.data.verification_code || '');
        navigate('/verify-phone', { state: { phone: response.data.phone || clean } });
      }
    } catch (err) {
      setGuestError(err.message || t('guestError'));
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <AuthLayout title={t('login')} subtitle={t('loginSubtitle')}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </motion.div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-800">{t('email')}</label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" size={16} />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="you@example.com"
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-brand-800">{t('password')}</label>
            <Link to="/forgot-password" className="text-xs text-brand-500 transition-colors hover:text-brand-600">
              {t('forgotPassword')}
            </Link>
          </div>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" size={16} />
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              className="input-field pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-brand-600"
            >
              {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={form.rememberMe}
            onChange={(e) => setForm((prev) => ({ ...prev, rememberMe: e.target.checked }))}
            className="rounded border-brand-300 text-brand-600 focus:ring-brand-500"
          />
          <span>{language === 'rw' ? 'Unyibuke kuri iki gikoresho' : 'Remember me on this device'}</span>
        </label>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="btn-primary mt-2 w-full py-3.5 text-base"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              {t('signingIn')}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {t('login')} <FiArrowRight />
            </span>
          )}
        </motion.button>

        <div className="relative flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-brand-100" />
          <span className="text-xs font-medium text-gray-400">{t('orDivider')}</span>
          <div className="h-px flex-1 bg-brand-100" />
        </div>

        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-950">
            <FiPhone size={14} className="text-brand-500" /> {t('continueAsGuest')}
          </p>
          <p className="text-xs text-gray-500">{t('guestDesc')}</p>

          {guestError && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500">
              {guestError}
            </motion.p>
          )}

          <div className="relative">
            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" size={16} />
            <input
              type="tel"
              value={guestPhone}
              onChange={(e) => {
                setGuestPhone(e.target.value);
                setGuestError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleGuestLogin()}
              placeholder="+250 7XX XXX XXX"
              className="input-field pl-10"
            />
          </div>

          <motion.button
            type="button"
            onClick={handleGuestLogin}
            disabled={guestLoading}
            whileHover={{ scale: guestLoading ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary w-full py-3 text-sm"
          >
            {guestLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
                {t('connecting')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FiPhone size={14} /> {t('guestSendCode')}
              </span>
            )}
          </motion.button>
        </div>

        <p className="text-center text-sm text-gray-500">
          {t('noAccount')}{' '}
          <Link to="/register" className="font-semibold text-brand-600 transition-colors hover:text-brand-800">
            {t('register')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
