import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Star, Clock, ArrowRight, TrendingUp,
  Bookmark, Share2, GitCompare, Building, CreditCard
} from 'lucide-react';
import styles from './MarketplaceCard.module.css';

export function MarketplaceCard({ offer, viewMode = 'grid' }) {
  // If no offer is provided, use a dummy one for preview
  const data = offer || {
    id: '123',
    title: 'Crédito Estruturado Premium',
    investor: 'J.P. Morgan Asset',
    rating: 4.9,
    maxAmount: '10.000.000',
    minAmount: '500.000',
    rate: '1.2% a.m.',
    term: 'Até 48 meses',
    volume: 'R$ 150M+',
    responseTime: '24h',
    operations: 342,
    guarantees: 'Recebíveis, Imóvel',
    tags: ['Construtoras', 'Capital de Giro'],
    badges: ['Oferta Premium', 'Verificado']
  };

  const renderBadge = (badgeName) => {
    switch(badgeName) {
      case 'Verificado': return <span className={`${styles.badge} ${styles.badgeSuccess}`} key={badgeName}><ShieldCheck size={12} /> {badgeName}</span>;
      case 'Oferta Premium': return <span className={`${styles.badge} ${styles.badgePremium}`} key={badgeName}><Star size={12} /> {badgeName}</span>;
      case 'Alta demanda': return <span className={`${styles.badge} ${styles.badgeWarning}`} key={badgeName}><TrendingUp size={12} /> {badgeName}</span>;
      default: return <span className={`${styles.badge} ${styles.badgeDefault}`} key={badgeName}>{badgeName}</span>;
    }
  };

  return (
    <motion.div 
      className={`${styles.card} ${viewMode === 'list' ? styles.listMode : ''}`}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.investorInfo}>
          <div className={styles.investorAvatar}>
            {data.investor.charAt(0)}
          </div>
          <div className={styles.investorDetails}>
            <span className={styles.investorName}>{data.investor}</span>
            <span className={styles.offerTitle}>{data.title}</span>
          </div>
        </div>
        <div className={styles.badgesWrapper}>
          {data.badges.map(renderBadge)}
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.statsRow}>
          <div className={styles.mainStat}>
            <span className={styles.statLabel}>Capital Disponível</span>
            <span className={styles.statValue}>R$ {data.maxAmount}</span>
            <span className={styles.statSub}>Mín: R$ {data.minAmount}</span>
          </div>
          <div className={styles.mainStat}>
            <span className={styles.statLabel}>Taxa a partir de</span>
            <span className={`${styles.statValue} ${styles.highlight}`}>{data.rate}</span>
            <span className={styles.statSub}>{data.term}</span>
          </div>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.metricItem}>
            <Building size={16} />
            <div className={styles.metricTexts}>
              <span className={styles.metricLabel}>Segmentos</span>
              <span className={styles.metricValue}>{data.tags.join(', ')}</span>
            </div>
          </div>
          <div className={styles.metricItem}>
            <CreditCard size={16} />
            <div className={styles.metricTexts}>
              <span className={styles.metricLabel}>Garantias</span>
              <span className={styles.metricValue}>{data.guarantees}</span>
            </div>
          </div>
          <div className={styles.metricItem}>
            <Clock size={16} />
            <div className={styles.metricTexts}>
              <span className={styles.metricLabel}>Tempo de Resposta</span>
              <span className={styles.metricValue}>{data.responseTime} médio</span>
            </div>
          </div>
          <div className={styles.metricItem}>
            <Star size={16} />
            <div className={styles.metricTexts}>
              <span className={styles.metricLabel}>Avaliação</span>
              <span className={styles.metricValue}>{data.rating} / 5.0</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.footerActions}>
          <button className={styles.iconBtn} title="Favoritar"><Bookmark size={18} /></button>
          <button className={styles.iconBtn} title="Compartilhar"><Share2 size={18} /></button>
          <button className={styles.iconBtn} title="Comparar"><GitCompare size={18} /></button>
        </div>
        
        <div className={styles.mainActions}>
          <Link to={`/dashboard/marketplace/${data.id}`} className={styles.detailsBtn}>
            Ver Detalhes
          </Link>
          <Link to={`/dashboard/marketplace/${data.id}/solicitar`} className={styles.primaryBtn}>
            Solicitar <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
