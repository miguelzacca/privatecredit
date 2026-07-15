import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, ArrowUpRight, Plus, Activity, Clock, DollarSign, ChevronRight } from 'lucide-react';
import styles from './InvestidorDashboard.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export function InvestidorDashboard() {
  const [filter, setFilter] = useState('ativas');

  const stats = [
    { label: 'Capital Disponível', value: 'R$ 2.500.000', icon: Wallet, trend: '+12%', isUp: true },
    { label: 'Capital Comprometido', value: 'R$ 8.450.000', icon: DollarSign, trend: '+5.4%', isUp: true },
    { label: 'Rentabilidade Média', value: '3.2% a.m.', icon: TrendingUp, trend: '+0.2%', isUp: true },
    { label: 'Operações Ativas', value: '42', icon: Activity, trend: 'Estável', isUp: true },
  ];

  const creditLines = [
    {
      id: 1,
      name: 'Capital de Giro Prime',
      status: 'ativa',
      available: 'R$ 1.500.000',
      rate: '3,00% a.m.',
      term: 'Até 36x',
      tags: ['Empresas', 'Garantia Real']
    },
    {
      id: 2,
      name: 'Antecipação Recebíveis',
      status: 'ativa',
      available: 'R$ 500.000',
      rate: '2,50% a.m.',
      term: 'Até 12x',
      tags: ['Fornecedores', 'Sem Garantia']
    },
    {
      id: 3,
      name: 'Financiamento Construtoras',
      status: 'pausada',
      available: 'R$ 5.000.000',
      rate: '4,50% a.m.',
      term: 'Até 60x',
      tags: ['Construtoras', 'Alienação Fiduciária']
    }
  ];

  const filteredLines = creditLines.filter(line => {
    if (filter === 'todas') return true;
    return line.status === filter;
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Visão Geral</h1>
          <p className={styles.subtitle}>Acompanhe a performance do seu portfólio de crédito privado.</p>
        </div>
        <Link to="/dashboard/investidor/nova-linha" className={styles.publishBtn}>
          <Plus size={18} />
          Publicar Linha de Crédito
        </Link>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <stat.icon size={20} />
              </div>
              <div className={`${styles.statTrend} ${stat.isUp ? styles.trendUp : styles.trendDown}`}>
                {stat.trend}
                {stat.isUp ? <ArrowUpRight size={14} /> : null}
              </div>
            </div>
            <div>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants}>
        <div className={styles.sectionTitle}>
          Minhas Linhas de Crédito
          <div className={styles.sectionActions}>
            <button 
              className={`${styles.filterBtn} ${filter === 'todas' ? styles.active : ''}`}
              onClick={() => setFilter('todas')}
            >
              Todas
            </button>
            <button 
              className={`${styles.filterBtn} ${filter === 'ativas' ? styles.active : ''}`}
              onClick={() => setFilter('ativas')}
            >
              Ativas
            </button>
            <button 
              className={`${styles.filterBtn} ${filter === 'pausadas' ? styles.active : ''}`}
              onClick={() => setFilter('pausadas')}
            >
              Pausadas
            </button>
          </div>
        </div>

        <div className={styles.linesGrid}>
          {filteredLines.map((line) => (
            <motion.div key={line.id} variants={itemVariants} className={styles.lineCard}>
              <div className={styles.lineHeader}>
                <div>
                  <div className={`${styles.lineStatus} ${line.status === 'pausada' ? styles.paused : ''}`}>
                    {line.status === 'ativa' ? <Activity size={12} /> : <Clock size={12} />}
                    {line.status === 'ativa' ? 'Disponível no Marketplace' : 'Pausada'}
                  </div>
                  <h3 className={styles.lineName}>{line.name}</h3>
                </div>
              </div>
              
              <div className={styles.lineMetrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Disponível</span>
                  <span className={styles.metricValue}>{line.available}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Taxa Mínima</span>
                  <span className={styles.metricValue}>{line.rate}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Prazo Máx.</span>
                  <span className={styles.metricValue}>{line.term}</span>
                </div>
              </div>

              <div className={styles.lineFooter}>
                <div className={styles.tags}>
                  {line.tags.map((tag, i) => (
                    <span key={i} className={styles.tag}>{tag}</span>
                  ))}
                </div>
                <Link to={`/dashboard/investidor/linhas/${line.id}`} className={styles.actionLink}>
                  Gerenciar <ChevronRight size={16} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
