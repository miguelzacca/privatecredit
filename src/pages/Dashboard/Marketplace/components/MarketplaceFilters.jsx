import React from 'react';
import styles from './MarketplaceFilters.module.css';

export function MarketplaceFilters() {
  return (
    <div className={styles.filtersWrapper}>
      <div className={styles.filterGrid}>
        <div className={styles.filterItem}>
          <label className={styles.filterLabel}>Valor (Mínimo - Máximo)</label>
          <div className={styles.rangeInputs}>
            <input type="text" placeholder="R$ 0" className={styles.filterInput} />
            <span className={styles.separator}>-</span>
            <input type="text" placeholder="R$ 10.000.000+" className={styles.filterInput} />
          </div>
        </div>

        <div className={styles.filterItem}>
          <label className={styles.filterLabel}>Taxa Máxima</label>
          <div className={styles.selectWrapper}>
            <select className={styles.filterSelect}>
              <option>Qualquer taxa</option>
              <option>Até 1.0% a.m.</option>
              <option>Até 1.5% a.m.</option>
              <option>Até 2.0% a.m.</option>
            </select>
          </div>
        </div>

        <div className={styles.filterItem}>
          <label className={styles.filterLabel}>Prazo Mínimo</label>
          <div className={styles.selectWrapper}>
            <select className={styles.filterSelect}>
              <option>Qualquer prazo</option>
              <option>A partir de 12 meses</option>
              <option>A partir de 24 meses</option>
              <option>A partir de 36 meses</option>
            </select>
          </div>
        </div>

        <div className={styles.filterItem}>
          <label className={styles.filterLabel}>Segmento da Empresa</label>
          <div className={styles.selectWrapper}>
            <select className={styles.filterSelect}>
              <option>Todos os segmentos</option>
              <option>Construtoras</option>
              <option>Fornecedores</option>
              <option>Indústria</option>
              <option>Serviços</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.filterActions}>
        <button className={styles.clearBtn}>Limpar Filtros</button>
        <button className={styles.applyBtn}>Aplicar Filtros</button>
      </div>
    </div>
  );
}
