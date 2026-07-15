import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ArrowLeft, Check, ShieldCheck, 
  MapPin, Landmark, FileSignature, AlertCircle, Loader2 
} from 'lucide-react';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import styles from './InvestorProfileWizard.module.css';

const steps = [
  { id: 1, title: 'Identidade' },
  { id: 2, title: 'Endereço' },
  { id: 3, title: 'Dados Bancários' },
  { id: 4, title: 'Declarações' },
  { id: 5, title: 'Termos' },
];

export function InvestorProfileWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [cpf, setCpf] = useState('');
  const [identityData, setIdentityData] = useState(null);
  
  const [cep, setCep] = useState('');
  const [addressData, setAddressData] = useState({
    street: '', neighborhood: '', city: '', state: '', number: '', complement: ''
  });
  
  const [bankData, setBankData] = useState({
    bank: '', agency: '', account: '', accountType: '', pix: ''
  });
  
  const [declarations, setDeclarations] = useState({
    d1: false, d2: false, d3: false, d4: false
  });
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const sigCanvas = useRef({});
  const [isFinished, setIsFinished] = useState(false);

  // Masks
  const handleCpfChange = async (e) => {
    setError('');
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    
    // Mask CPF
    let masked = val;
    if (val.length > 9) masked = val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    else if (val.length > 6) masked = val.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    else if (val.length > 3) masked = val.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    
    setCpf(masked);

    // Auto Fetch CPF
    if (val.length === 11) {
      setIsLoading(true);
      try {
        const { data } = await axios.post('/api/apifull', { cpf: val });
        if (data.status === 'sucesso' && data.dados) {
          if (data.dados.situacaoRFB !== 'REGULAR') {
            setError('CPF Irregular na Receita Federal. É necessário regularizar antes de operar.');
          } else {
            setIdentityData(data.dados);
          }
        } else {
          setError('Não foi possível validar o CPF.');
        }
      } catch (err) {
        setError('Erro ao consultar o CPF.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIdentityData(null);
    }
  };

  const handleCepChange = async (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    
    let masked = val;
    if (val.length > 5) masked = val.replace(/(\d{5})(\d{1,3})/, "$1-$2");
    
    setCep(masked);

    if (val.length === 8) {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`https://viacep.com.br/ws/${val}/json/`);
        if (!data.erro) {
          setAddressData(prev => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeclarationToggle = (id) => {
    setDeclarations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const canProceed = () => {
    if (step === 1) return identityData && identityData.situacaoRFB === 'REGULAR';
    if (step === 2) return addressData.street && addressData.number && addressData.city;
    if (step === 3) return bankData.bank && bankData.agency && bankData.account && bankData.accountType;
    if (step === 4) return Object.values(declarations).every(v => v);
    if (step === 5) {
      const sigData = sigCanvas.current.getTrimmedCanvas?.().toDataURL('image/png');
      return acceptedTerms && sigData && sigData !== 'data:,'; // Ensure signature exists
    }
    return true;
  };

  const submitProfile = async () => {
    setIsLoading(true);
    try {
      const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      
      await axios.post('/api/investor-profile', {
        cpf: identityData.cpf,
        fullName: identityData.nome,
        birthDate: identityData.dataNascimento,
        gender: identityData.sexo,
        motherName: identityData.nomeMae,
        rg: identityData.documentos?.rg?.numero,
        statusRFB: identityData.situacaoRFB,
        
        cep: cep.replace(/\D/g, ''),
        ...addressData,
        ...bankData,
        
        acceptedTerms,
        signature
      });
      
      setIsFinished(true);
    } catch (err) {
      setError('Ocorreu um erro ao salvar seu perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 5) {
      submitProfile();
    } else {
      setStep(s => Math.min(s + 1, 5));
    }
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // Renders
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className={styles.stepTitle}><ShieldCheck /> Verificação de Identidade</h2>
            
            <div className={styles.inputGroup}>
              <label>CPF</label>
              <input 
                type="text" 
                className={styles.input} 
                value={cpf} 
                onChange={handleCpfChange} 
                placeholder="000.000.000-00" 
              />
            </div>

            {isLoading && (
              <div className={styles.loadingOverlay}>
                <Loader2 size={32} />
                <p>Consultando base da Receita Federal...</p>
              </div>
            )}

            {error && (
              <div className={styles.errorMsg}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {identityData && identityData.situacaoRFB === 'REGULAR' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.cardsGrid}>
                <div className={styles.infoCard}>
                  <span className={styles.infoCardLabel}>Nome Completo</span>
                  <span className={styles.infoCardValue}>{identityData.nome}</span>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.infoCardLabel}>Data de Nascimento</span>
                  <span className={styles.infoCardValue}>{identityData.dataNascimento}</span>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.infoCardLabel}>Situação RFB</span>
                  <span className={styles.infoCardValue} style={{ color: '#059669', fontWeight: 600 }}>{identityData.situacaoRFB}</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className={styles.stepTitle}><MapPin /> Endereço Residencial</h2>
            <div className={styles.row}>
              <div className={styles.col}>
                <div className={styles.inputGroup}>
                  <label>CEP</label>
                  <input type="text" className={styles.input} value={cep} onChange={handleCepChange} placeholder="00000-000" />
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.inputGroup}>
                  <label>Número</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={addressData.number} 
                    onChange={e => setAddressData({...addressData, number: e.target.value})} 
                  />
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.inputGroup}>
                  <label>Complemento</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={addressData.complement} 
                    onChange={e => setAddressData({...addressData, complement: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.col}>
                <div className={styles.inputGroup}>
                  <label>Rua</label>
                  <input type="text" className={`${styles.input} ${styles.disabled}`} value={addressData.street} readOnly />
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.inputGroup}>
                  <label>Bairro</label>
                  <input type="text" className={`${styles.input} ${styles.disabled}`} value={addressData.neighborhood} readOnly />
                </div>
              </div>
            </div>
            
            <div className={styles.row}>
              <div className={styles.col}>
                <div className={styles.inputGroup}>
                  <label>Cidade</label>
                  <input type="text" className={`${styles.input} ${styles.disabled}`} value={addressData.city} readOnly />
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.inputGroup}>
                  <label>Estado</label>
                  <input type="text" className={`${styles.input} ${styles.disabled}`} value={addressData.state} readOnly />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className={styles.stepTitle}><Landmark /> Dados Bancários</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>Estes dados constarão nos contratos para o recebimento direto das transferências dos solicitantes. A plataforma não movimenta o seu dinheiro.</p>
            
            <div className={styles.row}>
              <div className={styles.col}>
                <div className={styles.inputGroup}>
                  <label>Titular</label>
                  <input type="text" className={`${styles.input} ${styles.disabled}`} value={identityData?.nome || ''} readOnly />
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.inputGroup}>
                  <label>CPF do Titular</label>
                  <input type="text" className={`${styles.input} ${styles.disabled}`} value={cpf} readOnly />
                </div>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.col}>
                <div className={styles.inputGroup}>
                  <label>Banco</label>
                  <input type="text" className={styles.input} value={bankData.bank} onChange={e => setBankData({...bankData, bank: e.target.value})} placeholder="Ex: Itaú, Nubank..." />
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.inputGroup}>
                  <label>Tipo de Conta</label>
                  <select className={styles.input} value={bankData.accountType} onChange={e => setBankData({...bankData, accountType: e.target.value})}>
                    <option value="">Selecione...</option>
                    <option value="Corrente">Conta Corrente</option>
                    <option value="Poupanca">Conta Poupança</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.col}>
                <div className={styles.inputGroup}>
                  <label>Agência</label>
                  <input type="text" className={styles.input} value={bankData.agency} onChange={e => setBankData({...bankData, agency: e.target.value})} placeholder="0000" />
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.inputGroup}>
                  <label>Conta</label>
                  <input type="text" className={styles.input} value={bankData.account} onChange={e => setBankData({...bankData, account: e.target.value})} placeholder="00000-0" />
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Chave PIX (Opcional)</label>
              <input type="text" className={styles.input} value={bankData.pix} onChange={e => setBankData({...bankData, pix: e.target.value})} placeholder="Telefone, Email, CPF ou Aleatória" />
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className={styles.stepTitle}><ShieldCheck /> Declarações Regulatórias</h2>
            
            <div 
              className={`${styles.declarationCard} ${declarations.d1 ? styles.selected : ''}`}
              onClick={() => handleDeclarationToggle('d1')}
            >
              <div className={styles.declarationIcon}>
                <Check size={24} />
              </div>
              <div className={styles.declarationText}>
                Declaro que os recursos financeiros utilizados nas operações possuem origem lícita e estão devidamente declarados à Receita Federal.
              </div>
            </div>

            <div 
              className={`${styles.declarationCard} ${declarations.d2 ? styles.selected : ''}`}
              onClick={() => handleDeclarationToggle('d2')}
            >
              <div className={styles.declarationIcon}>
                <Check size={24} />
              </div>
              <div className={styles.declarationText}>
                Li e aceito as regras do Marketplace, concordando em manter a transparência nas negociações.
              </div>
            </div>

            <div 
              className={`${styles.declarationCard} ${declarations.d3 ? styles.selected : ''}`}
              onClick={() => handleDeclarationToggle('d3')}
            >
              <div className={styles.declarationIcon}>
                <Check size={24} />
              </div>
              <div className={styles.declarationText}>
                Estou ciente de que a plataforma não realiza a movimentação financeira entre as partes. Todas as transferências ocorrerão de forma direta, sendo a plataforma exclusiva para estruturação, análise de risco, formalização e acompanhamento.
              </div>
            </div>

            <div 
              className={`${styles.declarationCard} ${declarations.d4 ? styles.selected : ''}`}
              onClick={() => handleDeclarationToggle('d4')}
            >
              <div className={styles.declarationIcon}>
                <Check size={24} />
              </div>
              <div className={styles.declarationText}>
                Autorizo a utilização das minhas informações exclusivamente para formalização das operações e confecção dos contratos jurídicos.
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className={styles.stepTitle}><FileSignature /> Termos de Uso e Assinatura</h2>
            
            <div className={styles.termsViewer}>
              <h3>Termos e Condições do Credor</h3>
              <p>1. O Credor utilizará a plataforma exclusivamente para prospecção, análise e formalização de linhas de crédito.</p>
              <p>2. A plataforma não atua como instituição financeira e não garante o pagamento por parte do devedor.</p>
              <p>3. O Credor é inteiramente responsável por validar os contratos gerados e as informações fornecidas, garantindo que as operações respeitem a legislação vigente.</p>
              <p>4. Em caso de inadimplência, a plataforma poderá oferecer serviços de cobrança extrajudicial, caso contratados em apartado.</p>
              <p>5. O perfil poderá ser suspenso caso sejam identificadas práticas que violem as políticas do Marketplace.</p>
              {/* Fake long text for scroll */}
              <p style={{ marginTop: '20px', color: '#999' }}>[Continue rolando para aceitar os termos...]</p>
              <br/><br/><br/><br/><br/><br/>
            </div>

            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="checkbox" 
                id="acceptTerms"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                style={{ width: '20px', height: '20px' }}
              />
              <label htmlFor="acceptTerms" style={{ fontSize: '1.1rem', fontWeight: 500 }}>Li e concordo com os Termos de Uso</label>
            </div>

            <div className={styles.inputGroup}>
              <label>Assinatura Eletrônica</label>
              <div className={styles.signatureContainer}>
                <SignatureCanvas 
                  ref={sigCanvas} 
                  penColor='black'
                  canvasProps={{ width: 700, height: 200, className: 'sigCanvas' }} 
                />
              </div>
              <div className={styles.signatureActions}>
                <button className={styles.clearBtn} onClick={() => sigCanvas.current.clear()}>Limpar assinatura</button>
              </div>
            </div>
          </motion.div>
        );
      
      default: return null;
    }
  };

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className={styles.successScreen}
      >
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: 'spring', delay: 0.2 }}
          className={styles.successIcon}
        >
          <Check size={40} />
        </motion.div>
        <h1 className={styles.successTitle}>Perfil Verificado</h1>
        <p className={styles.successDesc}>Sua conta agora está habilitada para operar no Marketplace.</p>
        
        <div className={styles.successList}>
          <div className={styles.successListItem}><Check /> Publicar linhas de crédito</div>
          <div className={styles.successListItem}><Check /> Receber solicitações</div>
          <div className={styles.successListItem}><Check /> Gerar contratos</div>
          <div className={styles.successListItem}><Check /> Negociar operações</div>
        </div>

        <button className={styles.btnPrimary} onClick={onComplete} style={{ margin: '0 auto' }}>
          Publicar Minha Primeira Linha <ArrowRight size={20} />
        </button>
      </motion.div>
    );
  }

  return (
    <div className={styles.wizardContainer}>
      <div className={styles.wizardHeader}>
        <h1 className={styles.title}>Tornar-se um Credor Verificado</h1>
        <p className={styles.subtitle}>Habilite sua conta de forma rápida e segura para operar no Marketplace.</p>
      </div>

      <div className={styles.stepIndicator}>
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className={`${styles.stepDot} ${step === s.id ? styles.active : ''} ${step > s.id ? styles.completed : ''}`} />
            {i < steps.length - 1 && <div className={`${styles.stepConnector} ${step > s.id ? styles.active : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className={styles.stepContent}>
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        <div className={styles.btnGroup}>
          {step > 1 && (
            <button className={styles.btnSecondary} onClick={prevStep} disabled={isLoading}>
              <ArrowLeft size={20} /> Voltar
            </button>
          )}
          <button 
            className={styles.btnPrimary} 
            onClick={nextStep} 
            disabled={!canProceed() || isLoading}
          >
            {isLoading ? <Loader2 className="spin" size={20} /> : (step === 5 ? 'Concluir Ativação' : 'Avançar')} 
            {!isLoading && step !== 5 && <ArrowRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
