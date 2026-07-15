import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle2, ChevronRight, UploadCloud, 
  DollarSign, Clock, FileText, Shield, AlertCircle
} from 'lucide-react';
import styles from './SolicitationWizard.module.css';

const steps = [
  { id: 'amount', title: 'Valor e Prazo', icon: <DollarSign size={20} /> },
  { id: 'purpose', title: 'Finalidade', icon: <FileText size={20} /> },
  { id: 'guarantees', title: 'Garantias', icon: <Shield size={20} /> },
  { id: 'review', title: 'Revisão', icon: <CheckCircle2 size={20} /> }
];

export function SolicitationWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    term: '',
    purpose: '',
    description: '',
    guarantees: '',
    files: []
  });

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitSolicitation();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitSolicitation = () => {
    setIsSubmitting(true);
    // Simulate API Call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/dashboard/marketplace?success=true');
    }, 2000);
  };

  return (
    <div className={styles.wizardContainer}>
      <div className={styles.header}>
        <Link to={`/dashboard/marketplace/${id}`} className={styles.backBtn}>
          <ArrowLeft size={16} /> Cancelar e Voltar
        </Link>
        <div className={styles.titleArea}>
          <h1>Solicitar Linha de Crédito</h1>
          <p>Preencha os dados abaixo para enviar sua proposta ao investidor.</p>
        </div>
      </div>

      <div className={styles.wizardBody}>
        <div className={styles.sidebar}>
          <div className={styles.stepsList}>
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`${styles.stepItem} ${index === currentStep ? styles.activeStep : ''} ${index < currentStep ? styles.completedStep : ''}`}
              >
                <div className={styles.stepIcon}>
                  {index < currentStep ? <CheckCircle2 size={16} /> : step.icon}
                </div>
                <div className={styles.stepInfo}>
                  <span className={styles.stepLabel}>Etapa {index + 1}</span>
                  <span className={styles.stepTitle}>{step.title}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.infoBox}>
            <AlertCircle size={20} className={styles.infoIcon} />
            <p>Seus dados estão seguros e serão compartilhados apenas com o investidor selecionado após a sua aprovação.</p>
          </div>
        </div>

        <div className={styles.contentArea}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className={styles.stepContent}
            >
              {currentStep === 0 && (
                <div className={styles.formSection}>
                  <h2>De quanto capital você precisa?</h2>
                  <p className={styles.sectionSubtitle}>Defina o valor e o prazo ideal para sua operação.</p>
                  
                  <div className={styles.inputGroup}>
                    <label>Valor Solicitado</label>
                    <div className={styles.currencyInput}>
                      <span>R$</span>
                      <input 
                        type="text" 
                        placeholder="0,00" 
                        value={formData.amount}
                        onChange={(e) => updateForm('amount', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Prazo Proposto (meses)</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 24" 
                      className={styles.standardInput}
                      value={formData.term}
                      onChange={(e) => updateForm('term', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className={styles.formSection}>
                  <h2>Qual a finalidade deste crédito?</h2>
                  <p className={styles.sectionSubtitle}>Explique brevemente como o recurso será utilizado.</p>
                  
                  <div className={styles.inputGroup}>
                    <label>Tipo de Operação</label>
                    <select 
                      className={styles.standardInput}
                      value={formData.purpose}
                      onChange={(e) => updateForm('purpose', e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      <option value="Capital de Giro">Capital de Giro</option>
                      <option value="Expansão">Expansão de Operações</option>
                      <option value="Equipamentos">Compra de Equipamentos</option>
                      <option value="Imobiliário">Operação Imobiliária (CRI/CRA)</option>
                    </select>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Descrição Detalhada</label>
                    <textarea 
                      placeholder="Descreva o projeto, a expectativa de retorno e por que este capital é importante agora..."
                      className={styles.textArea}
                      value={formData.description}
                      onChange={(e) => updateForm('description', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className={styles.formSection}>
                  <h2>Garantias e Documentos</h2>
                  <p className={styles.sectionSubtitle}>Que garantias sua empresa pode oferecer para esta operação?</p>
                  
                  <div className={styles.inputGroup}>
                    <label>Tipo de Garantia</label>
                    <select 
                      className={styles.standardInput}
                      value={formData.guarantees}
                      onChange={(e) => updateForm('guarantees', e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      <option value="Recebíveis">Recebíveis Performados</option>
                      <option value="Imóvel">Alienação Fiduciária de Imóvel</option>
                      <option value="Aval">Aval dos Sócios</option>
                      <option value="Sem Garantia">Operação Clean (Sem Garantia Real)</option>
                    </select>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Documentos de Suporte (Opcional)</label>
                    <div className={styles.uploadBox}>
                      <UploadCloud size={32} className={styles.uploadIcon} />
                      <h4>Arraste seus arquivos aqui</h4>
                      <p>ou clique para selecionar do seu computador</p>
                      <span className={styles.uploadHint}>Balanço, DRE ou Apresentação do Projeto (PDF até 10MB)</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className={styles.formSection}>
                  <h2>Revisão da Solicitação</h2>
                  <p className={styles.sectionSubtitle}>Confira os dados antes de enviar sua proposta para o investidor.</p>
                  
                  <div className={styles.reviewCard}>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Valor Solicitado</span>
                      <span className={styles.reviewValue}>R$ {formData.amount || '0,00'}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Prazo</span>
                      <span className={styles.reviewValue}>{formData.term || '0'} meses</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Finalidade</span>
                      <span className={styles.reviewValue}>{formData.purpose || '-'}</span>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Garantia</span>
                      <span className={styles.reviewValue}>{formData.guarantees || '-'}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className={styles.footerActions}>
            <button 
              className={styles.prevBtn} 
              onClick={handlePrev}
              disabled={currentStep === 0 || isSubmitting}
            >
              Voltar
            </button>
            <button 
              className={styles.nextBtn} 
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : currentStep === steps.length - 1 ? 'Enviar Solicitação' : 'Continuar'}
              {!isSubmitting && currentStep < steps.length - 1 && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
