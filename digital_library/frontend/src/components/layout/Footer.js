import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiMail } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';

export default function Footer() {
  const { language } = useApp();
  const { t } = useTranslation(language);
  return (
    <footer className="bg-white border-t border-[#E5E7EB] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center">
                <span className="text-white text-sm font-bold">ML</span>
              </div>
              <span className="font-['Playfair_Display'] font-semibold text-[#2E1065]">{t('appName')}</span>
            </div>
            <p className="text-sm text-[#6B7280] max-w-xs leading-relaxed">{t('tagline')}</p>
            <div className="flex gap-3 mt-4">
              {[FiGithub, FiTwitter, FiMail].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-[#8B5CF6] hover:bg-[#EDE9FE] transition-colors">
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#2E1065] mb-3">Platform</h4>
            <ul className="space-y-2">
              {[['Search Books', '/search'], ['Upload', '/upload'], ['Dashboard', '/dashboard']].map(([l, h]) => (
                <li key={h}><Link to={h} className="text-sm text-[#6B7280] hover:text-[#7C3AED] transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#2E1065] mb-3">Languages</h4>
            <ul className="space-y-2">
              {['English', 'Français', 'Kiswahili', 'Kinyarwanda'].map(l => (
                <li key={l}><span className="text-sm text-[#6B7280]">{l}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-[#E5E7EB] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#9CA3AF]">© 2025 Multilingual Library. Built for accessibility & inclusion.</p>
          <p className="text-xs text-[#9CA3AF]">Powered by LSTM AI · FastAPI · React</p>
        </div>
      </div>
    </footer>
  );
}
