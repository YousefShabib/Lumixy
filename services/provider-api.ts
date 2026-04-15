import axios from 'axios';

import {
  clearProviderSession,
  getProviderSession,
  setProviderSession,
  type ProviderSession,
  type ProviderSessionUser,
} from '@/services/provider-session';
import { getApiBaseCandidates, resolveApiAssetUrl } from '@/services/api';
import StorageService from '@/services/storage';

type ProviderStatusValue = 'pending' | 'approved' | 'rejected' | null;
type DayOfWeek =
  | 'saturday'
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday';

type ApiCategory = {
  id: string;
  name: string;
  is_active: boolean;
};

type ApiWorkingHour = {
  id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

type ApiGalleryItem = {
  id: string;
  image_url: string;
  sort_order: number;
};

type ApiApplication = {
  application_status: ProviderStatusValue;
  notes: string | null;
};

type ApiProviderProfile = {
  id: string;
  provider_name: string | null;
  profile_image: string | null;
  bio: string | null;
  category_id: string | null;
  custom_services: string[] | null;
  city: string | null;
  location_text: string | null;
  whatsapp_number: string | null;
  instagram_username: string | null;
  facebook_url: string | null;
  onboarding_step: number;
  is_profile_completed: boolean;
  category?: ApiCategory | null;
  working_hours?: ApiWorkingHour[];
  workingHours?: ApiWorkingHour[];
  gallery?: ApiGalleryItem[];
  applications?: ApiApplication[];
  latest_application?: ApiApplication | null;
  latestApplication?: ApiApplication | null;
};

type ApiProviderUser = ProviderSessionUser & {
  provider_profile?: ApiProviderProfile | null;
  providerProfile?: ApiProviderProfile | null;
};

type LoginResponse = {
  token: string;
  role: 'provider' | 'admin';
  user: ProviderSessionUser;
};

export type ProviderCategoryOption = {
  id: string;
  label: string;
};

export type ProviderGalleryImage = {
  id?: string;
  uri: string;
  isRemote: boolean;
};

export type ProviderWorkingHour = {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export type ProviderApplicationStatus = {
  applicationStatus: ProviderStatusValue;
  notes: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
};

export type ProviderProfileData = {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string;
  phone: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  city: string;
  locationText: string;
  location: string;
  workTime: string;
  workTimeEnd: string;
  about: string;
  avatar: string;
  services: string[];
  works: string[];
  gallery: ProviderGalleryImage[];
  workingHours: ProviderWorkingHour[];
  onboardingStep: number;
  isProfileCompleted: boolean;
  userStatus: string;
  applicationStatus: ProviderStatusValue;
};

export type SaveProviderProfileInput = {
  providerName: string;
  categoryId: string;
  city: string;
  locationText: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  about: string;
  startTime: string;
  endTime: string;
  services: string[];
  avatarUri: string;
  gallery: ProviderGalleryImage[];
  initialGallery: ProviderGalleryImage[];
  workingHours: ProviderWorkingHour[];
  shouldSubmit: boolean;
};

export const providerProfileQueryKey = ['provider-profile'] as const;
export const providerCategoriesQueryKey = ['provider-categories'] as const;
export const providerStatusQueryKey = ['provider-application-status'] as const;

const dayOrder: DayOfWeek[] = [
  'saturday',
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
];

const defaultProviderAvatar =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY8jIyPgPAASsAjgP4eRUAAAAAElFTkSuQmCC';

function resolveApiBaseUrl() {
  return getApiBaseCandidates()[0] ?? 'http://127.0.0.1:8000/api';
}

export const apiBaseUrl = resolveApiBaseUrl();

function createApiClient(token?: string) {
  return axios.create({
    baseURL: apiBaseUrl,
    timeout: 15000,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

function getAuthorizedApiClient() {
  const session = getProviderSession();

  if (!session?.token) {
    throw new Error('يجب تسجيل الدخول أولًا.');
  }

  return createApiClient(session.token);
}

function maskToken(token?: string | null) {
  if (!token) {
    return null;
  }

  if (token.length <= 12) {
    return `${token.slice(0, 4)}...`;
  }

  return `${token.slice(0, 8)}...${token.slice(-4)}`;
}

function getProviderProfileRelation(user: ApiProviderUser) {
  return user.provider_profile ?? user.providerProfile ?? null;
}

function normalizeAssetUrl(path?: string | null) {
  if (!path) {
    return defaultProviderAvatar;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return resolveApiAssetUrl(path) ?? defaultProviderAvatar;
}

function mapWorkingHours(hours: ApiWorkingHour[] = []): ProviderWorkingHour[] {
  return [...hours]
    .sort((left, right) => dayOrder.indexOf(left.day_of_week) - dayOrder.indexOf(right.day_of_week))
    .map((item) => ({
      dayOfWeek: item.day_of_week,
      startTime: item.start_time,
      endTime: item.end_time,
      isActive: Boolean(item.is_active),
    }));
}

function extractTimeRange(hours: ProviderWorkingHour[]) {
  const activeHours = hours.filter((item) => item.isActive);

  if (activeHours.length === 0) {
    return {
      workTime: '09:00',
      workTimeEnd: '18:00',
    };
  }

  const sortedByStart = [...activeHours].sort((left, right) =>
    left.startTime.localeCompare(right.startTime)
  );
  const sortedByEnd = [...activeHours].sort((left, right) =>
    right.endTime.localeCompare(left.endTime)
  );

  return {
    workTime: sortedByStart[0]?.startTime ?? '09:00',
    workTimeEnd: sortedByEnd[0]?.endTime ?? '18:00',
  };
}

function normalizeInstagramValue(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '';
  }

  const withoutProtocol = trimmedValue
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/\/+$/, '');

  return withoutProtocol.replace(/^@/, '');
}

function isLocalFileUri(uri: string) {
  return uri.startsWith('file://') || uri.startsWith('content://');
}

function inferMimeType(uri: string) {
  const loweredUri = uri.toLowerCase();

  if (loweredUri.endsWith('.png')) {
    return 'image/png';
  }

  if (loweredUri.endsWith('.webp')) {
    return 'image/webp';
  }

  return 'image/jpeg';
}

function buildUploadFile(uri: string, fallbackName: string) {
  const fileName = uri.split('/').pop() || fallbackName;

  return {
    uri,
    name: fileName,
    type: inferMimeType(uri),
  };
}

function buildWorkingHoursPayload(
  currentHours: ProviderWorkingHour[],
  startTime: string,
  endTime: string
) {
  const activeDays = currentHours.filter((item) => item.isActive).map((item) => item.dayOfWeek);
  const daysToUse = activeDays.length > 0 ? [...new Set(activeDays)] : dayOrder;

  return daysToUse.map((day) => ({
    day_of_week: day,
    start_time: startTime,
    end_time: endTime,
    is_active: true,
  }));
}

function mapProviderProfile(user: ApiProviderUser): ProviderProfileData {
  const profile = getProviderProfileRelation(user);

  if (!profile) {
    throw new Error('تعذر العثور على ملف المزود.');
  }

  const workingHours = mapWorkingHours(profile.working_hours ?? profile.workingHours ?? []);
  const { workTime, workTimeEnd } = extractTimeRange(workingHours);
  const gallery = (profile.gallery ?? []).map((item) => ({
    id: item.id,
    uri: normalizeAssetUrl(item.image_url),
    isRemote: true,
  }));

  const latestApplication =
    profile.latest_application ??
    profile.latestApplication ??
    profile.applications?.[0] ??
    null;

  const city = profile.city?.trim() ?? '';
  const locationText = profile.location_text?.trim() ?? '';
  const location = [city, locationText].filter(Boolean).join(' - ');

  return {
    id: profile.id,
    name: profile.provider_name?.trim() || user.full_name,
    categoryId: profile.category_id,
    categoryName: profile.category?.name ?? '',
    phone: user.phone ?? '',
    whatsapp: profile.whatsapp_number ?? '',
    facebook: profile.facebook_url ?? '',
    instagram: profile.instagram_username ?? '',
    city,
    locationText,
    location,
    workTime,
    workTimeEnd,
    about: profile.bio ?? '',
    avatar: normalizeAssetUrl(profile.profile_image),
    services: profile.custom_services ?? [],
    works: gallery.map((item) => item.uri),
    gallery,
    workingHours,
    onboardingStep: profile.onboarding_step,
    isProfileCompleted: Boolean(profile.is_profile_completed),
    userStatus: user.status,
    applicationStatus: latestApplication?.application_status ?? null,
  };
}

export function extractErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseMessage =
      typeof error.response?.data?.message === 'string' ? error.response.data.message : null;

    if (responseMessage) {
      return responseMessage;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'حدث خطأ غير متوقع.';
}

export async function loginProvider(email: string, password: string) {
  const response = await createApiClient().post<LoginResponse>('/auth/login', {
    email: email.trim(),
    password,
  });

  if (response.data.role !== 'provider') {
    throw new Error('هذا المسار مخصص لحسابات المزودين فقط.');
  }

  const session: ProviderSession = {
    token: response.data.token,
    role: response.data.role,
    user: response.data.user,
  };

  setProviderSession(session);
  await StorageService.saveSession(session);

  return session;
}

export async function logoutProvider() {
  try {
    await getAuthorizedApiClient().post('/provider/auth/logout');
  } catch {
    // Best effort logout.
  }

  clearProviderSession();
  await StorageService.removeSession();
}

export async function fetchProviderProfile() {
  const session = getProviderSession();

  console.log('[provider] fetch /provider/me', {
    hasToken: Boolean(session?.token),
    tokenPreview: maskToken(session?.token),
    userId: session?.user?.id ?? null,
    userRole: session?.user?.role ?? null,
  });

  const response = await getAuthorizedApiClient().get<ApiProviderUser>('/provider/me');
  return mapProviderProfile(response.data);
}

export async function fetchProviderCategories() {
  const response = await createApiClient().get<ApiCategory[]>('/service-categories');

  return response.data.map((item) => ({
    id: item.id,
    label: item.name,
  }));
}

export async function fetchProviderStatus() {
  const response = await getAuthorizedApiClient().get<{
    application_status: ProviderStatusValue;
    notes: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
  }>('/provider/application-status');

  return {
    applicationStatus: response.data.application_status,
    notes: response.data.notes,
    submittedAt: response.data.submitted_at,
    reviewedAt: response.data.reviewed_at,
  } satisfies ProviderApplicationStatus;
}

async function syncProviderGallery(
  apiClient: ReturnType<typeof createApiClient>,
  initialGallery: ProviderGalleryImage[],
  gallery: ProviderGalleryImage[]
) {
  const currentRemoteIds = new Set(
    gallery.filter((item) => item.isRemote && item.id).map((item) => item.id as string)
  );

  const removedRemoteImages = initialGallery.filter(
    (item) => item.isRemote && item.id && !currentRemoteIds.has(item.id)
  );

  for (const item of removedRemoteImages) {
    await apiClient.delete(`/provider/gallery/${item.id}`);
  }

  const newLocalImages = gallery.filter((item) => !item.isRemote && isLocalFileUri(item.uri));

  for (const [index, item] of newLocalImages.entries()) {
    const formData = new FormData();
    formData.append('sort_order', String(index));
    formData.append('image', buildUploadFile(item.uri, `gallery-${index + 1}.jpg`) as never);

    await apiClient.post('/provider/gallery', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export async function saveProviderProfile(input: SaveProviderProfileInput) {
  const apiClient = getAuthorizedApiClient();

  await apiClient.put('/provider/profile/basic', {
    provider_name: input.providerName.trim(),
    bio: input.about.trim() || null,
  });

  await apiClient.put('/provider/profile/business', {
    provider_name: input.providerName.trim(),
    bio: input.about.trim() || null,
    category_id: input.categoryId,
    custom_services: input.services.map((item) => item.trim()).filter(Boolean),
  });

  await apiClient.put('/provider/profile/contact', {
    whatsapp_number: input.whatsapp.trim(),
    instagram_username: normalizeInstagramValue(input.instagram) || null,
    facebook_url: input.facebook.trim() || null,
  });

  await apiClient.put('/provider/profile/location-schedule', {
    city: input.city.trim(),
    location_text: input.locationText.trim() || null,
    hours: buildWorkingHoursPayload(input.workingHours, input.startTime, input.endTime),
  });

  if (isLocalFileUri(input.avatarUri)) {
    const formData = new FormData();
    formData.append('profile_image', buildUploadFile(input.avatarUri, 'profile.jpg') as never);

    await apiClient.post('/provider/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  await syncProviderGallery(apiClient, input.initialGallery, input.gallery);

  let submittedForReview = false;

  if (input.shouldSubmit) {
    await apiClient.post('/provider/submit');
    submittedForReview = true;
  }

  const status = await fetchProviderStatus();
  let profile = null;

  try {
    profile = await fetchProviderProfile();
  } catch (error) {
    console.warn('[provider] profile refresh failed after save', extractErrorMessage(error));
  }

  return {
    profile,
    status,
    submittedForReview,
  };
}

export function getSupportWhatsappUrl() {
  const supportNumber = process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP?.trim() || '970599123456';
  return `https://wa.me/${supportNumber.replace(/\D/g, '')}`;
}
