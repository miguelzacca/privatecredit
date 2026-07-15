import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Sparkles, X, ArrowUp, AlertCircle, Loader2, TrendingUp, PlusCircle, BarChart2, FileText, ShieldAlert, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AiChat.module.css';

// Formatter helper
function formatTime(date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Custom Markdown renderer for premium look
function renderMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  html = html.replace(/(\/dashboard\/[a-zA-Z0-9\-\/]+)/g, '<a href="$1">$1</a>');

  html = html.replace(/^[•\-] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  html = html.replace(/\n{2,}/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  html = `<p>${html}</p>`;
  html = html.replace(/<p><\/p>/g, '');

  return html;
}

// Get context name from pathname
function getContextName(pathname) {
  if (pathname.includes('/marketplace/salvas')) return 'Linhas Salvas';
  if (pathname.includes('/marketplace')) return 'Marketplace';
  if (pathname.includes('/investidor/nova-linha')) return 'Nova Linha de Crédito';
  if (pathname.includes('/investidor/operacoes')) return 'Operações';
  if (pathname.includes('/investidor/clientes')) return 'Clientes';
  if (pathname.includes('/investidor')) return 'Dashboard Investidor';
  if (pathname.includes('/empresa/solicitacoes')) return 'Solicitações';
  if (pathname.includes('/empresa/contratos')) return 'Contratos';
  if (pathname.includes('/documents')) return 'Documentos';
  return 'Geral';
}

// Dynamic suggestions based on context
function getSuggestions(contextName) {
  const baseSuggestions = [
    { text: 'Mostrar minha rentabilidade', icon: <TrendingUp size={16} /> },
    { text: 'Criar linha de crédito', icon: <PlusCircle size={16} /> },
  ];

  if (contextName === 'Marketplace') {
    return [
      { text: 'Encontrar melhores oportunidades', icon: <Zap size={16} /> },
      { text: 'Qual linha possui menor taxa?', icon: <BarChart2 size={16} /> },
      { text: 'Explicar riscos de investimento', icon: <ShieldAlert size={16} /> },
      { text: 'Criar linha de crédito', icon: <PlusCircle size={16} /> },
    ];
  }

  if (contextName === 'Contratos') {
    return [
      { text: 'Quais contratos precisam de assinatura?', icon: <FileText size={16} /> },
      { text: 'Mostrar resumo de pagamentos', icon: <BarChart2 size={16} /> },
    ];
  }

  return baseSuggestions;
}

function Message({ msg }) {
  const isUser = msg.role === 'user';

  return (
    <motion.div 
      id={`msg-${msg.id}`}
      initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
      className={`${styles.messageBlock} ${isUser ? styles.user : styles.assistant}`}
    >
      <div className={`${styles.messageHeader} ${isUser ? styles.user : styles.assistant}`}>
        {isUser ? 'Você' : 'Assistente'}
      </div>
      <div className={styles.messageContent}>
        {isUser ? (
          msg.content
        ) : (
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
        )}
      </div>
    </motion.div>
  );
}

export function AiChat() {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const contextName = getContextName(location.pathname);
  const currentSuggestions = getSuggestions(contextName);

  useEffect(() => {
    if (!isOpen) return;

    if (isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant') {
        // Scroll to the top of the assistant's message
        const el = document.getElementById(`msg-${lastMsg.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasUnread(false);
    }
  }, [isOpen]);

  const hasSentGreeting = useRef(false);
  useEffect(() => {
    if (isOpen && !hasSentGreeting.current && messages.length === 0) {
      hasSentGreeting.current = true;
      const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário';
      const greeting = `Olá, **${firstName}**. Sou a inteligência financeira da plataforma.\n\nTenho acesso ao seu histórico, capital, linhas de crédito e contexto da tela atual para te auxiliar com decisões de alto impacto.\n\nComo posso ajudar?`;

      setMessages([{
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
        id: Date.now(),
      }]);
    }
  }, [isOpen, user, messages.length]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  };

  const sendMessage = useCallback(async (text) => {
    const content = (text || inputValue).trim();
    if (!content || isLoading) return;

    setInputValue('');
    setError(null);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'; // Will fall back to rows={3} height
    }

    const userMsg = { role: 'user', content, timestamp: new Date(), id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      const token = localStorage.getItem('@WhiteCredit:token');
      
      const res = await fetch('/api/ai/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          messages: history,
          currentContext: contextName,
          currentPath: location.pathname
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Falha na comunicação com o assistente.');
      }

      const assistantMsg = {
        role: 'assistant',
        content: data.message || 'Desculpe, ocorreu um erro ao processar a resposta.',
        timestamp: new Date(),
        id: Date.now() + 1,
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (!isOpen) setHasUnread(true);

    } catch (err) {
      setError(err.message || 'Falha ao conectar. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages, isOpen, contextName, location.pathname]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showWelcome = messages.length === 0;

  return (
    <div className={styles.fabContainer}>
      {/* Cinematic Panel using Framer Motion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.15 }}
            className={styles.chatPanel}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.avatarContainer}>
                <Sparkles size={20} />
              </div>
              <div className={styles.headerInfo}>
                <div className={styles.headerTopRow}>
                  <div className={styles.headerName}>Assistente IA</div>
                  <div className={styles.modelBadge}>Llama 3.1</div>
                </div>
                <div className={styles.contextRow}>
                  <div className={`${styles.statusDot} ${isLoading ? styles.typing : ''}`} />
                  Especialista Financeiro · Contexto: {contextName}
                </div>
              </div>
              <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={styles.errorBanner}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Messages */}
            <div className={styles.messagesArea}>
              {showWelcome && !isLoading ? (
                <div className={styles.welcomeContainer}>
                  <h3>Como posso ajudar?</h3>
                  <div className={styles.suggestionsGrid}>
                    {currentSuggestions.map((s, i) => (
                      <button
                        key={i}
                        className={styles.suggestionCard}
                        onClick={() => sendMessage(s.text)}
                        disabled={isLoading}
                      >
                        <span className={styles.suggestionIcon}>{s.icon}</span>
                        {s.text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <Message key={msg.id} msg={msg} />
                    ))}
                  </AnimatePresence>
                  
                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className={styles.typingIndicatorRow}
                    >
                      <Sparkles size={14} className="animate-pulse" /> Analisando contexto...
                    </motion.div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Premium Composer */}
            <div className={styles.footer}>
              <div className={styles.composer}>
                <textarea
                  ref={inputRef}
                  className={styles.inputArea}
                  placeholder="Pergunte qualquer coisa sobre sua conta, operações, marketplace ou contratos..."
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={3}
                  disabled={isLoading}
                />
                <div className={styles.composerActions}>
                  <div className={styles.composerHint}>
                    <span className={styles.kbd}>Enter</span> para enviar
                  </div>
                  <button
                    className={styles.sendButton}
                    onClick={() => sendMessage()}
                    disabled={isLoading || !inputValue.trim()}
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin text-black" /> : <ArrowUp size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button 
        className={`${styles.fabButton} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Sparkles size={24} />
        {hasUnread && !isOpen && (
          <div className={styles.unreadBadge}>1</div>
        )}
      </button>
    </div>
  );
}
