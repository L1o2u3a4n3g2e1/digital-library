import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiArrowLeft, FiCheckCircle, FiClock, FiDatabase, FiKey, FiMail, FiPhone } from 'react-icons/fi';
import AuthLayout from '../layouts/AuthLayout';
import { useApp } from '../context/AppContext';
import { systemService } from '../services/api';

const CHECK_META = {
  database: { icon: FiDatabase, label: { en: 'Database', rw: "Ububiko bw'amakuru" } },
  email: { icon: FiMail, label: { en: 'Email delivery', rw: 'Kohereza imeli' } },
  sms: { icon: FiPhone, label: { en: 'SMS delivery', rw: 'Kohereza SMS' } },
  jwt: { icon: FiKey, label: { en: 'JWT secret', rw: 'Ibanga rya JWT' } },
};

const text = {
  en: {
    title: 'Deployment Status',
    subtitle: 'This page shows whether the live app is running in full production mode or demo mode.',
    loading: 'Checking deployment readiness...',
    failed: 'We could not read the deployment status from the backend.',
    live: 'Production mode is ready',
    demo: 'The app is still running in demo mode',
    liveBody: 'Core production services are configured. Real users, persistent data, and live delivery can work from this deployment.',
    demoBody: 'The code is production-capable, but one or more required services are still missing from the Vercel project settings.',
    required: 'Required',
    optional: 'Optional',
    ready: 'Ready',
    missing: 'Missing',
    back: 'Back to login',
  },
  rw: {
    title: "Imimerere y'Iyoherezwa",
    subtitle: 'Uru rupapuro rwerekana niba urubuga ruri gukora nka production nyayo cyangwa nka demo.',
    loading: 'Turimo kugenzura niba deployment yiteguye...',
    failed: 'Ntitwashoboye gusoma uko backend yiteguye.',
    live: 'Production mode yiteguye',
    demo: 'Urubuga ruracyakora nka demo',
    liveBody: "Ibice by'ingenzi bya production byashyizweho. Abakoresha nyabo, amakuru abikwa, no kohereza ubutumwa nyabyo birashoboka.",
    demoBody: 'Code iriteguye gukora nka production, ariko hari services zimwe zitarashyirwa muri Vercel settings.',
    required: 'Birakenewe',
    optional: 'Ntibikenewe cyane',
    ready: 'Byateguwe',
    missing: 'Birabura',
    back: 'Subira kuri login',
  },
};

export default function DeploymentStatus() {
  const { language } = useApp();
  const copy = text[language] || text.en;
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await systemService.readiness();
        if (!active) return;
        setStatus(response);
      } catch (err) {
        if (!active) return;
        setError(err.message || copy.failed);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [copy.failed]);

  const checks = status?.checks || {};
  const isLive = Boolean(status?.production_ready);

  return (
    <AuthLayout title={copy.title} subtitle={copy.subtitle}>
      <div className="space-y-5">
        {loading && (
          <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
            <span className="inline-flex items-center gap-2">
              <FiClock size={15} />
              {copy.loading}
            </span>
          </div>
        )}

        {error && !loading && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="mt-0.5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {status && !loading && (
          <>
            <div className={`rounded-3xl border px-5 py-4 ${isLive ? 'border-green-200 bg-green-50 text-green-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
              <div className="flex items-start gap-3">
                {isLive ? <FiCheckCircle className="mt-0.5" size={18} /> : <FiAlertCircle className="mt-0.5" size={18} />}
                <div>
                  <h3 className="text-sm font-semibold">{isLive ? copy.live : copy.demo}</h3>
                  <p className="mt-1 text-sm opacity-90">{isLive ? copy.liveBody : copy.demoBody}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(checks).map(([key, check]) => {
                const meta = CHECK_META[key];
                if (!meta) return null;
                const Icon = meta.icon;
                const label = meta.label[language] || meta.label.en;
                const ready = Boolean(check?.ready);
                return (
                  <div key={key} className="rounded-2xl border border-brand-100 bg-white/80 px-4 py-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 rounded-xl p-2 ${ready ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          <Icon size={15} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-brand-950">{label}</p>
                          <p className="mt-1 text-xs text-gray-500">{check?.reason || ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${ready ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                          {ready ? copy.ready : copy.missing}
                        </span>
                        <p className="mt-2 text-[11px] uppercase tracking-wide text-gray-400">
                          {check?.required ? copy.required : copy.optional}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-800">
            <FiArrowLeft size={14} />
            {copy.back}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
