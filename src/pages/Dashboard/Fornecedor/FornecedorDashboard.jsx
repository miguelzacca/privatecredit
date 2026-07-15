import React from 'react';
import { Package, TrendingUp, CheckCircle } from 'lucide-react';
import styles from '../../../layouts/DashboardLayout/DashboardLayout.module.css';

export function FornecedorDashboard() {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', letterSpacing: '-0.03em', color: '#111' }}>Painel do Fornecedor</h1>
        <p style={{ color: '#666', fontSize: '16px', marginTop: '8px' }}>Acompanhe suas vendas à vista e recebimentos.</p>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Package size={24} /></div>
          <span className={styles.statLabel}>Volume de Vendas</span>
          <span className={styles.statValue}>R$ 0,00</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><TrendingUp size={24} /></div>
          <span className={styles.statLabel}>Crescimento YoY</span>
          <span className={styles.statValue}>0%</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><CheckCircle size={24} /></div>
          <span className={styles.statLabel}>Faturas Pagas</span>
          <span className={styles.statValue}>0</span>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>Recebimentos Mensais</span>
          </div>
          <div className={styles.chartPlaceholder}>Nenhum dado disponível ainda</div>
        </div>
      </div>
    </div>
  );
}
