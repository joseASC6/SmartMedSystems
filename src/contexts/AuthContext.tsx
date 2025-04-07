import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthData, setAuthData, clearAuthData, getUserRole } from '../utils/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: 'patient' | 'provider' | null;
  login: (token: string, role: 'patient' | 'provider') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'patient' | 'provider' | null>(null);

  useEffect(() => {
    const role = getUserRole();
    setIsAuthenticated(!!role);
    setUserRole(role);

    const checkAuth = () => {
      const role = getUserRole();
      setIsAuthenticated(!!role);
      setUserRole(role);
    };

    // Check auth status on focus and visibility change
    window.addEventListener('focus', checkAuth);
    document.addEventListener('visibilitychange', checkAuth);

    return () => {
      window.removeEventListener('focus', checkAuth);
      document.removeEventListener('visibilitychange', checkAuth);
    };
  }, []);

  const login = (token: string, role: 'patient' | 'provider') => {
    setAuthData(token, role);
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const logout = () => {
    clearAuthData();
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};