import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'patient' | 'staff';
  onNavigate: (page: string) => void;
}

function ProtectedRoute({ children, requiredRole, onNavigate }: ProtectedRouteProps) {
  const { isAuthenticated, userRole } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }

    if (requiredRole && userRole !== requiredRole) {
      onNavigate(userRole === 'patient' ? 'patient-home' : 'staff-dashboard');
    }
  }, [isAuthenticated, userRole, requiredRole, onNavigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && userRole !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;