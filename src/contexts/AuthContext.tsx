import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: 'patient' | 'staff' | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  user: null,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'patient' | 'staff' | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const clearAuthState = () => {
    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
  };

  const fetchUserRole = async (userId: string): Promise<'patient' | 'staff' | null> => {
    try {
      const { data, error } = await supabase
        .from('user_role')
        .select('role_id')
        .eq('user_id', userId);
  
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
  
      if (!data || data.length === 0) {
        return null; // No roles found
      }
  
      // Check for staff roles
      const isStaff = data.some((row) => row.role_id === 2 || (row.role_id >= 3 && row.role_id <= 8));
      if (isStaff) {
        return 'staff';
      }
  
      // If no staff roles, check for patient role
      const isPatient = data.some((row) => row.role_id === 1);
      if (isPatient) {
        return 'patient';
      }
  
      return null; // No valid roles found
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('Setting up auth state...');
    
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session);
        
        if (session?.user) {
          setIsAuthenticated(true);
          setUser(session.user);
          const role = await fetchUserRole(session.user.id);
          console.log('User role:', role);
          setUserRole(role);
        } else {
          console.log('No session found');
          clearAuthState();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthState();
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (session?.user) {
        setIsAuthenticated(true);
        setUser(session.user);
        const role = await fetchUserRole(session.user.id);
        console.log('Updated user role:', role);
        setUserRole(role);
      } else {
        clearAuthState();
      }
    });

    return () => {
      console.log('Cleaning up auth subscriptions');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error('Invalid login credentials');
      }

      if (!data.user) {
        throw new Error('No user returned from login');
      }

      // Role will be set by the auth state change listener
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error);
    }
    clearAuthState();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};