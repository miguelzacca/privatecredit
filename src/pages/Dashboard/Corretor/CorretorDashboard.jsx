import React from 'react';
import { Briefcase, CreditCard, Clock } from 'lucide-react';
import styles from '../../../layouts/DashboardLayout/DashboardLayout.module.css';

export function CorretorDashboard() {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', letterSpacing: '-0.03em', color: '#111' }}>Painel do Corretor</h1>
        <p style={{ color: '#666', fontSize: '16px', marginTop: '8px' }}>Gerencie suas antecipações e crédito.</p>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Briefcase size={24} /></div>
          <span className={styles.statLabel}>Comissões Disponíveis</span>
          <span className={styles.statValue}>R$ 0,00</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><CreditCard size={24} /></div>
          <span className={styles.statLabel}>Crédito Aprovado</span>
          <span className={styles.statValue}>R$ 0,00</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Clock size={24} /></div>
          <span className={styles.statLabel}>Operações em Análise</span>
          <span className={styles.statValue}>0</span>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>Histórico de Antecipações</span>
          </div>
          <div className={styles.chartPlaceholder}>Nenhum dado disponível ainda</div>
        </div>
      </div>
    </div>
  );
}
