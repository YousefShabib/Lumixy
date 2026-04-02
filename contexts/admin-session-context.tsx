import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  createAdminAccount,
  fetchAdminMe,
  loginAdmin,
  logoutAdmin,
  type AdminCreatePayload,
  type AdminProfilePayload,
  type AdminUser,
  updateAdminProfile,
} from '@/lib/admin-api';
import { getApiErrorMessage } from '@/lib/api-client';

type ActionResult = {
  message: string;
  success: boolean;
};

type CreateAdminResult = ActionResult & {
  user?: AdminUser;
};

type AdminSessionContextValue = {
  adminUser: AdminUser | null;
  apiBaseUrl: string | null;
  authError: string | null;
  clearAuthError: () => void;
  createAdmin: (payload: AdminCreatePayload) => Promise<CreateAdminResult>;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login: (email: string, password: string) => Promise<ActionResult>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<ActionResult>;
  token: string | null;
  updateProfile: (payload: AdminProfilePayload) => Promise<ActionResult>;
};

const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    setAdminUser(null);
    setApiBaseUrl(null);
    setAuthError(null);
    setToken(null);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const { data, baseUrl } = await loginAdmin(email, password);

      setAdminUser(data.user);
      setApiBaseUrl(baseUrl);
      setToken(data.token);

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error('فشل تسجيل الدخول:', error);
      setAuthError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token || !apiBaseUrl) {
      const message = 'لا توجد جلسة إدارة نشطة حالياً.';
      setAuthError(message);
      return { success: false, message };
    }

    try {
      const { data } = await fetchAdminMe(apiBaseUrl, token);
      setAdminUser(data);

      return {
        success: true,
        message: 'تم تحديث بيانات الحساب من الخادم.',
      };
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error('فشل تحديث بيانات الحساب:', error);
      setAuthError(message);

      return {
        success: false,
        message,
      };
    }
  }, [apiBaseUrl, token]);

  const updateProfile = useCallback(
    async (payload: AdminProfilePayload) => {
      if (!token || !apiBaseUrl) {
        const message = 'الجلسة الحالية غير صالحة. سجّل الدخول من جديد.';
        setAuthError(message);
        return { success: false, message };
      }

      try {
        const { data } = await updateAdminProfile(apiBaseUrl, token, payload);
        setAdminUser(data.user);

        return {
          success: true,
          message: data.message,
        };
      } catch (error) {
        const message = getApiErrorMessage(error);
        console.error('فشل حفظ البيانات الشخصية:', error);
        setAuthError(message);

        return {
          success: false,
          message,
        };
      }
    },
    [apiBaseUrl, token]
  );

  const createAdmin = useCallback(
    async (payload: AdminCreatePayload) => {
      if (!token || !apiBaseUrl) {
        const message = 'الجلسة الحالية غير صالحة. سجّل الدخول من جديد.';
        setAuthError(message);
        return { success: false, message };
      }

      try {
        const { data } = await createAdminAccount(apiBaseUrl, token, payload);

        return {
          success: true,
          message: data.message,
          user: data.user,
        };
      } catch (error) {
        const message = getApiErrorMessage(error);
        console.error('فشل إنشاء الحساب الإداري:', error);
        setAuthError(message);

        return {
          success: false,
          message,
        };
      }
    },
    [apiBaseUrl, token]
  );

  const logout = useCallback(async () => {
    if (token && apiBaseUrl) {
      try {
        await logoutAdmin(apiBaseUrl, token);
      } catch (error) {
        console.error('فشل تسجيل الخروج:', error);
      }
    }

    clearSession();
  }, [apiBaseUrl, clearSession, token]);

  const value = useMemo<AdminSessionContextValue>(
    () => ({
      adminUser,
      apiBaseUrl,
      authError,
      clearAuthError,
      createAdmin,
      isAuthenticated: Boolean(token && adminUser),
      isAuthenticating,
      login,
      logout,
      refreshProfile,
      token,
      updateProfile,
    }),
    [
      adminUser,
      apiBaseUrl,
      authError,
      clearAuthError,
      createAdmin,
      isAuthenticating,
      login,
      logout,
      refreshProfile,
      token,
      updateProfile,
    ]
  );

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession() {
  const context = useContext(AdminSessionContext);

  if (!context) {
    throw new Error('useAdminSession must be used within AdminSessionProvider');
  }

  return context;
}
