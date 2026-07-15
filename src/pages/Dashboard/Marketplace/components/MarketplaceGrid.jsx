import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { MarketplaceCard } from './MarketplaceCard';
import styles from './MarketplaceGrid.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function MarketplaceGrid({ offers, viewMode, loading }) {
  if (loading) {
    return (
      <div className={`${styles.grid} ${viewMode === 'list' ? styles.listGrid : ''}`}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonHeader} />
            <div className={styles.skeletonBody} />
            <div className={styles.skeletonFooter} />
          </div>
        ))}
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <Search size={48} strokeWidth={1.5} />
        </div>
        <h3>Nenhuma oferta encontrada</h3>
        <p>Ajuste seus filtros ou tente buscar com outras palavras-chave.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className={`${styles.grid} ${viewMode === 'list' ? styles.listGrid : ''}`}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      layout
    >
      <AnimatePresence>
        {offers.map(offer => (
          <motion.div key={offer.id} variants={itemVariants} layoutId={`card-${offer.id}`}>
            <MarketplaceCard offer={offer} viewMode={viewMode} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
