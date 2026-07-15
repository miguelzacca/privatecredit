import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';
import styles from './MarketplaceSimulator.module.css';

export function MarketplaceSimulator({ rate, maxTerm, maxAmount, minAmount }) {
  const numericRate = parseFloat(rate.replace(',', '.')) / 100 || 0.012;
  const maxTermNumeric = parseInt(maxTerm.replace(/\D/g, '')) || 48;
  const maxAmountNumeric = parseInt(maxAmount.replace(/\D/g, '')) || 10000000;
  const minAmountNumeric = minAmount && minAmount !== 'A consultar' 
    ? parseInt(minAmount.replace(/\D/g, '')) || 100000 
    : 100000;

  const [amount, setAmount] = useState(minAmountNumeric);
  const [term, setTerm] = useState(Math.min(24, maxTermNumeric));
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    // Tabela Price calculation
    if (amount > 0 && term > 0) {
      const i = numericRate;
      const n = term;
      const pmt = amount * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
      
      setMonthlyPayment(pmt);
      setTotalCost(pmt * n);
    } else {
      setMonthlyPayment(0);
      setTotalCost(0);
    }
  }, [amount, term, numericRate]);

  return (
    <div className={styles.simulatorWrapper}>
      <div className={styles.header}>
        <Calculator size={24} className={styles.icon} />
        <h3 className={styles.title}>Simulador de Financiamento</h3>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <label>Valor Solicitado</label>
            <span className={styles.valueDisplay}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
            </span>
          </div>
          <input 
            type="range" 
            min={minAmountNumeric} 
            max={maxAmountNumeric} 
            step={Math.max(1000, Math.floor((maxAmountNumeric - minAmountNumeric) / 20))}
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))} 
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <label>Prazo de Pagamento</label>
            <span className={styles.valueDisplay}>{term} meses</span>
          </div>
          <input 
            type="range" 
            min={6} 
            max={maxTermNumeric} 
            step={6}
            value={term} 
            onChange={(e) => setTerm(Number(e.target.value))} 
            className={styles.slider}
          />
        </div>
      </div>

      <div className={styles.resultsGrid}>
        <div className={styles.resultBox}>
          <span className={styles.resultLabel}>Parcela Mensal Estimada</span>
          <span className={styles.resultValuePrimary}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyPayment)}
          </span>
        </div>
        
        <div className={styles.resultBoxSecondary}>
          <div className={styles.secondaryRow}>
            <span>Taxa de Juros</span>
            <strong>{rate}</strong>
          </div>
          <div className={styles.secondaryRow}>
            <span>Custo Total Estimado</span>
            <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCost)}</strong>
          </div>
        </div>
      </div>
      
      <p className={styles.disclaimer}>
        * Esta é apenas uma simulação baseada nas condições inicias da linha. O valor final pode variar após análise de crédito e garantias.
      </p>
    </div>
  );
}
