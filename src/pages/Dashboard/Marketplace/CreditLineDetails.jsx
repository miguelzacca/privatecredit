import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ShieldCheck, Star, Send, FileText, CheckCircle2, 
  Clock, Activity, Users, MapPin, ChevronDown, ChevronUp 
} from 'lucide-react';
import styles from './CreditLineDetails.module.css';
import { MarketplaceSimulator } from './components/MarketplaceSimulator';

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
  const [openFaq, setOpenFaq] = useState(null);

  // Mock data based on id
  const offer = {
    id: id || '123',
    investor: 'J.P. Morgan Asset',
    rating: '4.9',
    volume: 'R$ 150M+ financiados',
    location: 'São Paulo, SP',
    maxAmount: '10.000.000',
    minAmount: '500.000',
    rate: '1.2% a.m.',
    term: 'Até 48 meses',
    time: '24h',
    description: 'Buscamos financiar operações estruturadas para construtoras e incorporadoras com histórico comprovado de entregas. Nossa análise é focada no fluxo de caixa da obra e no VGV do projeto. Oferecemos carência de até 12 meses dependendo do estágio da obra.',
    acceptedTypes: ['Operações imobiliárias', 'Capital de giro estruturado', 'Expansão'],
    guarantees: 'Alienação Fiduciária de Imóveis ou Recebíveis Performados.',
    amortization: 'Sim, sem penalidades após o 6º mês.',
    negotiation: 'Sim, para volumes acima de R$ 2.000.000.',
    faqs: [
      { question: "Qual é o tempo médio para liberação dos recursos?", answer: "Após a aprovação de crédito e assinatura dos contratos, a liberação ocorre em até 48 horas úteis." },
      { question: "É possível estender a carência?", answer: "Sim, a carência pode ser estendida até 18 meses, com um ajuste de 0.15% na taxa final." },
      { question: "Quais documentos são necessários na primeira fase?", answer: "Apresentação institucional, Balanço dos últimos 2 anos, DRE recente e a planilha de VGV do projeto em caso de obras." }
    ]
  };

  const toggleFaq = (index) => {
    if (openFaq === index) setOpenFaq(null);
    else setOpenFaq(index);
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
        
        <Link to={`/dashboard/marketplace/${offer.id}/solicitar`} className={styles.requestBtn}>
          <Send size={18} /> Solicitar esta Linha
        </Link>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          <motion.div variants={itemVariants} className={styles.section}>
            <div className={styles.sectionTitle}>
              <FileText size={20} /> Visão Geral da Operação
            </div>
            <p className={styles.description}>{offer.description}</p>
          </motion.div>

          <motion.div variants={itemVariants} className={styles.statsGrid}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Valor Máximo</span>
              <span className={styles.statValue}>R$ {offer.maxAmount}</span>
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
              <span className={styles.statLabel}>Tempo de Resposta</span>
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
                <span className={styles.infoValue}>R$ {offer.minAmount}</span>
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

          {/* Fluxo da Operação */}
          <motion.div variants={itemVariants} className={styles.section}>
            <div className={styles.sectionTitle}>
              <Activity size={20} /> Fluxo da Operação
            </div>
            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <div className={styles.timelinePoint} />
                <div className={styles.timelineContent}>
                  <h4>1. Envio da Solicitação</h4>
                  <p>Preenchimento do wizard com o valor, prazo e finalidade.</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelinePoint} />
                <div className={styles.timelineContent}>
                  <h4>2. Análise Prévia</h4>
                  <p>A equipe do investidor analisa as condições em até {offer.time}.</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelinePoint} />
                <div className={styles.timelineContent}>
                  <h4>3. Due Diligence e Contratos</h4>
                  <p>Envio da documentação completa e auditoria das garantias ofertadas.</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={`${styles.timelinePoint} ${styles.timelinePointFinal}`} />
                <div className={styles.timelineContent}>
                  <h4>4. Liberação de Recursos</h4>
                  <p>Assinatura digital e desembolso imediato na conta da empresa.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQs */}
          <motion.div variants={itemVariants} className={styles.section}>
            <div className={styles.sectionTitle}>
              Perguntas Frequentes
            </div>
            <div className={styles.faqList}>
              {offer.faqs.map((faq, i) => (
                <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ''}`}>
                  <button className={styles.faqQuestion} onClick={() => toggleFaq(i)}>
                    {faq.question}
                    {openFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={styles.faqAnswerWrapper}
                      >
                        <div className={styles.faqAnswer}>{faq.answer}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        <div className={styles.sideColumn}>
          {/* Simulador Integrado */}
          <motion.div variants={itemVariants}>
            <MarketplaceSimulator rate={offer.rate} maxTerm={offer.term} maxAmount={offer.maxAmount} />
          </motion.div>

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

          <motion.div variants={itemVariants} className={`${styles.section} ${styles.darkSection}`}>
            <div className={styles.sectionTitle} style={{ color: '#fff', borderBottomColor: 'rgba(255,255,255,0.1)' }}>
              <Users size={20} color="#fff" /> Histórico do Investidor
            </div>
            <div className={styles.darkStats}>
              <div>
                <div className={styles.darkStatLabel}>Volume Financiado</div>
                <div className={styles.darkStatValue}>{offer.volume}</div>
              </div>
              <div>
                <div className={styles.darkStatLabel}>Operações Concluídas</div>
                <div className={styles.darkStatValue}>342 operações</div>
              </div>
              <div>
                <div className={styles.darkStatLabel}>Capital Comprometido Atual</div>
                <div className={styles.darkStatValue}>R$ 45.000.000</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
