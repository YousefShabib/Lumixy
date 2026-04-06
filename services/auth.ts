import { apiRequest } from '@/services/api';
import StorageService from '@/services/storage';

export type AuthRole = 'admin' | 'provider';

export type AuthUser = {
  id: string | number;
  full_name: string;
  email: string;
  role: AuthRole;
  status?: string;
  providerProfile?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export type AuthResponse = {
  message?: string;
  token: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
};

async function persistAuthResponse(response: AuthResponse) {
  await StorageService.saveSession({
    token: response.token,
    role: response.user.role,
    user: response.user,
  });
}

export async function loginProvider(payload: LoginPayload) {
  const response = (await apiRequest('auth/login', {
    method: 'POST',
    body: payload,
  })) as AuthResponse;

  await persistAuthResponse(response);
  return response;
}

export async function registerProvider(payload: RegisterPayload) {
  const response = (await apiRequest('provider/auth/register', {
    method: 'POST',
    body: payload,
  })) as AuthResponse;

  await persistAuthResponse(response);
  return response;
}

export async function sendForgotPasswordOtp(email: string) {
  return apiRequest('auth/forgot-password', { method: 'POST', body: { email } });
}

export async function verifyPasswordOtp(email: string, otp: string) {
  return apiRequest('auth/verify-otp', { method: 'POST', body: { email, otp } });
}

export async function resetPasswordWithOtp(
  email: string,
  otp: string,
  password: string,
  password_confirmation: string
) {
  return apiRequest('auth/reset-password', {
    method: 'POST',
    body: { email, otp, password, password_confirmation },
  });
}

export async function logoutProvider() {
  await apiRequest('provider/auth/logout', { method: 'POST', requiresAuth: true });
}

export async function logoutAdmin() {
  await apiRequest('admin/auth/logout', { method: 'POST', requiresAuth: true });
}
