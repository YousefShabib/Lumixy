import { requestApi } from '@/lib/api-client';

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

export async function loginAdmin(email: string, password: string) {
  return requestApi<AdminLoginResponse>({
    method: 'POST',
    path: '/admin/auth/login',
    body: { email, password },
  });
}

export async function fetchAdminMe(baseUrl: string, token: string) {
  return requestApi<AdminUser>({
    baseUrl,
    method: 'GET',
    path: '/admin/me',
    token,
  });
}

export async function updateAdminProfile(
  baseUrl: string,
  token: string,
  payload: AdminProfilePayload
) {
  return requestApi<{ message: string; user: AdminUser }>({
    baseUrl,
    method: 'PUT',
    path: '/admin/auth/profile',
    token,
    body: payload,
  });
}

export async function createAdminAccount(
  baseUrl: string,
  token: string,
  payload: AdminCreatePayload
) {
  return requestApi<{ message: string; user: AdminUser }>({
    baseUrl,
    method: 'POST',
    path: '/admin/admins',
    token,
    body: payload,
  });
}

export async function logoutAdmin(baseUrl: string, token: string) {
  return requestApi<{ message: string }>({
    baseUrl,
    method: 'POST',
    path: '/admin/auth/logout',
    token,
  });
}

export async function fetchAdminProviders(baseUrl: string, token: string) {
  return requestApi<PaginatedResponse<AdminProviderRecord>>({
    baseUrl,
    method: 'GET',
    path: '/admin/providers',
    token,
  });
}

export async function approveProvider(baseUrl: string, token: string, providerId: string) {
  return requestApi<{ message: string }>({
    baseUrl,
    method: 'POST',
    path: `/admin/providers/${providerId}/approve`,
    token,
  });
}

export async function rejectProvider(
  baseUrl: string,
  token: string,
  providerId: string,
  rejectionReason: string
) {
  return requestApi<{ message: string }>({
    baseUrl,
    method: 'POST',
    path: `/admin/providers/${providerId}/reject`,
    token,
    body: {
      rejection_reason: rejectionReason,
    },
  });
}

export async function suspendProvider(
  baseUrl: string,
  token: string,
  providerId: string,
  reason: string
) {
  return requestApi<{ message: string }>({
    baseUrl,
    method: 'POST',
    path: `/admin/providers/${providerId}/suspend`,
    token,
    body: { reason },
  });
}

export async function deleteProvider(baseUrl: string, token: string, providerId: string) {
  return requestApi<{ message: string }>({
    baseUrl,
    method: 'DELETE',
    path: `/admin/providers/${providerId}`,
    token,
  });
}

export async function fetchAdminCategories(baseUrl: string, token: string) {
  return requestApi<AdminCategoryRecord[]>({
    baseUrl,
    method: 'GET',
    path: '/admin/categories',
    token,
  });
}

export async function createCategory(
  baseUrl: string,
  token: string,
  payload: CategoryPayload
) {
  return requestApi<{ category: AdminCategoryRecord; message: string }>({
    baseUrl,
    method: 'POST',
    path: '/admin/categories',
    token,
    body: payload,
  });
}

export async function updateCategory(
  baseUrl: string,
  token: string,
  categoryId: string,
  payload: CategoryPayload
) {
  return requestApi<{ category: AdminCategoryRecord; message: string }>({
    baseUrl,
    method: 'PUT',
    path: `/admin/categories/${categoryId}`,
    token,
    body: payload,
  });
}

export async function deleteCategory(baseUrl: string, token: string, categoryId: string) {
  return requestApi<{ message: string }>({
    baseUrl,
    method: 'DELETE',
    path: `/admin/categories/${categoryId}`,
    token,
  });
}
