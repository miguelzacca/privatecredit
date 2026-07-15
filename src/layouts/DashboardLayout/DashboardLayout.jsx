import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Bell, Search, Home, Briefcase, FileText, Settings, User } from 'lucide-react';
import styles from './DashboardLayout.module.css';

export function DashboardLayout({ title = 'Dashboard' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderNavItems = () => {
    // Dynamic navigation could be added here based on user.profile
    return (
      <>
        <NavLink to={`/dashboard/${user?.profile || ''}`} end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <Home size={18} /> Início
        </NavLink>
        <NavLink to="/dashboard/opportunities" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <Briefcase size={18} /> Oportunidades
        </NavLink>
        <NavLink to="/dashboard/documents" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <FileText size={18} /> Documentos
        </NavLink>
        <NavLink to="/dashboard/settings" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <Settings size={18} /> Configurações
        </NavLink>
      </>
    );
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 22H22L12 2Z" fill="black" />
          </svg>
          <span className={styles.brandText}>White Private Credit</span>
        </div>

        <nav className={styles.nav}>
          {renderNavItems()}
        </nav>

        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {user?.image ? (
              <img src={user.image} alt={user?.name} />
            ) : (
              <User size={20} />
            )}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || 'Usuário'}</span>
            <span className={styles.userRole}>{user?.profile || 'Perfil'}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn} title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}>
            Painel / <span>{title}</span>
          </div>
          <div className={styles.topActions}>
            <button className={styles.iconBtn} aria-label="Pesquisar">
              <Search size={18} />
            </button>
            <button className={styles.iconBtn} aria-label="Notificações">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
