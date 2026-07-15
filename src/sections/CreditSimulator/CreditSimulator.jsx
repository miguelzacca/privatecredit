import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import styles from './CreditSimulator.module.css';

const formatCurrency = (val) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const formatPercent = (val) => 
  new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(val / 100);

const AnimatedNumber = ({ value }) => {
  const spring = useSpring(value, { mass: 1, stiffness: 80, damping: 15 });
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);
  const display = useTransform(spring, (current) => formatCurrency(current));
  return <motion.span>{display}</motion.span>;
};

const FormattedInput = ({ value, onChange, isCurrency, className, min, max }) => {
  const formatVal = (val) => 
    isCurrency 
      ? new Intl.NumberFormat('pt-BR').format(val) 
      : new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(val);

  const [localValue, setLocalValue] = useState(formatVal(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(formatVal(value));
    }
  }, [value, isCurrency, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    let parsed = parseFloat(localValue.toString().replace(/\./g, '').replace(',', '.'));
    if (isNaN(parsed)) parsed = min || 0;
    if (max && parsed > max) parsed = max;
    if (min && parsed < min) parsed = min;
    
    onChange(parsed);
    setLocalValue(formatVal(parsed));
  };

  const handleChange = (e) => {
    const val = e.target.value.replace(/[^0-9,]/g, '');
    setLocalValue(val);
  };

  return (
    <input 
      type="text"
      className={className}
      value={localValue}
      onFocus={() => {
        setIsFocused(true);
        setLocalValue(value.toString().replace('.', ','));
      }}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.target.blur();
      }}
    />
  );
};

const CustomSlider = ({ min, max, step, value, onChange }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className={styles.sliderWrapper}>
      <div className={styles.sliderTrack}>
        <div className={styles.sliderFill} style={{ width: `${percentage}%` }} />
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.sliderInput} 
      />
    </div>
  );
};

