import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types/user';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  loginAsDemoUser,
  logoutUser,
  getPersistedSession,
  DEMO_USER,
} from '@/services/auth/authService';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  loginGoogle: (mockUser?: { email: string; name: string; photoUrl?: string }) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const persisted = await getPersistedSession();
        if (persisted) {
          setUser(persisted);
        } else {
          // Auto-initialize demo user on first startup for instant hackathon showcase
          setUser(DEMO_USER);
        }
      } catch (err) {
        setUser(DEMO_USER);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const profile = await loginWithEmail(email, pass);
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const profile = await registerWithEmail(name, email, pass);
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const loginGoogle = async (mockUser?: { email: string; name: string; photoUrl?: string }) => {
    setIsLoading(true);
    try {
      const profile = await loginWithGoogle(mockUser);
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    setIsLoading(true);
    try {
      const profile = await loginAsDemoUser();
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        loginGoogle,
        loginDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
