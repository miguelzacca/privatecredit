import React from 'react';
import { Button } from '../../components/Button';
import { ArrowRight, Shield } from 'lucide-react';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        
        <div className={styles.ctaBox}>
          <h2 className={styles.ctaTitle}>Pronto para operar no mais alto nível?</h2>
          <p className={styles.ctaDesc}>
            Junte-se à plataforma que está redefinindo o crédito privado.
          </p>
          <div className={styles.ctaActions}>
            <Button size="lg" icon={ArrowRight}>Abrir conta gratuita</Button>
            <Button size="lg" variant="ghost">Falar com especialista</Button>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <Shield size={24} className={styles.logoIcon} />
              <span>LOGO</span>
            </div>
            <p className={styles.brandText}>
              A infraestrutura definitiva para operações de crédito e recebíveis.
            </p>
          </div>
          
          <div className={styles.linksGrid}>
            <div>
              <h4>Plataforma</h4>
              <a href="#">Para Originadores</a>
              <a href="#">Para Investidores</a>
              <a href="#">Tecnologia</a>
              <a href="#">Segurança</a>
            </div>
            <div>
              <h4>Empresa</h4>
              <a href="#">Sobre nós</a>
              <a href="#">Carreiras</a>
              <a href="#">Contato</a>
              <a href="#">Imprensa</a>
            </div>
            <div>
              <h4>Legal</h4>
              <a href="#">Termos de Uso</a>
              <a href="#">Privacidade</a>
              <a href="#">Compliance</a>
            </div>
          </div>
        </div>
        
        <div className={styles.copyright}>
          <p>© {new Date().getFullYear()} LOGO S.A. Todos os direitos reservados.</p>
        </div>
        
      </div>
    </footer>
  );
}
