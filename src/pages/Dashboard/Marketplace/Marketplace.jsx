import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ShieldCheck, Star, Clock, ArrowRight, Activity, Percent } from 'lucide-react';
import axios from 'axios';
import styles from './Marketplace.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const mockOffers = [];

export function Marketplace() {
  const [showFilters, setShowFilters] = useState(false);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/credit-lines')
      .then(res => {
        setOffers([...res.data.data, ...mockOffers]);
      })
      .catch(err => {
        console.error('Error fetching credit lines:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: '24px', border: '1px dashed rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111', marginBottom: '8px' }}>Carregando ofertas...</h3>
        </div>
      ) : offers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: '24px', border: '1px dashed rgba(0,0,0,0.1)' }}>
          <Search size={48} color="#ccc" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111', marginBottom: '8px' }}>Nenhuma oferta encontrada</h3>
          <p style={{ color: '#666', fontSize: '15px' }}>Ainda não há linhas de crédito publicadas no momento. Tente novamente mais tarde.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {offers.map((offer) => (
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
                    <span className={styles.statValue}>R$ {offer.maxAmount}</span>
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
                    {offer.tags && offer.tags.map((tag, i) => (
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
      )}
    </motion.div>
  );
}
