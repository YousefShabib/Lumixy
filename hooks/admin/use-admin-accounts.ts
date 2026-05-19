import * as Haptics from 'expo-haptics';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createAdminAccount,
  deleteAdminAccount,
  fetchAdminAccounts,
  updateAdminProfile,
  type AdminAccountRecord,
  type AdminCreatePayload,
  type AdminProfilePayload,
} from '@/services/admin-api';

export const adminAccountKeys = {
  all: ['admin', 'accounts'] as const,
};

export function useAdminAccountsQuery() {
  return useQuery({
    queryFn: async () => {
      const response = await fetchAdminAccounts();
      return response.data;
    },
    queryKey: adminAccountKeys.all,
  });
}

export function useCreateAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdminCreatePayload) => {
      const response = await createAdminAccount(payload);
      return response.data;
    },
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await queryClient.invalidateQueries({ queryKey: adminAccountKeys.all });
    },
  });
}

export function useDeleteAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminId: string) => {
      const response = await deleteAdminAccount(adminId);
      return response.data;
    },
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await queryClient.invalidateQueries({ queryKey: adminAccountKeys.all });
    },
  });
}

export function useUpdateAdminProfileMutation() {
  return useMutation({
    mutationFn: async (payload: AdminProfilePayload) => {
      const response = await updateAdminProfile(payload);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return response.data;
    },
  });
}

export function sortAdminAccounts(accounts: AdminAccountRecord[], currentAdminId?: string) {
  return [...accounts].sort((first, second) => {
    if (first.id === currentAdminId) {
      return -1;
    }

    if (second.id === currentAdminId) {
      return 1;
    }

    return (second.created_at ?? '').localeCompare(first.created_at ?? '');
  });
}
