import React from 'react';
import { Shield, Lock, FileKey } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import styles from './Security.module.css';

export function Security() {
  return (
    <section className={styles.security} id="seguranca">
      <div className="container">
        <div className={styles.wrapper}>
          <div className={styles.content}>
            <div className={styles.badge}>
              <Shield size={16} />
              Nível Institucional
            </div>
            <h2 className={styles.title}>Blindagem<br/>Jurídica Total.</h2>
            <p className={styles.subtitle}>
              Não delegamos segurança. Nossa equipe jurídica interna formata, 
              valida e executa contratos com garantia real. Se houver falha, 
              nossa infraestrutura atua na recuperação.
            </p>
            
            <ul className={styles.list}>
              <li>
                <div className={styles.iconBox}><Lock size={18}/></div>
                <div>
                  <h4>Garantias Reais</h4>
                  <p>Imóveis e recebíveis performados como colateral.</p>
                </div>
              </li>
              <li>
                <div className={styles.iconBox}><FileKey size={18}/></div>
                <div>
                  <h4>Contratos Executivos</h4>
                  <p>Força de título executivo extrajudicial.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className={styles.visual}>
            <GlassCard className={styles.card} hoverEffect={false}>
              <div className={styles.cardInner}>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Status Jurídico</span>
                  <span className={styles.statusBadge}>Protegido</span>
                </div>
                
                <div className={styles.docMockup}>
                  <div className={styles.docHeader}>
                    <div className={styles.line} style={{width: '40%'}}/>
                    <div className={styles.line} style={{width: '20%'}}/>
                  </div>
                  <div className={styles.docBody}>
                    <div className={styles.line} style={{width: '100%'}}/>
                    <div className={styles.line} style={{width: '100%'}}/>
                    <div className={styles.line} style={{width: '80%'}}/>
                    <div className={styles.line} style={{width: '90%'}}/>
                  </div>
                  <div className={styles.docSign}>
                    <div className={styles.signMark}>Assinado Digitalmente</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
