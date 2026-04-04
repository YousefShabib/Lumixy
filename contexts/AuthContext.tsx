import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { AuthUser } from '@/services/auth';
import {
  clearAuthSession,
  getStoredAuthSession,
  saveAuthSession,
  StoredAuthRole,
  StoredAuthSession,
} from '@/services/storage';

type AuthSessionInput = {
  token: string;
  role: StoredAuthRole;
  user: AuthUser;
};

type AuthContextValue = {
  clearSession: () => Promise<void>;
  isAuthenticated: boolean;
  isHydrating: boolean;
  role: StoredAuthRole | null;
  setSession: (session: AuthSessionInput) => Promise<void>;
  user: AuthUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeStoredUser(user: StoredAuthSession['user'] | null | undefined): AuthUser | null {
  if (!user) {
    return null;
  }

  return user as AuthUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isHydrating, setIsHydrating] = useState(true);
  const [session, setSessionState] = useState<AuthSessionInput | null>(null);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      try {
        const storedSession = await getStoredAuthSession();
        if (!isMounted || !storedSession) {
          return;
        }

        const normalizedUser = normalizeStoredUser(storedSession.user);
        if (!normalizedUser) {
          await clearAuthSession();
          return;
        }

        setSessionState({
          token: storedSession.token,
          role: storedSession.role,
          user: normalizedUser,
        });
      } finally {
        if (isMounted) {
          setIsHydrating(false);
        }
      }
    };

    void hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      clearSession: async () => {
        await clearAuthSession();
        setSessionState(null);
      },
      isAuthenticated: Boolean(session?.token),
      isHydrating,
      role: session?.role ?? null,
      setSession: async (nextSession) => {
        await saveAuthSession(nextSession);
        setSessionState(nextSession);
      },
      user: session?.user ?? null,
    }),
    [isHydrating, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider.');
  }

  return context;
}
