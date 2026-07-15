import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../components/GlassCard';
import { Fingerprint, Scale, LineChart, FileText, Blocks, Zap } from 'lucide-react';
import styles from './Infrastructure.module.css';

export function Infrastructure() {
  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <section className={styles.infrastructure} id="solucao">
      <div className="container">
        
        <div className={styles.header}>
          <h2 className={styles.title}>A infraestrutura completa.</h2>
          <p className={styles.subtitle}>
            Não somos apenas um marketplace. Fornecemos a camada de inteligência, 
            operacional e jurídica para viabilizar operações complexas.
          </p>
        </div>

        <motion.div 
          className={styles.bentoGrid}
          variants={containerVars}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Card 1: Large */}
          <motion.div variants={itemVars} className={styles.bentoItemLarge}>
            <GlassCard className={styles.card}>
              <Scale className={styles.icon} size={28} />
              <h3 className={styles.cardTitle}>Due Diligence & Blindagem Jurídica</h3>
              <p className={styles.cardDesc}>
                Equipe jurídica dedicada à formatação de contratos digitais com validade executiva, validação documental de garantias reais e estruturação segura para mitigar riscos de calote.
              </p>
              <div className={styles.visualMockup}>
                <div className={styles.mockupDoc}>
                  <div className={styles.docLine} style={{width: '60%'}}></div>
                  <div className={styles.docLine} style={{width: '80%'}}></div>
                  <div className={styles.docLine} style={{width: '40%'}}></div>
                  <div className={styles.docStamp}>
                    <ShieldIcon />
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Card 2: Medium */}
          <motion.div variants={itemVars} className={styles.bentoItemMedium}>
            <GlassCard className={styles.card}>
              <Fingerprint className={styles.icon} size={28} />
              <h3 className={styles.cardTitle}>Análise de Risco & Score Próprio</h3>
              <p className={styles.cardDesc}>
                Algoritmos proprietários que cruzam milhares de dados para gerar um rating preciso e transparente de cada operação.
              </p>
            </GlassCard>
          </motion.div>

          {/* Card 3: Small */}
          <motion.div variants={itemVars} className={styles.bentoItemSmall}>
            <GlassCard className={styles.card}>
              <FileText className={styles.icon} size={28} />
              <h3 className={styles.cardTitle}>Contratos Digitais</h3>
              <p className={styles.cardDesc}>Assinatura 100% digital e segura.</p>
            </GlassCard>
          </motion.div>

          {/* Card 4: Small */}
          <motion.div variants={itemVars} className={styles.bentoItemSmall}>
            <GlassCard className={styles.card}>
              <Zap className={styles.icon} size={28} />
              <h3 className={styles.cardTitle}>Cobrança Ativa</h3>
              <p className={styles.cardDesc}>Régua de cobrança inteligente.</p>
            </GlassCard>
          </motion.div>

          {/* Card 5: Medium */}
          <motion.div variants={itemVars} className={styles.bentoItemMedium2}>
            <GlassCard className={styles.card}>
              <LineChart className={styles.icon} size={28} />
              <h3 className={styles.cardTitle}>Acompanhamento & Dashboard</h3>
              <p className={styles.cardDesc}>
                Acompanhe o fluxo financeiro, rendimentos e status de cada ativo em tempo real através de um dashboard intuitivo e poderoso.
              </p>
            </GlassCard>
          </motion.div>
          
        </motion.div>
      </div>
    </section>
  );
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  );
}
