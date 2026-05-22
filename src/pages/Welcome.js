import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import LanguageSelector from '../components/LanguageSelector';
import '../styles/welcome.css';

const Welcome = () => {
  const navigate = useNavigate();
  const { language, user } = useApp();
  const t = translations[language];

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-header">
          <h1 className="welcome-title">{t.appTitle}</h1>
          <p className="welcome-subtitle">{t.appSubtitle}</p>
        </div>

        <div className="welcome-language">
          <p className="language-label">{t.selectLanguage}</p>
          <LanguageSelector />
        </div>

        <div className="welcome-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/login')}
          >
            {t.login}
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => navigate('/register')}
          >
            {t.register}
          </button>
        </div>

        <div className="welcome-guest">
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/guest-signin')}
          >
            {t.continueAsGuest}
          </button>
        </div>
      </div>

      <div className="welcome-illustration">
        <div className="illustration-circle circle-1"></div>
        <div className="illustration-circle circle-2"></div>
        <div className="illustration-circle circle-3"></div>
      </div>
    </div>
  );
};

export default Welcome;
