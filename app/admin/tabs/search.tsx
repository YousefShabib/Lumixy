import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import StatusBanner from '@/components/ui/status-banner';
import { useAdminSession } from '@/contexts/admin-session-context';
import {
  filterProviderItems,
  mapProvider,
  useAdminProvidersQuery,
  useApproveProviderMutation,
  useDeleteProviderMutation,
  useRejectProviderMutation,
  useSuspendProviderMutation,
  type ProviderItem,
  type ProviderTone,
  type StatusFilter,
} from '@/hooks/admin/use-admin-providers';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { ApiError, getReadableError } from '@/services/api';

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'approved', label: 'موافق' },
  { key: 'rejected', label: 'رفض' },
  { key: 'pending', label: 'قيد الانتظار' },
];

const statusMeta: Record<
  ProviderTone,
  {
    badgeClassName: string;
    color: string;
  }
> = {
  approved: {
    badgeClassName: 'border-[#58D29B]/20 bg-[#265E43]/25',
    color: '#58D29B',
  },
  none: {
    badgeClassName: 'border-[#A1A1AA]/15 bg-[#52525B]/20',
    color: '#A1A1AA',
  },
  pending: {
    badgeClassName: 'border-[#F59E0B]/20 bg-[#754212]/25',
    color: '#F59E0B',
  },
  rejected: {
    badgeClassName: 'border-[#F87171]/15 bg-[#702323]/25',
    color: '#F87171',
  },
  suspended: {
    badgeClassName: 'border-[#F97316]/15 bg-[#7C3C0C]/25',
    color: '#F97316',
  },
};

