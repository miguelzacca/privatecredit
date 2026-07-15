import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Activity, Users } from 'lucide-react';
import styles from './MarketplaceHero.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export function MarketplaceHero() {
  return (
    <motion.div className={styles.heroContainer} variants={containerVariants} initial="hidden" animate="show">
      <div className={styles.textContent}>
        <motion.h1 variants={itemVariants} className={styles.title}>
          Marketplace de Crédito
        </motion.h1>
        <motion.p variants={itemVariants} className={styles.subtitle}>
          Explore oportunidades de crédito privado compatíveis com seu perfil.
        </motion.p>
      </div>

      <motion.div className={styles.statsGrid} variants={itemVariants}>
        <div className={styles.statBox}>
          <div className={styles.statIconWrapper}><DollarSign size={20} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Capital Disponível</span>
            <span className={styles.statValue}>R$ 450M+</span>
          </div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statIconWrapper}><TrendingUp size={20} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Taxa Média</span>
            <span className={styles.statValue}>1.2% a.m.</span>
          </div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statIconWrapper}><Activity size={20} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Operações em Negociação</span>
            <span className={styles.statValue}>142</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
