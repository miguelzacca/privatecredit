import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Home } from './pages/Home/Home';
import Login from './pages/Login/Login';
import MagicVerify from './pages/MagicVerify/MagicVerify';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/verify" element={<MagicVerify />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
