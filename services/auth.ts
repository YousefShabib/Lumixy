import { apiRequest } from '@/services/api'; 
import { ApiError } from '@/services/api';
import { clearAuthSession } from '@/services/storage'; 

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
 
export async function loginProvider(payload: { email: string; password: string }) { 
  return apiRequest('provider/auth/login', { method: 'POST', body: payload }) as Promise<AuthResponse>; 
} 
 
export async function registerProvider(payload: { full_name: string; email: string; phone: string; password: string; password_confirmation: string }) { 
  return apiRequest('provider/auth/register', { method: 'POST', body: payload }) as Promise<AuthResponse>; 
} 

export async function loginAdmin(payload: { email: string; password: string }) {
  return apiRequest('admin/auth/login', { method: 'POST', body: payload }) as Promise<AuthResponse>;
}

export async function loginWithDetectedRole(payload: { email: string; password: string }) {
  try {
    return await loginProvider(payload);
  } catch (providerError) {
    try {
      return await loginAdmin(payload);
    } catch (adminError) {
      if (adminError instanceof ApiError) {
        throw adminError;
      }

      if (providerError instanceof ApiError) {
        throw providerError;
      }

      throw adminError;
    }
  }
}
 
export async function sendForgotPasswordOtp(email: string) { 
  return apiRequest('auth/forgot-password', { method: 'POST', body: { email } }); 
} 
 
export async function verifyPasswordOtp(email: string, otp: string) { 
  return apiRequest('auth/verify-otp', { method: 'POST', body: { email, otp } }); 
} 
 
export async function resetPasswordWithOtp(email: string, otp: string, password: string, password_confirmation: string) { 
  return apiRequest('auth/reset-password', { method: 'POST', body: { email, otp, password, password_confirmation } }); 
} 
 
export async function logoutProvider() { 
  try { 
    await apiRequest('provider/auth/logout', { method: 'POST', requiresAuth: true }); 
  } finally { 
    await clearAuthSession(); 
  } 
}

export async function logoutAdmin() {
  try {
    await apiRequest('admin/auth/logout', { method: 'POST', requiresAuth: true });
  } finally {
    await clearAuthSession();
  } 
}
