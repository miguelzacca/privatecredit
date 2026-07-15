import React, { useRef } from 'react';
import clsx from 'clsx';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import styles from './GlassCard.module.css';

export function GlassCard({ 
  children, 
  className,
  hoverEffect = true,
  ...props 
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    if (!hoverEffect) return;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={clsx(styles.card, className)}
      onMouseMove={handleMouseMove}
      {...props}
    >
      {hoverEffect && (
        <motion.div
          className={styles.glow}
          style={{
            background: useMotionTemplate`
              radial-gradient(
                450px circle at ${mouseX}px ${mouseY}px,
                rgba(0, 0, 0, 0.03),
                transparent 80%
              )
            `,
          }}
        />
      )}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
