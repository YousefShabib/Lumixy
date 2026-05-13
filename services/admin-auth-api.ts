import { apiRequest, type ApiRequestConfig } from '@/services/api';

export type AdminUser = {
  email: string;
  full_name: string;
  id: string;
  phone: string | null;
  role: 'admin';
  status: 'active' | 'inactive';
};

type AdminLoginResponse = {
  message: string;
  token: string;
  user: AdminUser;
};

type AdminAuthResponse<T> = {
  data: T;
};

async function adminAuthRequest<T>(path: string, config: ApiRequestConfig = {}) {
  const data = await apiRequest<T>(path, config);
  return { data } as AdminAuthResponse<T>;
}

export async function loginAdmin(email: string, password: string) {
  return adminAuthRequest<AdminLoginResponse>('/admin/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function fetchAdminMe() {
  return adminAuthRequest<AdminUser>('/admin/me', {
    method: 'GET',
    requiresAuth: true,
  });
}

export async function logoutAdmin() {
  return adminAuthRequest<{ message: string }>('/admin/auth/logout', {
    method: 'POST',
    requiresAuth: true,
  });
}
