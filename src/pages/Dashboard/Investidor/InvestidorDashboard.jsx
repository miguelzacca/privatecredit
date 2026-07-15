import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, ArrowUpRight, Plus, Activity, Clock, DollarSign, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
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
  const [creditLines, setCreditLines] = useState([]);
  const [rawLines, setRawLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      axios.get(`/api/credit-lines?userId=${user.id}`)
        .then(res => {
          setRawLines(res.data.data);
          // Format them to match what the dashboard expects
          const formatted = res.data.data.map(line => ({
            id: line.id,
            name: `Linha Premium - ${line.term}`,
            available: line.maxAmount,
            rate: line.rate,
            term: line.term,
            status: 'ativa', // Fixed as active for demo
            tags: line.tags
          }));
          setCreditLines(formatted);
        })
        .catch(err => console.error('Error fetching dashboard lines:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  // Calculate dynamic stats
  const totalCapital = rawLines.reduce((acc, line) => acc + (line.capital || 0), 0);
  const avgRate = rawLines.length > 0 
    ? (rawLines.reduce((acc, line) => acc + (line.interestRate || 0), 0) / rawLines.length) 
    : 0;

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(val);

  const stats = [
    { label: 'Capital Disponível', value: formatCurrency(totalCapital), icon: Wallet, trend: 'Atualizado', isUp: true },
    { label: 'Capital Comprometido', value: 'R$ 0', icon: DollarSign, trend: 'Novo', isUp: true },
    { label: 'Rentabilidade Média', value: `${avgRate.toFixed(2)}% a.m.`, icon: TrendingUp, trend: 'Atualizado', isUp: true },
    { label: 'Operações Ativas', value: creditLines.length.toString(), icon: Activity, trend: 'Atualizado', isUp: true },
  ];

  const filteredLines = creditLines.filter(line => {
    if (filter === 'todas') return true;
    return line.status === filter || (filter === 'ativas' && line.status === 'ativa') || (filter === 'pausadas' && line.status === 'pausada');
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

        {filteredLines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: '20px', border: '1px dashed rgba(0,0,0,0.1)' }}>
            <Wallet size={48} color="#ccc" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', marginBottom: '8px' }}>Nenhuma linha de crédito encontrada</h3>
            <p style={{ color: '#666', marginBottom: '24px', fontSize: '15px' }}>Você ainda não possui linhas de crédito {filter !== 'todas' ? `com status "${filter}"` : 'publicadas'}.</p>
            <Link to="/dashboard/investidor/nova-linha" className={styles.publishBtn} style={{ display: 'inline-flex', margin: '0 auto' }}>
              <Plus size={18} />
              Publicar Primeira Linha
            </Link>
          </div>
        ) : (
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
        )}
      </motion.div>
    </motion.div>
  );
}
