import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useDeferredValue, useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { StatusMessage } from '@/components/ui/status-message';
import { fetchSearchData, type SearchFilter, type SearchResultItem, type SearchScreenData } from '@/services/search';
import { colors, typography } from '@/theme';

type SearchFormValues = {
  search: string;
};

type CityFilterOption = {
  id: string;
  label: string;
  aliases: string[];
};

type CityFilterChip = CityFilterOption & {
  resultsCount: number;
};

const ALL_CITIES_ID = 'all-cities';

const westBankCities: CityFilterOption[] = [
  { id: 'jerusalem', label: 'القدس', aliases: ['القدس', 'القدس الشرقية'] },
  { id: 'ramallah', label: 'رام الله', aliases: ['رام الله', 'رام الله والبيرة', 'البيرة'] },
  { id: 'nablus', label: 'نابلس', aliases: ['نابلس'] },
  { id: 'hebron', label: 'الخليل', aliases: ['الخليل'] },
  { id: 'bethlehem', label: 'بيت لحم', aliases: ['بيت لحم'] },
  { id: 'jenin', label: 'جنين', aliases: ['جنين'] },
  { id: 'tulkarm', label: 'طولكرم', aliases: ['طولكرم'] },
  { id: 'qalqilya', label: 'قلقيلية', aliases: ['قلقيلية', 'قلقيليه'] },
  { id: 'salfit', label: 'سلفيت', aliases: ['سلفيت'] },
  { id: 'jericho', label: 'أريحا', aliases: ['أريحا', 'اريحا', 'أريحا والأغوار', 'اريحا والأغوار'] },
  { id: 'tubas', label: 'طوباس', aliases: ['طوباس'] },
];

function normalizeCategoryParam(value: string | string[] | undefined) {
  const source = Array.isArray(value) ? value[0] : value;
  return source?.trim() || 'all';
}

