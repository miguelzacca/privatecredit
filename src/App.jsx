import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Home } from './pages/Home/Home';
import Login from './pages/Login/Login';
import MagicVerify from './pages/MagicVerify/MagicVerify';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Onboarding } from './pages/Onboarding/Onboarding';
import { DashboardLayout } from './layouts/DashboardLayout/DashboardLayout';
import { InvestidorDashboard } from './pages/Dashboard/Investidor/InvestidorDashboard';
import { CorretorDashboard } from './pages/Dashboard/Corretor/CorretorDashboard';
import { ConstrutoraDashboard } from './pages/Dashboard/Construtora/ConstrutoraDashboard';
import { FornecedorDashboard } from './pages/Dashboard/Fornecedor/FornecedorDashboard';
import { EmpresaDashboard } from './pages/Dashboard/Empresa/EmpresaDashboard';
import { PublishCreditLine } from './pages/Dashboard/Investidor/PublishCreditLine';
import { ManageCreditLine } from './pages/Dashboard/Investidor/ManageCreditLine';
import { Marketplace } from './pages/Dashboard/Marketplace/Marketplace';
import { CreditLineDetails } from './pages/Dashboard/Marketplace/CreditLineDetails';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/verify" element={<MagicVerify />} />

        {/* Protected Route - Needs to be logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<Onboarding />} />
        </Route>

        {/* Protected Route - Needs to be logged in AND have a profile */}
        <Route element={<ProtectedRoute requireProfile={true} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="investidor">
              <Route index element={<InvestidorDashboard />} />
              <Route path="nova-linha" element={<PublishCreditLine />} />
              <Route path="linhas/:id" element={<ManageCreditLine />} />
            </Route>
            <Route path="corretor" element={<CorretorDashboard />} />
            <Route path="construtora" element={<ConstrutoraDashboard />} />
            <Route path="fornecedor" element={<FornecedorDashboard />} />
            <Route path="empresa" element={<EmpresaDashboard />} />
            <Route path="marketplace">
              <Route index element={<Marketplace />} />
              <Route path=":id" element={<CreditLineDetails />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
