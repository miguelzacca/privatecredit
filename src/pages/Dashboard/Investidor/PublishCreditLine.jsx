import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Building2, HardHat, Briefcase, Truck, User, FileText, Home, BadgeDollarSign, ShieldCheck, FileSignature, AlertCircle, CheckCircle2, Loader2, Landmark } from 'lucide-react';
import axios from 'axios';
import styles from './PublishCreditLine.module.css';

// --- Premium Components ---

const PremiumToggle = ({ checked, onChange }) => (
  <div 
    onClick={() => onChange(!checked)}
    style={{
      width: '52px', height: '32px', borderRadius: '16px',
      background: checked ? '#111' : '#e5e5e5',
      display: 'flex', alignItems: 'center', padding: '2px 4px',
      cursor: 'pointer', transition: 'background 0.3s ease',
      justifyContent: checked ? 'flex-end' : 'flex-start'
    }}
  >
    <motion.div 
      layout
      transition={{ type: "spring", stiffness: 700, damping: 30 }}
      style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
    />
  </div>
);

// --- Main Component ---

export function PublishCreditLine() {
  const navigate = useNavigate();
  
  // State Machine
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Form State
  const [capital, setCapital] = useState(500000);
  const [interestRate, setInterestRate] = useState(2.8);
  const [duration, setDuration] = useState(36);
  const [amortization, setAmortization] = useState(true);
  const [negotiation, setNegotiation] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [selectedGuarantees, setSelectedGuarantees] = useState([]);

  const [isPublishing, setIsPublishing] = useState(false);
  const [validationStep, setValidationStep] = useState(0);

  // Constants
  const segments = [
    { id: 'empresas', title: 'Empresas', desc: 'B2B em geral', icon: Building2 },
    { id: 'construtoras', title: 'Construtoras', desc: 'Obras e incorporações', icon: HardHat },
    { id: 'corretores', title: 'Corretores', desc: 'Profissionais do setor', icon: Briefcase },
    { id: 'fornecedores', title: 'Fornecedores', desc: 'Materiais e serviços', icon: Truck },
    { id: 'pf', title: 'Pessoa Física', desc: 'Consumidor final', icon: User },
  ];

  const guarantees = [
    { id: 'imovel', title: 'Imóvel', desc: 'Alienação fiduciária', icon: Home },
    { id: 'recebiveis', title: 'Recebíveis', desc: 'Cartões e duplicatas', icon: BadgeDollarSign },
    { id: 'avalista', title: 'Avalista', desc: 'Garantia pessoal', icon: ShieldCheck },
    { id: 'contrato', title: 'Contrato', desc: 'Cessão de direitos', icon: FileSignature },
    { id: 'nenhuma', title: 'Sem Garantia', desc: 'Clean, maior risco', icon: AlertCircle },
  ];

  // Helpers
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value).replace('R$', '').trim();
  };

  const toggleArrayItem = (array, setArray, item) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    
    // Simulate validation steps
    setTimeout(() => setValidationStep(1), 1000); // Validating structure
    setTimeout(() => setValidationStep(2), 2500); // Checking conditions

    try {
      // Import axios if not done globally (or we'll just add it to the top of file)
      // Save to real database
      const payload = {
        capital,
        interestRate,
        duration,
        amortization,
        negotiation,
        segments: selectedSegments.map(id => segments.find(s => s.id === id)?.title),
        guarantees: selectedGuarantees.map(id => guarantees.find(g => g.id === id)?.title),
      };
      
      const res = await axios.post('/api/credit-lines', payload);
      
      if (res.status !== 201) {
        console.error('Failed to publish credit line');
      }

      setValidationStep(3); // Ready
      
      // Final redirect
      setTimeout(() => {
        navigate('/dashboard/marketplace');
      }, 1500);
      
    } catch (err) {
      console.error('Error publishing:', err);
      // fallback just in case
      setTimeout(() => navigate('/dashboard/marketplace'), 1500);
    }
  };

  // Variants for step transitions
  const stepVariants = {
    initial: (direction) => ({
      opacity: 0,
      x: direction > 0 ? 50 : -50,
      filter: 'blur(10px)',
    }),
    animate: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction < 0 ? 50 : -50,
      filter: 'blur(10px)',
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    })
  };

  // Determine direction for animation
  const [[page, direction], setPage] = useState([1, 0]);
  useEffect(() => {
    setPage([step, step > page ? 1 : -1]);
  }, [step]);

  return (
    <div className={styles.container}>
      {/* Header & Progress */}
      <header className={styles.header}>
        <button className={styles.closeBtn} onClick={() => navigate('/dashboard/investidor')}>
          <X size={16} /> Fechar
        </button>
        
        <div className={styles.progressContainer}>
          {['Capital', 'Condições', 'Público', 'Garantias', 'Revisão'].map((label, idx) => {
            const num = idx + 1;
            const isActive = step === num;
            const isCompleted = step > num;
            return (
              <React.Fragment key={num}>
                <div className={`${styles.progressStep} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
                  <div className={styles.stepNumber}>
                    {isCompleted ? <CheckCircle2 size={12} color="#fff" /> : num}
                  </div>
                  <span>{label}</span>
                </div>
                {num < totalSteps && <div className={styles.progressLine} />}
              </React.Fragment>
            );
          })}
        </div>
        
        <div style={{ width: '80px' }} /> {/* Spacer to balance flex-between */}
      </header>

      {/* Main Content */}
      <main className={styles.contentArea}>
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div key="step1" custom={direction} variants={stepVariants} initial="initial" animate="animate" exit="exit" className={`${styles.stepWrapper} ${styles.active}`}>
              <div className={styles.stepContent}>
                <h1 className={styles.stepTitle}>Quanto você deseja disponibilizar?</h1>
                <p className={styles.stepSubtitle}>Defina o volume total desta linha de crédito.</p>

                <div className={styles.capitalContainer}>
                  <div className={styles.hugeNumberWrapper}>
                    <span className={styles.currency}>R$</span>
                    <motion.div 
                      key={capital}
                      initial={{ scale: 0.95, opacity: 0.8 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className={styles.hugeNumber}
                    >
                      {formatCurrency(capital)}
                    </motion.div>
                  </div>

                  <input 
                    type="range" 
                    min="50000" 
                    max="10000000" 
                    step="50000" 
                    value={capital} 
                    onChange={(e) => setCapital(Number(e.target.value))}
                    className={styles.capitalSlider}
                  />

                  <div className={styles.quickButtons}>
                    {[50000, 100000, 250000, 500000, 1000000, 5000000].map(val => (
                      <button key={val} className={styles.quickBtn} onClick={() => setCapital(val)}>
                        {val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" custom={direction} variants={stepVariants} initial="initial" animate="animate" exit="exit" className={`${styles.stepWrapper} ${styles.active}`}>
              <div className={styles.stepContent}>
                <h1 className={styles.stepTitle}>Condições da Linha</h1>
                <p className={styles.stepSubtitle}>Estabeleça as regras financeiras da operação.</p>

                <div className={styles.conditionsGrid}>
                  <div className={styles.conditionBlock}>
                    <div className={styles.blockHeader}>
                      <span className={styles.blockTitle}>Taxa de juros (ao mês)</span>
                      <motion.div 
                        key={interestRate}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={styles.blockValue}
                      >
                        {interestRate.toFixed(2)}<span>%</span>
                      </motion.div>
                    </div>
                    <input 
                      type="range" min="0.5" max="10.0" step="0.1" 
                      value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                      className={styles.capitalSlider} style={{ maxWidth: '100%' }}
                    />
                    <div className={styles.impactBadge} style={{ background: interestRate < 2 ? '#f0fdf4' : interestRate > 5 ? '#fef2f2' : '#f8fafc', color: interestRate < 2 ? '#166534' : interestRate > 5 ? '#991b1b' : '#334155' }}>
                      {interestRate < 2 ? 'Excelente competitividade' : interestRate > 5 ? 'Retorno elevado (Alto risco)' : 'Taxa equilibrada'}
                    </div>
                  </div>

                  <div className={styles.conditionBlock}>
                    <div className={styles.blockHeader}>
                      <span className={styles.blockTitle}>Prazo máximo</span>
                    </div>
                    <div className={styles.chipsGrid}>
                      {[12, 24, 36, 48, 60].map(m => (
                        <div 
                          key={m} 
                          onClick={() => setDuration(m)}
                          className={`${styles.chip} ${duration === m ? styles.active : ''}`}
                        >
                          {m} meses
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.toggleRow}>
                    <div className={styles.toggleInfo}>
                      <span className={styles.toggleTitle}>Amortização antecipada</span>
                      <span className={styles.toggleDesc}>Permitir pagamento antes do prazo sem multa.</span>
                    </div>
                    <PremiumToggle checked={amortization} onChange={setAmortization} />
                  </div>

                  <div className={styles.toggleRow}>
                    <div className={styles.toggleInfo}>
                      <span className={styles.toggleTitle}>Aceita negociação</span>
                      <span className={styles.toggleDesc}>Tomadores podem sugerir taxas ou prazos diferentes.</span>
                    </div>
                    <PremiumToggle checked={negotiation} onChange={setNegotiation} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" custom={direction} variants={stepVariants} initial="initial" animate="animate" exit="exit" className={`${styles.stepWrapper} ${styles.active}`}>
              <div className={styles.stepContent}>
                <h1 className={styles.stepTitle}>Quem pode solicitar?</h1>
                <p className={styles.stepSubtitle}>Selecione os segmentos alvo para esta linha de crédito.</p>

                <div className={styles.cardsGrid}>
                  {segments.map(seg => {
                    const isSelected = selectedSegments.includes(seg.id);
                    const Icon = seg.icon;
                    return (
                      <div 
                        key={seg.id} 
                        className={`${styles.premiumCard} ${isSelected ? styles.selected : ''}`}
                        onClick={() => toggleArrayItem(selectedSegments, setSelectedSegments, seg.id)}
                      >
                        <div className={styles.cardIconWrapper}>
                          <Icon size={28} strokeWidth={1.5} />
                        </div>
                        <span className={styles.cardTitle}>{seg.title}</span>
                        <span className={styles.cardDesc}>{seg.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" custom={direction} variants={stepVariants} initial="initial" animate="animate" exit="exit" className={`${styles.stepWrapper} ${styles.active}`}>
              <div className={styles.stepContent}>
                <h1 className={styles.stepTitle}>Garantias exigidas</h1>
                <p className={styles.stepSubtitle}>Quais garantias você exige para aprovar as operações?</p>

                <div className={styles.cardsGrid}>
                  {guarantees.map(gar => {
                    const isSelected = selectedGuarantees.includes(gar.id);
                    const Icon = gar.icon;
                    return (
                      <div 
                        key={gar.id} 
                        className={`${styles.premiumCard} ${isSelected ? styles.selected : ''}`}
                        onClick={() => toggleArrayItem(selectedGuarantees, setSelectedGuarantees, gar.id)}
                      >
                        <div className={styles.cardIconWrapper}>
                          <Icon size={28} strokeWidth={1.5} />
                        </div>
                        <span className={styles.cardTitle}>{gar.title}</span>
                        <span className={styles.cardDesc}>{gar.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" custom={direction} variants={stepVariants} initial="initial" animate="animate" exit="exit" className={`${styles.stepWrapper} ${styles.active}`}>
              <div className={styles.stepContent}>
                <h1 className={styles.stepTitle}>Revisão</h1>
                <p className={styles.stepSubtitle}>Confira os detalhes da estrutura antes de disponibilizar ao mercado.</p>

                <div className={styles.prospectus}>
                  <div className={styles.prosHeader}>
                    <div className={styles.prosLabel}>Capital Disponível</div>
                    <div className={styles.prosAmount}>R$ {formatCurrency(capital)}</div>
                  </div>

                  <div className={styles.prosGrid}>
                    <div className={styles.prosItem}>
                      <span className={styles.prosItemLabel}>Taxa de Juros</span>
                      <span className={styles.prosItemValue}>{interestRate.toFixed(2)}% a.m.</span>
                    </div>
                    <div className={styles.prosItem}>
                      <span className={styles.prosItemLabel}>Prazo Máximo</span>
                      <span className={styles.prosItemValue}>{duration} meses</span>
                    </div>
                    <div className={styles.prosItem} style={{ gridColumn: '1 / -1' }}>
                      <span className={styles.prosItemLabel}>Público Alvo</span>
                      <div className={styles.prosTags}>
                        {selectedSegments.length > 0 
                          ? selectedSegments.map(id => <span key={id} className={styles.prosTag}>{segments.find(s => s.id === id)?.title}</span>)
                          : <span className={styles.prosTag}>Qualquer público</span>
                        }
                      </div>
                    </div>
                    <div className={styles.prosItem} style={{ gridColumn: '1 / -1' }}>
                      <span className={styles.prosItemLabel}>Garantias</span>
                      <div className={styles.prosTags}>
                        {selectedGuarantees.length > 0 
                          ? selectedGuarantees.map(id => <span key={id} className={styles.prosTag}>{guarantees.find(g => g.id === id)?.title}</span>)
                          : <span className={styles.prosTag}>Sob análise</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Action Bar */}
      <div className={styles.bottomActions}>
        {step > 1 ? (
          <button className={styles.backBtn} onClick={prevStep}>
            <ArrowLeft size={16} /> Voltar
          </button>
        ) : <div />}

        {step < totalSteps ? (
          <button className={styles.nextBtn} onClick={nextStep}>
            Continuar <ArrowRight size={16} />
          </button>
        ) : (
          <button className={styles.nextBtn} onClick={handlePublish} style={{ background: '#000', color: '#fff' }}>
            Publicar Linha de Crédito
          </button>
        )}
      </div>

      {/* Publishing Overlay Animation */}
      <AnimatePresence>
        {isPublishing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.validationOverlay}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={styles.valSteps}
            >
              <div className={`${styles.valStep} ${validationStep >= 0 ? styles.active : ''}`}>
                <div className={styles.valIconWrapper}>
                  {validationStep > 0 ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                      <CheckCircle2 size={16} />
                    </motion.div>
                  ) : <Loader2 size={16} className="animate-spin" />}
                </div>
                Validando estrutura...
              </div>
              <div className={`${styles.valStep} ${validationStep >= 1 ? styles.active : ''}`}>
                <div className={styles.valIconWrapper}>
                  {validationStep > 1 ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                      <CheckCircle2 size={16} />
                    </motion.div>
                  ) : validationStep === 1 ? <Loader2 size={16} className="animate-spin" /> : null}
                </div>
                Verificando condições...
              </div>
              <div className={`${styles.valStep} ${validationStep >= 2 ? styles.active : ''}`}>
                <div className={styles.valIconWrapper}>
                  {validationStep > 2 ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                      <CheckCircle2 size={16} />
                    </motion.div>
                  ) : validationStep === 2 ? <Loader2 size={16} className="animate-spin" /> : null}
                </div>
                Preparando disponibilidade...
              </div>
              
              {validationStep >= 3 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '48px', gap: '16px' }}
                >
                  <div style={{ width: '64px', height: '64px', background: '#111', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <Landmark size={32} />
                  </div>
                  <span style={{ fontSize: '24px', fontWeight: '600', color: '#111' }}>Linha publicada no Marketplace</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
