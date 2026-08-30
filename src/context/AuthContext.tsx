import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  demoLogin: (email: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('travel_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('travel_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          setUser(res.user);
          setToken(storedToken);
        } catch (err) {
          console.warn('Session expired or invalid, initiating demo login...');
          // Auto login as default demo user for seamless instant preview
          await performDemoLogin('alex@traveler.com');
        }
      } else {
        // Auto demo login so live preview is instantly functional
        await performDemoLogin('alex@traveler.com');
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const performDemoLogin = async (email: string) => {
    try {
      const res = await authService.login(email, 'password123');
      localStorage.setItem('travel_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err) {
      console.error('Demo login error:', err);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    localStorage.setItem('travel_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    const res = await authService.register(userData);
    localStorage.setItem('travel_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const demoLogin = async (email: string) => {
    await performDemoLogin(email);
  };

  const logout = () => {
    localStorage.removeItem('travel_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await authService.updateProfile(data);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
