import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'patient' | 'staff';
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, userRole, refreshUserRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (!userRole) {
        await refreshUserRole();
      }

      if (requiredRole && userRole !== requiredRole) {
        navigate(userRole === 'patient' ? '/patient-home' : '/staff-dashboard');
      }
    };

    checkAuth();
  }, [isAuthenticated, userRole, requiredRole, navigate, refreshUserRole]);

  if (!isAuthenticated || (requiredRole && userRole !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;