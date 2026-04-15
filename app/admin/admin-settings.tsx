import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, Text, View } from 'react-native';

import AdminDetailShell from '@/components/admin/admin-detail-shell';
import StatusBanner from '@/components/ui/status-banner';
import { useAdminSession } from '@/contexts/admin-session-context';
import {
  sortAdminAccounts,
  useAdminAccountsQuery,
  useDeleteAdminMutation,
} from '@/hooks/admin/use-admin-accounts';
import { getReadableError } from '@/services/api';

export default function AdminSettingsScreen() {
  const { adminUser, logout } = useAdminSession();
  const adminAccountsQuery = useAdminAccountsQuery();
  const deleteAdminMutation = useDeleteAdminMutation();

  const sortedAdmins = sortAdminAccounts(adminAccountsQuery.data ?? [], adminUser?.id);

  const handleUnauthorized = async (error: unknown) => {
    const message = getReadableError(error);

    if (
      message.includes('انتهت') ||
      message.includes('صلاحية') ||
      message.includes('Unauthenticated')
    ) {
      await logout();
      return true;
    }

    return false;
  };

  const handleDeleteAdmin = (adminId: string, adminName: string, isCurrentAdmin: boolean) => {
    if (isCurrentAdmin) {
      Alert.alert('غير متاح', 'لا يمكنك حذف حسابك الإداري الحالي.');
      return;
    }

    Alert.alert('حذف الأدمن', `هل تريد حذف حساب ${adminName} من النظام؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              const result = await deleteAdminMutation.mutateAsync(adminId);
              Alert.alert('تم الحذف', result.message);
            } catch (error) {
              if (await handleUnauthorized(error)) {
                return;
              }

              Alert.alert('تعذر الحذف', getReadableError(error));
            }
          })();
        },
      },
    ]);
  };

  return (
    <AdminDetailShell
      badge="إعدادات الأدمن"
      title="عرض وإعدادات الأدمن"
      titleClassName="text-[24px] leading-9">
      <View className="-mt-1 items-center pb-1">
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.20)', 'rgba(109, 40, 217, 0.08)']}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={{
            alignItems: 'center',
            borderColor: 'rgba(255,255,255,0.07)',
            borderRadius: 28,
            borderWidth: 1,
            minWidth: 148,
            paddingHorizontal: 24,
            paddingVertical: 16,
          }}>
          <View className="mb-3 h-[34px] w-[34px] items-center justify-center rounded-[14px] bg-admin-primaryLight/14">
            <Ionicons color="#8B5CF6" name="shield-checkmark-outline" size={18} />
          </View>

          <View className="flex-row-reverse items-center gap-2.5">
            <Text className="font-cairo-bold text-[14px] text-admin-text">إجمالي حسابات الأدمن</Text>
            <Text
              className="text-[30px] leading-none text-admin-text"
              style={{
                fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
                fontVariant: ['tabular-nums'],
                fontWeight: '700',
              }}>
              {String(adminAccountsQuery.data?.length ?? 0)}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {adminAccountsQuery.isError ? (
        <StatusBanner
          actionLabel="إعادة المحاولة"
          message={getReadableError(adminAccountsQuery.error)}
          onAction={() => {
            void adminAccountsQuery.refetch();
          }}
          tone="error"
        />
      ) : null}

      <View className="gap-4 rounded-[30px] border border-white/10 bg-admin-panel px-4.5 py-4.5">
        <View className="items-end">
          <Text className="text-right font-cairo-bold text-[19px] text-admin-text">
            قائمة الأدمنز
          </Text>
        </View>

        {adminAccountsQuery.isLoading ? (
          <View className="min-h-[180px] items-center justify-center gap-2.5">
            <ActivityIndicator color="#8B5CF6" size="large" />
            <Text className="font-cairo text-[14px] text-admin-muted">جار تحميل الأدمنز...</Text>
          </View>
        ) : sortedAdmins.length === 0 ? (
          <View className="items-center justify-center rounded-[22px] border border-white/5 bg-white/3 px-4.5 py-7">
            <Ionicons color="#6B7280" name="people-outline" size={24} />
            <Text className="mt-2.5 font-cairo-bold text-[17px] text-admin-text">
              لا توجد حسابات أدمن حالياً
            </Text>
            <Text className="mt-1 text-center font-cairo text-[13px] leading-5 text-admin-muted">
              يمكنك إضافة حساب جديد من شاشة إضافة أدمن جديد.
            </Text>
          </View>
        ) : (
          <View className="gap-2.5">
            {sortedAdmins.map((admin) => {
              const isCurrentAdmin = admin.id === adminUser?.id;
              const isDeleting = deleteAdminMutation.isPending && deleteAdminMutation.variables === admin.id;

              return (
                <View
                  key={admin.id}
                  className={`min-h-[92px] flex-row-reverse items-center gap-3 rounded-[24px] border px-3.5 py-3 ${
                    isCurrentAdmin
                      ? 'border-admin-primaryLight/12 bg-admin-primaryLight/5'
                      : 'border-white/6 bg-white/3'
                  }`}>
                  <View
                    className={`h-[48px] w-[48px] items-center justify-center rounded-[18px] ${
                      isCurrentAdmin ? 'bg-admin-primaryLight/12' : 'bg-white/5'
                    }`}>
                    <Ionicons
                      color={isCurrentAdmin ? '#8B5CF6' : '#A78BFA'}
                      name={isCurrentAdmin ? 'shield-half-outline' : 'person-circle-outline'}
                      size={22}
                    />
                  </View>

                  <View className="flex-1 items-end">
                    <View className="mb-1 flex-row-reverse items-center gap-2">
                      <Text className="text-right font-cairo-bold text-[16px] text-admin-text">
                        {admin.full_name}
                      </Text>
                      {isCurrentAdmin ? (
                        <LinearGradient
                          colors={['rgba(139, 92, 246, 0.22)', 'rgba(109, 40, 217, 0.12)']}
                          end={{ x: 1, y: 1 }}
                          start={{ x: 0, y: 0 }}
                          style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
                          <Text className="font-cairo-bold text-[11px] text-admin-accent">أنت</Text>
                        </LinearGradient>
                      ) : null}
                    </View>

                    <Text className="text-right font-cairo text-[12px] leading-5 text-admin-muted">
                      {admin.email}
                    </Text>
                    <Text className="text-right font-cairo text-[12px] leading-5 text-admin-subtle">
                      {admin.phone?.trim() ? admin.phone : 'لا يوجد رقم جوال محفوظ'}
                    </Text>
                  </View>

                  <Pressable
                    className={`h-[42px] w-[42px] items-center justify-center rounded-full border ${
                      isCurrentAdmin
                        ? 'border-white/5 bg-white/5'
                        : 'border-admin-danger/15 bg-admin-danger/10'
                    }`}
                    disabled={isCurrentAdmin || isDeleting}
                    onPress={() => handleDeleteAdmin(admin.id, admin.full_name, isCurrentAdmin)}>
                    {isDeleting ? (
                      <ActivityIndicator color="#EF4444" size="small" />
                    ) : (
                      <Feather
                        color={isCurrentAdmin ? '#6B7280' : '#EF4444'}
                        name="trash-2"
                        size={16}
                      />
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </AdminDetailShell>
  );
}
