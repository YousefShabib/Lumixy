import { apiClient, buildPublicAssetUrl } from '@/services/api/client';

type ApiCategory = {
  id: string;
  name: string;
  icon?: string | null;
  is_active?: boolean;
  sort_order?: number;
};

type ApiGalleryItem = {
  id: string;
  image_url?: string | null;
  sort_order?: number;
};

type ApiWorkingHour = {
  id: string;
  day_of_week?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  is_active?: boolean;
};

type ApiProvider = {
  id: string;
  provider_name?: string | null;
  profile_image?: string | null;
  bio?: string | null;
  city?: string | null;
  location_text?: string | null;
  whatsapp_number?: string | null;
  instagram_username?: string | null;
  facebook_url?: string | null;
  is_featured?: boolean;
  custom_services?: string[] | string | null;
  category_id?: string | null;
  category?: ApiCategory | null;
  gallery?: ApiGalleryItem[] | null;
  working_hours?: ApiWorkingHour[] | null;
};

type ApiPaginatedResponse<T> = {
  current_page: number;
  data: T[];
  last_page: number;
  next_page_url?: string | null;
  total: number;
};

export type PublicCategory = {
  id: string;
  name: string;
  icon: string;
  backendIcon: string | null;
  providersCount: number;
  sortOrder: number;
};

