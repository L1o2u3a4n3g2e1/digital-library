import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import '../styles/voice-button.css';

const VoiceButton = ({ onVoiceSearch }) => {
  const { language, accessibilityMode } = useApp();
  const t = translations[language];

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    const languageMap = {
      en: 'en-US',
      fr: 'fr-FR',
      sw: 'sw-KE',
      rw: 'rw-RW'
    };

    recognitionRef.current.lang = languageMap[language] || 'en-US';

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);

    recognitionRef.current.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) {
        onVoiceSearch(transcript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, onVoiceSearch]);

  const handleVoiceClick = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <button
      className={`voice-button ${isListening ? 'listening' : ''} ${accessibilityMode ? 'accessibility-mode' : ''}`}
      onClick={handleVoiceClick}
      title={isListening ? t.speakNow : t.voiceSearch}
      aria-label={t.voiceSearch}
    >
      <span className="voice-icon">🎤</span>
      {isListening && <span className="voice-pulse"></span>}
      {isListening && <span className="voice-text">{t.speakNow}</span>}
    </button>
  );
};

export default VoiceButton;
