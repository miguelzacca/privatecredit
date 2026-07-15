import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ requireProfile = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireProfile && !user.profile) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!requireProfile && user.profile) {
    // If we're on the onboarding route but the user already has a profile, redirect to dashboard
    // We can handle this logic directly in Onboarding component as well, but this is an option.
  }

  return <Outlet />;
}