export type PublicWorkingHour = {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export type PublicProvider = {
  id: string;
  name: string;
  bio: string;
  city: string;
  locationText: string;
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string;
  imageUrl: string | null;
  galleryImages: string[];
  customServices: string[];
  whatsappNumber: string | null;
  instagramUsername: string | null;
  facebookUrl: string | null;
  isFeatured: boolean;
};

export type PublicProviderDetails = PublicProvider & {
  workingHours: PublicWorkingHour[];
};

export type PublicDirectoryStats = {
  approvedProviders: number;
  featuredProviders: number;
  activeCategories: number;
  citiesCount: number;
};

export type PublicDirectoryData = {
  categories: PublicCategory[];
  providers: PublicProvider[];
  featuredProviders: PublicProvider[];
  stats: PublicDirectoryStats;
};

const categoryIconFallbacks = [
  'camera-outline',
  'color-palette-outline',
  'flower-outline',
  'construct-outline',
  'sparkles-outline',
  'storefront-outline',
] as const;

const weekdayOrder = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

const weekdayLabels: Record<string, string> = {
  saturday: 'السبت',
  sunday: 'الأحد',
  monday: 'الاثنين',
  tuesday: 'الثلاثاء',
  wednesday: 'الأربعاء',
  thursday: 'الخميس',
  friday: 'الجمعة',
};

const fallbackCategories: PublicCategory[] = [
  {
    id: 'photo-production',
    name: 'التصوير والإنتاج',
    icon: 'camera-outline',
    backendIcon: null,
    providersCount: 1,
    sortOrder: 0,
  },
  {
    id: 'design-graphics',
    name: 'التصميم والجرافيك',
    icon: 'color-palette-outline',
    backendIcon: null,
    providersCount: 1,
    sortOrder: 1,
  },
  {
    id: 'podcast-audio',
    name: 'البودكاست',
    icon: 'mic-outline',
    backendIcon: null,
    providersCount: 1,
    sortOrder: 2,
  },
];

const fallbackProviderDetails: PublicProviderDetails[] = [
  {
    id: 'fallback-omran',
    name: 'عمران للإنتاج الفني',
    bio: 'استوديو متخصص في التصوير والمونتاج وتغطية الفعاليات داخل فلسطين.',
    city: 'رام الله',
    locationText: 'رام الله، فلسطين',
    categoryId: 'photo-production',
    categoryName: 'التصوير والإنتاج',
    categoryIcon: 'camera-outline',
    imageUrl: null,
    galleryImages: [],
    customServices: ['تصوير مناسبات', 'مونتاج فيديو', 'تغطية فعاليات'],
    whatsappNumber: '0599000001',
    instagramUsername: 'omran.production',
    facebookUrl: null,
    isFeatured: true,
    workingHours: [
      {
        id: 'fallback-omran-sun',
        dayOfWeek: 'sunday',
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      },
      {
        id: 'fallback-omran-mon',
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      },
    ],
  },
  {
    id: 'fallback-lumixy-studio',
    name: 'استديو لوميكسي',
    bio: 'خدمات تصميم بصري وهويات وإدارة محتوى للعلامات التجارية والمشاريع الصغيرة.',
    city: 'القدس',
    locationText: 'القدس',
    categoryId: 'design-graphics',
    categoryName: 'التصميم والجرافيك',
    categoryIcon: 'color-palette-outline',
    imageUrl: null,
    galleryImages: [],
    customServices: ['تصميم هوية', 'بوسترات', 'تصميم سوشال ميديا'],
    whatsappNumber: '0599000002',
    instagramUsername: 'lumixy.studio',
    facebookUrl: null,
    isFeatured: false,
    workingHours: [
      {
        id: 'fallback-lumixy-mon',
        dayOfWeek: 'monday',
        startTime: '10:00',
        endTime: '18:00',
        isActive: true,
      },
      {
        id: 'fallback-lumixy-tue',
        dayOfWeek: 'tuesday',
        startTime: '10:00',
        endTime: '18:00',
        isActive: true,
      },
    ],
  },
  {
    id: 'fallback-podcast-house',
    name: 'بيت البودكاست',
    bio: 'إنتاج وتسجيل حلقات بودكاست مع تحرير صوتي وتجهيز للنشر.',
    city: 'نابلس',
    locationText: 'نابلس',
    categoryId: 'podcast-audio',
    categoryName: 'البودكاست',
    categoryIcon: 'mic-outline',
    imageUrl: null,
    galleryImages: [],
    customServices: ['تسجيل حلقات', 'تحرير صوت', 'هندسة صوتية'],
    whatsappNumber: null,
    instagramUsername: 'podcast.house.ps',
    facebookUrl: null,
    isFeatured: false,
    workingHours: [
      {
        id: 'fallback-podcast-wed',
        dayOfWeek: 'wednesday',
        startTime: '11:00',
        endTime: '19:00',
        isActive: true,
      },
      {
        id: 'fallback-podcast-thu',
        dayOfWeek: 'thursday',
        startTime: '11:00',
        endTime: '19:00',
        isActive: true,
      },
    ],
  },
];

const fallbackDirectoryStats: PublicDirectoryStats = {
  approvedProviders: fallbackProviderDetails.length,
  featuredProviders: fallbackProviderDetails.filter((provider) => provider.isFeatured).length,
  activeCategories: fallbackCategories.length,
  citiesCount: new Set(fallbackProviderDetails.map((provider) => provider.city)).size,
};

function toStringArray(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) {
    return value
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function resolveCategoryIcon(source?: string | null, fallbackIndex = 0) {
  const value = source?.trim().toLowerCase() ?? '';

  if (
    value.includes('camera') ||
    value.includes('photo') ||
    value.includes('video') ||
    value.includes('تصوير') ||
    value.includes('فيديو')
  ) {
    return 'camera-outline';
  }

  if (
    value.includes('design') ||
    value.includes('palette') ||
    value.includes('brush') ||
    value.includes('graphic') ||
    value.includes('تصميم') ||
    value.includes('ديكور')
  ) {
    return 'color-palette-outline';
  }

  if (
    value.includes('beauty') ||
    value.includes('salon') ||
    value.includes('flower') ||
    value.includes('صالون') ||
    value.includes('تجميل') ||
    value.includes('ورد')
  ) {
    return 'flower-outline';
  }

  if (
    value.includes('electric') ||
    value.includes('repair') ||
    value.includes('construct') ||
    value.includes('نجار') ||
    value.includes('كهرب') ||
    value.includes('صيانة')
  ) {
    return 'construct-outline';
  }

  if (
    value.includes('event') ||
    value.includes('hall') ||
    value.includes('party') ||
    value.includes('قاعة') ||
    value.includes('مناسبة')
  ) {
    return 'sparkles-outline';
  }

  return categoryIconFallbacks[fallbackIndex % categoryIconFallbacks.length] ?? 'storefront-outline';
}

function normalizeCategory(category: ApiCategory, providersCount = 0, index = 0): PublicCategory {
  return {
    id: category.id,
    name: category.name?.trim() || `تصنيف ${index + 1}`,
    icon: resolveCategoryIcon(category.icon || category.name, index),
    backendIcon: category.icon?.trim() || null,
    providersCount,
    sortOrder: category.sort_order ?? index,
  };
}

function normalizeProvider(provider: ApiProvider, index = 0): PublicProvider {
  const galleryImages = (provider.gallery ?? [])
    .map((item) => buildPublicAssetUrl(item.image_url))
    .filter((item): item is string => Boolean(item));
  const customServices = toStringArray(provider.custom_services);
  const categoryName = provider.category?.name?.trim() || 'غير مصنف';
  const categoryIcon = resolveCategoryIcon(provider.category?.icon || categoryName, index);

  return {
    id: provider.id,
    name: provider.provider_name?.trim() || `مزود خدمة ${index + 1}`,
    bio: provider.bio?.trim() || 'هذا الملف لم يضف نبذة تعريفية بعد.',
    city: provider.city?.trim() || 'غير محدد',
    locationText: provider.location_text?.trim() || provider.city?.trim() || 'فلسطين',
    categoryId: provider.category_id ?? provider.category?.id ?? null,
    categoryName,
    categoryIcon,
    imageUrl: buildPublicAssetUrl(provider.profile_image),
    galleryImages,
    customServices,
    whatsappNumber: provider.whatsapp_number?.trim() || null,
    instagramUsername: provider.instagram_username?.trim() || null,
    facebookUrl: provider.facebook_url?.trim() || null,
    isFeatured: Boolean(provider.is_featured),
  };
}

function normalizeWorkingHours(hours: ApiWorkingHour[] | null | undefined): PublicWorkingHour[] {
  return (hours ?? [])
    .map((hour) => ({
      id: hour.id,
      dayOfWeek: hour.day_of_week?.trim().toLowerCase() || 'unknown',
      startTime: hour.start_time?.trim() || '--:--',
      endTime: hour.end_time?.trim() || '--:--',
      isActive: Boolean(hour.is_active),
    }))
    .sort((first, second) => {
      return weekdayOrder.indexOf(first.dayOfWeek) - weekdayOrder.indexOf(second.dayOfWeek);
    });
}

function dedupeProviders(providers: PublicProvider[]) {
  return Array.from(new Map(providers.map((provider) => [provider.id, provider])).values());
}

function mergeCategories(categories: PublicCategory[], providers: PublicProvider[]) {
  const categoriesMap = new Map(categories.map((category) => [category.id, category]));
  const categoryCounts = new Map<string, number>();

  for (const provider of providers) {
    if (!provider.categoryId) {
      continue;
    }

    categoryCounts.set(provider.categoryId, (categoryCounts.get(provider.categoryId) ?? 0) + 1);

    if (!categoriesMap.has(provider.categoryId)) {
      categoriesMap.set(provider.categoryId, {
        id: provider.categoryId,
        name: provider.categoryName,
        icon: provider.categoryIcon,
        backendIcon: null,
        providersCount: 0,
        sortOrder: categoriesMap.size,
      });
    }
  }

  return Array.from(categoriesMap.values())
    .map((category) => ({
      ...category,
      providersCount: categoryCounts.get(category.id) ?? 0,
    }))
    .sort((first, second) => first.sortOrder - second.sortOrder);
}

function countCities(providers: PublicProvider[]) {
  return new Set(
    providers
      .map((provider) => provider.city.trim())
      .filter((city) => city && city !== 'غير محدد'),
  ).size;
}

function cloneWorkingHours(hours: PublicWorkingHour[]) {
  return hours.map((hour) => ({ ...hour }));
}

function cloneProvider(provider: PublicProvider): PublicProvider {
  return {
    ...provider,
    galleryImages: [...provider.galleryImages],
    customServices: [...provider.customServices],
  };
}

function cloneProviderDetails(provider: PublicProviderDetails): PublicProviderDetails {
  return {
    ...cloneProvider(provider),
    workingHours: cloneWorkingHours(provider.workingHours),
  };
}

function toDirectoryProvider(provider: PublicProviderDetails): PublicProvider {
  return cloneProvider({
    id: provider.id,
    name: provider.name,
    bio: provider.bio,
    city: provider.city,
    locationText: provider.locationText,
    categoryId: provider.categoryId,
    categoryName: provider.categoryName,
    categoryIcon: provider.categoryIcon,
    imageUrl: provider.imageUrl,
    galleryImages: provider.galleryImages,
    customServices: provider.customServices,
    whatsappNumber: provider.whatsappNumber,
    instagramUsername: provider.instagramUsername,
    facebookUrl: provider.facebookUrl,
    isFeatured: provider.isFeatured,
  });
}

export function getFallbackPublicDirectory(): PublicDirectoryData {
  const providers = fallbackProviderDetails.map(toDirectoryProvider);
  const featuredProviders = providers.filter((provider) => provider.isFeatured).map(cloneProvider);

  return {
    categories: fallbackCategories.map((category) => ({ ...category })),
    providers,
    featuredProviders,
    stats: { ...fallbackDirectoryStats },
  };
}

function getFallbackPublicProviderDetails(id: string) {
  const provider = fallbackProviderDetails.find((item) => item.id === id);
  return provider ? cloneProviderDetails(provider) : null;
}

async function fetchProvidersPage(page: number, signal?: AbortSignal) {
  const response = await apiClient.get<ApiPaginatedResponse<ApiProvider>>('/providers', {
    params: { page },
    signal,
  });

  return response.data;
}

export async function fetchPublicCategories(signal?: AbortSignal) {
  const response = await apiClient.get<ApiCategory[]>('/service-categories', { signal });

  return (response.data ?? []).map((category, index) => normalizeCategory(category, 0, index));
}

export async function fetchAllPublicProviders(signal?: AbortSignal) {
  const firstPage = await fetchProvidersPage(1, signal);
  const totalPages = Math.max(firstPage.last_page || 1, 1);

  if (totalPages === 1) {
    return dedupeProviders((firstPage.data ?? []).map((provider, index) => normalizeProvider(provider, index)));
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => fetchProvidersPage(index + 2, signal)),
  );

  const allItems = [firstPage, ...remainingPages].flatMap((page) => page.data ?? []);

  return dedupeProviders(allItems.map((provider, index) => normalizeProvider(provider, index)));
}

export async function fetchPublicDirectory(signal?: AbortSignal): Promise<PublicDirectoryData> {
  const [categories, providers] = await Promise.all([
    fetchPublicCategories(signal),
    fetchAllPublicProviders(signal),
  ]);
  const mergedCategories = mergeCategories(categories, providers);
  const featuredProviders = providers.filter((provider) => provider.isFeatured);

  return {
    categories: mergedCategories,
    providers,
    featuredProviders,
    stats: {
      approvedProviders: providers.length,
      featuredProviders: featuredProviders.length,
      activeCategories: mergedCategories.length,
      citiesCount: countCities(providers),
    },
  };
}

export async function fetchPublicDirectoryWithFallback(
  signal?: AbortSignal,
): Promise<PublicDirectoryData> {
  try {
    return await fetchPublicDirectory(signal);
  } catch {
    return getFallbackPublicDirectory();
  }
}

export async function fetchPublicProviderDetails(id: string, signal?: AbortSignal) {
  try {
    const response = await apiClient.get<ApiProvider>(`/providers/${id}`, { signal });
    const provider = response.data;
    const normalizedProvider = normalizeProvider(provider);

    return {
      ...normalizedProvider,
      workingHours: normalizeWorkingHours(provider.working_hours),
    } satisfies PublicProviderDetails;
  } catch (error) {
    const fallbackProvider = getFallbackPublicProviderDetails(id);

    if (fallbackProvider) {
      return fallbackProvider;
    }

    throw error;
  }
}

export function formatArabicCount(count: number, singular: string, plural = singular) {
  const label = count === 1 ? singular : plural;
  return `${count.toLocaleString('ar-EG')} ${label}`;
}

export function formatWorkingDay(dayOfWeek: string) {
  return weekdayLabels[dayOfWeek] ?? dayOfWeek;
}
