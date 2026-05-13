import type { AdminUser } from '@/services/admin-auth-api';
import { apiRequest, type ApiRequestConfig } from '@/services/api';

export type AdminAccountRecord = AdminUser & {
  created_at?: string;
  updated_at?: string;
};

export type AdminProviderApplication = {
  application_status: 'approved' | 'pending' | 'rejected';
  created_at?: string;
  id: string;
  notes?: string | null;
  reviewed_at?: string | null;
  submitted_at?: string | null;
};

export type AdminProviderGalleryItem = {
  id?: string;
  image?: string | null;
  image_path?: string | null;
  image_url?: string | null;
  path?: string | null;
  secure_url?: string | null;
  url?: string | null;
};

type AdminProviderWorkingHour = {
  day_of_week?: string | null;
  end_time?: string | null;
  id?: string;
  is_active?: boolean;
  start_time?: string | null;
};

export type AdminProviderRecord = {
  applications?: AdminProviderApplication[];
  bio?: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  city?: string | null;
  custom_services?: string[] | null;
  facebook_url?: string | null;
  gallery?: AdminProviderGalleryItem[] | null;
  gallery_images?: Array<AdminProviderGalleryItem | string> | null;
  id: string;
  image_url?: string | null;
  instagram_username?: string | null;
  location_text?: string | null;
  provider_name?: string | null;
  profile_image?: string | null;
  profile_image_url?: string | null;
  user?: {
    email: string;
    full_name: string;
    id: string;
    phone?: string | null;
    status: 'active' | 'inactive';
  } | null;
  whatsapp_number?: string | null;
  works?: Array<AdminProviderGalleryItem | string> | null;
  working_hours?: AdminProviderWorkingHour[] | null;
};

type PaginatedResponse<T> = {
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

export async function fetchAdminAccounts() {
  return adminRequest<AdminAccountRecord[]>('/admin/admins', {
    method: 'GET',
    requiresAuth: true,
  });
}

export async function deleteAdminAccount(adminId: string) {
  return adminRequest<{ message: string }>(`/admin/admins/${adminId}`, {
    method: 'DELETE',
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
