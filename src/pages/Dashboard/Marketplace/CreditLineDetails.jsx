import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Star, Send, X, FileText, CheckCircle2, Clock, Percent, Activity, Users, MapPin, UploadCloud } from 'lucide-react';
import styles from './CreditLineDetails.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function CreditLineDetails() {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock data based on id
  const offer = {
    investor: 'Vertex Invest',
    rating: '4.8',
    volume: 'Mais de R$ 50M financiados',
    location: 'São Paulo, SP',
    maxAmount: 'R$ 2.500.000',
    minAmount: 'R$ 100.000',
    rate: '3,20% a.m.',
    term: 'Até 60 meses',
    time: '5 dias úteis',
    description: 'Buscamos financiar operações estruturadas para construtoras e incorporadoras com histórico comprovado de entregas. Nossa análise é focada no fluxo de caixa da obra e no VGV do projeto. Oferecemos carência de até 12 meses dependendo do estágio da obra.',
    acceptedTypes: ['Operações imobiliárias', 'Capital de giro estruturado', 'Expansão'],
    guarantees: 'Alienação Fiduciária de Imóveis ou Recebíveis Performados.',
    amortization: 'Sim, sem penalidades após o 6º mês.',
    negotiation: 'Sim, para volumes acima de R$ 1.000.000.',
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsSuccess(false);
    }, 2000);
  };

  return (
    <motion.div className={styles.container} variants={containerVariants} initial="hidden" animate="show">
      <Link to="/dashboard/marketplace" className={styles.backBtn}>
        <ArrowLeft size={16} /> Voltar ao Marketplace
      </Link>

      <div className={styles.header}>
        <div className={styles.investorProfile}>
          <div className={styles.avatar}>
            {offer.investor.charAt(0)}
          </div>
          <div className={styles.titleArea}>
            <h1 className={styles.name}>{offer.investor}</h1>
            <div className={styles.badgeRow}>
              <span className={`${styles.badge} ${styles.verified}`}>
                <ShieldCheck size={14} /> Investidor Verificado
              </span>
              <span className={`${styles.badge} ${styles.rating}`}>
                <Star size={14} fill="currentColor" /> {offer.rating}
              </span>
              <span className={styles.badge} style={{ color: '#666', background: '#f5f5f5' }}>
                <MapPin size={14} /> {offer.location}
              </span>
            </div>
          </div>
        </div>
        <button className={styles.requestBtn} onClick={() => setIsModalOpen(true)}>
          <Send size={18} /> Solicitar esta Linha
        </button>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          <motion.div variants={itemVariants} className={styles.section}>
            <div className={styles.sectionTitle}>
              <FileText size={20} /> Visão Geral
            </div>
            <p className={styles.description}>{offer.description}</p>
          </motion.div>

          <motion.div variants={itemVariants} className={styles.statsGrid}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Valor Máximo</span>
              <span className={styles.statValue}>{offer.maxAmount}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Taxa de Juros</span>
              <span className={`${styles.statValue} ${styles.highlight}`}>{offer.rate}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Prazo Máximo</span>
              <span className={styles.statValue}>{offer.term}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Tempo de Aprovação</span>
              <span className={styles.statValue}>{offer.time}</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className={styles.section}>
            <div className={styles.sectionTitle}>
              <CheckCircle2 size={20} /> Condições e Requisitos
            </div>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Valor Mínimo</span>
                <span className={styles.infoValue}>{offer.minAmount}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Garantias Exigidas</span>
                <span className={styles.infoValue}>{offer.guarantees}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Amortização Antecipada</span>
                <span className={styles.infoValue}>{offer.amortization}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Negociação de Taxa</span>
                <span className={styles.infoValue}>{offer.negotiation}</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className={styles.sideColumn}>
          <motion.div variants={itemVariants} className={styles.section}>
            <div className={styles.sectionTitle}>
              <Activity size={20} /> Tipos Aceitos
            </div>
            <div className={styles.tagsList}>
              {offer.acceptedTypes.map((type, i) => (
                <span key={i} className={styles.tagItem}>{type}</span>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className={styles.section} style={{ background: 'linear-gradient(180deg, #111, #222)', color: '#fff' }}>
            <div className={styles.sectionTitle} style={{ color: '#fff' }}>
              <Users size={20} color="#fff" /> Histórico do Investidor
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Volume Financiado</div>
                <div style={{ fontSize: '20px', fontWeight: '600' }}>{offer.volume}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Operações Concluídas</div>
                <div style={{ fontSize: '20px', fontWeight: '600' }}>142 operações</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal de Solicitação */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={styles.modalContent}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button className={styles.closeModalBtn} onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>

              {isSuccess ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    style={{ color: '#10b981', display: 'flex', justifyContent: 'center', marginBottom: '24px' }}
                  >
                    <CheckCircle2 size={64} />
                  </motion.div>
                  <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>Solicitação Enviada!</h2>
                  <p style={{ color: '#666' }}>O investidor foi notificado e sua proposta está em análise.</p>
                </div>
              ) : (
                <>
                  <h2 className={styles.modalTitle}>Solicitar Linha de Crédito</h2>
                  <p className={styles.modalSubtitle}>Envie sua proposta para {offer.investor}.</p>

                  <form className={styles.modalForm} onSubmit={handleRequestSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Valor Desejado</label>
                        <input type="text" className={styles.input} placeholder="R$ 0,00" required />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Prazo Proposto (meses)</label>
                        <input type="number" className={styles.input} placeholder="Ex: 24" required />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Finalidade do Crédito</label>
                      <select className={styles.input} required>
                        <option value="">Selecione uma opção...</option>
                        {offer.acceptedTypes.map((type, i) => (
                          <option key={i} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Observações e Detalhes da Operação</label>
                      <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Explique brevemente como o capital será utilizado e quais garantias você pretende ofertar..." required />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Documentos Anexos</label>
                      <div className={styles.fileUpload}>
                        <UploadCloud size={24} />
                        <span>Arraste seus documentos estruturais aqui ou clique para selecionar</span>
                        <span style={{ fontSize: '12px', color: '#999' }}>(Balanço, DRE, Apresentação Institucional)</span>
                      </div>
                    </div>

                    <button type="submit" className={styles.submitModalBtn}>
                      Enviar Solicitação de Crédito
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