export default function ProvidersScreen() {
  const pathname = usePathname();
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId?: string;
    categoryName?: string;
  }>();
  const { logout } = useAdminSession();
  const isCategoryView = pathname.includes('/admin/category-providers');
  const searchStorageKey = isCategoryView
    ? `admin:providers:${categoryId ?? 'all'}:search`
    : 'admin:providers:search';
  const statusStorageKey = isCategoryView
    ? `admin:providers:${categoryId ?? 'all'}:status`
    : 'admin:providers:status';
  const [searchQuery, setSearchQuery, isSearchHydrated] = usePersistedState(searchStorageKey, '');
  const [statusFilter, setStatusFilter, isStatusHydrated] = usePersistedState<StatusFilter>(
    statusStorageKey,
    'all'
  );
  const providersQuery = useAdminProvidersQuery(
    isCategoryView && typeof categoryId === 'string' ? categoryId : undefined
  );
  const approveMutation = useApproveProviderMutation();
  const rejectMutation = useRejectProviderMutation();
  const suspendMutation = useSuspendProviderMutation();
  const deleteMutation = useDeleteProviderMutation();

  const resolvedCategoryName =
    typeof categoryName === 'string' && categoryName.trim().length > 0
      ? categoryName
      : 'هذا القطاع';

  const providerItems = useMemo(
    () => (providersQuery.data ?? []).map(mapProvider),
    [providersQuery.data]
  );

  const filteredProviders = useMemo(
    () => filterProviderItems(providerItems, searchQuery, statusFilter),
    [providerItems, searchQuery, statusFilter]
  );

  const summaryCards = useMemo(() => {
    const totalCount = providerItems.length;
    const activeCount = providerItems.filter((provider) => provider.tone === 'approved').length;
    const inactiveCount = totalCount - activeCount;

    return [
      {
        borderClassName: 'border-admin-accent/20',
        icon: 'people-outline' as const,
        iconBgClassName: 'bg-admin-accent/15',
        iconColor: '#A78BFA',
        key: 'total',
        label: isCategoryView ? 'مزودو القطاع' : 'إجمالي المزودين',
        value: totalCount,
      },
      {
        borderClassName: 'border-admin-success/20',
        icon: 'checkmark-circle-outline' as const,
        iconBgClassName: 'bg-admin-success/15',
        iconColor: '#58D29B',
        key: 'active',
        label: 'نشط',
        value: activeCount,
      },
      {
        borderClassName: 'border-admin-warning/20',
        icon: 'pause-circle-outline' as const,
        iconBgClassName: 'bg-admin-warning/15',
        iconColor: '#F59E0B',
        key: 'inactive',
        label: 'غير نشط',
        value: inactiveCount,
      },
    ];
  }, [isCategoryView, providerItems]);

  const activeError =
    approveMutation.error ??
    rejectMutation.error ??
    suspendMutation.error ??
    deleteMutation.error ??
    providersQuery.error ??
    null;

  useEffect(() => {
    if (!(activeError instanceof ApiError)) {
      return;
    }

    if (activeError.status !== 401 && activeError.status !== 403) {
      return;
    }

    void (async () => {
      await logout();
      router.replace('/auth/login');
    })();
  }, [activeError, logout]);

  useEffect(() => {
    if (!isCategoryView || !isSearchHydrated || !isStatusHydrated) {
      return;
    }

    setSearchQuery('');
    setStatusFilter('all');
  }, [
    categoryId,
    isCategoryView,
    isSearchHydrated,
    isStatusHydrated,
    setSearchQuery,
    setStatusFilter,
  ]);

  const isBusyForProvider = (providerId: string) =>
    (approveMutation.isPending && approveMutation.variables === providerId) ||
    (deleteMutation.isPending && deleteMutation.variables === providerId) ||
    (rejectMutation.isPending && rejectMutation.variables?.providerId === providerId) ||
    (suspendMutation.isPending && suspendMutation.variables?.providerId === providerId);

  const runProviderAction = async (
    action: () => Promise<unknown>,
    successMessage: string,
    failureTitle: string
  ) => {
    try {
      await action();
      Alert.alert('تمت العملية', successMessage);
    } catch (error) {
      Alert.alert(failureTitle, getReadableError(error));
    }
  };

  const handleApprove = async (provider: ProviderItem) => {
    await runProviderAction(
      () => approveMutation.mutateAsync(provider.id),
      `تمت الموافقة على ${provider.name} بنجاح.`,
      'تعذر تنفيذ الموافقة'
    );
  };

  const handleReject = async (provider: ProviderItem) => {
    await runProviderAction(
      () =>
        rejectMutation.mutateAsync({
          providerId: provider.id,
          reason: 'تم رفض الطلب من لوحة الإدارة.',
        }),
      `تم رفض ${provider.name} بنجاح.`,
      'تعذر تنفيذ الرفض'
    );
  };

  const handleSuspend = async (provider: ProviderItem) => {
    await runProviderAction(
      () =>
        suspendMutation.mutateAsync({
          providerId: provider.id,
          reason: 'تم تعليق الحساب من لوحة الإدارة.',
        }),
      `تم تعليق حساب ${provider.name} بنجاح.`,
      'تعذر تنفيذ التعليق'
    );
  };

  const handleDelete = (provider: ProviderItem) => {
    Alert.alert('حذف المزود', `هل تريد حذف ${provider.name} نهائياً من النظام؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          void runProviderAction(
            () => deleteMutation.mutateAsync(provider.id),
            `تم حذف ${provider.name} نهائياً من النظام.`,
            'تعذر تنفيذ الحذف'
          );
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-admin-background" edges={['top']}>
      <StatusBar style="light" />

      <View className="flex-1 bg-admin-background">
        <LinearGradient
          colors={['rgba(167, 139, 250, 0.16)', 'rgba(167, 139, 250, 0)']}
          end={{ x: 0, y: 1 }}
          start={{ x: 1, y: 0 }}
          style={{
            borderRadius: 999,
            height: 220,
            position: 'absolute',
            right: -42,
            top: -40,
            width: 220,
          }}
        />
        <LinearGradient
          colors={['rgba(109, 40, 217, 0.18)', 'rgba(109, 40, 217, 0)']}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 1 }}
          style={{
            borderRadius: 999,
            bottom: 120,
            height: 260,
            left: -80,
            position: 'absolute',
            width: 260,
          }}
        />

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-3.5 px-5 pb-6 pt-3"
          showsVerticalScrollIndicator={false}>
          {isCategoryView ? (
            <View className="flex-row-reverse items-center gap-3">
              <Pressable
                className="h-[42px] w-[42px] items-center justify-center rounded-full border border-white/10 bg-white/5"
                onPress={() => router.replace('/admin/tabs')}>
                <Ionicons color="#FFFFFF" name="arrow-forward" size={20} />
              </Pressable>

              <View className="flex-1 items-center px-2">
                <Text className="text-center font-cairo-bold text-[20px] text-admin-text">
                  {`مزودو ${resolvedCategoryName}`}
                </Text>
                <Text className="mt-0.5 text-center font-cairo text-[12px] text-admin-muted">
                  إدارة مزودي هذا المجال
                </Text>
              </View>

              <View className="min-w-[42px] items-center justify-center rounded-full border border-admin-accent/20 bg-admin-primaryLight/10 px-3 py-2">
                <Text className="font-cairo-bold text-[12px] text-admin-accent">قطاع</Text>
              </View>
            </View>
          ) : (
            <View className="items-center border-b border-white/5 pb-3.5">
              <Text className="font-cairo-bold text-[22px] tracking-[0.3px] text-admin-text">
                LUMIXY
              </Text>
            </View>
          )}

          {!isCategoryView ? (
            <View className="items-end pt-3">
              <Text className="text-right font-cairo-bold text-[28px] leading-[40px] text-admin-text">
                إدارة المزودين
              </Text>
              <Text className="mt-1 text-right font-cairo text-[13px] text-admin-muted">
                مراجعة واعتماد مزودي الخدمات الجدد وإدارة حساباتهم
              </Text>
            </View>
          ) : null}

          {activeError ? (
            <StatusBanner
              actionLabel="إعادة المحاولة"
              message={getReadableError(activeError)}
              onAction={() => {
                void providersQuery.refetch();
              }}
              tone="error"
            />
          ) : null}

          <View className="flex-row-reverse gap-2.5">
            {summaryCards.map((card) => (
              <View
                key={card.key}
                className={`min-h-[96px] flex-1 items-center justify-center rounded-[22px] border bg-white/5 px-3 py-3.5 ${card.borderClassName}`}>
                <View className={`mb-2.5 h-[38px] w-[38px] items-center justify-center rounded-full ${card.iconBgClassName}`}>
                  <Ionicons color={card.iconColor} name={card.icon} size={18} />
                </View>
                <Text className="text-center font-cairo-bold text-[24px] text-admin-text">
                  {card.value}
                </Text>
                <Text className="mt-1 text-center font-cairo text-[12px] text-admin-muted">
                  {card.label}
                </Text>
              </View>
            ))}
          </View>

          <View className="min-h-[56px] flex-row items-center gap-3 rounded-full border border-white/5 bg-white/5 px-4.5">
            <TextInput
              className="flex-1 text-right font-cairo text-[15px] text-admin-text"
              onChangeText={setSearchQuery}
              placeholder={
                isCategoryView ? `ابحث داخل ${resolvedCategoryName}...` : 'ابحث بالاسم أو الفئة...'
              }
              placeholderTextColor="#6B7280"
              value={searchQuery}
            />
            <Feather color="#6B7280" name="search" size={20} />
          </View>

          <View className="w-full flex-row-reverse flex-wrap justify-start gap-2.5 self-end">
            {statusFilters.map((filter) => {
              const active = statusFilter === filter.key;

              return (
                <Pressable key={filter.key} onPress={() => setStatusFilter(filter.key)}>
                  {active ? (
                    <LinearGradient
                      colors={['#8B5CF6', '#6D28D9']}
                      end={{ x: 1, y: 1 }}
                      start={{ x: 0, y: 0 }}
                      style={{
                        alignItems: 'center',
                        borderRadius: 999,
                        justifyContent: 'center',
                        minHeight: 40,
                        paddingHorizontal: 20,
                      }}>
                      <Text className="font-cairo-bold text-[12px] text-admin-text">
                        {filter.label}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View className="min-h-[40px] items-center justify-center rounded-full border border-white/10 bg-white/5 px-5">
                      <Text className="font-cairo-bold text-[12px] text-white/80">
                        {filter.label}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View className="gap-3.5">
            {providersQuery.isLoading ? (
              <View className="items-center justify-center gap-3 rounded-[24px] border border-white/10 bg-white/3 px-4.5 py-10">
                <ActivityIndicator color="#8B5CF6" size="large" />
                <Text className="text-center font-cairo text-[14px] text-admin-muted">
                  {isCategoryView ? 'جار تحميل مزودي هذا القطاع...' : 'جار تحميل المزودين...'}
                </Text>
              </View>
            ) : filteredProviders.length === 0 ? (
              <View className="items-center justify-center gap-2 rounded-[24px] border border-white/10 bg-white/3 px-4.5 py-10">
                <Ionicons color="#6B7280" name="search-outline" size={28} />
                <Text className="font-cairo-bold text-[18px] text-admin-text">
                  {isCategoryView ? 'لا يوجد مزودون في هذا المجال' : 'لا توجد نتائج مطابقة'}
                </Text>
                <Text className="text-center font-cairo text-[14px] leading-6 text-admin-muted">
                  {isCategoryView
                    ? 'جرّب تغيير الفلتر أو البحث لعرض مزودين آخرين داخل هذا القطاع.'
                    : 'جرّب تغيير البحث أو اختيار فلتر مختلف لعرض مزودين آخرين.'}
                </Text>
              </View>
            ) : (
              filteredProviders.map((provider) => {
                const status = statusMeta[provider.tone];
                const isBusy = isBusyForProvider(provider.id);

                return (
                  <View
                    key={provider.id}
                    className="rounded-[30px] border border-white/10 bg-[#16141A]/95 px-4.5 py-4">
                    <View className="flex-row items-start justify-between gap-3.5 px-1">
                      <View
                        className={`min-h-[38px] items-center justify-center self-start rounded-full border px-3.5 ${status.badgeClassName}`}>
                        <Text
                          style={{ color: status.color }}
                          className="font-cairo-bold text-[12px]">
                          {provider.badgeLabel}
                        </Text>
                      </View>

                      <View className="flex-1 flex-row-reverse items-center gap-3">
                        <View
                          style={{
                            borderColor: 'rgba(255,255,255,0.10)',
                            borderRadius: 24,
                            borderWidth: 1,
                            height: 78,
                            overflow: 'hidden',
                            width: 78,
                          }}>
                          {provider.profileImageUrl ? (
                            <Image
                              contentFit="cover"
                              source={{ uri: provider.profileImageUrl }}
                              style={{ height: '100%', width: '100%' }}
                            />
                          ) : (
                            <LinearGradient
                              colors={provider.avatarGradient}
                              end={{ x: 1, y: 1 }}
                              start={{ x: 0, y: 0 }}
                              style={{
                                alignItems: 'center',
                                flex: 1,
                                justifyContent: 'center',
                              }}>
                              <MaterialCommunityIcons
                                color={
                                  provider.tone === 'approved'
                                    ? '#8A8A8A'
                                    : provider.tone === 'rejected'
                                      ? '#451A1A'
                                      : provider.tone === 'none'
                                        ? '#D4D4D8'
                                        : '#FFFFFF'
                                }
                                name={provider.avatarIcon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
                                size={28}
                              />
                            </LinearGradient>
                          )}
                        </View>

                        <View className="flex-1 items-end">
                          <Text className="text-right font-cairo-bold text-[17px] leading-7 text-admin-text">
                            {provider.name}
                          </Text>
                          <View className="mt-1 flex-row-reverse items-center gap-1.5">
                            <Feather color="#9CA3AF" name="map-pin" size={12} />
                            <Text className="font-cairo text-[11px] text-admin-muted">
                              {provider.city}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View className="mx-1 my-4 h-px bg-white/10" />

                    {provider.note ? (
                      <View className="mb-3.5 flex-row-reverse items-center gap-1.5">
                        <Ionicons
                          color={provider.tone === 'rejected' ? '#EF4444' : '#F59E0B'}
                          name="alert-circle-outline"
                          size={14}
                        />
                        <Text className="flex-1 text-right font-cairo text-[12px] leading-[18px] text-admin-muted">
                          {provider.note}
                        </Text>
                      </View>
                    ) : null}

                    <View className="flex-row-reverse items-center justify-between gap-3 px-1">
                      <Text className="mr-2 flex-1 text-right font-cairo text-[12px] leading-6 text-admin-muted">
                        {provider.specialty}
                      </Text>

                      <View className="flex-row items-center gap-2.5">
                        {!provider.hasApplication &&
                        !provider.isAwaitingApproval &&
                        !provider.isActiveProvider ? (
                          <View className="min-h-[44px] items-center justify-center rounded-[16px] border border-[#A1A1AA]/15 bg-[#A1A1AA]/10 px-4">
                            <Text className="font-cairo-bold text-[12px] text-admin-subtle">
                              لا يوجد طلب اعتماد
                            </Text>
                          </View>
                        ) : !provider.hasApplication && provider.isAwaitingApproval ? (
                          <>
                            <Pressable
                              className="h-[48px] w-[48px] items-center justify-center rounded-full border border-admin-danger/20 bg-[#471717]/30"
                              disabled={isBusy}
                              onPress={() => {
                                void handleReject(provider);
                              }}>
                              {isBusy ? (
                                <ActivityIndicator color="#EF4444" size="small" />
                              ) : (
                                <Feather color="#EF4444" name="trash-2" size={16} />
                              )}
                            </Pressable>

                            <Pressable
                              disabled={isBusy}
                              onPress={() => {
                                void handleApprove(provider);
                              }}>
                              <LinearGradient
                                colors={['#78DBA9', '#59C98F']}
                                end={{ x: 1, y: 1 }}
                                start={{ x: 0, y: 0 }}
                                style={{
                                  alignItems: 'center',
                                  borderRadius: 999,
                                  flexDirection: 'row',
                                  gap: 8,
                                  height: 48,
                                  justifyContent: 'center',
                                  minWidth: 118,
                                  opacity: isBusy ? 0.82 : 1,
                                  paddingHorizontal: 16,
                                }}>
                                {isBusy ? (
                                  <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                  <>
                                    <Text className="font-cairo-bold text-[13px] text-admin-text">
                                      موافقة
                                    </Text>
                                    <Ionicons color="#FFFFFF" name="checkmark-circle-outline" size={18} />
                                  </>
                                )}
                              </LinearGradient>
                            </Pressable>
                          </>
                        ) : (
                          <>
                            {provider.filterStatus === 'rejected' ? (
                              <Pressable
                                className="h-[48px] w-[48px] items-center justify-center rounded-full border border-admin-danger/20 bg-[#471717]/24"
                                disabled={isBusy}
                                onPress={() => handleDelete(provider)}>
                                {isBusy ? (
                                  <ActivityIndicator color="#EF4444" size="small" />
                                ) : (
                                  <Feather color="#EF4444" name="trash-2" size={16} />
                                )}
                              </Pressable>
                            ) : (
                              <Pressable
                                className="h-[48px] w-[48px] items-center justify-center rounded-full border border-admin-danger/20 bg-[#471717]/28"
                                disabled={isBusy}
                                onPress={() => {
                                  void handleReject(provider);
                                }}>
                                {isBusy ? (
                                  <ActivityIndicator color="#EF4444" size="small" />
                                ) : (
                                  <Feather color="#EF4444" name="trash-2" size={16} />
                                )}
                              </Pressable>
                            )}

                            {provider.filterStatus === 'approved' && provider.tone !== 'suspended' ? (
                              <Pressable
                                className="h-[48px] w-[48px] items-center justify-center rounded-full border border-white/10 bg-white/5"
                                disabled={isBusy}
                                onPress={() => {
                                  void handleSuspend(provider);
                                }}>
                                {isBusy ? (
                                  <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                  <Feather color="rgba(255,255,255,0.72)" name="slash" size={14} />
                                )}
                              </Pressable>
                            ) : (
                              <Pressable
                                disabled={isBusy}
                                onPress={() => {
                                  void handleApprove(provider);
                                }}>
                                <LinearGradient
                                  colors={['#78DBA9', '#59C98F']}
                                  end={{ x: 1, y: 1 }}
                                  start={{ x: 0, y: 0 }}
                                style={{
                                  alignItems: 'center',
                                  borderRadius: 999,
                                  flexDirection: 'row',
                                  gap: 8,
                                  height: 48,
                                  justifyContent: 'center',
                                  minWidth: 118,
                                  opacity: isBusy ? 0.82 : 1,
                                  paddingHorizontal: 16,
                                }}>
                                  {isBusy ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                  ) : (
                                    <>
                                      <Text className="font-cairo-bold text-[13px] text-admin-text">
                                        موافقة
                                      </Text>
                                      <Ionicons color="#FFFFFF" name="checkmark-circle-outline" size={18} />
                                    </>
                                  )}
                                </LinearGradient>
                              </Pressable>
                            )}
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
