import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiPause,
  FiPlay,
  FiSkipBack,
  FiSkipForward,
  FiSquare,
  FiVolume2,
  FiVolumeX,
} from 'react-icons/fi';
import { MdSpeed } from 'react-icons/md';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/translations';
import { statsService } from '../../services/api';

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function AudioPlayer({
  text = '',
  lang = 'en',
  compact = false,
  autoPlay = false,
  bookId = null,
}) {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const utterRef = useRef(null);
  const startedAtRef = useRef(null);
  const listenedSecondsRef = useRef(0);
  const totalWords = text.trim() ? text.trim().split(/\s+/).length : 0;

  const commitListening = useCallback(() => {
    if (!bookId || listenedSecondsRef.current <= 0) {
      return;
    }

    const seconds = Math.max(1, Math.round(listenedSecondsRef.current));
    listenedSecondsRef.current = 0;
    statsService.logAudio(bookId, seconds, lang).catch(() => {});
  }, [bookId, lang]);

  const stopClock = useCallback(() => {
    if (startedAtRef.current) {
      listenedSecondsRef.current += (Date.now() - startedAtRef.current) / 1000;
      startedAtRef.current = null;
    }
  }, []);

  const stop = useCallback(
    (shouldLog = true) => {
      stopClock();
      window.speechSynthesis.cancel();
      setPlaying(false);
      setProgress(0);
      setWordIndex(0);
      if (shouldLog) {
        commitListening();
      }
    },
    [commitListening, stopClock]
  );

  const speak = useCallback(() => {
    if (!('speechSynthesis' in window) || !text.trim()) {
      return;
    }

    window.speechSynthesis.cancel();
    startedAtRef.current = Date.now();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'rw' ? 'rw-RW' : 'en-US';
    utterance.rate = speed;
    utterance.volume = muted ? 0 : 1;
    utterance.onboundary = (event) => {
      const ratio = text.length ? event.charIndex / text.length : 0;
      setProgress(Math.min(100, ratio * 100));
      setWordIndex(Math.min(totalWords, Math.floor(ratio * totalWords)));
    };
    utterance.onend = () => {
      stopClock();
      setPlaying(false);
      setProgress(100);
      setWordIndex(totalWords);
      commitListening();
    };

    utterRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  }, [commitListening, lang, muted, speed, stopClock, text, totalWords]);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      if (playing) {
        window.speechSynthesis.pause();
        stopClock();
        setPlaying(false);
      } else {
        startedAtRef.current = Date.now();
        window.speechSynthesis.resume();
        setPlaying(true);
      }
      return;
    }

    speak();
  }, [playing, speak, stopClock]);

  useEffect(() => {
    if (utterRef.current) {
      utterRef.current.rate = speed;
      utterRef.current.volume = muted ? 0 : 1;
    }
  }, [muted, speed]);

  useEffect(() => {
    if (autoPlay && text) {
      speak();
    }
  }, [autoPlay, speak, text]);

  useEffect(() => {
    return () => {
      stop(false);
      commitListening();
    };
  }, [commitListening, stop]);

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3">
        <button
          onClick={pause}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-white transition-all ${
            playing ? 'bg-brand-600' : 'bg-brand-500 hover:bg-brand-600'
          }`}
        >
          {playing ? <FiPause size={14} /> : <FiPlay size={14} />}
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-200">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <button onClick={() => stop(true)} className="text-gray-400 transition-colors hover:text-brand-600">
          <FiSquare size={13} />
        </button>
        <span className="text-xs font-medium text-gray-500">{speed}x</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-brand-100 bg-white p-5 shadow-card"
    >
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-brand-950">{t('audioReading')}</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMuted((value) => !value)}
            className="p-1 text-brand-500 transition-colors hover:text-brand-600"
          >
            {muted ? <FiVolumeX size={15} /> : <FiVolume2 size={15} />}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowSpeed((value) => !value)}
              className="flex items-center gap-1 p-1 text-xs text-gray-500 transition-colors hover:text-brand-600"
            >
              <MdSpeed size={15} />
              {speed}x
            </button>
            {showSpeed && (
              <div className="absolute right-0 top-full z-10 mt-1 min-w-[64px] rounded-xl border border-brand-100 bg-white py-1 shadow-card">
                {SPEEDS.map((value) => (
                  <button
                    key={value}
                    onClick={() => {
                      setSpeed(value);
                      setShowSpeed(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-brand-50 ${
                      speed === value ? 'font-semibold text-brand-600' : 'text-brand-800'
                    }`}
                  >
                    {value}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="h-2 cursor-pointer overflow-hidden rounded-full bg-brand-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <div className="mt-1.5 flex justify-between">
          <span className="text-xs text-gray-400">
            {t('wordLabel')} {wordIndex} / {totalWords}
          </span>
          <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setSpeed((value) => SPEEDS[Math.max(0, SPEEDS.indexOf(value) - 1)])}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-500 transition-colors hover:bg-brand-100"
        >
          <FiSkipBack size={14} />
        </button>
        <button
          onClick={pause}
          className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-glow transition-all duration-200 active:scale-95 ${
            playing
              ? 'bg-brand-600 hover:bg-brand-800'
              : 'bg-gradient-to-br from-brand-500 to-brand-600 hover:shadow-[0_0_24px_rgba(124,58,237,0.4)]'
          }`}
        >
          {playing ? <FiPause size={22} /> : <FiPlay size={22} className="ml-1" />}
        </button>
        <button
          onClick={() => stop(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-500 transition-colors hover:bg-brand-100"
        >
          <FiSquare size={14} />
        </button>
        <button
          onClick={() => setSpeed((value) => SPEEDS[Math.min(SPEEDS.length - 1, SPEEDS.indexOf(value) + 1)])}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-500 transition-colors hover:bg-brand-100"
        >
          <FiSkipForward size={14} />
        </button>
      </div>
    </motion.div>
  );
}
