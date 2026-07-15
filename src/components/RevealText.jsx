import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import styles from './RevealText.module.css';

export function RevealText({ 
  text, 
  className,
  delay = 0,
  as: Component = 'h1'
}) {
  // Split text into words for staggered animation
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(10px)',
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <Component className={clsx(styles.reveal, className)}>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className={styles.wordContainer}
      >
        {words.map((word, index) => (
          <motion.span
            variants={child}
            style={{ display: 'inline-block', marginRight: '0.25em' }}
            key={index}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    </Component>
  );
}
