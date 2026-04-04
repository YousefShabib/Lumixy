import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import StatusBanner from '@/components/ui/status-banner';
import { useAdminSession } from '@/contexts/admin-session-context';
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
import { ApiError, getReadableError } from '@/services/api';
import { colors, typography } from '@/theme';

type ProviderStatus = 'approved' | 'pending' | 'rejected';
type ProviderTone = ProviderStatus | 'none' | 'suspended';
type StatusFilter = 'all' | ProviderStatus;

type ProviderItem = {
  avatarGradient: [string, string];
  avatarIcon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  badgeLabel: string;
  city: string;
  filterStatus: ProviderStatus | null;
  hasApplication: boolean;
  id: string;
  isActiveProvider: boolean;
  isAwaitingApproval: boolean;
  name: string;
  note: string | null;
  specialty: string;
  tone: ProviderTone;
};

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'approved', label: 'موافق' },
  { key: 'rejected', label: 'رفض' },
  { key: 'pending', label: 'قيد الانتظار' },
];

const statusMeta: Record<
  ProviderTone,
  {
    bg: string;
    border: string;
    color: string;
  }
> = {
  approved: {
    color: '#58D29B',
    bg: 'rgba(38, 94, 67, 0.26)',
    border: 'rgba(88, 210, 155, 0.18)',
  },
  pending: {
    color: '#F59E0B',
    bg: 'rgba(117, 66, 18, 0.24)',
    border: 'rgba(245, 158, 11, 0.18)',
  },
  none: {
    color: '#A1A1AA',
    bg: 'rgba(82, 82, 91, 0.22)',
    border: 'rgba(161, 161, 170, 0.14)',
  },
  rejected: {
    color: '#F87171',
    bg: 'rgba(112, 35, 35, 0.24)',
    border: 'rgba(248, 113, 113, 0.16)',
  },
  suspended: {
    color: '#F97316',
    bg: 'rgba(124, 60, 12, 0.24)',
    border: 'rgba(249, 115, 22, 0.16)',
  },
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
      avatarIcon: 'camera-outline' as const,
      avatarGradient: ['#6D28D9', '#2E1065'] as [string, string],
    };
  }

  if (subject.includes('تقنية') || subject.includes('معلومات') || subject.includes('برمجة')) {
    return {
      avatarIcon: 'office-building-outline' as const,
      avatarGradient: ['#FFFFFF', '#D7D7D7'] as [string, string],
    };
  }

  if (subject.includes('تصميم') || subject.includes('إعلام') || subject.includes('حفلات')) {
    return {
      avatarIcon: 'party-popper' as const,
      avatarGradient: ['#2B5BC9', '#162D66'] as [string, string],
    };
  }

  return {
    avatarIcon: 'storefront-outline' as const,
    avatarGradient: ['#F4B183', '#C97D52'] as [string, string],
  };
}

function mapProvider(record: AdminProviderRecord): ProviderItem {
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
    id: record.id,
    name,
    city: record.city?.trim() || 'المدينة غير محددة',
    specialty,
    hasApplication: Boolean(latestApplication),
    filterStatus: isAwaitingApproval ? 'pending' : isActiveProvider ? 'approved' : rawStatus,
    isActiveProvider,
    isAwaitingApproval,
    tone,
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
    note: latestApplication?.notes?.trim() || null,
    ...visual,
  };
}

