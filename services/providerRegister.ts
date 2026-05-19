import { apiRequest } from '@/services/api';

export type ServiceCategory = {
  id: string;
  name: string;
};

function normalizeCategoryList(data: unknown): ServiceCategory[] {
  if (Array.isArray(data)) {
    return data as ServiceCategory[];
  }

  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown }).data)) {
    return (data as { data: ServiceCategory[] }).data;
  }

  return [];
}

function getFileMetaFromUri(uri: string) {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
  const extension = match?.[1]?.toLowerCase() || 'jpg';

  const typeMap: Record<string, string> = {
    heic: 'image/heic',
    heif: 'image/heif',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };

  const normalizedExtension = typeMap[extension] ? extension : 'jpg';

  return {
    name: `profile.${normalizedExtension}`,
    type: typeMap[extension] || 'image/jpeg',
  };
}

type BusinessPayload = {
  provider_name: string;
  bio?: string;
  category_id: string;
  custom_services: string[];
  onboarding_step?: number;
};

type LocationSchedulePayload = {
  city: string;
  location_text?: string;
  latitude?: number | null;
  longitude?: number | null;
  onboarding_step?: number;
  hours: {
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_active?: boolean;
  }[];
};

type ContactPayload = {
  whatsapp_number: string;
  instagram_username?: string;
  facebook_url?: string;
  onboarding_step?: number;
};

export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  const data = await apiRequest<unknown>('service-categories', { method: 'GET' });
  return normalizeCategoryList(data);
}

export async function uploadProviderImage(imageUri: string) {
  const formData = new FormData();
  const fileMeta = getFileMetaFromUri(imageUri);

  formData.append(
    'profile_image',
    {
      uri: imageUri,
      name: fileMeta.name,
      type: fileMeta.type,
    } as unknown as Blob
  );

  formData.append('onboarding_step', '1');

  await apiRequest('provider/profile/image', {
    method: 'POST',
    body: formData,
    requiresAuth: true,
  });
}

export async function uploadProviderGallery(imageUris: string[]) {
  for (const [index, imageUri] of imageUris.entries()) {
    const fileMeta = getFileMetaFromUri(imageUri);
    const formData = new FormData();

    formData.append('sort_order', String(index));
    formData.append(
      'image',
      {
        uri: imageUri,
        name: `gallery-${index + 1}.${fileMeta.name.split('.').pop() || 'jpg'}`,
        type: fileMeta.type,
      } as unknown as Blob
    );

    await apiRequest('provider/gallery', {
      method: 'POST',
      body: formData,
      requiresAuth: true,
    });
  }
}

export async function updateProviderBusiness(payload: BusinessPayload) {
  await apiRequest('provider/profile/business', {
    method: 'PUT',
    body: payload,
    requiresAuth: true,
  });
}

export async function updateProviderLocationSchedule(payload: LocationSchedulePayload) {
  await apiRequest('provider/profile/location-schedule', {
    method: 'PUT',
    body: payload,
    requiresAuth: true,
  });
}

export async function updateProviderContact(payload: ContactPayload) {
  await apiRequest('provider/profile/contact', {
    method: 'PUT',
    body: payload,
    requiresAuth: true,
  });
}

export async function submitProviderApplication() {
  await apiRequest('provider/submit', { method: 'POST', requiresAuth: true });
}
