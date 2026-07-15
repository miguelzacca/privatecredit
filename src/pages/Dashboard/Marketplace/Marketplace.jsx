import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ShieldCheck, Star, Clock, ArrowRight, Activity, Percent } from 'lucide-react';
import styles from './Marketplace.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const mockOffers = [
  {
    id: '1',
    investor: 'Alpha Capital',
    rating: '4.9',
    maxAmount: 'R$ 500.000',
    rate: '2,50% a.m.',
    term: 'Até 36 meses',
    time: '2 dias úteis',
    volume: '+10M',
    tags: ['Capital de Giro', 'Recebíveis', 'Sem Garantia Real']
  },
  {
    id: '2',
    investor: 'Vertex Invest',
    rating: '4.8',
    maxAmount: 'R$ 2.500.000',
    rate: '3,20% a.m.',
    term: 'Até 60 meses',
    time: '5 dias úteis',
    volume: '+50M',
    tags: ['Construtoras', 'Alienação Fiduciária']
  },
  {
    id: '3',
    investor: 'Nexus Credit',
    rating: '5.0',
    maxAmount: 'R$ 100.000',
    rate: '1,99% a.m.',
    term: 'Até 12 meses',
    time: '1 dia útil',
    volume: '+2M',
    tags: ['Antecipação de Notas', 'Fornecedores']
  },
  {
    id: '4',
    investor: 'Horizon Partners',
    rating: '4.7',
    maxAmount: 'R$ 1.000.000',
    rate: '2,80% a.m.',
    term: 'Até 24 meses',
    time: '3 dias úteis',
    volume: '+15M',
    tags: ['Expansão', 'Equipamentos', 'Avalista']
  }
];

export function Marketplace() {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <motion.div className={styles.container} variants={containerVariants} initial="hidden" animate="show">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Marketplace de Crédito</h1>
          <p className={styles.subtitle}>Encontre a linha de crédito ideal para o momento da sua empresa.</p>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <Search size={18} color="#666" />
            <input type="text" placeholder="Buscar linhas de crédito..." />
          </div>
          <button className={styles.filterBtn} onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal size={18} />
            Filtros
          </button>
          <select className={styles.sortSelect}>
            <option>Recomendados</option>
            <option>Menor Taxa</option>
            <option>Maior Valor</option>
            <option>Mais Rápidos</option>
          </select>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.filtersPanel}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Valor Desejado</label>
                <input type="text" className={styles.filterInput} placeholder="Ex: R$ 50.000" />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Prazo (Meses)</label>
                <input type="number" className={styles.filterInput} placeholder="Ex: 24" />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Segmento</label>
                <select className={styles.filterInput}>
                  <option>Todos</option>
                  <option>Construtoras</option>
                  <option>Fornecedores</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Garantias</label>
                <select className={styles.filterInput}>
                  <option>Indiferente</option>
                  <option>Com Garantia Real</option>
                  <option>Sem Garantia Real</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.grid}>
        {mockOffers.map((offer) => (
          <motion.div key={offer.id} variants={itemVariants}>
            <Link to={`/dashboard/marketplace/${offer.id}`} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.investorInfo}>
                  <div className={styles.investorAvatar}>
                    {offer.investor.charAt(0)}
                  </div>
                  <div className={styles.investorDetails}>
                    <span className={styles.investorName}>{offer.investor}</span>
                    <span className={styles.verifiedBadge}>
                      <ShieldCheck size={14} /> Verificado
                    </span>
                  </div>
                </div>
                <div className={styles.rating}>
                  <Star size={12} fill="currentColor" /> {offer.rating}
                </div>
              </div>

              <div className={styles.mainStats}>
                <div className={styles.mainStat}>
                  <span className={styles.statLabel}>Disponível até</span>
                  <span className={styles.statValue}>{offer.maxAmount}</span>
                </div>
                <div className={styles.mainStat}>
                  <span className={styles.statLabel}>Juros a partir de</span>
                  <span className={`${styles.statValue} ${styles.highlight}`}>{offer.rate}</span>
                </div>
              </div>

              <div className={styles.metricsGrid}>
                <div className={styles.metricRow}>
                  <Clock size={16} /> {offer.term}
                </div>
                <div className={styles.metricRow}>
                  <Activity size={16} /> Vol: {offer.volume}
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.tags}>
                  {offer.tags.map((tag, i) => (
                    <span key={i} className={styles.tag}>{tag}</span>
                  ))}
                </div>
                
                <div className={styles.actionBtn}>
                  Ver Condições <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
