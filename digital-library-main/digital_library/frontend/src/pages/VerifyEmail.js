import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiCheck, FiMail } from 'react-icons/fi';
import AuthLayout from '../layouts/AuthLayout';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { authService } from '../services/api';

const getStoredValue = (key, fallback = '') => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

const setStoredValue = (key, value) => {
  try {
    if (value === undefined || value === null || value === '') {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {}
};

const formatExpiryLabel = (seconds, language) => {
  const totalSeconds = Number(seconds || 0);
  const minutes = Math.max(1, Math.round(totalSeconds / 60));

  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return language === 'rw'
      ? `Kode irarangira mu masaha ${hours}`
      : `Code expires in ${hours} hour${hours === 1 ? '' : 's'}`;
  }

  return language === 'rw'
    ? `Kode irarangira mu minota ${minutes}`
    : `Code expires in ${minutes} minutes`;
};

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, language } = useApp();
  const { t } = useTranslation(language);

  const email = location.state?.email || getStoredValue('ml_pending_email') || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [devCode, setDevCode] = useState(() => getStoredValue('ml_pending_verification_code'));
  const [deliveryStatus, setDeliveryStatus] = useState(() => getStoredValue('ml_pending_delivery'));
  const [expirySeconds, setExpirySeconds] = useState(() => Number(getStoredValue('ml_pending_verification_expiry_seconds', '3600')) || 3600);

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const clearPendingVerificationState = () => {
    setStoredValue('ml_pending_email', '');
    setStoredValue('ml_pending_user', '');
    setStoredValue('ml_pending_verification_code', '');
    setStoredValue('ml_pending_delivery', '');
    setStoredValue('ml_pending_verification_expiry_seconds', '');
    setDevCode('');
    setDeliveryStatus('');
    setExpirySeconds(3600);
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!code || code.length < 4) {
      setError(t('codeRequired') || (language === 'rw' ? 'Kode yo kwemeza irakenewe.' : 'Verification code is required.'));
      return;
    }

    setError('');
    setNotice('');
    setLoading(true);

    try {
      const response = await authService.verifyEmail(email, code);
      if (response.success) {
        setSuccess(true);
        clearPendingVerificationState();
        login(response.data.user, response.data.token);
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      setError(err.message || (language === 'rw' ? 'Kwemeza email byanze.' : 'Verification failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setNotice('');

    try {
      const response = await authService.resendVerification(email);
      if (response.success) {
        const nextCode = response.data?.verification_code || '';
        const nextDelivery = response.data?.email_delivery || '';
        const nextExpirySeconds = Number(response.data?.verification_expires_in_seconds || 3600) || 3600;

        setStoredValue('ml_pending_verification_code', nextCode);
        setStoredValue('ml_pending_delivery', nextDelivery);
        setStoredValue('ml_pending_verification_expiry_seconds', String(nextExpirySeconds));

        setDevCode(nextCode);
        setDeliveryStatus(nextDelivery);
        setExpirySeconds(nextExpirySeconds);
        setNotice(response.message || (language === 'rw' ? 'Kode nshya yateguwe.' : 'A new verification code is ready.'));
      }
    } catch (err) {
      setError(err.message || (language === 'rw' ? 'Byanze kongera kohereza kode.' : 'Failed to resend.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title={t('verifyEmail') || (language === 'rw' ? 'Emeza email' : 'Verify Email')}
      subtitle={t('verifyEmailSubtitle') || (language === 'rw' ? 'Injiza kode woherejwe kuri email yawe' : 'Enter the code sent to your email')}
    >
      <form onSubmit={handleVerify} className="space-y-5">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">{email}</span>
          </p>
        </div>

        {devCode && deliveryStatus === 'failed' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <p className="text-sm font-medium text-amber-800">
              {language === 'rw' ? 'Kohereza email byanze muri development.' : 'Email delivery failed in development.'}
            </p>
            <p className="text-sm text-amber-700 mt-1">
              {language === 'rw' ? 'Koresha iyi kode mu igerageza:' : 'Use this verification code for testing:'} <span className="font-semibold tracking-widest">{devCode}</span>
            </p>
          </div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-2xl px-4 py-3 flex items-center gap-2"
          >
            <FiCheck size={16} />
            <span>{t('verificationSuccess') || (language === 'rw' ? 'Email yemejwe neza.' : 'Email verified successfully!')}</span>
          </motion.div>
        )}

        {notice && !success && !error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-2xl px-4 py-3"
          >
            {notice}
          </motion.div>
        )}

        {error && !success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3"
          >
            {error}
          </motion.div>
        )}

        <div>
          <label className="block text-sm font-medium text-brand-800 mb-1.5">
            {t('verificationCode') || (language === 'rw' ? 'Kode yo kwemeza' : 'Verification Code')}
          </label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-500" size={16} />
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.trim());
                setError('');
              }}
              placeholder="000000"
              maxLength="6"
              className="input-field pl-10 text-center text-lg tracking-widest"
              disabled={success}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            {formatExpiryLabel(expirySeconds, language)}
          </p>
        </div>

        <motion.button
          type="submit"
          disabled={loading || success}
          whileHover={{ scale: (loading || success) ? 1 : 1.02 }}
          whileTap={{ scale: (loading || success) ? 1 : 0.98 }}
          className="btn-primary w-full py-3.5 text-base"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {t('verifying') || (language === 'rw' ? 'Turimo kwemeza...' : 'Verifying...')}
            </span>
          ) : success ? (
            <span className="flex items-center justify-center gap-2">
              <FiCheck /> {t('verified') || (language === 'rw' ? 'Byemejwe' : 'Verified')}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {t('verify') || (language === 'rw' ? 'Emeza' : 'Verify')} <FiArrowRight />
            </span>
          )}
        </motion.button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || success}
            className="text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors disabled:opacity-50"
          >
            {resending ? t('resending') || (language === 'rw' ? 'Turimo kongera kohereza...' : 'Resending...') : t('didNotReceive') || (language === 'rw' ? 'Ntiwayibonye?' : "Didn't receive code?")} {!resending && <span className="ml-1">?</span>}
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              clearPendingVerificationState();
              navigate('/register');
            }}
            disabled={loading}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1 mx-auto transition-colors disabled:opacity-50"
          >
            <FiArrowLeft size={14} /> {t('backToRegister') || (language === 'rw' ? 'Subira ku kwiyandikisha' : 'Back to Register')}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
