import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GlassCard } from '../../components/GlassCard';
import { Home, ArrowRightLeft, ShieldCheck, Wallet, Banknote } from 'lucide-react';
import styles from './Flow.module.css';

gsap.registerPlugin(ScrollTrigger);

export function Flow() {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);
  const stepsRef = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const line = lineRef.current;
    const steps = stepsRef.current;

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top center",
        end: "bottom center",
        scrub: 1,
      }
    });

    tl.to(line, {
      height: "100%",
      ease: "none"
    });

    steps.forEach((step, i) => {
      gsap.fromTo(step, 
        { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
        {
          opacity: 1, 
          x: 0,
          scrollTrigger: {
            trigger: step,
            start: "top 80%",
            end: "top 50%",
            scrub: 1,
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const flowSteps = [
    {
      title: "Originação do Ativo",
      desc: "Um corretor vende um imóvel e tem R$ 50k a receber em 12 meses.",
      icon: Home,
    },
    {
      title: "Análise & Estruturação",
      desc: "Nossa tecnologia valida contratos, garantias e risco em tempo real.",
      icon: ShieldCheck,
    },
    {
      title: "Match via Plataforma",
      desc: "O ativo é disponibilizado e adquirido por um investidor qualificado.",
      icon: ArrowRightLeft,
    },
    {
      title: "Liquidez Imediata",
      desc: "O corretor recebe o dinheiro à vista, e o investidor assume o recebível.",
      icon: Wallet,
    },
    {
      title: "Liquidação",
      desc: "A construtora paga as parcelas diretamente na plataforma, rendendo ao investidor.",
      icon: Banknote,
    }
  ];

  return (
    <section className={styles.flowSection} ref={sectionRef}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>O fluxo do capital.</h2>
          <p className={styles.subtitle}>
            Entenda como transformamos ativos ilíquidos em capital de giro imediato, com total segurança jurídica.
          </p>
        </div>

        <div className={styles.timeline}>
          <div className={styles.lineBg} />
          <div className={styles.lineFill} ref={lineRef} />

          {flowSteps.map((step, idx) => (
            <div 
              key={idx} 
              className={styles.stepWrapper}
              ref={el => stepsRef.current[idx] = el}
            >
              <div className={styles.stepContent}>
                <GlassCard className={styles.stepCard}>
                  <div className={styles.stepIconBox}>
                    <step.icon size={24} />
                  </div>
                  <div>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDesc}>{step.desc}</p>
                  </div>
                </GlassCard>
              </div>
              <div className={styles.stepDot}>
                <div className={styles.dotInner} />
              </div>
              <div className={styles.stepEmpty} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
