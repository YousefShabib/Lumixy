import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography } from '@/theme';

type ProviderStatus = 'approved' | 'pending' | 'rejected';
type StatusFilter = 'all' | ProviderStatus;

type ProviderItem = {
  id: string;
  name: string;
  city: string;
  specialty: string;
  status: ProviderStatus;
  avatarIcon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  avatarGradient: [string, string];
};

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'approved', label: 'موافق' },
  { key: 'rejected', label: 'رفض' },
  { key: 'pending', label: 'قيد الانتظار' },
];

const initialProviders: ProviderItem[] = [
  {
    id: '1',
    name: 'مركز غزة الإبداعي',
    city: 'مدينة غزة',
    specialty: 'التصميم والإعلام',
    status: 'pending',
    avatarIcon: 'sofa-single-outline',
    avatarGradient: ['#86724D', '#D8C2A0'],
  },
  {
    id: '2',
    name: 'رم الله للحلول التقنية',
    city: 'رام الله، الضفة الغربية',
    specialty: 'خدمات تكنولوجيا المعلومات',
    status: 'approved',
    avatarIcon: 'office-building-outline',
    avatarGradient: ['#F5F5F5', '#D9D9D9'],
  },
  {
    id: '3',
    name: 'ستوديو لومير',
    city: 'الخليل، الضفة الغربية',
    specialty: 'تصوير وفوتوغرافي',
    status: 'pending',
    avatarIcon: 'storefront-outline',
    avatarGradient: ['#FFD1B6', '#E79A76'],
  },
  {
    id: '4',
    name: 'بيت عدسة برو',
    city: 'نابلس، الضفة الغربية',
    specialty: 'تصوير وإنتاج',
    status: 'rejected',
    avatarIcon: 'camera-outline',
    avatarGradient: ['#51426E', '#1F1A2C'],
  },
];

const statusMeta: Record<
  ProviderStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
  }
> = {
  approved: {
    label: 'نشط',
    color: '#58D29B',
    bg: 'rgba(38, 94, 67, 0.26)',
    border: 'rgba(88, 210, 155, 0.18)',
  },
  pending: {
    label: 'قيد الانتظار',
    color: '#F59E0B',
    bg: 'rgba(117, 66, 18, 0.24)',
    border: 'rgba(245, 158, 11, 0.18)',
  },
  rejected: {
    label: 'مرفوض',
    color: '#F87171',
    bg: 'rgba(112, 35, 35, 0.24)',
    border: 'rgba(248, 113, 113, 0.16)',
  },
};

export default function ProvidersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [providers, setProviders] = useState<ProviderItem[]>(initialProviders);

  const filteredProviders = providers.filter((provider) => {
    const matchesStatus = statusFilter === 'all' || provider.status === statusFilter;
    const searchableText = `${provider.name} ${provider.city} ${provider.specialty}`.toLowerCase();
    const matchesSearch =
      searchQuery.trim().length === 0 || searchableText.includes(searchQuery.trim().toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const updateProviderStatus = (id: string, status: ProviderStatus) => {
    setProviders((current) =>
      current.map((provider) => (provider.id === id ? { ...provider, status } : provider))
    );
  };

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
          <View style={styles.headerRow}>
            <View style={styles.brandWrapper}>
              <Text style={styles.brandText}>LUMIXY</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={styles.title}>إدارة الحسابات</Text>
            <Text style={styles.subtitle}>مراجعة واعتماد مزودي الخدمات الجدد</Text>
          </View>

          <View style={styles.searchBar}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="ابحث بالاسم أو الفئة..."
              style={styles.searchInput}
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
            {filteredProviders.map((provider) => {
              const providerStatus = statusMeta[provider.status];

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
                        {providerStatus.label}
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
                          color={provider.status === 'approved' ? '#8A8A8A' : '#70482A'}
                        />
                      </LinearGradient>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.providerFooter}>
                    <View style={styles.actionsRow}>
                      <Pressable
                        style={[styles.iconAction, styles.rejectButton]}
                        onPress={() => updateProviderStatus(provider.id, 'rejected')}>
                        <Feather name="trash-2" size={18} color="#EF4444" />
                      </Pressable>

                      {provider.status === 'approved' ? (
                        <Pressable style={[styles.iconAction, styles.editButton]}>
                          <Feather name="edit-3" size={18} color="rgba(255,255,255,0.72)" />
                        </Pressable>
                      ) : (
                        <Pressable onPress={() => updateProviderStatus(provider.id, 'approved')}>
                          <LinearGradient
                            colors={['#78DBA9', '#59C98F']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.approveButton}>
                            <Text style={styles.approveButtonText}>موافقة</Text>
                            <Ionicons
                              name="checkmark-circle-outline"
                              size={16}
                              color={colors.text}
                            />
                          </LinearGradient>
                        </Pressable>
                      )}
                    </View>

                    <Text style={styles.providerSpecialty}>{provider.specialty}</Text>
                  </View>
                </View>
              );
            })}

            {filteredProviders.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={28} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>لا توجد نتائج مطابقة</Text>
                <Text style={styles.emptyText}>
                  جرّب تغيير البحث أو اختيار فلتر مختلف لعرض مزودين آخرين.
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
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
    paddingTop: 24,
    gap: 6,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 34,
    lineHeight: 40,
    textAlign: 'right',
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    textAlign: 'right',
  },
  searchBar: {
    marginTop: 18,
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
  },
  filtersRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    marginTop: 14,
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
    fontFamily: typography.fontFamily.semiBold,
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
  cardsList: {
    gap: 14,
    marginTop: 16,
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
    fontFamily: typography.fontFamily.semiBold,
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
    marginRight: 0,
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
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  approveButton: {
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
