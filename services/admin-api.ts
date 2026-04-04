import { apiRequest, type ApiRequestConfig } from '@/services/api';

export type AdminUser = {
  email: string;
  full_name: string;
  id: string;
  phone: string | null;
  role: 'admin';
  status: 'active' | 'inactive';
};

export type AdminLoginResponse = {
  message: string;
  token: string;
  user: AdminUser;
};

export type AdminProviderApplication = {
  application_status: 'approved' | 'pending' | 'rejected';
  created_at?: string;
  id: string;
  notes?: string | null;
  reviewed_at?: string | null;
  submitted_at?: string | null;
};

export type AdminProviderRecord = {
  applications?: AdminProviderApplication[];
  category?: {
    id: string;
    name: string;
  } | null;
  city?: string | null;
  custom_services?: string[] | null;
  id: string;
  provider_name?: string | null;
  user?: {
    email: string;
    full_name: string;
    id: string;
    phone?: string | null;
    status: 'active' | 'inactive';
  } | null;
};

export type PaginatedResponse<T> = {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
};

export type AdminCategoryRecord = {
  approved_providers_count: number;
  icon?: string | null;
  id: string;
  is_active: boolean;
  name: string;
  provider_profiles_count: number;
  sort_order: number;
};

export type CategoryPayload = {
  is_active: boolean;
  name: string;
  sort_order?: number;
};

export type AdminCreatePayload = {
  email: string;
  full_name: string;
  password: string;
  password_confirmation: string;
  phone?: string;
};

export type AdminProfilePayload = {
  email: string;
  full_name: string;
  password?: string;
  password_confirmation?: string;
  phone?: string;
};

type AdminApiResponse<T> = {
  data: T;
};

async function adminRequest<T>(path: string, config: ApiRequestConfig = {}) {
  const data = await apiRequest<T>(path, config);
  return { data } as AdminApiResponse<T>;
}

export async function loginAdmin(email: string, password: string) {
  return adminRequest<AdminLoginResponse>('/admin/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function fetchAdminMe() {
  return adminRequest<AdminUser>('/admin/me', {
    method: 'GET',
    requiresAuth: true,
  });
}

export async function updateAdminProfile(payload: AdminProfilePayload) {
  return adminRequest<{ message: string; user: AdminUser }>('/admin/auth/profile', {
    method: 'PUT',
    requiresAuth: true,
    body: payload,
  });
}

export async function createAdminAccount(payload: AdminCreatePayload) {
  return adminRequest<{ message: string; user: AdminUser }>('/admin/admins', {
    method: 'POST',
    requiresAuth: true,
    body: payload,
  });
}

export async function logoutAdmin() {
  return adminRequest<{ message: string }>('/admin/auth/logout', {
    method: 'POST',
    requiresAuth: true,
  });
}

export async function fetchAdminProviders() {
  return adminRequest<PaginatedResponse<AdminProviderRecord>>('/admin/providers', {
    method: 'GET',
    requiresAuth: true,
  });
}

export async function fetchAdminPendingProviders() {
  return adminRequest<AdminProviderRecord[]>('/admin/providers/pending', {
    method: 'GET',
    requiresAuth: true,
  });
}

export async function approveProvider(providerId: string) {
  return adminRequest<{ message: string }>(`/admin/providers/${providerId}/approve`, {
    method: 'POST',
    requiresAuth: true,
  });
}

export async function rejectProvider(
  providerId: string,
  rejectionReason: string
) {
  return adminRequest<{ message: string }>(`/admin/providers/${providerId}/reject`, {
    method: 'POST',
    requiresAuth: true,
    body: {
      rejection_reason: rejectionReason,
    },
  });
}

export async function suspendProvider(
  providerId: string,
  reason: string
) {
  return adminRequest<{ message: string }>(`/admin/providers/${providerId}/suspend`, {
    method: 'POST',
    requiresAuth: true,
    body: { reason },
  });
}

export async function deleteProvider(providerId: string) {
  return adminRequest<{ message: string }>(`/admin/providers/${providerId}`, {
    method: 'DELETE',
    requiresAuth: true,
  });
}

export async function fetchAdminCategories() {
  return adminRequest<AdminCategoryRecord[]>('/admin/categories', {
    method: 'GET',
    requiresAuth: true,
  });
}

export async function createCategory(payload: CategoryPayload) {
  return adminRequest<{ category: AdminCategoryRecord; message: string }>('/admin/categories', {
    method: 'POST',
    requiresAuth: true,
    body: payload,
  });
}

export async function updateCategory(categoryId: string, payload: CategoryPayload) {
  return adminRequest<{ category: AdminCategoryRecord; message: string }>(
    `/admin/categories/${categoryId}`,
    {
      method: 'PUT',
      requiresAuth: true,
      body: payload,
    }
  );
}

export async function deleteCategory(categoryId: string) {
  return adminRequest<{ message: string }>(`/admin/categories/${categoryId}`, {
    method: 'DELETE',
    requiresAuth: true,
  });
}
