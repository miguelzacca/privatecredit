import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import clsx from 'clsx';
import { Button } from '../../components/Button';
import { RevealText } from '../../components/RevealText';
import { GlassCard } from '../../components/GlassCard';
import { ArrowRight, BarChart3, TrendingUp, Lock } from 'lucide-react';
import styles from './Hero.module.css';

export function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className={styles.hero}>
      {/* Background glow effects */}
      <div className={styles.glowBg} />

      <div className={clsx('container', styles.container)}>
        <motion.div 
          className={styles.content}
          style={{ opacity, y: y1 }}
        >
          <div className={styles.badge}>
            <span className={styles.pulse} />
            A nova infraestrutura de crédito privado
          </div>
          
          <RevealText 
            text="Liquidez imediata. Segurança institucional."
            className={styles.title}
          />
          
          <motion.p 
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Conectamos originadores de alto padrão a investidores qualificados. 
            Antecipe recebíveis, estruture operações e invista com a plataforma 
            que movimenta o mercado com tecnologia de classe mundial.
          </motion.p>

          <motion.div 
            className={styles.actions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Button size="lg" icon={ArrowRight}>Abrir conta</Button>
            <Button size="lg" variant="secondary">Falar com especialista</Button>
          </motion.div>
        </motion.div>

        {/* Abstract Floating UI */}
        <motion.div 
          className={styles.visuals}
          style={{ y: y2 }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.mockupWrapper}>
            <GlassCard className={styles.mainMockup} hoverEffect={false}>
              <div className={styles.mockupHeader}>
                <div className={styles.mockupTitle}>Volume Transacionado</div>
                <div className={styles.mockupValue}>R$ 48.500.000</div>
              </div>
              <div className={styles.mockupChart}>
                <div className={styles.bar} style={{height: '40%'}}></div>
                <div className={styles.bar} style={{height: '65%'}}></div>
                <div className={styles.bar} style={{height: '45%'}}></div>
                <div className={styles.bar} style={{height: '80%'}}></div>
                <div className={styles.bar} style={{height: '100%', background: 'var(--color-text-primary)'}}></div>
              </div>
            </GlassCard>

            <div className={styles.floatingCard1}>
              <GlassCard className={styles.miniCard}>
                <Lock size={18} className={styles.iconBlue} />
                <div>
                  <div className={styles.miniLabel}>Blindagem Jurídica</div>
                  <div className={styles.miniValue}>Ativa</div>
                </div>
              </GlassCard>
            </div>

            <div className={styles.floatingCard2}>
              <GlassCard className={styles.miniCard}>
                <TrendingUp size={18} className={styles.iconGreen} />
                <div>
                  <div className={styles.miniLabel}>Rendimento (a.a)</div>
                  <div className={styles.miniValue}>18.5%</div>
                </div>
              </GlassCard>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
