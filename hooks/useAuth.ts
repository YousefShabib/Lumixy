import { useState } from 'react';

import { useAuthContext } from '@/contexts/AuthContext';
import { getReadableError } from '@/services/api';
import {
  AuthResponse,
  loginProvider as loginProviderRequest,
  logoutAdmin as logoutAdminRequest,
  logoutProvider as logoutProviderRequest,
  registerProvider as registerProviderRequest,
  resetPasswordWithOtp as resetPasswordWithOtpRequest,
  sendForgotPasswordOtp as sendForgotPasswordOtpRequest,
  verifyPasswordOtp as verifyPasswordOtpRequest,
} from '@/services/auth';

type AuthAction =
  | 'login'
  | 'register'
  | 'sendForgotPasswordOtp'
  | 'verifyPasswordOtp'
  | 'resetPassword'
  | 'logout';

export default function useAuth() {
  const [pendingAction, setPendingAction] = useState<AuthAction | null>(null);
  const [error, setError] = useState('');
  const { clearSession, isAuthenticated, isHydrating, role, setSession, user } = useAuthContext();

  const runAction = async <T>(action: AuthAction, callback: () => Promise<T>) => {
    try {
      setPendingAction(action);
      setError('');
      return await callback();
    } catch (e) {
      const message = getReadableError(e);
      setError(message);
      throw e;
    } finally {
      setPendingAction(null);
    }
  };

  return {
    isAuthenticated,
    isHydrating,
    role,
    user,
    error,
    clearError: () => setError(''),
    setError: (message: string) => setError(message),
    isLoading: (action?: AuthAction) => {
      if (!pendingAction) {
        return false;
      }

      return action ? pendingAction === action : true;
    },
    login: (payload: Parameters<typeof loginProviderRequest>[0]) =>
      runAction('login', async () => {
        const response: AuthResponse = await loginProviderRequest(payload);

        await setSession({
          token: response.token,
          role: response.user.role,
          user: response.user,
        });

        return response;
      }),
    register: (payload: Parameters<typeof registerProviderRequest>[0]) =>
      runAction('register', async () => {
        const response = await registerProviderRequest(payload);

        await setSession({
          token: response.token,
          role: response.user.role,
          user: response.user,
        });

        return response;
      }),
    sendForgotPasswordOtp: (email: string) =>
      runAction('sendForgotPasswordOtp', () => sendForgotPasswordOtpRequest(email)),
    verifyPasswordOtp: (email: string, otp: string) =>
      runAction('verifyPasswordOtp', () => verifyPasswordOtpRequest(email, otp)),
    resetPassword: (
      email: string,
      otp: string,
      password: string,
      passwordConfirmation: string
    ) =>
      runAction('resetPassword', () =>
        resetPasswordWithOtpRequest(email, otp, password, passwordConfirmation)
      ),
    logout: () =>
      runAction('logout', async () => {
        if (role === 'admin') {
          await logoutAdminRequest();
          return;
        }

        if (role === 'provider') {
          await logoutProviderRequest();
          return;
        }

        await clearSession();
      }),
  };
}
