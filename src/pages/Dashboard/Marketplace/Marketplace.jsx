import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import styles from './Marketplace.module.css';

// Components
import { MarketplaceHero } from './components/MarketplaceHero';
import { MarketplaceSearch } from './components/MarketplaceSearch';
import { MarketplaceGrid } from './components/MarketplaceGrid';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const DUMMY_OFFERS = [
  // {
  //   id: '1',
  //   title: 'Crédito Estruturado Premium',
  //   investor: 'J.P. Morgan Asset',
  //   rating: 4.9,
  //   maxAmount: '10.000.000',
  //   minAmount: '500.000',
  //   rate: '1.2% a.m.',
  //   term: 'Até 48 meses',
  //   volume: 'R$ 150M+',
  //   responseTime: '24h',
  //   operations: 342,
  //   guarantees: 'Recebíveis, Imóvel',
  //   tags: ['Construtoras', 'Capital de Giro'],
  //   badges: ['Oferta Premium', 'Verificado']
  // },
  // {
  //   id: '2',
  //   title: 'Antecipação de Recebíveis (FIDC)',
  //   investor: 'Vinci Partners',
  //   rating: 4.7,
  //   maxAmount: '5.000.000',
  //   minAmount: '100.000',
  //   rate: '0.9% a.m.',
  //   term: 'Até 24 meses',
  //   volume: 'R$ 80M+',
  //   responseTime: '4h',
  //   operations: 1205,
  //   guarantees: 'Contratos, Notas Fiscais',
  //   tags: ['Serviços', 'Fornecedores'],
  //   badges: ['Resposta rápida', 'Alta demanda']
  // },
  // {
  //   id: '3',
  //   title: 'Financiamento para Máquinas',
  //   investor: 'BNDES / Parceiros',
  //   rating: 4.5,
  //   maxAmount: '2.000.000',
  //   minAmount: '50.000',
  //   rate: '0.75% a.m.',
  //   term: 'Até 60 meses',
  //   volume: 'R$ 300M+',
  //   responseTime: '48h',
  //   operations: 500,
  //   guarantees: 'Alienação Fiduciária',
  //   tags: ['Indústria', 'Agronegócio'],
  //   badges: ['Baixo risco']
  // },
  // {
  //   id: '4',
  //   title: 'Venture Debt',
  //   investor: 'Silicon Valley Bank',
  //   rating: 4.8,
  //   maxAmount: '25.000.000',
  //   minAmount: '2.000.000',
  //   rate: '1.5% a.m.',
  //   term: 'Até 36 meses',
  //   volume: 'R$ 500M+',
  //   responseTime: '72h',
  //   operations: 45,
  //   guarantees: 'Ações, IP',
  //   tags: ['Tecnologia', 'SaaS'],
  //   badges: ['Nova', 'Investidor Top']
  // }
];

export function Marketplace() {
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axios.get('/api/credit-lines');
        if (response.data && response.data.data) {
          setOffers([...response.data.data, ...DUMMY_OFFERS]);
        } else {
          setOffers(DUMMY_OFFERS);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
        setOffers(DUMMY_OFFERS);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  return (
    <motion.div className={styles.container} variants={containerVariants} initial="hidden" animate="show">
      <MarketplaceHero />
      
      <MarketplaceSearch viewMode={viewMode} setViewMode={setViewMode} />

      {/* Seções (Tabs ou Divisores) podem ser adicionadas aqui no futuro */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Ofertas em Destaque</h2>
      </div>

      <MarketplaceGrid offers={offers} viewMode={viewMode} loading={loading} />

    </motion.div>
  );
}
