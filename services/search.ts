import {
  fetchPublicDirectoryWithFallback,
  type PublicCategory,
  type PublicDirectoryData,
  type PublicProvider,
} from '@/services/public-directory';

export type SearchFilter = {
  id: string;
  label: string;
};

export type SearchResultItem = {
  id: string;
  name: string;
  type: string;
  categoryId: string | null;
  city: string;
  location: string;
  desc: string;
  customServices: string[];
  isFeatured: boolean;
};

export type SearchScreenData = {
  filters: SearchFilter[];
  results: SearchResultItem[];
};

function buildSearchFilter(category: PublicCategory): SearchFilter {
  return {
    id: category.id,
    label: category.name,
  };
}

function buildSearchResult(provider: PublicProvider): SearchResultItem {
  const servicesSummary =
    provider.customServices.length > 0
      ? `يشمل ${provider.customServices.slice(0, 3).join('، ')}`
      : 'لم تتم إضافة الخدمات التفصيلية بعد.';

  return {
    id: provider.id,
    name: provider.name,
    type: provider.categoryName,
    categoryId: provider.categoryId,
    city: provider.city,
    location: provider.city !== 'غير محدد' ? provider.city : provider.locationText,
    desc: provider.bio !== 'هذا الملف لم يضف نبذة تعريفية بعد.' ? provider.bio : servicesSummary,
    customServices: provider.customServices,
    isFeatured: provider.isFeatured,
  };
}

function buildSearchData(directory: PublicDirectoryData): SearchScreenData {
  return {
    filters: [{ id: 'all', label: 'الكل' }, ...directory.categories.map(buildSearchFilter)],
    results: directory.providers.map(buildSearchResult),
  };
}

export async function fetchSearchData(signal?: AbortSignal): Promise<SearchScreenData> {
  const directory = await fetchPublicDirectoryWithFallback(signal);
  return buildSearchData(directory);
}