export function CreditSimulator() {
  const [requestedValue, setRequestedValue] = useState(50000);
  const [term, setTerm] = useState(24);
  const [interestRate, setInterestRate] = useState(2.5);
  const [chartView, setChartView] = useState('evolution');

  const terms = [6, 12, 18, 24, 36, 48, 60];
  const termIndex = terms.indexOf(term) >= 0 ? terms.indexOf(term) : 3;

  // Calculations
  const platformFee = requestedValue * 0.05;
  const financedValue = requestedValue + platformFee;
  const i = interestRate / 100;
  const pmt = (financedValue * i) / (1 - Math.pow(1 + i, -term));
  const totalPaid = pmt * term;
  const totalInterest = totalPaid - financedValue;

  // Chart Data
  const evolutionData = useMemo(() => {
    const data = [];
    let balance = financedValue;
    for (let k = 0; k <= term; k++) {
      data.push({
        month: k,
        balance: balance > 0 ? balance : 0,
      });
      // balance after paying this month
      balance = balance * (1 + i) - pmt;
    }
    return data;
  }, [financedValue, i, pmt, term]);

  const distributionData = [
    { name: 'Capital Solicitado', value: requestedValue, color: '#3b82f6' },
    { name: 'Taxa da Plataforma', value: platformFee, color: '#8b5cf6' },
    { name: 'Juros', value: totalInterest, color: '#f43f5e' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Mês {payload[0].payload.month}</p>
          <p style={{ margin: 0, color: '#8b5cf6' }}>Saldo: {formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const DistributionTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].name}</p>
          <p style={{ margin: 0, color: payload[0].payload.color }}>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className={styles.simulatorSection}>
      <div className={styles.container}>
        
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.title}>Simulador Inteligente</h2>
          <p className={styles.subtitle}>
            Explore cenários de crédito em tempo real. Sem recargas, sem esperas.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {/* Controls Panel */}
          <motion.div 
            className={styles.card}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className={styles.controls}>
              
              {/* Requested Value */}
              <div className={styles.controlGroup}>
                <div className={styles.controlHeader}>
                  <label className={styles.controlLabel}>Valor Solicitado</label>
                  <div className={styles.valueInputWrapper}>
                    <span className={styles.valueInputPrefix}>R$</span>
                    <FormattedInput 
                      className={styles.valueInput}
                      value={requestedValue}
                      onChange={setRequestedValue}
                      isCurrency={true}
                      min={5000}
                      max={10000000}
                    />
                  </div>
                </div>
                <CustomSlider 
                  min={5000} 
                  max={10000000} 
                  step={5000} 
                  value={requestedValue} 
                  onChange={setRequestedValue} 
                />
                <span className={styles.platformFeeNotice}>
                  Taxa da plataforma (5%): {formatCurrency(platformFee)}
                </span>
              </div>

              {/* Term */}
              <div className={styles.controlGroup}>
                <div className={styles.controlHeader}>
                  <label className={styles.controlLabel}>Prazo (Meses)</label>
                  <span className={styles.controlValue}>{term}</span>
                </div>
                <div className={styles.termsList}>
                  {terms.map(t => (
                    <button
                      key={t}
                      className={`${styles.termButton} ${term === t ? styles.active : ''}`}
                      onClick={() => setTerm(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <CustomSlider 
                  min={0} 
                  max={terms.length - 1} 
                  step={1} 
                  value={termIndex} 
                  onChange={(idx) => setTerm(terms[idx])} 
                />
              </div>

              {/* Interest Rate */}
              <div className={styles.controlGroup}>
                <div className={styles.controlHeader}>
                  <label className={styles.controlLabel}>Juros Mensais</label>
                  <div className={styles.valueInputWrapper} style={{ width: '120px' }}>
                    <FormattedInput 
                      className={styles.valueInput}
                      value={interestRate}
                      onChange={setInterestRate}
                      isCurrency={false}
                      min={0.5}
                      max={5}
                    />
                    <span className={styles.valueInputPrefix} style={{ marginRight: 0, marginLeft: '0.5rem' }}>%</span>
                  </div>
                </div>
                <CustomSlider 
                  min={0.5} 
                  max={5} 
                  step={0.1} 
                  value={interestRate} 
                  onChange={setInterestRate} 
                />
              </div>

            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div 
            className={styles.resultsPanel}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Giant Monthly Installment */}
            <motion.div 
              className={styles.mainResult}
              layout
            >
              <h3 className={styles.mainResultLabel}>Parcela Estimada</h3>
              <div className={styles.mainResultValue}>
                <AnimatedNumber value={pmt} />
              </div>
              <p className={styles.mainResultSub}>Por mês durante {term} meses</p>
            </motion.div>

            {/* Breakdown Table */}
            <div className={styles.breakdown}>
              <div className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>Valor Financiado</span>
                <span className={styles.breakdownValue}>
                  <AnimatedNumber value={financedValue} />
                </span>
              </div>
              <div className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>Juros Totais</span>
                <span className={styles.breakdownValue}>
                  <AnimatedNumber value={totalInterest} />
                </span>
              </div>
              <div className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>Custo Efetivo Total</span>
                <span className={styles.breakdownValue}>
                  <AnimatedNumber value={totalPaid} />
                </span>
              </div>
              <div className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>Taxa da Plataforma</span>
                <span className={styles.breakdownValue}>
                  <AnimatedNumber value={platformFee} />
                </span>
              </div>
            </div>

            {/* Charts Section */}
            <div className={styles.card} style={{ padding: '1.5rem' }}>
              <div className={styles.chartTabs}>
                <button 
                  className={`${styles.chartTab} ${chartView === 'evolution' ? styles.active : ''}`}
                  onClick={() => setChartView('evolution')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '6px' }}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                  Evolução
                </button>
                <button 
                  className={`${styles.chartTab} ${chartView === 'distribution' ? styles.active : ''}`}
                  onClick={() => setChartView('distribution')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '6px' }}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                  Distribuição
                </button>
              </div>

              <div className={styles.chartContainer}>
                <AnimatePresence mode="wait">
                  {chartView === 'evolution' ? (
                    <motion.div 
                      key="evolution" 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={evolutionData}>
                          <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                          <YAxis hide domain={[0, 'dataMax']} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="balance" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="distribution"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={distributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {distributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<DistributionTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button className={styles.ctaButton}>
              Solicitar Análise
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
