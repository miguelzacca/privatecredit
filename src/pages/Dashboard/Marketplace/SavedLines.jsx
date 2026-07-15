import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, LayoutGrid, List } from 'lucide-react';
import { MarketplaceGrid } from './components/MarketplaceGrid';
import styles from './SavedLines.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const SAVED_OFFERS = [
  {
    id: '1',
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
  },
  {
    id: '3',
    title: 'Financiamento para Máquinas',
    investor: 'BNDES / Parceiros',
    rating: 4.5,
    maxAmount: '2.000.000',
    minAmount: '50.000',
    rate: '0.75% a.m.',
    term: 'Até 60 meses',
    volume: 'R$ 300M+',
    responseTime: '48h',
    operations: 500,
    guarantees: 'Alienação Fiduciária',
    tags: ['Indústria', 'Agronegócio'],
    badges: ['Baixo risco']
  }
];

export function SavedLines() {
  const [viewMode, setViewMode] = useState('grid');

  return (
    <motion.div className={styles.container} variants={containerVariants} initial="hidden" animate="show">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}><Bookmark size={28} className={styles.titleIcon} /> Minhas Linhas Salvas</h1>
          <p className={styles.subtitle}>Linhas de crédito que você favoritou no Marketplace para acompanhamento.</p>
        </div>
        
        <div className={styles.viewToggle}>
          <button 
            className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.activeToggle : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.activeToggle : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <MarketplaceGrid offers={SAVED_OFFERS} viewMode={viewMode} loading={false} />
    </motion.div>
  );
}
