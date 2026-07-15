import React from 'react';
import { Building2, DollarSign, Activity } from 'lucide-react';
import styles from '../../../layouts/DashboardLayout/DashboardLayout.module.css';

export function EmpresaDashboard() {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', letterSpacing: '-0.03em', color: '#111' }}>Painel Corporativo</h1>
        <p style={{ color: '#666', fontSize: '16px', marginTop: '8px' }}>Visão geral de captação e crédito privado.</p>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Building2 size={24} /></div>
          <span className={styles.statLabel}>Crédito Estruturado</span>
          <span className={styles.statValue}>R$ 0,00</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><DollarSign size={24} /></div>
          <span className={styles.statLabel}>Capital de Giro Liberado</span>
          <span className={styles.statValue}>R$ 0,00</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Activity size={24} /></div>
          <span className={styles.statLabel}>Limite Disponível</span>
          <span className={styles.statValue}>R$ 0,00</span>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>Estrutura de Dívida</span>
          </div>
          <div className={styles.chartPlaceholder}>Nenhum dado disponível ainda</div>
        </div>
      </div>
    </div>
  );
}
