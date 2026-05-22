import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiCheck, FiMail } from 'react-icons/fi';
import AuthLayout from '../layouts/AuthLayout';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { authService } from '../services/api';

const isLocalDevelopment = () =>
  typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

export default function ForgotPassword() {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        const nextResetLink = response.data?.reset_link || '';
        setSuccess(
          response.message ||
            (language === 'rw'
              ? 'Ubutumwa bwo guhindura ijambo ry\'ibanga bwoherejwe kuri email yawe.'
              : 'Password reset instructions have been sent to your email.')
        );
        localStorage.setItem('ml_reset_email', email);
        if (nextResetLink && isLocalDevelopment()) {
          localStorage.setItem('ml_reset_link', nextResetLink);
        } else {
          localStorage.removeItem('ml_reset_link');
        }
        setResetLink(nextResetLink);
      }
    } catch (err) {
      setError(err.message || (language === 'rw' ? 'Byanze kohereza ubutumwa bwo guhindura ijambo ry\'ibanga.' : 'Failed to request a password reset.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={language === 'rw' ? 'Wibagiwe ijambo ry\'ibanga' : 'Forgot Password'}
      subtitle={language === 'rw' ? 'Injiza email yawe twohereze umurongo wo guhindura ijambo ry\'ibanga.' : 'Enter your email and we will send you a password reset link.'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <div className="flex items-start gap-2">
              <FiCheck className="mt-0.5" />
              <div>
                <p>{success}</p>
                <p className="mt-2 text-xs text-green-700/80">
                  {language === 'rw' ? 'Reba inbox cyangwa spam, hanyuma ukande ku murongo wo guhindura ijambo ry\'ibanga.' : 'Check your inbox or spam folder, then open the reset link from the email.'}
                </p>
                {resetLink && isLocalDevelopment() && (
                  <a
                    href={resetLink}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-brand-200 transition hover:bg-brand-50"
                  >
                    {language === 'rw' ? 'Komeza ukoresheje reset link yo mu mashini yawe' : 'Continue with local reset link'}
                    <FiArrowRight size={13} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-800">{t('email')}</label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" size={16} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }} className="btn-primary w-full py-3.5 text-base">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              {language === 'rw' ? 'Turimo kohereza...' : 'Sending...'}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {language === 'rw' ? 'Ohereza email yo guhindura ijambo ry\'ibanga' : 'Send reset email'} <FiArrowRight />
            </span>
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
