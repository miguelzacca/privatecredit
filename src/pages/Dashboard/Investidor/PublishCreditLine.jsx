import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Info, Rocket } from 'lucide-react';
import styles from './PublishCreditLine.module.css';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// Custom Toggle Component
const Toggle = ({ checked, onChange }) => (
  <div 
    onClick={() => onChange(!checked)}
    style={{
      width: '44px', height: '24px', borderRadius: '12px',
      background: checked ? '#111' : '#e5e5e5',
      display: 'flex', alignItems: 'center', padding: '2px',
      cursor: 'pointer', transition: 'background 0.2s',
      justifyContent: checked ? 'flex-end' : 'flex-start'
    }}
  >
    <motion.div 
      layout
      transition={{ type: "spring", stiffness: 700, damping: 30 }}
      style={{ width: '20px', height: '20px', borderRadius: '10px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
    />
  </div>
);

export function PublishCreditLine() {
  const navigate = useNavigate();
  
  // Form State
  const [operations, setOperations] = useState([]);
  const [segments, setSegments] = useState([]);
  const [amortization, setAmortization] = useState(true);
  const [negotiation, setNegotiation] = useState(true);
  const [manualAnalysis, setManualAnalysis] = useState(true);

  const operationTypes = [
    'Antecipação de comissão', 'Capital de giro', 'Recebíveis', 
    'Compra de materiais', 'Operações imobiliárias', 'Outros'
  ];

  const segmentTypes = [
    'Construtoras', 'Empresas', 'Corretores', 'Fornecedores', 'Pessoas físicas', 'Outros'
  ];

  const toggleArrayItem = (array, setArray, item) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const handlePublish = () => {
    // Simulate API call and redirect
    setTimeout(() => {
      navigate('/dashboard/investidor');
    }, 800);
  };

  return (
    <div className={styles.container}>
      <Link to="/dashboard/investidor" className={styles.backBtn}>
        <ArrowLeft size={16} /> Voltar para o Dashboard
      </Link>
      
      <div className={styles.header}>
        <h1 className={styles.title}>Publicar Linha de Crédito</h1>
        <p className={styles.subtitle}>Defina as regras, taxas e condições. Sua oferta entrará automaticamente no Marketplace.</p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show">
        {/* Valores e Taxas */}
        <motion.div variants={itemVariants} className={styles.section}>
          <div className={styles.sectionTitle}>Condições Financeiras</div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Valor total disponível</label>
              <div className={styles.inputWrapper}>
                <span className={styles.prefix}>R$</span>
                <input type="text" className={`${styles.input} ${styles.withPrefix}`} placeholder="100.000,00" />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Taxa de Juros Mensal</label>
              <div className={styles.inputWrapper}>
                <input type="text" className={`${styles.input} ${styles.withSuffix}`} placeholder="3,00" />
                <span className={styles.suffix}>%</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Valor Mínimo por Operação</label>
              <div className={styles.inputWrapper}>
                <span className={styles.prefix}>R$</span>
                <input type="text" className={`${styles.input} ${styles.withPrefix}`} placeholder="20.000,00" />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Valor Máximo por Operação</label>
              <div className={styles.inputWrapper}>
                <span className={styles.prefix}>R$</span>
                <input type="text" className={`${styles.input} ${styles.withPrefix}`} placeholder="100.000,00" />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Prazo Máximo</label>
              <select className={styles.input}>
                <option value="6">6 meses</option>
                <option value="12">12 meses</option>
                <option value="24">24 meses</option>
                <option value="36">36 meses</option>
                <option value="48">48 meses</option>
                <option value="60">60 meses</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Tipos e Segmentos */}
        <motion.div variants={itemVariants} className={styles.section}>
          <div className={styles.sectionTitle}>Direcionamento</div>
          
          <div className={styles.formGroup} style={{ marginBottom: '32px' }}>
            <label className={styles.label} style={{ marginBottom: '16px' }}>Tipos de Operação Aceitos</label>
            <div className={styles.checkboxGrid}>
              {operationTypes.map(type => {
                const isSelected = operations.includes(type);
                return (
                  <div 
                    key={type} 
                    className={`${styles.checkboxCard} ${isSelected ? styles.selected : ''}`}
                    onClick={() => toggleArrayItem(operations, setOperations, type)}
                  >
                    <div className={styles.checkboxIcon}>
                      {isSelected && <Check size={14} />}
                    </div>
                    <span className={styles.checkboxLabel}>{type}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} style={{ marginBottom: '16px' }}>Segmentos Aceitos</label>
            <div className={styles.checkboxGrid}>
              {segmentTypes.map(type => {
                const isSelected = segments.includes(type);
                return (
                  <div 
                    key={type} 
                    className={`${styles.checkboxCard} ${isSelected ? styles.selected : ''}`}
                    onClick={() => toggleArrayItem(segments, setSegments, type)}
                  >
                    <div className={styles.checkboxIcon}>
                      {isSelected && <Check size={14} />}
                    </div>
                    <span className={styles.checkboxLabel}>{type}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Detalhes Adicionais */}
        <motion.div variants={itemVariants} className={styles.section}>
          <div className={styles.sectionTitle}>Detalhes e Garantias</div>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.full}`}>
              <label className={styles.label}>Garantias Exigidas <span>(Opcional)</span></label>
              <input type="text" className={styles.input} placeholder="Ex: Imóveis urbanos, recebíveis de cartão..." />
            </div>
            <div className={`${styles.formGroup} ${styles.full}`}>
              <label className={styles.label}>Descrição da Estratégia</label>
              <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Explique um pouco mais sobre o perfil de crédito que você busca, requisitos específicos ou observações para os tomadores..." />
            </div>
          </div>
        </motion.div>

        {/* Regras e Disponibilidade */}
        <motion.div variants={itemVariants} className={styles.section}>
          <div className={styles.sectionTitle}>Regras de Negócio</div>
          <div className={styles.toggleGrid}>
            <div className={styles.toggleCard}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleTitle}>Amortização Antecipada</span>
                <span className={styles.toggleDesc}>Permite que o tomador pague antes do prazo sem penalidades.</span>
              </div>
              <Toggle checked={amortization} onChange={setAmortization} />
            </div>

            <div className={styles.toggleCard}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleTitle}>Negociação de Taxa</span>
                <span className={styles.toggleDesc}>Tomadores podem sugerir taxas menores na proposta.</span>
              </div>
              <Toggle checked={negotiation} onChange={setNegotiation} />
            </div>

            <div className={styles.toggleCard}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleTitle}>Análise Manual</span>
                <span className={styles.toggleDesc}>Você revisará cada solicitação antes da aprovação final.</span>
              </div>
              <Toggle checked={manualAnalysis} onChange={setManualAnalysis} />
            </div>
          </div>
          
          <div className={styles.formGrid} style={{ marginTop: '32px' }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Disponibilidade</label>
              <select className={styles.input}>
                <option value="imediata">Imediata</option>
                <option value="aprovacao">Após aprovação</option>
                <option value="consulta">Sob consulta</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Validade da Oferta</label>
              <select className={styles.input}>
                <option value="30">30 dias</option>
                <option value="60">60 dias</option>
                <option value="90">90 dias</option>
                <option value="sem_validade">Sem validade</option>
              </select>
            </div>
          </div>
        </motion.div>

      </motion.div>

      {/* Sticky Action Bar */}
      <div className={styles.actionBar}>
        <div className={styles.actionInfo}>
          <Info size={18} />
          <span>Sua oferta ficará visível imediatamente após a publicação.</span>
        </div>
        <div className={styles.actionBtns}>
          <button className={styles.cancelBtn} onClick={() => navigate('/dashboard/investidor')}>
            Cancelar
          </button>
          <button className={styles.publishBtn} onClick={handlePublish}>
            <Rocket size={18} />
            Publicar Linha de Crédito
          </button>
        </div>
      </div>
    </div>
  );
}
