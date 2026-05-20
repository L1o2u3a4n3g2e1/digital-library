import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiEye, FiEyeOff, FiLock } from 'react-icons/fi';
import AuthLayout from '../layouts/AuthLayout';
import { useApp } from '../context/AppContext';
import { authService } from '../services/api';
import { useTranslation } from '../utils/translations';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useApp();
  const { t } = useTranslation(language);
  const initialEmail = searchParams.get('email') || localStorage.getItem('ml_reset_email') || '';
  const resetCode = searchParams.get('code') || '';
  const [form, setForm] = useState({
    email: initialEmail,
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const passwordMismatch = useMemo(
    () => form.confirmPassword && form.newPassword !== form.confirmPassword,
    [form.confirmPassword, form.newPassword]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError(language === 'rw' ? 'Amagambo y\'ibanga ntahuye.' : 'Passwords do not match.');
      return;
    }

    if (!resetCode) {
      setError(language === 'rw' ? 'Koresha umurongo woherejwe kuri email yawe kugira ngo uhindure ijambo ry\'ibanga.' : 'Use the password reset link from your email to continue.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword(form.email, resetCode, form.newPassword);
      if (response.success) {
        setSuccess(response.message || (language === 'rw' ? 'Ijambo ry\'ibanga ryahinduwe neza.' : 'Password reset successfully.'));
        localStorage.removeItem('ml_reset_email');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      setError(err.message || (language === 'rw' ? 'Byanze guhindura ijambo ry\'ibanga.' : 'Failed to reset password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={language === 'rw' ? 'Hindura ijambo ry\'ibanga' : 'Reset Password'}
      subtitle={language === 'rw' ? 'Shyiraho ijambo ry\'ibanga rishya ukoresheje umurongo woherejwe kuri email yawe.' : 'Set a new password using the link sent to your email.'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <div className="flex items-center gap-2">
              <FiCheck size={15} />
              {success}
            </div>
          </motion.div>
        )}

        {!resetCode && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {language === 'rw' ? 'Fungura email yawe maze ukande ku murongo wo guhindura ijambo ry\'ibanga.' : 'Open your email and use the password reset link we sent you.'}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-800">{t('email')}</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className="input-field"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-800">
            {language === 'rw' ? 'Ijambo ry\'ibanga rishya' : 'New password'}
          </label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" size={16} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.newPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              className="input-field pl-10 pr-10"
              placeholder={language === 'rw' ? 'Nibura inyuguti 6' : 'At least 6 characters'}
              required
            />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600">
              {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-800">
            {language === 'rw' ? 'Emeza ijambo ry\'ibanga' : 'Confirm new password'}
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            className="input-field"
            placeholder={language === 'rw' ? 'Subiramo ijambo ry\'ibanga' : 'Repeat your password'}
            required
          />
          {passwordMismatch && (
            <p className="mt-1.5 text-xs text-red-500">
              {language === 'rw' ? 'Amagambo y\'ibanga ntahuye.' : 'Passwords do not match.'}
            </p>
          )}
        </div>

        <motion.button type="submit" disabled={loading || passwordMismatch || !resetCode} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }} className="btn-primary w-full py-3.5 text-base">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              {language === 'rw' ? 'Turimo guhindura...' : 'Resetting...'}
            </span>
          ) : (
            language === 'rw' ? 'Hindura ijambo ry\'ibanga' : 'Reset password'
          )}
        </motion.button>

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-800">
            <FiArrowLeft size={14} />
            {language === 'rw' ? 'Subira kuri login' : 'Back to login'}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
