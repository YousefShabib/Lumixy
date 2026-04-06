import * as Haptics from 'expo-haptics';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createCategory,
  deleteCategory,
  fetchAdminCategories,
  updateCategory,
  type AdminCategoryRecord,
  type CategoryPayload,
} from '@/services/admin-api';

export const adminCategoryKeys = {
  all: ['admin', 'categories'] as const,
};

export function useAdminCategoriesQuery() {
  return useQuery({
    queryFn: async () => {
      const response = await fetchAdminCategories();
      return response.data;
    },
    queryKey: adminCategoryKeys.all,
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CategoryPayload) => {
      const response = await createCategory(payload);
      return response.data;
    },
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await queryClient.invalidateQueries({ queryKey: adminCategoryKeys.all });
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: CategoryPayload;
    }) => {
      const response = await updateCategory(categoryId, payload);
      return response.data;
    },
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await queryClient.invalidateQueries({ queryKey: adminCategoryKeys.all });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await deleteCategory(categoryId);
      return response.data;
    },
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await queryClient.invalidateQueries({ queryKey: adminCategoryKeys.all });
    },
  });
}

export function filterAdminCategories(categories: AdminCategoryRecord[], query: string) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return categories;
  }

  return categories.filter((category) => {
    const searchableText =
      `${category.name} ${category.provider_profiles_count} ${category.approved_providers_count}`.toLowerCase();

    return searchableText.includes(trimmedQuery.toLowerCase());
  });
}
