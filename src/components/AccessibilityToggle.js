import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import '../styles/accessibility-toggle.css';

const AccessibilityToggle = () => {
  const { language, accessibilityMode, setAccessibilityMode } = useApp();
  const t = translations[language];

  return (
    <button
      className={`accessibility-toggle ${accessibilityMode ? 'active' : ''}`}
      onClick={() => setAccessibilityMode(!accessibilityMode)}
      title={t.accessibilityMode}
      aria-label={t.accessibilityMode}
    >
      ♿
    </button>
  );
};

export default AccessibilityToggle;
