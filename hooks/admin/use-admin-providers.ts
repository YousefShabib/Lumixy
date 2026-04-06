import * as Haptics from 'expo-haptics';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  approveProvider,
  deleteProvider,
  fetchAdminPendingProviders,
  fetchAdminProviders,
  rejectProvider,
  suspendProvider,
  type AdminProviderApplication,
  type AdminProviderRecord,
} from '@/services/admin-api';
import { resolveApiAssetUrl } from '@/services/api';

export type ProviderStatus = 'approved' | 'pending' | 'rejected';
export type ProviderTone = ProviderStatus | 'none' | 'suspended';
export type StatusFilter = 'all' | ProviderStatus;

export type ProviderItem = {
  avatarGradient: [string, string];
  avatarIcon: string;
  badgeLabel: string;
  city: string;
  filterStatus: ProviderStatus | null;
  hasApplication: boolean;
  id: string;
  isActiveProvider: boolean;
  isAwaitingApproval: boolean;
  name: string;
  note: string | null;
  profileImageUrl: string | null;
  specialty: string;
  tone: ProviderTone;
};

export const adminProviderKeys = {
  all: ['admin', 'providers'] as const,
  byCategory: (categoryId?: string) => ['admin', 'providers', categoryId ?? 'all'] as const,
};

function getLatestApplication(applications?: AdminProviderApplication[]) {
  if (!applications || applications.length === 0) {
    return null;
  }

  return [...applications].sort((first, second) => {
    const firstDate = new Date(first.submitted_at ?? first.created_at ?? 0).getTime();
    const secondDate = new Date(second.submitted_at ?? second.created_at ?? 0).getTime();
    return secondDate - firstDate;
  })[0];
}

function resolveProviderVisual(name: string, specialty: string) {
  const subject = `${name} ${specialty}`;

  if (subject.includes('تصوير') || subject.includes('ستوديو')) {
    return {
      avatarGradient: ['#6D28D9', '#2E1065'] as [string, string],
      avatarIcon: 'camera-outline',
    };
  }

  if (subject.includes('تقنية') || subject.includes('معلومات') || subject.includes('برمجة')) {
    return {
      avatarGradient: ['#FFFFFF', '#D7D7D7'] as [string, string],
      avatarIcon: 'office-building-outline',
    };
  }

  if (subject.includes('تصميم') || subject.includes('إعلام') || subject.includes('حفلات')) {
    return {
      avatarGradient: ['#2B5BC9', '#162D66'] as [string, string],
      avatarIcon: 'party-popper',
    };
  }

  return {
    avatarGradient: ['#F4B183', '#C97D52'] as [string, string],
    avatarIcon: 'storefront-outline',
  };
}

export function mapProvider(record: AdminProviderRecord): ProviderItem {
  const latestApplication = getLatestApplication(record.applications);
  const rawStatus = latestApplication?.application_status ?? null;
  const isActiveProvider = !latestApplication && record.user?.status === 'active';
  const isAwaitingApproval =
    rawStatus === 'pending' || (!latestApplication && record.user?.status === 'inactive');
  const isSuspended = rawStatus === 'approved' && record.user?.status === 'inactive';
  const specialty =
    record.category?.name ?? record.custom_services?.[0] ?? 'خدمات غير مصنفة حتى الآن';
  const name = record.provider_name ?? record.user?.full_name ?? 'مزود بدون اسم';
  const visual = resolveProviderVisual(name, specialty);
  let tone: ProviderTone = 'none';

  if (isAwaitingApproval) {
    tone = 'pending';
  } else if (isActiveProvider) {
    tone = 'approved';
  } else if (latestApplication) {
    tone = isSuspended ? 'suspended' : latestApplication.application_status;
  }

  return {
    avatarGradient: visual.avatarGradient,
    avatarIcon: visual.avatarIcon,
    badgeLabel:
      isAwaitingApproval
        ? 'قيد الانتظار'
        : isActiveProvider
          ? 'نشط'
          : rawStatus === 'approved'
            ? isSuspended
              ? 'موقوف'
              : 'نشط'
            : rawStatus === 'rejected'
              ? 'مرفوض'
              : 'بدون طلب',
    city: record.city?.trim() || 'المدينة غير محددة',
    filterStatus: isAwaitingApproval ? 'pending' : isActiveProvider ? 'approved' : rawStatus,
    hasApplication: Boolean(latestApplication),
    id: record.id,
    isActiveProvider,
    isAwaitingApproval,
    name,
    note: latestApplication?.notes?.trim() || null,
    profileImageUrl: resolveApiAssetUrl(record.profile_image),
    specialty,
    tone,
  };
}

export function useAdminProvidersQuery(categoryId?: string) {
  return useQuery({
    queryFn: async () => {
      const [providersResponse, pendingResponse] = await Promise.all([
        fetchAdminProviders(),
        fetchAdminPendingProviders(),
      ]);

      const pendingProvidersById = new Map(
        pendingResponse.data.map((provider) => [provider.id, provider])
      );

      const mergedProviders = providersResponse.data.data.map((provider) => {
        const pendingProvider = pendingProvidersById.get(provider.id);

        if (!pendingProvider) {
          return provider;
        }

        const hasApplications =
          Array.isArray(provider.applications) && provider.applications.length > 0;

        return hasApplications
          ? provider
          : {
              ...provider,
              applications: pendingProvider.applications,
            };
      });

      if (!categoryId) {
        return mergedProviders;
      }

      return mergedProviders.filter((provider) => provider.category?.id === categoryId);
    },
    queryKey: adminProviderKeys.byCategory(categoryId),
  });
}

function useProviderMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await queryClient.invalidateQueries({ queryKey: adminProviderKeys.all });
    },
  });
}

export function useApproveProviderMutation() {
  return useProviderMutation(async (providerId: string) => approveProvider(providerId));
}

export function useRejectProviderMutation() {
  return useProviderMutation(async ({ providerId, reason }: { providerId: string; reason: string }) =>
    rejectProvider(providerId, reason)
  );
}

export function useSuspendProviderMutation() {
  return useProviderMutation(async ({ providerId, reason }: { providerId: string; reason: string }) =>
    suspendProvider(providerId, reason)
  );
}

export function useDeleteProviderMutation() {
  return useProviderMutation(async (providerId: string) => deleteProvider(providerId));
}

export function filterProviderItems(
  providers: ProviderItem[],
  searchQuery: string,
  statusFilter: StatusFilter
) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return providers.filter((provider) => {
    const matchesStatus = statusFilter === 'all' || provider.filterStatus === statusFilter;
    const searchableText =
      `${provider.name} ${provider.city} ${provider.specialty} ${provider.note ?? ''}`.toLowerCase();
    const matchesSearch =
      normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);

    return matchesStatus && matchesSearch;
  });
}
