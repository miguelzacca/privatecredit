import React from 'react';
import { motion } from 'framer-motion';
import styles from './Skeleton.module.css';

export function Skeleton({ width, height, borderRadius, style, className }) {
  return (
    <motion.div
      className={`${styles.skeleton} ${className || ''}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius: borderRadius || '8px',
        ...style
      }}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    />
  );
}
