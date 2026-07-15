import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import GoogleButton from '../../components/GoogleButton';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mail, AlertCircle, ShieldCheck, Check } from 'lucide-react';
import styles from './Login.module.css';

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

let csrfToken = null;
async function getCsrf() {
  if (csrfToken) return csrfToken;
  try {
    const res = await axios.get('/api/auth/csrf');
    csrfToken = res.data.token;
  } catch (err) {
    console.error('Failed to fetch CSRF token:', err);
  }
  return csrfToken;
}

export default function Login() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Email-link state
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [emailTouched, setEmailTouched] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const navigate = useNavigate();
  const { login } = useAuth();
  const emailRef = useRef(null);

  const emailValid = isValidEmail(email);
  const emailError = emailTouched && !emailValid && email.length > 0;

  /* ── Google OAuth ── */
  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/google', { token: tokenResponse.access_token });
      login(res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erro ao fazer login com o Google');
      setGoogleLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Não foi possível conectar com o Google. Tente novamente.'),
  });

  /* ── Magic link ── */
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailTouched(true);
    if (!emailValid) return;
    setEmailLoading(true);
    setError('');
    try {
      const csrf = await getCsrf();
      await axios.post('/api/auth/magic-send', {
        email: email.trim().toLowerCase(),
        isRegister: false,
      }, { headers: { 'x-csrf-token': csrf } });
      setEmailSent(true);
      setCooldown(30);
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === 'USER_NOT_FOUND') {
        setError('Nenhuma conta com este e-mail. Cadastre-se primeiro.');
      } else {
        setError(err.response?.data?.error || 'Erro ao enviar o e-mail. Tente novamente.');
      }
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Left side: Premium Graphics */}
      <div className={styles.loginLeft}>
        <div className={styles.topLogo}>
          <Link to="/" className={styles.logoLink}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.logoIcon}>
              <path d="M12 2L2 22H22L12 2Z" fill="black" />
            </svg>
            WPC
          </Link>
        </div>
        
        <div className={styles.leftContent}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className={styles.heading}>
              Acesso exclusivo ao portal do parceiro.
            </h1>
            <p className={styles.subtitle}>
              Gerencie seus repasses, acompanhe métricas em tempo real e expanda suas operações de crédito com máxima segurança.
            </p>
            
            <div className={styles.benefitsList}>
              {[
                'Liquidez garantida em D+0',
                'Taxas e condições exclusivas',
                'Atendimento humanizado VIP'
              ].map((item, idx) => (
                <div key={idx} className={styles.benefitItem}>
                  <div className={styles.checkIconWrapper}>
                    <Check className={styles.checkIcon} />
                  </div>
                  <span className={styles.benefitText}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Abstract graphical element */}
        <div className={styles.loginLeftGraphic}>
          <svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(0,0,0,0.02)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.06)" />
              </linearGradient>
            </defs>
            <circle cx="400" cy="400" r="300" fill="none" stroke="url(#g1)" strokeWidth="1" strokeDasharray="4 8" />
            <circle cx="400" cy="400" r="200" fill="none" stroke="url(#g1)" strokeWidth="1" />
            <circle cx="400" cy="400" r="400" fill="none" stroke="url(#g1)" strokeWidth="1" strokeDasharray="2 12" />
          </svg>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className={styles.loginContent}>
        {/* Mobile Header Logo */}
        <div className={styles.mobileHeaderLogo}>
          <Link to="/" className={styles.logoLink}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.logoIcon}>
              <path d="M12 2L2 22H22L12 2Z" fill="black" />
            </svg>
            WPC
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {!emailSent ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={styles.loginFormWrapper}
            >
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Bem-vindo de volta</h2>
                <p className={styles.formSubtitle}>
                  Acesse sua conta para continuar
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.errorAlert}
                >
                  <AlertCircle className={styles.errorIcon} />
                  <p className={styles.errorText}>{error}</p>
                </motion.div>
              )}

              <GoogleButton
                onClick={() => loginWithGoogle()}
                loading={googleLoading}
                label="Continuar com Google"
              />

              <div className={styles.divider}>
                <div className={styles.dividerLineWrapper}>
                  <div className={styles.dividerLine}></div>
                </div>
                <div className={styles.dividerTextWrapper}>
                  <span className={styles.dividerText}>ou com e-mail</span>
                </div>
              </div>

              <form onSubmit={handleEmailSubmit} noValidate>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.inputLabel}>
                    Endereço de e-mail
                  </label>
                  <input
                    id="email"
                    ref={emailRef}
                    type="email"
                    placeholder="seu@email.com"
                    className={`${styles.loginInput} ${emailError ? styles.isError : ''}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    autoComplete="email"
                    disabled={emailLoading}
                  />
                  {emailError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.inputErrorText}>
                      Por favor, insira um e-mail válido.
                    </motion.p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={emailLoading || (emailTouched && !emailValid)}
                  className={styles.submitBtn}
                >
                  {emailLoading ? (
                    <div className={styles.submitSpinner} />
                  ) : (
                    <>
                      Enviar Magic Link
                      <ArrowRight className={styles.btnArrow} />
                    </>
                  )}
                </motion.button>
              </form>
              
              <div className={styles.trustFooter}>
                <ShieldCheck className={styles.trustIcon} />
                Acesso sem senhas. Receba um link seguro.
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={styles.sentFormWrapper}
            >
              <div className={styles.authSentIconWrapper}>
                <Mail className={styles.sentIcon} />
              </div>
              <h2 className={styles.sentTitle}>
                Verifique seu e-mail
              </h2>
              <p className={styles.sentSubtitle}>
                Enviamos um link mágico de acesso para <br/>
                <strong className={styles.sentEmailHighlight}>{email}</strong>. <br/>
                O link expira em 15 minutos.
              </p>

              <div className={styles.sentHint}>
                Não recebeu?{' '}
                {cooldown > 0 ? (
                  <span className={styles.cooldownText}>Aguarde {cooldown}s</span>
                ) : (
                  <button
                    onClick={() => { setEmailSent(false); setError(''); }}
                    className={styles.retryBtn}
                  >
                    Tente novamente
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
