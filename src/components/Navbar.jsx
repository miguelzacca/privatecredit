import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Button } from './Button';
import styles from './Navbar.module.css';
import { Shield } from 'lucide-react';

export function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setIsScrolled(latest > 50);
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={clsx(styles.navbar, isScrolled && styles.scrolled)}
    >
      <div className={clsx('container', styles.inner)}>
        <div className={styles.logo}>
          <Shield size={24} className={styles.logoIcon} />
          <span>LOGO</span>
        </div>
        
        <div className={styles.links}>
          <a href="#solucao">Solução</a>
          <a href="#operacoes">Operações</a>
          <a href="#seguranca">Segurança</a>
        </div>

        <div className={styles.actions}>
          <Link to="/login">
            <Button variant="ghost" size="sm" className={styles.loginBtn}>Entrar</Button>
          </Link>
          <Link to="/login">
            <Button variant="primary" size="sm">Começar</Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
