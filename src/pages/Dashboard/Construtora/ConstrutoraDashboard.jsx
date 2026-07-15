import React from 'react';
import { Building, TrendingDown, Clock } from 'lucide-react';
import styles from '../../../layouts/DashboardLayout/DashboardLayout.module.css';

export function ConstrutoraDashboard() {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', letterSpacing: '-0.03em', color: '#111' }}>Painel da Construtora</h1>
        <p style={{ color: '#666', fontSize: '16px', marginTop: '8px' }}>Gestão de recebíveis e estruturação de capital.</p>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Building size={24} /></div>
          <span className={styles.statLabel}>Projetos Ativos</span>
          <span className={styles.statValue}>0</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><TrendingDown size={24} /></div>
          <span className={styles.statLabel}>Custo de Capital</span>
          <span className={styles.statValue}>0%</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Clock size={24} /></div>
          <span className={styles.statLabel}>Pagamentos Alongados</span>
          <span className={styles.statValue}>R$ 0,00</span>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>Fluxo de Caixa Projetado</span>
          </div>
          <div className={styles.chartPlaceholder}>Nenhum dado disponível ainda</div>
        </div>
      </div>
    </div>
  );
}
