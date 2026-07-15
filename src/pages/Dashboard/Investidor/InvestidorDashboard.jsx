import React from 'react';
import { TrendingUp, Users, DollarSign } from 'lucide-react';
import styles from '../../../layouts/DashboardLayout/DashboardLayout.module.css';

export function InvestidorDashboard() {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', letterSpacing: '-0.03em', color: '#111' }}>Bem-vindo(a)</h1>
        <p style={{ color: '#666', fontSize: '16px', marginTop: '8px' }}>Aqui está o resumo dos seus investimentos.</p>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <DollarSign size={24} />
          </div>
          <span className={styles.statLabel}>Capital Alocado</span>
          <span className={styles.statValue}>R$ 0,00</span>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <span className={styles.statLabel}>Retorno Estimado</span>
          <span className={styles.statValue}>0%</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <span className={styles.statLabel}>Operações Ativas</span>
          <span className={styles.statValue}>0</span>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>Evolução Patrimonial</span>
          </div>
          <div className={styles.chartPlaceholder}>
            Nenhum dado disponível ainda
          </div>
        </div>
      </div>
    </div>
  );
}
