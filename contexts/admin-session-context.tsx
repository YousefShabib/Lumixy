import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuthContext } from '@/contexts/AuthContext';
import {
  createAdminAccount,
  fetchAdminMe,
  loginAdmin,
  logoutAdmin,
  type AdminCreatePayload,
  type AdminProfilePayload,
  type AdminUser,
  updateAdminProfile,
} from '@/services/admin-api';
import { getReadableError } from '@/services/api';
import { getStoredToken } from '@/services/storage';

type ActionResult = {
  message: string;
  success: boolean;
};

type CreateAdminResult = ActionResult & {
  user?: AdminUser;
};

type AdminSessionContextValue = {
  adminUser: AdminUser | null;
  authError: string | null;
  clearAuthError: () => void;
  createAdmin: (payload: AdminCreatePayload) => Promise<CreateAdminResult>;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login: (email: string, password: string) => Promise<ActionResult>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<ActionResult>;
  updateProfile: (payload: AdminProfilePayload) => Promise<ActionResult>;
};

const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const { clearSession, isHydrating, role, setSession, user } = useAuthContext();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  const adminUser = useMemo<AdminUser | null>(() => {
    if (role !== 'admin' || !user) {
      return null;
    }

    return user as AdminUser;
  }, [role, user]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsSubmittingLogin(true);
    setAuthError(null);

    try {
      const { data } = await loginAdmin(email, password);

      await setSession({
        token: data.token,
        role: data.user.role,
        user: data.user,
      });

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      const message = getReadableError(error);
      console.error('فشل تسجيل الدخول:', error);
      setAuthError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setIsSubmittingLogin(false);
    }
  }, [setSession]);

  const refreshProfile = useCallback(async () => {
    if (role !== 'admin') {
      const message = 'لا توجد جلسة إدارة نشطة حالياً.';
      setAuthError(message);
      return { success: false, message };
    }

    try {
      const { data } = await fetchAdminMe();
      const currentToken = await getStoredToken();

      if (!currentToken) {
        const message = 'الجلسة الحالية غير صالحة. سجّل الدخول من جديد.';
        setAuthError(message);
        return { success: false, message };
      }

      await setSession({
        token: currentToken,
        role: 'admin',
        user: data,
      });

      return {
        success: true,
        message: 'تم تحديث بيانات الحساب من الخادم.',
      };
    } catch (error) {
      const message = getReadableError(error);
      console.error('فشل تحديث بيانات الحساب:', error);
      setAuthError(message);

      return {
        success: false,
        message,
      };
    }
  }, [role, setSession]);

  const updateProfile = useCallback(
    async (payload: AdminProfilePayload) => {
      if (role !== 'admin') {
        const message = 'الجلسة الحالية غير صالحة. سجّل الدخول من جديد.';
        setAuthError(message);
        return { success: false, message };
      }

      try {
        const { data } = await updateAdminProfile(payload);
        const currentToken = await getStoredToken();

        if (!currentToken) {
          const message = 'الجلسة الحالية غير صالحة. سجّل الدخول من جديد.';
          setAuthError(message);
          return { success: false, message };
        }

        await setSession({
          token: currentToken,
          role: 'admin',
          user: data.user,
        });

        return {
          success: true,
          message: data.message,
        };
      } catch (error) {
        const message = getReadableError(error);
        console.error('فشل حفظ البيانات الشخصية:', error);
        setAuthError(message);

        return {
          success: false,
          message,
        };
      }
    },
    [role, setSession]
  );

  const createAdmin = useCallback(
    async (payload: AdminCreatePayload) => {
      if (role !== 'admin') {
        const message = 'الجلسة الحالية غير صالحة. سجّل الدخول من جديد.';
        setAuthError(message);
        return { success: false, message };
      }

      try {
        const { data } = await createAdminAccount(payload);

        return {
          success: true,
          message: data.message,
          user: data.user,
        };
      } catch (error) {
        const message = getReadableError(error);
        console.error('فشل إنشاء الحساب الإداري:', error);
        setAuthError(message);

        return {
          success: false,
          message,
        };
      }
    },
    [role]
  );

  const logout = useCallback(async () => {
    if (role === 'admin') {
      try {
        await logoutAdmin();
      } catch (error) {
        console.error('فشل تسجيل الخروج:', error);
      }
    }

    await clearSession();
    setAuthError(null);
  }, [clearSession, role]);

  const value = useMemo<AdminSessionContextValue>(
    () => ({
      adminUser,
      authError,
      clearAuthError,
      createAdmin,
      isAuthenticated: role === 'admin' && Boolean(adminUser),
      isAuthenticating: isHydrating || isSubmittingLogin,
      login,
      logout,
      refreshProfile,
      updateProfile,
    }),
    [
      adminUser,
      authError,
      clearAuthError,
      createAdmin,
      isHydrating,
      isSubmittingLogin,
      login,
      logout,
      refreshProfile,
      role,
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
