import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Wallet, ShieldCheck, Activity, Trash2, PauseCircle, 
  PlayCircle, Edit3, Copy, Link, Archive, Clock, Users, TrendingUp, CheckCircle, XCircle 
} from 'lucide-react';
import axios from 'axios';
import styles from './InvestidorDashboard.module.css';

export function ManageCreditLine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [line, setLine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchLine();
  }, [id]);

  const fetchLine = async () => {
    try {
      const res = await axios.get(`/api/credit-lines/${id}`);
      setLine(res.data.data);
    } catch (err) {
      console.error('Error fetching credit line:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setIsProcessing(true);
    try {
      await axios.put(`/api/credit-lines/${id}`, { 
        status: newStatus,
        historyEvent: {
          action: newStatus === 'PAUSED' ? 'Oferta Pausada' : newStatus === 'ACTIVE' ? 'Oferta Reativada' : 'Oferta Encerrada',
          description: `O status da linha foi alterado para ${newStatus}`
        }
      });
      await fetchLine();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Erro ao atualizar status.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDuplicate = async () => {
    setIsProcessing(true);
    try {
      const res = await axios.post(`/api/credit-lines/duplicate`, { id });
      navigate(`/dashboard/investidor/manage/${res.data.data.id}`);
    } catch (err) {
      console.error('Failed to duplicate:', err);
      alert('Erro ao duplicar a linha.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja encerrar definitivamente esta linha de crédito?')) return;
    
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
        <p>Carregando gestão premium da linha...</p>
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

  // Simulated metrics for the premium dashboard
  const formatValue = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const capital = line.capital || 0;
  const metrics = {
    disponivel: capital * 0.7,
    comprometido: capital * 0.1,
    emprestado: capital * 0.2,
    rentabilidadeEstimada: '18.5% a.a.',
    rentabilidadeRecebida: formatValue(capital * 0.05),
    solicitacoes: 24,
    aprovadas: 8,
    recusadas: 16
  };

  const statusColors = {
    ACTIVE: { bg: '#dcfce7', color: '#166534', icon: <Activity size={12} />, label: 'Ativa' },
    PAUSED: { bg: '#fef08a', color: '#854d0e', icon: <PauseCircle size={12} />, label: 'Pausada' },
    CLOSED: { bg: '#fee2e2', color: '#991b1b', icon: <XCircle size={12} />, label: 'Encerrada' }
  };

  const currentStatus = statusColors[line.status] || statusColors.ACTIVE;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Premium Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <button 
            onClick={() => navigate('/dashboard/investidor')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#666', marginBottom: '16px', fontWeight: '500' }}
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-1px', color: '#111' }}>{line.tags[0] || 'Linha Premium'}</h1>
            <span style={{ background: currentStatus.bg, color: currentStatus.color, padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {currentStatus.icon} {currentStatus.label}
            </span>
          </div>
          <p style={{ color: '#666', fontSize: '15px' }}>ID: {line.id}</p>
        </div>

        {/* Premium Actions Dropdown / Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => navigate(`/dashboard/investidor/publicar?edit=${line.id}`)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            <Edit3 size={16} /> Editar Condições
          </button>

          {line.status === 'ACTIVE' ? (
            <button 
              onClick={() => handleUpdateStatus('PAUSED')} disabled={isProcessing}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e5e5e5', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '500' }}
            >
              <PauseCircle size={16} /> Pausar
            </button>
          ) : (
            <button 
              onClick={() => handleUpdateStatus('ACTIVE')} disabled={isProcessing}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e5e5e5', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '500' }}
            >
              <PlayCircle size={16} /> Reativar
            </button>
          )}

          <button 
            onClick={handleDuplicate} disabled={isProcessing}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e5e5e5', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '500' }}
          >
            <Copy size={16} /> Duplicar
          </button>
          
          <button 
            onClick={() => { navigator.clipboard.writeText(`https://whiteprivatecredit.com/linha/${line.id}`); alert('Link copiado!'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e5e5e5', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '500' }}
          >
            <Link size={16} /> Compartilhar
          </button>
        </div>
      </div>

      {/* Main Dashboard Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Capital Flow */}
        <motion.div whileHover={{ y: -4 }} style={{ background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Capital Restante</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
              <Wallet size={16} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            {formatValue(metrics.disponivel)}
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748b' }}>
            <span>De: {formatValue(capital)}</span>
          </div>
        </motion.div>

        {/* Rentabilidade */}
        <motion.div whileHover={{ y: -4 }} style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '24px', borderRadius: '24px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(15,23,42,0.2)', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Rentabilidade Estimada</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
            {metrics.rentabilidadeEstimada}
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#94a3b8' }}>
            <span>Já recebido: <strong style={{color:'#fff'}}>{metrics.rentabilidadeRecebida}</strong></span>
          </div>
        </motion.div>

        {/* Solicitações */}
        <motion.div whileHover={{ y: -4 }} style={{ background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Pipeline de Operações</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>{metrics.solicitacoes}</span>
            <span style={{ color: '#64748b', fontSize: '14px', marginBottom: '6px' }}>solicitações</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
            <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12}/> {metrics.aprovadas} aprovadas</span>
            <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={12}/> {metrics.recusadas} recusadas</span>
          </div>
        </motion.div>
      </div>

      {/* Split Content: Configurações and Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Configurações Atuais */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>Condições de Oferta</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Taxa de Juros</span>
              <span style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>{line.rate}</span>
            </div>
            <div>
              <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Prazo Máximo</span>
              <span style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>{line.term}</span>
            </div>
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #f1f5f9', paddingTop: '24px', marginTop: '8px' }}>
              <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '12px' }}>Público Alvo</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {line.tags.map((tag, i) => (
                  <span key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>{tag}</span>
                ))}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '12px' }}>Garantias Exigidas</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {line.rawGuarantees.length > 0 ? line.rawGuarantees.map((tag, i) => (
                  <span key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>{tag}</span>
                )) : <span style={{ fontSize: '14px', color: '#0f172a' }}>Sob análise / Sem garantia específica</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Clock size={18} color="#64748b" />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Histórico</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            {/* Timeline Line */}
            <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '24px', width: '2px', background: '#f1f5f9', zIndex: 0 }}></div>

            {/* Eventos da Timeline */}
            {line.history && line.history.slice().reverse().map((event, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fff', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', flexShrink: 0 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }}></div>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{event.action}</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', lineHeight: '1.4' }}>{event.description}</p>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                    {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(event.timestamp))}
                  </span>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fff', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', flexShrink: 0 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div>
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>Linha Criada</h4>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                  {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(line.createdAt))}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '#ef4444', border: 'none', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '500' }}
        >
          <Archive size={16} /> {isDeleting ? 'Encerrando...' : 'Encerrar e Arquivar Linha'}
        </button>
      </div>

    </motion.div>
  );
}
