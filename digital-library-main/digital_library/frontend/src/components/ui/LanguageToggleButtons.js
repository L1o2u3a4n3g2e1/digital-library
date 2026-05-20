import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { LANGUAGES } from '../../utils/constants';
import { labelForLanguage } from '../../utils/languageSupport';

export default function LanguageToggleButtons({ className = '' }) {
  const { language, setLanguage } = useApp();

  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`.trim()}>
      {LANGUAGES.map((item) => {
        const active = language === item.code;
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code)}
            className={`inline-flex min-w-[164px] items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold shadow-sm transition-all ${
              active
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-brand-200 bg-white text-brand-700 hover:border-brand-400 hover:bg-brand-50'
            }`}
          >
            <span className="text-base">{item.flag}</span>
            <span>{labelForLanguage(item.code, language)}</span>
            {active && <FiCheck size={14} />}
          </button>
        );
      })}
    </div>
  );
}
