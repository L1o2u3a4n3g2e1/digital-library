import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import api from '../services/api';
import Header from '../components/Header';
import '../styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { language, login, setLoading, loading } = useApp();
  const t = translations[language];

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(phoneNumber, password);
      if (response.token && response.user) {
        login(response.user, response.token);
        navigate('/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="auth-container">
        <div className="auth-card">
          <div className="form-row">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← {t.back}</button>
          </div>
          <div className="auth-header">
            <h1>{t.signIn}</h1>
            <p>{t.alreadyHaveAccount}</p>
          </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="phoneNumber">{t.phoneNumber}</label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={t.phoneNumber}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t.password}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.password}
              required
            />
          </div>

          <div className="form-checkbox">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember">{t.rememberMe}</label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? t.loading : t.signIn}
          </button>
        </form>

        <div className="auth-divider"></div>

        <div className="auth-link">
          <p>{t.dontHaveAccount}</p>
          <Link to="/register" className="link-primary">{t.signUp}</Link>
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;
