import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import styles from './MagicVerify.module.css';

function getErrorMeta(code) {
  switch (code) {
    case 'ALREADY_USED':
      return {
        icon: <Clock className={styles.iconGold} size={48} />,
        title: 'Link já utilizado',
        message: 'Este link de acesso já foi usado. Solicite um novo link para entrar.',
        action: 'login',
      };
    case 'EXPIRED':
      return {
        icon: <Clock className={styles.iconGold} size={48} />,
        title: 'Link expirado',
        message: 'O link de acesso expirou (validade de 15 minutos). Solicite um novo.',
        action: 'login',
      };
    case 'USER_NOT_FOUND':
      return {
        icon: <AlertCircle className={styles.iconRed} size={48} />,
        title: 'Conta não encontrada',
        message: 'Não encontramos uma conta com este e-mail.',
        action: 'login',
      };
    case 'INVALID_TOKEN':
    default:
      return {
        icon: <AlertCircle className={styles.iconRed} size={48} />,
        title: 'Link inválido',
        message: 'Este link de acesso é inválido ou já foi utilizado. Solicite um novo link.',
        action: 'login',
      };
  }
}

export default function MagicVerify() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMeta, setErrorMeta] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const fetchAttempted = React.useRef(false);

  useEffect(() => {
    if (!token) {
      setErrorMeta(getErrorMeta('INVALID_TOKEN'));
      setStatus('error');
      return;
    }

    if (fetchAttempted.current) return;
    fetchAttempted.current = true;

    axios.get(`/api/auth/magic-verify?token=${encodeURIComponent(token)}`)
      .then((res) => {
        login(res.data.user);
        setStatus('success');
      })
      .catch((err) => {
        const code = err.response?.data?.code || 'INVALID_TOKEN';
        setErrorMeta(getErrorMeta(code));
        setStatus('error');
      });
  }, [token, login]);

  const nextPath = (user && user.profile) ? `/dashboard/${user.profile}` : '/onboarding';

  // Countdown redirect on success
  useEffect(() => {
    if (status !== 'success') return;
    if (countdown <= 0) {
      navigate(nextPath);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, navigate, nextPath]);

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.brand}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 22H22L12 2Z" fill="black" />
          </svg>
          <span className={styles.brandText}>Private Credit</span>
        </div>

        {status === 'loading' && (
          <div className={styles.body}>
            <div className={styles.spinner}></div>
            <h1 className={styles.title}>Verificando seu link...</h1>
            <p className={styles.desc}>Aguarde um instante, estamos autenticando você.</p>
          </div>
        )}

        {status === 'success' && (
          <div className={styles.body}>
            <CheckCircle2 className={styles.iconSuccess} size={56} />
            <h1 className={styles.title}>Autenticação Concluída</h1>
            <p className={styles.desc}>
              Você foi autenticado com sucesso.<br />
              Redirecionando em <strong>{countdown}</strong> segundo{countdown !== 1 ? 's' : ''}...
            </p>
            <Link to={nextPath} className={styles.btnPrimary}>
              Ir para o Painel →
            </Link>
          </div>
        )}

        {status === 'error' && errorMeta && (
          <div className={styles.body}>
            <div className={styles.iconWrapper}>
              {errorMeta.icon}
            </div>
            <h1 className={styles.title}>{errorMeta.title}</h1>
            <p className={styles.desc}>{errorMeta.message}</p>
            <div className={styles.actions}>
              <Link to="/login" className={styles.btnPrimary}>
                Voltar para o Login
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
