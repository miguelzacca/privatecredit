import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Home, Building2, Package, Briefcase, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Onboarding.module.css';

const profiles = [
  {
    id: 'investidor',
    title: 'Investidor',
    icon: TrendingUp,
    description: 'Possuo capital disponível.',
    features: [
      'Quero investir em operações privadas.',
      'Escolho onde alocar meu dinheiro.',
      'Recebo oportunidades e analiso risco.',
      'Recebo retorno financeiro.'
    ]
  },
  {
    id: 'corretor',
    title: 'Corretor de Imóveis',
    icon: Home,
    description: 'Quero antecipar minhas comissões.',
    features: [
      'Quero acesso a crédito.',
      'Quero acompanhar minhas operações.'
    ]
  },
  {
    id: 'construtora',
    title: 'Construtora',
    icon: Building2,
    description: 'Busco crédito e estruturação.',
    features: [
      'Quero alongar pagamentos.',
      'Quero antecipar pagamentos.',
      'Quero aproveitar oportunidades à vista.',
      'Quero captar recursos.'
    ]
  },
  {
    id: 'fornecedor',
    title: 'Fornecedor',
    icon: Package,
    description: 'Quero ampliar minhas vendas.',
    features: [
      'Quero vender com pagamento à vista.',
      'Quero participar das operações.'
    ]
  },
  {
    id: 'empresa',
    title: 'Empresa',
    icon: Briefcase,
    description: 'Busco capital para crescimento.',
    features: [
      'Capital de giro.',
      'Recebíveis.',
      'Crédito privado.',
      'Operações estruturadas.'
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export function Onboarding() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (id) => {
    setSelected(id);
  };

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      // The API endpoint was created in api/user/profile.js
      const res = await axios.post('/api/user/profile', { profile: selected });
      updateUser({ profile: selected });
      navigate(`/dashboard/${selected}`);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar perfil. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.bgGlow}></div>
      <div className={styles.content}>
        <motion.div 
          className={styles.brand}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 22H22L12 2Z" fill="black" />
          </svg>
          White Private Credit
        </motion.div>

        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Qual melhor descreve você?
        </motion.h1>
        
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Personalizaremos sua experiência, métricas e oportunidades com base no seu perfil.
        </motion.p>

        <motion.div 
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {profiles.map((profile) => {
            const Icon = profile.icon;
            const isSelected = selected === profile.id;
            return (
              <motion.div
                key={profile.id}
                variants={itemVariants}
                whileHover={isSelected ? {} : { scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(profile.id)}
                className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
                layout
              >
                <div className={styles.iconWrapper}>
                  <Icon size={28} />
                </div>
                <h3 className={styles.cardTitle}>{profile.title}</h3>
                <p className={styles.cardDesc}>{profile.description}</p>
                
                <div className={styles.featuresList}>
                  {profile.features.map((feature, idx) => (
                    <div key={idx} className={styles.featureItem}>
                      <div className={styles.bullet}></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className={styles.actionWrapper}>
          <AnimatePresence>
            {selected && (
              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className={styles.btnPrimary}
                onClick={handleContinue}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className={styles.spinner}></div>
                    Preparando ambiente...
                  </>
                ) : (
                  <>
                    Continuar <ArrowRight size={20} />
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
