import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: 'patient' | 'staff' | null;
  user: { id: string } | null;
  login: (userId: string, role: 'patient' | 'staff') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  user: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'patient' | 'staff' | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        setUser({ id: session.user.id });
        
        // Check user role
        const { data: roleData } = await supabase
          .from('user_role')
          .select('role_id')
          .eq('user_id', session.user.id)
          .single();

        if (roleData) {
          setUserRole(roleData.role_id === 1 ? 'patient' : 'staff');
        }
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthenticated(true);
        setUser({ id: session.user.id });
        
        // Check user role
        const { data: roleData } = await supabase
          .from('user_role')
          .select('role_id')
          .eq('user_id', session.user.id)
          .single();

        if (roleData) {
          setUserRole(roleData.role_id === 1 ? 'patient' : 'staff');
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (userId: string, role?: 'patient' | 'staff') => {
    setIsAuthenticated(true);
    setUser({ id: userId });
    if (role) {
      setUserRole(role);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};