export default function ProvidersScreen() {
  const { logout } = useAdminSession();
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId?: string;
    categoryName?: string;
  }>();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [providers, setProviders] = useState<AdminProviderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyProviderId, setBusyProviderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isCategoryView = pathname.includes('/admin/category-providers');
  const resolvedCategoryName =
    typeof categoryName === 'string' && categoryName.trim().length > 0
      ? categoryName
      : 'هذا القطاع';

  const handleUnauthorized = useCallback(
    async (error: unknown) => {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        console.error('انتهت صلاحية الوصول إلى صفحة المزودين:', error);
        await logout();
        router.replace('/auth/login');
        return true;
      }

      return false;
    },
    [logout]
  );

  const loadProviders = useCallback(
    async ({ quiet = false }: { quiet?: boolean } = {}) => {
      if (!quiet) {
        setIsLoading(true);
      }

      setErrorMessage(null);

      try {
        const [response, pendingResponse] = await Promise.all([
          fetchAdminProviders(),
          fetchAdminPendingProviders(),
        ]);
        const pendingProvidersById = new Map(
          pendingResponse.data.map((provider) => [provider.id, provider])
        );
        const mergedProviders = response.data.data.map((provider) => {
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
        const nextProviders =
          isCategoryView && typeof categoryId === 'string'
            ? mergedProviders.filter((provider) => provider.category?.id === categoryId)
            : mergedProviders;

        setProviders(nextProviders);
      } catch (error) {
        console.error('فشل تحميل المزودين:', error);

        if (await handleUnauthorized(error)) {
          return;
        }

        setErrorMessage(getReadableError(error));
      } finally {
        if (!quiet) {
          setIsLoading(false);
        }
      }
    },
    [categoryId, handleUnauthorized, isCategoryView]
  );

  useEffect(() => {
    void loadProviders();
  }, [loadProviders]);

  const providerItems = useMemo(() => providers.map(mapProvider), [providers]);

  const providerSummaryCards = useMemo(() => {
    const totalCount = providerItems.length;
    const activeCount = providerItems.filter((provider) => provider.tone === 'approved').length;
    const inactiveCount = totalCount - activeCount;

    return [
      {
        key: 'total',
        label: isCategoryView ? 'مزودو القطاع' : 'إجمالي المزودين',
        value: totalCount,
        icon: 'people-outline' as const,
        iconColor: '#A78BFA',
        iconBg: 'rgba(167, 139, 250, 0.16)',
        borderColor: 'rgba(167, 139, 250, 0.18)',
      },
      {
        key: 'active',
        label: 'نشط',
        value: activeCount,
        icon: 'checkmark-circle-outline' as const,
        iconColor: '#58D29B',
        iconBg: 'rgba(88, 210, 155, 0.14)',
        borderColor: 'rgba(88, 210, 155, 0.16)',
      },
      {
        key: 'inactive',
        label: 'غير نشط',
        value: inactiveCount,
        icon: 'pause-circle-outline' as const,
        iconColor: '#F59E0B',
        iconBg: 'rgba(245, 158, 11, 0.14)',
        borderColor: 'rgba(245, 158, 11, 0.16)',
      },
    ];
  }, [isCategoryView, providerItems]);

  const filteredProviders = useMemo(() => {
    return providerItems.filter((provider) => {
      const matchesStatus = statusFilter === 'all' || provider.filterStatus === statusFilter;
      const searchableText = `${provider.name} ${provider.city} ${provider.specialty} ${provider.note ?? ''}`.toLowerCase();
      const matchesSearch =
        searchQuery.trim().length === 0 || searchableText.includes(searchQuery.trim().toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [providerItems, searchQuery, statusFilter]);

  const runProviderAction = useCallback(
    async ({
      providerId,
      request,
      successMessage,
      logLabel,
    }: {
      logLabel: string;
      providerId: string;
      request: () => Promise<unknown>;
      successMessage: string;
    }) => {
      setBusyProviderId(providerId);
      setErrorMessage(null);

      try {
        await request();
        Alert.alert('تمت العملية', successMessage);
        await loadProviders({ quiet: true });
      } catch (error) {
        console.error(`فشل تنفيذ العملية: ${logLabel}`, error);

        if (await handleUnauthorized(error)) {
          return;
        }

        setErrorMessage(getReadableError(error));
      } finally {
        setBusyProviderId(null);
      }
    },
    [handleUnauthorized, loadProviders]
  );

  const handleApprove = async (provider: ProviderItem) => {
    await runProviderAction({
      providerId: provider.id,
      logLabel: 'الموافقة على المزود',
      request: () => approveProvider(provider.id),
      successMessage: `تمت الموافقة على ${provider.name} بنجاح.`,
    });
  };

  const handleReject = async (provider: ProviderItem) => {
    await runProviderAction({
      providerId: provider.id,
      logLabel: 'رفض المزود',
      request: () => rejectProvider(provider.id, 'تم رفض الطلب من لوحة الإدارة.'),
      successMessage: `تم رفض ${provider.name} بنجاح.`,
    });
  };

  const handleSuspend = async (provider: ProviderItem) => {
    await runProviderAction({
      providerId: provider.id,
      logLabel: 'تعليق حساب المزود',
      request: () => suspendProvider(provider.id, 'تم تعليق الحساب من لوحة الإدارة.'),
      successMessage: `تم تعليق حساب ${provider.name} بنجاح.`,
    });
  };

  const handleDelete = (provider: ProviderItem) => {
    Alert.alert(
      'حذف المزود',
      `هل تريد حذف ${provider.name} نهائياً من النظام؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            void runProviderAction({
              providerId: provider.id,
              logLabel: 'حذف المزود',
              request: () => deleteProvider(provider.id),
              successMessage: `تم حذف ${provider.name} نهائياً من النظام.`,
            });
          },
        },
      ]
    );
  };

  const isEmpty = !isLoading && filteredProviders.length === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.screen}>
        <LinearGradient
          colors={['rgba(167, 139, 250, 0.16)', 'rgba(167, 139, 250, 0)']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.topGlow}
        />
        <LinearGradient
          colors={['rgba(109, 40, 217, 0.18)', 'rgba(109, 40, 217, 0)']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.bottomGlow}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {isCategoryView ? (
            <View style={styles.headerDetailRow}>
              <Pressable
                onPress={() => router.replace('/admin/tabs')}
                style={styles.backButton}>
                <Ionicons name="arrow-forward" size={20} color={colors.text} />
              </Pressable>

              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>{resolvedCategoryName}</Text>
                <Text style={styles.headerSubtitle}>إدارة مزودي هذا المجال</Text>
              </View>

              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>قطاع</Text>
              </View>
            </View>
          ) : (
            <View style={styles.headerRow}>
              <View style={styles.brandWrapper}>
                <Text style={styles.brandText}>LUMIXY</Text>
              </View>
            </View>
          )}

          <View style={styles.hero}>
            <Text style={styles.title}>
              {isCategoryView ? `مزودو ${resolvedCategoryName}` : 'إدارة المزودين'}
            </Text>
            <Text style={styles.subtitle}>
              {isCategoryView
                ? 'إدارة الحسابات المرتبطة بهذا المجال فقط'
                : 'مراجعة واعتماد مزودي الخدمات الجدد وإدارة حساباتهم'}
            </Text>
          </View>

          {errorMessage ? (
            <StatusBanner
              message={errorMessage}
              tone="error"
              actionLabel="إعادة المحاولة"
              onAction={() => {
                void loadProviders();
              }}
            />
          ) : null}

          <View style={styles.summaryRow}>
            {providerSummaryCards.map((card) => (
              <View
                key={card.key}
                style={[styles.summaryCard, { borderColor: card.borderColor }]}>
                <View style={[styles.summaryIconWrap, { backgroundColor: card.iconBg }]}>
                  <Ionicons name={card.icon} size={18} color={card.iconColor} />
                </View>
                <Text style={styles.summaryValue}>{card.value}</Text>
                <Text style={styles.summaryLabel}>{card.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.searchBar}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={
                isCategoryView
                  ? `ابحث داخل ${resolvedCategoryName}...`
                  : 'ابحث بالاسم أو الفئة...'
              }
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              textAlign="right"
            />
            <Feather name="search" size={20} color={colors.textMuted} />
          </View>

          <View style={styles.filtersRow}>
            {statusFilters.map((filter) => {
              const active = statusFilter === filter.key;

              return (
                <Pressable
                  key={filter.key}
                  style={styles.filterPressable}
                  onPress={() => setStatusFilter(filter.key)}>
                  {active ? (
                    <LinearGradient
                      colors={[colors.primaryLight, colors.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.activeFilter}>
                      <Text style={styles.activeFilterText}>{filter.label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.filterChip}>
                      <Text style={styles.filterChipText}>{filter.label}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.cardsList}>
            {isLoading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={colors.primaryLight} />
                <Text style={styles.loadingText}>
                  {isCategoryView ? 'جار تحميل مزودي هذا القطاع...' : 'جار تحميل المزودين...'}
                </Text>
              </View>
            ) : null}

            {!isLoading
              ? filteredProviders.map((provider) => {
                  const providerStatus = statusMeta[provider.tone];
                  const isBusy = busyProviderId === provider.id;

                  return (
                    <View key={provider.id} style={styles.providerCard}>
                      <View style={styles.providerHeader}>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: providerStatus.bg,
                              borderColor: providerStatus.border,
                            },
                          ]}>
                          <Text style={[styles.statusBadgeText, { color: providerStatus.color }]}>
                            {provider.badgeLabel}
                          </Text>
                        </View>

                        <View style={styles.providerIdentity}>
                          <View style={styles.providerText}>
                            <Text style={styles.providerName}>{provider.name}</Text>
                            <View style={styles.locationRow}>
                              <Feather name="map-pin" size={12} color={colors.textSecondary} />
                              <Text style={styles.providerLocation}>{provider.city}</Text>
                            </View>
                          </View>

                          <LinearGradient
                            colors={provider.avatarGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.providerAvatar}>
                            <MaterialCommunityIcons
                              name={provider.avatarIcon}
                              size={24}
                              color={
                                provider.tone === 'approved'
                                  ? '#8A8A8A'
                                  : provider.tone === 'rejected'
                                    ? '#451A1A'
                                    : provider.tone === 'none'
                                      ? '#D4D4D8'
                                    : '#FFFFFF'
                              }
                            />
                          </LinearGradient>
                        </View>
                      </View>

                      <View style={styles.cardDivider} />

                      {provider.note ? (
                        <View style={styles.noteWrap}>
                          <Ionicons
                            name="alert-circle-outline"
                            size={14}
                            color={provider.tone === 'rejected' ? colors.error : colors.warning}
                          />
                          <Text style={styles.noteText}>{provider.note}</Text>
                        </View>
                      ) : null}

                      <View style={styles.providerFooter}>
                        <View style={styles.actionsRow}>
                          {!provider.hasApplication &&
                          !provider.isAwaitingApproval &&
                          !provider.isActiveProvider ? (
                            <View style={styles.noApplicationBadge}>
                              <Text style={styles.noApplicationText}>لا يوجد طلب اعتماد</Text>
                            </View>
                          ) : !provider.hasApplication && provider.isAwaitingApproval ? (
                            <>
                              <Pressable
                                style={[styles.iconAction, styles.rejectButton]}
                                onPress={() => {
                                  void handleReject(provider);
                                }}
                                disabled={isBusy}>
                                {isBusy ? (
                                  <ActivityIndicator size="small" color={colors.error} />
                                ) : (
                                  <Feather name="trash-2" size={18} color={colors.error} />
                                )}
                              </Pressable>

                              <Pressable
                                onPress={() => {
                                  void handleApprove(provider);
                                }}
                                disabled={isBusy}>
                                <LinearGradient
                                  colors={['#78DBA9', '#59C98F']}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 1 }}
                                  style={[
                                    styles.approveButton,
                                    isBusy && styles.approveButtonDisabled,
                                  ]}>
                                  {isBusy ? (
                                    <ActivityIndicator size="small" color={colors.text} />
                                  ) : (
                                    <>
                                      <Text style={styles.approveButtonText}>موافقة</Text>
                                      <Ionicons
                                        name="checkmark-circle-outline"
                                        size={16}
                                        color={colors.text}
                                      />
                                    </>
                                  )}
                                </LinearGradient>
                              </Pressable>
                            </>
                          ) : (
                            <>
                              {provider.filterStatus === 'rejected' ? (
                                <Pressable
                                  style={[styles.iconAction, styles.deleteButton]}
                                  onPress={() => handleDelete(provider)}
                                  disabled={isBusy}>
                                  {isBusy ? (
                                    <ActivityIndicator size="small" color={colors.error} />
                                  ) : (
                                    <Feather name="trash-2" size={18} color={colors.error} />
                                  )}
                                </Pressable>
                              ) : (
                                <Pressable
                                  style={[styles.iconAction, styles.rejectButton]}
                                  onPress={() => {
                                    void handleReject(provider);
                                  }}
                                  disabled={isBusy}>
                                  {isBusy ? (
                                    <ActivityIndicator size="small" color={colors.error} />
                                  ) : (
                                    <Feather name="trash-2" size={18} color={colors.error} />
                                  )}
                                </Pressable>
                              )}

                              {provider.filterStatus === 'approved' && provider.tone !== 'suspended' ? (
                                <Pressable
                                  style={[styles.iconAction, styles.editButton]}
                                  onPress={() => {
                                    void handleSuspend(provider);
                                  }}
                                  disabled={isBusy}>
                                  {isBusy ? (
                                    <ActivityIndicator size="small" color={colors.text} />
                                  ) : (
                                    <Feather
                                      name="slash"
                                      size={18}
                                      color="rgba(255,255,255,0.72)"
                                    />
                                  )}
                                </Pressable>
                              ) : (
                                <Pressable
                                  onPress={() => {
                                    void handleApprove(provider);
                                  }}
                                  disabled={isBusy}>
                                  <LinearGradient
                                    colors={['#78DBA9', '#59C98F']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={[
                                      styles.approveButton,
                                      isBusy && styles.approveButtonDisabled,
                                    ]}>
                                    {isBusy ? (
                                      <ActivityIndicator size="small" color={colors.text} />
                                    ) : (
                                      <>
                                        <Text style={styles.approveButtonText}>موافقة</Text>
                                        <Ionicons
                                          name="checkmark-circle-outline"
                                          size={16}
                                          color={colors.text}
                                        />
                                      </>
                                    )}
                                  </LinearGradient>
                                </Pressable>
                              )}
                            </>
                          )}
                        </View>

                        <Text style={styles.providerSpecialty}>{provider.specialty}</Text>
                      </View>
                    </View>
                  );
                })
              : null}

            {isEmpty ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={28} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>
                  {isCategoryView ? 'لا يوجد مزودون في هذا المجال' : 'لا توجد نتائج مطابقة'}
                </Text>
                <Text style={styles.emptyText}>
                  {isCategoryView
                    ? 'جرّب تغيير الفلتر أو البحث لعرض مزودين آخرين داخل هذا القطاع.'
                    : 'جرّب تغيير البحث أو اختيار فلتر مختلف لعرض مزودين آخرين.'}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: '#09080C',
  },
  topGlow: {
    position: 'absolute',
    top: -40,
    right: -42,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerDetailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  headerText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
    textAlign: 'right',
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 2,
  },
  headerBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.16)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerBadgeText: {
    color: colors.accent,
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
  },
  brandWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 26,
    letterSpacing: 0.4,
  },
  hero: {
    alignItems: 'flex-end',
    paddingTop: 14,
    gap: 6,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 34,
    lineHeight: 48,
    paddingTop: 4,
    textAlign: 'right',
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    textAlign: 'right',
  },
  searchBar: {
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontFamily: typography.fontFamily.regular,
  },
  filtersRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
  },
  filterPressable: {
    flexShrink: 0,
  },
  filterChip: {
    minHeight: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  filterChipText: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
  },
  activeFilter: {
    minHeight: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 7,
  },
  activeFilterText: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    alignItems: 'stretch',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    minHeight: 96,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
  },
  summaryIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  summaryValue: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
    lineHeight: 34,
    paddingTop: 2,
    textAlign: 'center',
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  cardsList: {
    gap: 14,
    marginTop: 2,
  },
  loadingState: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 42,
    paddingHorizontal: 18,
    gap: 12,
  },
  loadingText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    textAlign: 'center',
  },
  providerCard: {
    backgroundColor: 'rgba(22, 20, 26, 0.96)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statusBadgeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
  },
  providerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'flex-end',
  },
  providerText: {
    alignItems: 'flex-end',
    flexShrink: 1,
  },
  providerName: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    textAlign: 'right',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  providerLocation: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
  },
  providerAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 14,
  },
  noteWrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  noteText: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'right',
  },
  providerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  providerSpecialty: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noApplicationBadge: {
    minHeight: 38,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(161, 161, 170, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(161, 161, 170, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noApplicationText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
  },
  iconAction: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  rejectButton: {
    backgroundColor: 'rgba(71, 23, 23, 0.28)',
    borderColor: 'rgba(239, 68, 68, 0.18)',
  },
  deleteButton: {
    backgroundColor: 'rgba(71, 23, 23, 0.24)',
    borderColor: 'rgba(239, 68, 68, 0.16)',
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  approveButton: {
    minWidth: 108,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  approveButtonDisabled: {
    opacity: 0.82,
  },
  approveButtonText: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
  },
  emptyState: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 42,
    paddingHorizontal: 18,
    gap: 8,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
