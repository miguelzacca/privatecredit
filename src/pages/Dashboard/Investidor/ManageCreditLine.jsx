import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Wallet, ShieldCheck, Activity, Trash2, PauseCircle } from 'lucide-react';
import axios from 'axios';
import styles from './InvestidorDashboard.module.css'; // Reusing some base styles

export function ManageCreditLine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [line, setLine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    axios.get(`/api/credit-lines/${id}`)
      .then(res => {
        setLine(res.data.data);
      })
      .catch(err => {
        console.error('Error fetching credit line:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir esta linha de crédito?')) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`/api/credit-lines/${id}`);
      navigate('/dashboard/investidor');
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Erro ao excluir linha de crédito.');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <p>Carregando dados da linha...</p>
      </div>
    );
  }

  if (!line) {
    return (
      <div style={{ textAlign: 'center', padding: '64px' }}>
        <h2>Linha não encontrada</h2>
        <button onClick={() => navigate('/dashboard/investidor')} style={{ marginTop: '16px', background: '#111', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button 
        onClick={() => navigate('/dashboard/investidor')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#666', marginBottom: '24px', fontWeight: '500' }}
      >
        <ArrowLeft size={16} /> Voltar ao Dashboard
      </button>

      <div className={styles.header} style={{ marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 className={styles.title}>Gerenciar Linha</h1>
            <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Activity size={12} /> Ativa
            </span>
          </div>
          <p className={styles.subtitle}>ID: {line.id}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e5e5e5', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '500' }}
          >
            <PauseCircle size={16} /> Pausar Captação
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '500' }}
          >
            <Trash2 size={16} /> {isDeleting ? 'Excluindo...' : 'Excluir Linha'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={20} color="#111" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Capital e Taxas</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Capital Total</span>
              <span style={{ fontSize: '24px', fontWeight: '600', color: '#111' }}>{line.maxAmount}</span>
            </div>
            <div style={{ display: 'flex', gap: '48px' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Taxa de Juros</span>
                <span style={{ fontSize: '16px', fontWeight: '500', color: '#111' }}>{line.rate}</span>
              </div>
              <div>
                <span style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Prazo Máximo</span>
                <span style={{ fontSize: '16px', fontWeight: '500', color: '#111' }}>{line.term}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} color="#111" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Público e Garantias</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '8px' }}>Público Alvo</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {line.tags.map((tag, i) => (
                  <span key={i} style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500' }}>{tag}</span>
                ))}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '8px' }}>Garantias Exigidas</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {line.rawGuarantees.length > 0 ? line.rawGuarantees.map((tag, i) => (
                  <span key={i} style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500' }}>{tag}</span>
                )) : <span style={{ fontSize: '14px', color: '#111' }}>Sob análise / Sem garantia específica</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
