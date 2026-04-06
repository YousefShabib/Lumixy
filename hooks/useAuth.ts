import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';

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
  const [manualError, setManualError] = useState('');
  const { clearSession, isAuthenticated, isHydrating, role, setSession, user } = useAuthContext();
  const loginMutation = useMutation({
    mutationFn: loginProviderRequest,
    onSuccess: async (response: AuthResponse) => {
      await setSession({
        token: response.token,
        role: response.user.role,
        user: response.user,
      });
    },
  });
  const registerMutation = useMutation({
    mutationFn: registerProviderRequest,
    onSuccess: async (response: AuthResponse) => {
      await setSession({
        token: response.token,
        role: response.user.role,
        user: response.user,
      });
    },
  });
  const sendForgotPasswordOtpMutation = useMutation({
    mutationFn: sendForgotPasswordOtpRequest,
  });
  const verifyPasswordOtpMutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      verifyPasswordOtpRequest(email, otp),
  });
  const resetPasswordMutation = useMutation({
    mutationFn: ({
      email,
      otp,
      password,
      passwordConfirmation,
    }: {
      email: string;
      otp: string;
      password: string;
      passwordConfirmation: string;
    }) => resetPasswordWithOtpRequest(email, otp, password, passwordConfirmation),
  });
  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (role === 'admin') {
        await logoutAdminRequest();
        return;
      }

      if (role === 'provider') {
        await logoutProviderRequest();
        return;
      }
    },
    onSettled: async () => {
      await clearSession();
    },
  });

  const mutationMap = {
    login: loginMutation,
    logout: logoutMutation,
    register: registerMutation,
    resetPassword: resetPasswordMutation,
    sendForgotPasswordOtp: sendForgotPasswordOtpMutation,
    verifyPasswordOtp: verifyPasswordOtpMutation,
  } satisfies Record<AuthAction, { error: unknown; isPending: boolean; reset: () => void }>;

  const clearError = () => {
    setManualError('');
    Object.values(mutationMap).forEach((mutation) => mutation.reset());
  };

  const error =
    manualError ||
    Object.values(mutationMap)
      .map((mutation) => (mutation.error ? getReadableError(mutation.error) : ''))
      .find(Boolean) ||
    '';

  return {
    isAuthenticated,
    isHydrating,
    role,
    user,
    error,
    clearError,
    setError: (message: string) => {
      clearError();
      setManualError(message);
    },
    isLoading: (action?: AuthAction) => {
      return action
        ? mutationMap[action].isPending
        : Object.values(mutationMap).some((mutation) => mutation.isPending);
    },
    login: (payload: Parameters<typeof loginProviderRequest>[0]) =>
      loginMutation.mutateAsync(payload),
    register: (payload: Parameters<typeof registerProviderRequest>[0]) =>
      registerMutation.mutateAsync(payload),
    sendForgotPasswordOtp: (email: string) =>
      sendForgotPasswordOtpMutation.mutateAsync(email),
    verifyPasswordOtp: (email: string, otp: string) =>
      verifyPasswordOtpMutation.mutateAsync({ email, otp }),
    resetPassword: (
      email: string,
      otp: string,
      password: string,
      passwordConfirmation: string
    ) =>
      resetPasswordMutation.mutateAsync({
        email,
        otp,
        password,
        passwordConfirmation,
      }),
    logout: () => logoutMutation.mutateAsync(),
  };
}
