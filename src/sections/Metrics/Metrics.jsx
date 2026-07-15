import React from 'react';
import CountUpLib from 'react-countup';
const CountUp = CountUpLib.default ? CountUpLib.default : CountUpLib;
import { useInView } from 'react-intersection-observer';
import styles from './Metrics.module.css';
import clsx from 'clsx';

export function Metrics() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const metrics = [
    { value: 2.4, suffix: 'bi+', label: 'Transacionados na plataforma', prefix: 'R$ ' },
    { value: 120, suffix: '+', label: 'Fundos parceiros' },
    { value: 0, suffix: '%', label: 'Índice de inadimplência institucional' },
    { value: 24, suffix: 'h', label: 'Tempo médio de liquidação' }
  ];

  return (
    <section className={styles.metrics} ref={ref}>
      <div className={clsx('container', styles.container)}>
        {metrics.map((metric, idx) => (
          <div key={idx} className={styles.metricItem}>
            <div className={styles.value}>
              {metric.prefix}
              {inView ? (
                <CountUp
                  start={0}
                  end={metric.value}
                  duration={2.5}
                  separator="."
                  decimals={metric.value % 1 !== 0 ? 1 : 0}
                  decimal=","
                />
              ) : '0'}
              {metric.suffix}
            </div>
            <div className={styles.label}>{metric.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
