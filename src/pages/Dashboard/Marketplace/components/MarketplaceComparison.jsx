import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitCompare, ArrowRight } from 'lucide-react';
import styles from './MarketplaceComparison.module.css';
import { Link } from 'react-router-dom';

export function MarketplaceComparison({ offers, onClose, onRemove }) {
  if (!offers || offers.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className={styles.modal}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <GitCompare size={24} />
              <h2>Comparação de Linhas de Crédito</h2>
              <span className={styles.count}>{offers.length} de 4 selecionadas</span>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th className={styles.featureColumn}>Características</th>
                  {offers.map(offer => (
                    <th key={offer.id} className={styles.offerColumn}>
                      <div className={styles.offerHeader}>
                        <button className={styles.removeBtn} onClick={() => onRemove(offer.id)}>
                          <X size={14} />
                        </button>
                        <div className={styles.investorAvatar}>{offer.investor.charAt(0)}</div>
                        <span className={styles.investorName}>{offer.investor}</span>
                        <span className={styles.offerTitle}>{offer.title}</span>
                      </div>
                    </th>
                  ))}
                  {/* Empty slots if less than 4 */}
                  {Array.from({ length: 4 - offers.length }).map((_, i) => (
                    <th key={`empty-${i}`} className={styles.emptyColumn}>
                      <div className={styles.emptySlot}>
                        <span>Vazio</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.featureName}>Capital Disponível</td>
                  {offers.map(offer => (
                    <td key={offer.id} className={styles.valueCell}>
                      <strong>R$ {offer.maxAmount}</strong>
                    </td>
                  ))}
                  {Array.from({ length: 4 - offers.length }).map((_, i) => <td key={`e1-${i}`}></td>)}
                </tr>
                <tr>
                  <td className={styles.featureName}>Taxa de Juros</td>
                  {offers.map(offer => (
                    <td key={offer.id} className={`${styles.valueCell} ${styles.highlightCell}`}>
                      {offer.rate}
                    </td>
                  ))}
                  {Array.from({ length: 4 - offers.length }).map((_, i) => <td key={`e2-${i}`}></td>)}
                </tr>
                <tr>
                  <td className={styles.featureName}>Prazo</td>
                  {offers.map(offer => (
                    <td key={offer.id} className={styles.valueCell}>{offer.term}</td>
                  ))}
                  {Array.from({ length: 4 - offers.length }).map((_, i) => <td key={`e3-${i}`}></td>)}
                </tr>
                <tr>
                  <td className={styles.featureName}>Garantias</td>
                  {offers.map(offer => (
                    <td key={offer.id} className={styles.valueCell}>{offer.guarantees}</td>
                  ))}
                  {Array.from({ length: 4 - offers.length }).map((_, i) => <td key={`e4-${i}`}></td>)}
                </tr>
                <tr>
                  <td className={styles.featureName}>Rating</td>
                  {offers.map(offer => (
                    <td key={offer.id} className={styles.valueCell}>
                      <span className={styles.ratingBadge}>★ {offer.rating}</span>
                    </td>
                  ))}
                  {Array.from({ length: 4 - offers.length }).map((_, i) => <td key={`e5-${i}`}></td>)}
                </tr>
                <tr className={styles.actionRow}>
                  <td></td>
                  {offers.map(offer => (
                    <td key={offer.id}>
                      <Link to={`/dashboard/marketplace/${offer.id}/solicitar`} className={styles.applyBtn}>
                        Solicitar <ArrowRight size={16} />
                      </Link>
                    </td>
                  ))}
                  {Array.from({ length: 4 - offers.length }).map((_, i) => <td key={`e6-${i}`}></td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
