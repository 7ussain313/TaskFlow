'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AuthUser } from '@/types/auth';
import { AUTH_TOKEN_KEY } from './api-client';

const AUTH_USER_KEY = 'taskflow_user';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Holds the logged-in user in memory + localStorage and exposes login/logout to the app.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // On first render, check localStorage for a token/user from a previous session.
  useEffect(() => {
    const storedToken = window.localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = window.localStorage.getItem(AUTH_USER_KEY);
    if (storedToken && storedUser) {
      // One-time hydration from localStorage on mount; localStorage isn't
      // available during SSR so this can't be a lazy useState initializer.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Persists the token/user after a successful API login and updates state. Clears
  // the React Query cache first so a previous session's data (e.g. another user's
  // work items, still cached from before logout) can never flash on screen.
  const login = useCallback(
    (token: string, user: AuthUser) => {
      queryClient.clear();
      window.localStorage.setItem(AUTH_TOKEN_KEY, token);
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      setUser(user);
    },
    [queryClient],
  );

  // Clears the stored session and all cached query data so the user is fully signed out.
  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
    queryClient.clear();
    setUser(null);
  }, [queryClient]);

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook other components use to read the current user / call login() and logout().
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