function normalizeArabicForMatch(value: string) {
  return value
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/[،,]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function matchesWestBankCity(result: SearchResultItem, city: CityFilterOption) {
  const candidates = [result.city, result.location]
    .map((value) => normalizeArabicForMatch(value))
    .filter(Boolean);

  return city.aliases.some((alias) => {
    const normalizedAlias = normalizeArabicForMatch(alias);
    return candidates.some(
      (candidate) => candidate.includes(normalizedAlias) || normalizedAlias.includes(candidate),
    );
  });
}

function buildCityFilterChips(results: SearchResultItem[]): CityFilterChip[] {
  return westBankCities.map((city) => ({
    ...city,
    resultsCount: results.filter((result) => matchesWestBankCity(result, city)).length,
  }));
}

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string | string[] }>();
  const routeCategoryId = normalizeCategoryParam(params.categoryId);
  const [activeFilterId, setActiveFilterId] = useState(routeCategoryId);
  const [activeCityId, setActiveCityId] = useState(ALL_CITIES_ID);
  const [isCitySheetOpen, setIsCitySheetOpen] = useState(false);
  const { control, resetField } = useForm<SearchFormValues>({
    defaultValues: {
      search: '',
    },
  });
  const search =
    useWatch({
      control,
      name: 'search',
    }) ?? '';
  const deferredSearch = useDeferredValue(search);
  const {
    data: searchData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<SearchScreenData>({
    queryKey: ['search-data'],
    queryFn: ({ signal }) => fetchSearchData(signal),
  });
  const errorMessage = error instanceof Error ? error.message : null;

  useEffect(() => {
    resetField('search', { defaultValue: '' });
    setActiveFilterId(routeCategoryId);
    setActiveCityId(ALL_CITIES_ID);
    setIsCitySheetOpen(false);
  }, [resetField, routeCategoryId]);

  useEffect(() => {
    if (!searchData) {
      return;
    }

    const hasMatchingFilter = searchData.filters.some((filter) => filter.id === activeFilterId);

    if (!hasMatchingFilter) {
      setActiveFilterId('all');
    }
  }, [activeFilterId, searchData]);

  const filters = searchData?.filters ?? [{ id: 'all', label: 'الكل' } satisfies SearchFilter];
  const results = searchData?.results ?? [];
  const isFallbackData = searchData?.dataSource === 'fallback';
  const cityFilterChips = buildCityFilterChips(results);
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const hasProviders = results.length > 0;

  const filteredResults = results.filter((item) => {
    const matchesCategory = activeFilterId === 'all' || item.categoryId === activeFilterId;
    const matchesCity =
      activeCityId === ALL_CITIES_ID ||
      cityFilterChips.some((city) => city.id === activeCityId && matchesWestBankCity(item, city));
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [item.name, item.type, item.location, item.city, item.desc, ...item.customServices]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);

    return matchesCategory && matchesCity && matchesSearch;
  });

  const resultsCountLabel = `${filteredResults.length.toLocaleString('ar-EG')} نتيجة`;
  function handleProfilePress(providerId: string) {
    router.push({
      pathname: '/providers/[id]',
      params: { id: providerId },
    });
  }

  function handleOpenCitySheet() {
    setIsCitySheetOpen(true);
  }

  function handleCloseCitySheet() {
    setIsCitySheetOpen(false);
  }

  function handleSelectCity(cityId: string) {
    setActiveCityId(cityId);
    setIsCitySheetOpen(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>LUMIXY</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={30} color="#8D4BFF" style={styles.searchIcon} />
            <Controller
              control={control}
              name="search"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="ابحث عن مزود خدمة أو مدينة..."
                  placeholderTextColor="#6F7892"
                  value={value}
                  onChangeText={onChange}
                  textAlign="right"
                />
              )}
            />
          </View>

          <Pressable
            style={[styles.filterBtn, activeCityId !== ALL_CITIES_ID && styles.filterBtnActive]}
            onPress={handleOpenCitySheet}>
            <Ionicons name="options-outline" size={22} color="#fff" />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersRow}
          contentContainerStyle={styles.filtersContent}>
          {filters.map((filter) => {
            const isActive = activeFilterId === filter.id;

            return (
              <Pressable
                key={filter.id}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveFilterId(filter.id)}>
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

      </View>

      <View style={styles.resultsHeaderRow}>
        <Text style={styles.sectionTitle}>النتائج المتاحة</Text>
        <Text style={styles.resultsCount}>{resultsCountLabel}</Text>
      </View>

      {isLoading && !searchData ? (
        <StatusMessage
          style={styles.topStatus}
          title="جاري تحميل الدليل"
          message="نقوم الآن بسحب جميع المزودين المعتمدين والتصنيفات من Laravel."
          variant="info"
        />
      ) : null}

      {errorMessage ? (
        <StatusMessage
          style={styles.topStatus}
          title="تعذر تحميل نتائج البحث"
          message={errorMessage}
          variant="error"
          actionLabel="إعادة المحاولة"
          onActionPress={() => {
            void refetch();
          }}
        />
      ) : null}

      {isFallbackData ? (
        <StatusMessage
          style={styles.topStatus}
          title="يتم عرض بيانات تجريبية"
          message={
            searchData?.warningMessage ??
            'تعذر الوصول إلى الباك الحالي، لذلك يتم عرض نتائج محلية مؤقتة.'
          }
          variant="warning"
        />
      ) : null}

      {!isLoading && !errorMessage && !hasProviders ? (
        <StatusMessage
          style={styles.topStatus}
          title="لا توجد نتائج منشورة حاليًا"
          message="ما زال الدليل العام فارغًا. اعتمد مزودًا واحدًا على الأقل ليظهر هنا."
          variant="warning"
        />
      ) : null}

      <ScrollView style={styles.resultsList} contentContainerStyle={styles.resultsContent}>
        {filteredResults.map((item) => (
          <View key={item.id} style={styles.resultCard}>
            <View style={styles.resultAvatar}>
              <Ionicons
                name={item.isFeatured ? 'sparkles-outline' : 'person-circle'}
                size={item.isFeatured ? 28 : 54}
                color="#fff"
              />
            </View>

            <View style={styles.resultContent}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultName}>{item.name}</Text>

                <View style={styles.resultType}>
                  <Text style={styles.resultTypeText}>{item.type}</Text>
                </View>
              </View>

              <Text style={styles.resultDesc} numberOfLines={2}>
                {item.desc}
              </Text>

              <View style={styles.resultFooter}>
                <Ionicons name="location-outline" size={13} color="#B9A6D6" />
                <Text style={styles.resultLocation}>{item.location}</Text>

                <Pressable onPress={() => handleProfilePress(item.id)}>
                  <Text style={styles.profileLink}>عرض الملف الشخصي</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}

        {!isLoading && hasProviders && filteredResults.length === 0 ? (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTitle}>لا توجد نتائج مطابقة</Text>
            <Text style={styles.emptyStateText}>
              جرّب تغيير التصنيف أو اختر مدينة أخرى من مدن الضفة أو اكتب كلمة بحث مختلفة.
            </Text>
          </View>
        ) : null}

        {isFetching && searchData ? (
          <View style={styles.loadingMoreRow}>
            <ActivityIndicator color="#B04BFF" />
          </View>
        ) : null}
      </ScrollView>

      <Modal visible={isCitySheetOpen} transparent animationType="fade" onRequestClose={handleCloseCitySheet}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={handleCloseCitySheet} />

          <View style={styles.citySheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Pressable style={styles.sheetCloseButton} onPress={handleCloseCitySheet}>
                <Ionicons name="close" size={18} color="#FFFFFF" />
              </Pressable>

              <View style={styles.sheetHeaderText}>
                <Text style={styles.sheetTitle}>فلترة حسب المدينة</Text>
                <Text style={styles.sheetSubtitle}>اختر من مدن الضفة الغربية فقط</Text>
              </View>
            </View>

            <ScrollView
              style={styles.citySheetScroll}
              contentContainerStyle={styles.citySheetContent}
              showsVerticalScrollIndicator={false}>
              <Pressable
                style={[
                  styles.cityChip,
                  activeCityId === ALL_CITIES_ID && styles.cityChipActive,
                ]}
                onPress={() => handleSelectCity(ALL_CITIES_ID)}>
                <Text
                  style={[
                    styles.cityChipLabel,
                    activeCityId === ALL_CITIES_ID && styles.cityChipLabelActive,
                  ]}>
                  كل المدن
                </Text>
                <Text
                  style={[
                    styles.cityChipCount,
                    activeCityId === ALL_CITIES_ID && styles.cityChipCountActive,
                  ]}>
                  {results.length.toLocaleString('ar-EG')}
                </Text>
              </Pressable>

              {cityFilterChips.map((city) => {
                const isActive = activeCityId === city.id;

                return (
                  <Pressable
                    key={city.id}
                    style={[styles.cityChip, isActive && styles.cityChipActive]}
                    onPress={() => handleSelectCity(city.id)}>
                    <Text style={[styles.cityChipLabel, isActive && styles.cityChipLabelActive]}>
                      {city.label}
                    </Text>
                    <Text style={[styles.cityChipCount, isActive && styles.cityChipCountActive]}>
                      {city.resultsCount.toLocaleString('ar-EG')}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  logo: {
    color: '#9D4DFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    textAlign: 'center',
    alignSelf: 'center',
    marginBottom: 18,
    letterSpacing: 2,
  },
  searchRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#1D1325',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(159, 120, 219, 0.18)',
    paddingHorizontal: 18,
    height: 72,
  },
  searchIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontFamily: typography.fontFamily.regular,
    fontSize: 17,
    padding: 0,
    marginRight: 10,
    writingDirection: 'rtl',
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7B3FE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#9657FF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  filtersRow: {
    marginTop: 2,
    marginBottom: 10,
  },
  filtersContent: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#1B1122',
  },
  filterTabActive: {
    backgroundColor: '#7B3FE4',
  },
  filterTabText: {
    color: '#B9A6D6',
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
  },
  filterTabTextActive: {
    color: '#fff',
  },
  resultsHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    textAlign: 'right',
  },
  resultsCount: {
    color: '#8C859C',
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    textAlign: 'left',
  },
  topStatus: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  resultsList: {
    flex: 1,
    paddingHorizontal: 8,
  },
  resultsContent: {
    paddingBottom: 32,
  },
  resultCard: {
    flexDirection: 'row-reverse',
    backgroundColor: '#23113A',
    borderRadius: 18,
    width: '94%',
    alignSelf: 'center',
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  resultAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#7B3FE4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  resultContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  resultHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 2,
    gap: 8,
  },
  resultName: {
    color: '#fff',
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    marginLeft: 8,
    maxWidth: 180,
    textAlign: 'right',
  },
  resultType: {
    backgroundColor: '#7B3FE4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 6,
  },
  resultTypeText: {
    color: '#fff',
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
  },
  resultDesc: {
    color: '#B9A6D6',
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    marginBottom: 6,
    textAlign: 'right',
  },
  resultFooter: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
  },
  resultLocation: {
    color: '#B9A6D6',
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    marginLeft: 4,
  },
  profileLink: {
    color: '#B04BFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    marginRight: 8,
  },
  emptyStateCard: {
    backgroundColor: '#17131B',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    marginBottom: 6,
  },
  emptyStateText: {
    color: '#9CA3AF',
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
  },
  loadingMoreRow: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 2, 10, 0.72)',
  },
  citySheet: {
    maxHeight: '70%',
    backgroundColor: '#120A17',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(159, 120, 219, 0.18)',
  },
  sheetHandle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHeaderText: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 14,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    textAlign: 'right',
  },
  sheetSubtitle: {
    marginTop: 4,
    color: '#A89AB9',
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    textAlign: 'right',
  },
  citySheetScroll: {
    flexGrow: 0,
  },
  citySheetContent: {
    gap: 10,
    paddingBottom: 4,
  },
  cityChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1B1122',
    borderWidth: 1,
    borderColor: 'rgba(159, 120, 219, 0.16)',
  },
  cityChipActive: {
    backgroundColor: '#7B3FE4',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  cityChipLabel: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    textAlign: 'right',
  },
  cityChipLabelActive: {
    color: '#FFFFFF',
  },
  cityChipCount: {
    color: '#A89AB9',
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
  },
  cityChipCountActive: {
    color: '#F5EDFF',
  },
});
