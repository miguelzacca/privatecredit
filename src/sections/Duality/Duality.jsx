import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { Building2, Wallet, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import styles from './Duality.module.css';

export function Duality() {
  const [activeTab, setActiveTab] = useState('originator');

  const content = {
    originator: {
      title: 'Precisa de liquidez?',
      subtitle: 'Antecipe seus recebíveis e expanda sua operação sem burocracia bancária.',
      features: ['Antecipação de comissão imobiliária', 'Crédito empresarial rápido', 'Financiamento de materiais'],
      icon: Building2,
      action: 'Solicitar crédito'
    },
    investor: {
      title: 'Quer rentabilidade?',
      subtitle: 'Acesse operações de crédito privado exclusivas com garantias reais e alta previsibilidade.',
      features: ['Rendimentos superiores ao CDI', 'Operações estruturadas e auditadas', 'Garantia real (imóveis/recebíveis)'],
      icon: Wallet,
      action: 'Ver oportunidades'
    }
  };

  return (
    <section className={styles.duality} id="operacoes">
      <div className={clsx('container', styles.container)}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>O ecossistema perfeito.</h2>
          <p className={styles.subtitle}>
            Conectamos as duas pontas da economia real através de uma infraestrutura robusta, segura e inteligente.
          </p>
          
          <div className={styles.tabContainer}>
            <button 
              className={clsx(styles.tab, activeTab === 'originator' && styles.activeTab)}
              onClick={() => setActiveTab('originator')}
            >
              Para Empresas
            </button>
            <button 
              className={clsx(styles.tab, activeTab === 'investor' && styles.activeTab)}
              onClick={() => setActiveTab('investor')}
            >
              Para Investidores
            </button>
            <div 
              className={styles.indicator} 
              style={{ transform: `translateX(${activeTab === 'originator' ? '0%' : '100%'})` }}
            />
          </div>
        </div>

        <div className={styles.contentWrapper}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={styles.activeContent}
            >
              <GlassCard className={styles.infoCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.iconBox}>
                    {React.createElement(content[activeTab].icon, { size: 24 })}
                  </div>
                  <h3>{content[activeTab].title}</h3>
                </div>
                <p className={styles.cardDesc}>{content[activeTab].subtitle}</p>
                
                <ul className={styles.featureList}>
                  {content[activeTab].features.map((feat, idx) => (
                    <li key={idx}>
                      <ShieldCheck size={18} className={styles.checkIcon} />
                      {feat}
                    </li>
                  ))}
                </ul>
                
                <div className={styles.actionRow}>
                  <Button icon={ArrowRight}>{content[activeTab].action}</Button>
                </div>
              </GlassCard>

              {/* Abstract Visual Representation */}
              <div className={styles.visualSide}>
                {activeTab === 'originator' ? (
                  <div className={styles.flowDiagram}>
                    <div className={styles.node}>Contrato</div>
                    <div className={styles.line}><Zap size={16} /></div>
                    <div className={styles.nodeMain}>Liquidez 24h</div>
                  </div>
                ) : (
                  <div className={styles.chartDiagram}>
                    <div className={styles.chartCol} style={{height: '40%'}}></div>
                    <div className={styles.chartCol} style={{height: '60%'}}></div>
                    <div className={styles.chartCol} style={{height: '80%'}}></div>
                    <div className={styles.chartCol} style={{height: '100%', background: 'var(--color-accent)'}}></div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
