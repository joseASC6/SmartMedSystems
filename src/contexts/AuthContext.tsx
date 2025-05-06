import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: 'patient' | 'staff' | null;
  user: User | null;
  login: (email: string, password: string) => Promise<{ userRole: 'patient' | 'staff' | null }>;
  logout: () => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  user: null,
  login: async () => ({ userRole: null }),
  logout: async () => {},
  refreshUserRole: () => Promise.resolve(),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'patient' | 'staff' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const clearAuthState = () => {
    console.log('Clearing auth state');
    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
  };

  const fetchUserRole = async (userId: string): Promise<'patient' | 'staff' | null> => {
    try {
      console.log('Fetching user role for:', userId);
      
      // First try to get the role from localStorage
      const cachedRole = localStorage.getItem(`user_role_${userId}`);
      if (cachedRole === 'patient' || cachedRole === 'staff') {
        console.log('Found cached role:', cachedRole);
        return cachedRole;
      }

      // If no cached role, fetch from database
      const { data, error } = await supabase
        .from('user_role')
        .select('role_id')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log('No role found for user');
        return null;
      }

      // Get the highest role ID (staff roles take precedence)
      const highestRoleId = Math.max(...data.map(role => role.role_id));
      console.log('Highest role ID:', highestRoleId);

      let role: 'patient' | 'staff' | null = null;
      if (highestRoleId === 1) {
        role = 'patient';
      } else if (highestRoleId >= 2 && highestRoleId <= 8) {
        role = 'staff';
      }

      // Cache the role
      if (role) {
        localStorage.setItem(`user_role_${userId}`, role);
      }

      console.log('Determined role:', role);
      return role;
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return null;
    }
  };

  const refreshUserRole = async () => {
    if (!user?.id) {
      console.log('Cannot refresh role: no user ID');
      return;
    }

    console.log('Refreshing user role');
    const role = await fetchUserRole(user.id);
    console.log('Refreshed role:', role);
    setUserRole(role);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          console.log('Found existing session');
          setIsAuthenticated(true);
          setUser(session.user);
          const role = await fetchUserRole(session.user.id);
          console.log('Initial role:', role);
          if (mounted) {
            setUserRole(role);
          }
        } else {
          console.log('No session found');
          clearAuthState();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthState();
      } finally {
        if (mounted) {
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (session?.user && mounted) {
        console.log('Session exists, updating state');
        setIsAuthenticated(true);
        setUser(session.user);
        const role = await fetchUserRole(session.user.id);
        console.log('Updated role:', role);
        if (mounted) {
          setUserRole(role);
        }
      } else {
        console.log('No session, clearing state');
        clearAuthState();
      }
    });

    return () => {
      console.log('Cleaning up auth subscriptions');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from login');

      console.log('Login successful, fetching role');
      const role = await fetchUserRole(data.user.id);
      console.log('Login complete, role:', role);
      return { userRole: role };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('Logging out');
    if (user?.id) {
      localStorage.removeItem(`user_role_${user.id}`);
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error);
    }
    clearAuthState();
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, user, login, logout, refreshUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};