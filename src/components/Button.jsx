import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import styles from './Button.module.css';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  icon: Icon,
  as: Component = 'button',
  ...props 
}) {
  return (
    <Component 
      className={clsx(
        styles.button,
        styles[variant],
        styles[size],
        className
      )}
      {...props}
    >
      {children}
      {Icon && <Icon className={styles.icon} size={18} />}
    </Component>
  );
}
