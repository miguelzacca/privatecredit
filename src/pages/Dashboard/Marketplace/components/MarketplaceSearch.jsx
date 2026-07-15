import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, List, SlidersHorizontal, Map } from 'lucide-react';
import styles from './MarketplaceSearch.module.css';
import { MarketplaceFilters } from './MarketplaceFilters';

export function MarketplaceSearch({ viewMode, setViewMode }) {
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className={styles.searchContainer}>
      <div className={styles.mainBar}>
        <motion.div 
          className={`${styles.inputWrapper} ${isFocused ? styles.focused : ''}`}
          animate={{ scale: isFocused ? 1.01 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Search size={20} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Pesquisar por empresa, operação, segmento ou palavra-chave..." 
            className={styles.input}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <button className={styles.quickSearchBtn}>Buscar</button>
        </motion.div>

        <div className={styles.actions}>
          <button 
            className={`${styles.actionBtn} ${showFilters ? styles.active : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={18} />
            Filtros
          </button>
          
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
            <button 
              className={`${styles.toggleBtn} ${viewMode === 'map' ? styles.activeToggle : ''}`}
              onClick={() => setViewMode('map')}
              title="Visualização em Mapa (Em breve)"
            >
              <Map size={18} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <MarketplaceFilters />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
