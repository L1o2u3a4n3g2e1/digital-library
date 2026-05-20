import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiCheck, FiPhone } from 'react-icons/fi';
import AuthLayout from '../layouts/AuthLayout';
import { useApp } from '../context/AppContext';
import { authService } from '../services/api';
import { useTranslation } from '../utils/translations';

export default function VerifyGuestPhone() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, language } = useApp();
  const { t } = useTranslation(language);
  const phone = location.state?.phone || localStorage.getItem('ml_guest_phone') || '';
  const [deliveryMode, setDeliveryMode] = useState(() => localStorage.getItem('ml_guest_delivery') || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerify = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authService.verifyGuestPhone(phone, code);
      if (response.success) {
        login(response.data.user, response.data.token);
        localStorage.removeItem('ml_guest_phone');
        localStorage.removeItem('ml_guest_delivery');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || t('guestVerifyError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone) {
      setError(t('phoneInvalid'));
      return;
    }

    setResending(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.resendGuestVerification(phone);
      if (response.success) {
        localStorage.setItem('ml_guest_delivery', response.data?.sms_delivery || '');
        setDeliveryMode(response.data?.sms_delivery || '');
        setSuccess(response.message || t('guestCodeResent'));
      }
    } catch (err) {
      setError(err.message || t('guestResendError'));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title={t('guestVerifyTitle')}
      subtitle={phone ? `${t('guestVerifySubtitle')} ${phone}` : t('guestVerifyNoPhone')}
    >
      <form onSubmit={handleVerify} className="space-y-5">
        {deliveryMode === 'sandbox' && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {language === 'rw'
              ? 'SMS iri koherezwa muri sandbox ya Africa\'s Talking. Iyo sandbox yohereza ubutumwa muri simulator, si kuri telefoni yawe.'
              : 'SMS is currently using the Africa\'s Talking sandbox. Sandbox messages go to the simulator, not to your real phone.'}
          </div>
        )}

        {(deliveryMode === 'simulated' || deliveryMode === 'unconfigured') && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {language === 'rw'
              ? 'Kohereza SMS nyayo ntibiratangira kuri iyi server. Ubutumwa bwa verification burimo gukinwa gusa muri development.'
              : 'Real SMS delivery is not configured on this server yet. The verification message is only being simulated in development.'}
          </div>
        )}

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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-800">{t('verificationCode')}</label>
          <div className="relative">
            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" size={16} />
            <input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              className="input-field pl-10 text-center tracking-[0.35em]"
              placeholder="000000"
              maxLength="6"
              required
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">{t('guestCodeHelp')}</p>
        </div>

        <motion.button type="submit" disabled={loading || !phone} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }} className="btn-primary w-full py-3.5 text-base">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              {t('verifying')}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {t('verifyPhone')} <FiArrowRight />
            </span>
          )}
        </motion.button>

        <button type="button" onClick={handleResend} disabled={resending || !phone} className="btn-secondary w-full py-3 text-sm">
          {resending ? t('sendingAgain') : t('resendSms')}
        </button>

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
