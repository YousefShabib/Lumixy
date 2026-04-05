import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import StatusBanner from '@/components/ui/status-banner';
import { useAdminSession } from '@/contexts/admin-session-context';
import {
  createCategory,
  deleteCategory,
  fetchAdminCategories,
  updateCategory,
  type AdminCategoryRecord,
} from '@/services/admin-api';
import { ApiError, getReadableError } from '@/services/api';
import { colors, typography } from '@/theme';

type EditorState = {
  id: string | null;
  isActive: boolean;
  name: string;
  sortOrder: string;
};

type AdminCategoriesScreenProps = {
  mode: 'all' | 'preview';
};

const initialEditorState: EditorState = {
  id: null,
  name: '',
  sortOrder: '0',
  isActive: true,
};

function resolveCategoryVisual(name: string) {
  if (name.includes('قاعة')) {
    return {
      color: '#F59E0B',
      icon: 'storefront-outline' as const,
    };
  }

  if (name.includes('استوديو') || name.includes('تصوير')) {
    return {
      color: colors.primaryLight,
      icon: 'camera-outline' as const,
    };
  }

  if (name.includes('حفلات') || name.includes('تنظيم')) {
    return {
      color: '#3B82F6',
      icon: 'sparkles-outline' as const,
    };
  }

  if (name.includes('خارجي') || name.includes('طبيعة')) {
    return {
      color: '#34D399',
      icon: 'image-outline' as const,
    };
  }

  return {
    color: colors.accent,
    icon: 'layers-outline' as const,
  };
}

export default function AdminCategoriesScreen({ mode }: AdminCategoriesScreenProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { logout } = useAdminSession();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<AdminCategoryRecord[]>([]);
  const [editorState, setEditorState] = useState<EditorState>(initialEditorState);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyDeleteId, setBusyDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editorOffsetY, setEditorOffsetY] = useState(0);
  const [shouldRevealEditor, setShouldRevealEditor] = useState(false);

  const isPreviewMode = mode === 'preview';
  const horizontalPadding = 20;
  const gridGap = 12;
  const cardSize = Math.floor(
    Math.min((width - horizontalPadding * 2 - gridGap) / 2, isPreviewMode ? 183 : 195)
  );
  const scrollBottomPadding = isPreviewMode ? 24 : insets.bottom + 28;

  const handleUnauthorized = useCallback(
    async (error: unknown) => {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        console.error('انتهت صلاحية الوصول إلى صفحة القطاعات:', error);
        await logout();
        return true;
      }

      return false;
    },
    [logout]
  );

  const loadCategories = useCallback(
    async ({ quiet = false }: { quiet?: boolean } = {}) => {
      if (!quiet) {
        setIsLoading(true);
      }

      setErrorMessage(null);

      try {
        const response = await fetchAdminCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('فشل تحميل القطاعات:', error);

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
    [handleUnauthorized]
  );

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const searchableText = `${category.name} ${category.provider_profiles_count} ${category.approved_providers_count}`;
      return query.trim().length === 0 || searchableText.includes(query.trim());
    });
  }, [categories, query]);

  const visibleCategories = useMemo(() => {
    if (!isPreviewMode || query.trim().length > 0) {
      return filteredCategories;
    }

    return filteredCategories.slice(0, 4);
  }, [filteredCategories, isPreviewMode, query]);

  const revealEditor = useCallback(() => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(editorOffsetY - 18, 0),
        animated: true,
      });
    });
  }, [editorOffsetY]);

  useEffect(() => {
    if (!isEditorVisible || !shouldRevealEditor || editorOffsetY <= 0) {
      return;
    }

    revealEditor();
    setShouldRevealEditor(false);
  }, [editorOffsetY, isEditorVisible, revealEditor, shouldRevealEditor]);

  const openCreateEditor = () => {
    setEditorState(initialEditorState);
    setIsEditorVisible(true);
    setErrorMessage(null);
    setShouldRevealEditor(true);
  };

  const openEditEditor = (category: AdminCategoryRecord) => {
    setEditorState({
      id: category.id,
      name: category.name,
      sortOrder: String(category.sort_order ?? 0),
      isActive: category.is_active,
    });
    setIsEditorVisible(true);
    setErrorMessage(null);
    setShouldRevealEditor(true);
  };

  const closeEditor = () => {
    setEditorState(initialEditorState);
    setIsEditorVisible(false);
  };

  const handleSaveCategory = async () => {
    const trimmedName = editorState.name.trim();

    if (!trimmedName) {
      setErrorMessage('اسم القطاع مطلوب قبل الحفظ.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const payload = {
      name: trimmedName,
      sort_order: Number(editorState.sortOrder || 0),
      is_active: editorState.isActive,
    };

    try {
      if (editorState.id) {
        await updateCategory(editorState.id, payload);
        Alert.alert('تم التحديث', `تم تحديث قطاع ${trimmedName} بنجاح.`);
      } else {
        await createCategory(payload);
        Alert.alert('تمت الإضافة', `تمت إضافة قطاع ${trimmedName} بنجاح.`);
      }

      closeEditor();
      await loadCategories({ quiet: true });
    } catch (error) {
      console.error('فشل حفظ القطاع:', error);

      if (await handleUnauthorized(error)) {
        return;
      }

      setErrorMessage(getReadableError(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = (category: AdminCategoryRecord) => {
    Alert.alert('حذف القطاع', `هل تريد حذف قطاع ${category.name} نهائياً؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setBusyDeleteId(category.id);
            setErrorMessage(null);

            try {
              await deleteCategory(category.id);
              Alert.alert('تم الحذف', `تم حذف قطاع ${category.name} بنجاح.`);
              await loadCategories({ quiet: true });
            } catch (error) {
              console.error('فشل حذف القطاع:', error);

              if (await handleUnauthorized(error)) {
                return;
              }

              setErrorMessage(getReadableError(error));
            } finally {
              setBusyDeleteId(null);
            }
          })();
        },
      },
    ]);
  };

  const handleEditorLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const nextOffset = nativeEvent.layout.y;

    if (Math.abs(nextOffset - editorOffsetY) > 2) {
      setEditorOffsetY(nextOffset);
    }
  };

  const openCategoryProviders = (category: AdminCategoryRecord) => {
    router.push({
      pathname: '/admin/category-providers',
      params: {
        categoryId: category.id,
        categoryName: category.name,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.background}>
        <LinearGradient
          colors={['rgba(167, 139, 250, 0.20)', 'rgba(167, 139, 250, 0.00)']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.topGlow}
        />
        <LinearGradient
          colors={['rgba(109, 40, 217, 0.22)', 'rgba(109, 40, 217, 0.00)']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.bottomGlow}
        />

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: scrollBottomPadding,
            },
          ]}>
          {isPreviewMode ? (
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>إدارة القطاعات والخدمات</Text>
              <Text style={styles.heroDescription}>
                إضافة وإدارة قطاعات الخدمات للمزودين في المنصة
              </Text>
            </View>
          ) : (
            <View style={styles.allHeaderRow}>
              <Pressable
                onPress={() => router.replace('/admin/tabs')}
                style={styles.backButton}>
                <Ionicons name="arrow-forward" size={20} color={colors.text} />
              </Pressable>

              <View style={styles.allHeaderText}>
                <Text style={styles.allHeaderTitle}>عرض كل القطاعات</Text>
                <Text style={styles.allHeaderSubtitle}>كل قطاعات الخدمات الموجودة في المنصة</Text>
              </View>

              <View style={styles.headerGhost} />
            </View>
          )}

          {errorMessage ? (
            <StatusBanner
              message={errorMessage}
              tone="error"
              actionLabel="إعادة المحاولة"
              onAction={() => {
                void loadCategories();
              }}
            />
          ) : null}

          {isPreviewMode ? (
            <Pressable style={styles.addCardWrapper} onPress={openCreateEditor}>
              <LinearGradient
                colors={[colors.primaryLight, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addCard}>
                <Text style={styles.addCardTitle}>إضافة قطاع جديد</Text>
                <Text style={styles.addCardSubtitle}>إنشاء فئة خدمات جديدة للمزودين</Text>

                <View style={styles.plusCircle}>
                  <Ionicons name="add" size={28} color={colors.text} />
                </View>
              </LinearGradient>
            </Pressable>
          ) : null}

          {isEditorVisible ? (
            <View onLayout={handleEditorLayout} style={styles.editorCard}>
              <Text style={styles.editorTitle}>
                {editorState.id ? 'تعديل بيانات القطاع' : 'إضافة قطاع جديد'}
              </Text>

              <View style={styles.fieldBlock}>
                <Text style={styles.label}>اسم القطاع</Text>
                <TextInput
                  value={editorState.name}
                  onChangeText={(value) =>
                    setEditorState((current) => ({
                      ...current,
                      name: value,
                    }))
                  }
                  placeholder="مثال: قاعات"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  textAlign="right"
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.label}>ترتيب الظهور</Text>
                <TextInput
                  value={editorState.sortOrder}
                  onChangeText={(value) =>
                    setEditorState((current) => ({
                      ...current,
                      sortOrder: value.replace(/[^0-9]/g, ''),
                    }))
                  }
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={styles.input}
                  textAlign="right"
                />
              </View>

              <View style={styles.toggleRow}>
                <Pressable
                  style={[styles.toggleChip, !editorState.isActive && styles.toggleChipInactive]}
                  onPress={() =>
                    setEditorState((current) => ({
                      ...current,
                      isActive: false,
                    }))
                  }>
                  <Text style={styles.toggleText}>غير مفعل</Text>
                </Pressable>

                <Pressable
                  style={[styles.toggleChip, editorState.isActive && styles.toggleChipActive]}
                  onPress={() =>
                    setEditorState((current) => ({
                      ...current,
                      isActive: true,
                    }))
                  }>
                  <Text style={styles.toggleTextActive}>مفعل</Text>
                </Pressable>
              </View>

              <View style={styles.editorActions}>
                <Pressable onPress={closeEditor} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>إلغاء</Text>
                </Pressable>

                <Pressable
                  onPress={handleSaveCategory}
                  disabled={isSaving}
                  style={styles.saveButtonWrap}>
                  <LinearGradient
                    colors={[colors.primaryLight, colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}>
                    {isSaving ? (
                      <ActivityIndicator color={colors.text} />
                    ) : (
                      <Text style={styles.saveButtonText}>
                        {editorState.id ? 'تحديث القطاع' : 'حفظ القطاع'}
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          ) : null}

          <View style={styles.searchBar}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="البحث عن قطاع أو خدمة معينة..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              textAlign="right"
            />
            <Feather name="search" size={20} color={colors.textMuted} />
          </View>

          <View style={styles.sectionHeader}>
            {isPreviewMode ? (
              <Pressable onPress={() => router.push('/admin/all-categories')}>
                <Text style={styles.showAllText}>عرض الكل</Text>
              </Pressable>
            ) : (
              <Text style={styles.allCounterText}>{filteredCategories.length} قطاع</Text>
            )}
            <Text style={styles.sectionTitle}>
              {isPreviewMode ? 'القطاعات الحالية' : 'كل القطاعات'}
            </Text>
          </View>

          <View
            style={[
              styles.grid,
              !isLoading && visibleCategories.length > 0
                ? { maxWidth: cardSize * 2 + gridGap }
                : null,
            ]}>
            {isLoading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={colors.primaryLight} />
                <Text style={styles.loadingText}>جار تحميل القطاعات...</Text>
              </View>
            ) : null}

            {!isLoading
              ? visibleCategories.map((category) => {
                  const visual = resolveCategoryVisual(category.name);
                  const activeCount =
                    category.approved_providers_count || category.provider_profiles_count;

                  return (
                    <View
                      key={category.id}
                      style={[styles.card, { width: cardSize, height: cardSize }]}>
                      <View style={styles.cardActions}>
                        <Pressable
                          hitSlop={10}
                          style={({ pressed }) => [
                            styles.actionButton,
                            styles.actionButtonEdit,
                            pressed && styles.actionButtonPressed,
                          ]}
                          onPress={() => openEditEditor(category)}>
                          <Feather name="edit-2" size={15} color="rgba(255,255,255,0.76)" />
                        </Pressable>
                        <Pressable
                          hitSlop={10}
                          style={({ pressed }) => [
                            styles.actionButton,
                            styles.actionButtonDelete,
                            pressed && styles.actionButtonPressed,
                          ]}
                          onPress={() => handleDeleteCategory(category)}
                          disabled={busyDeleteId === category.id}>
                          {busyDeleteId === category.id ? (
                            <ActivityIndicator size="small" color={colors.error} />
                          ) : (
                            <Feather name="trash-2" size={15} color="rgba(255,255,255,0.62)" />
                          )}
                        </Pressable>
                      </View>

                      <Pressable
                        style={({ pressed }) => [
                          styles.cardBody,
                          pressed && styles.cardBodyPressed,
                        ]}
                        onPress={() => openCategoryProviders(category)}>
                        <View
                          style={[
                            styles.iconCircle,
                            {
                              backgroundColor: `${visual.color}1F`,
                              borderColor: `${visual.color}40`,
                            },
                          ]}>
                          <Ionicons name={visual.icon} size={26} color={visual.color} />
                        </View>

                        <Text style={styles.cardTitle} numberOfLines={2}>
                          {category.name}
                        </Text>
                        <Text style={styles.cardCount} numberOfLines={1}>
                          {category.is_active ? `${activeCount} مزود نشط` : 'قطاع غير مفعل'}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })
              : null}

            {!isLoading && visibleCategories.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={28} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>لا توجد قطاعات مطابقة</Text>
                <Text style={styles.emptyText}>
                  غيّر البحث أو أضف قطاعاً جديداً ليظهر هنا مباشرة من قاعدة البيانات.
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
  background: {
    flex: 1,
    backgroundColor: '#09070D',
  },
  topGlow: {
    position: 'absolute',
    top: -18,
    right: -38,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  bottomGlow: {
    position: 'absolute',
    left: -60,
    bottom: 120,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 14,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 10,
    gap: 8,
  },
  heroTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 41,
    lineHeight: 50,
    textAlign: 'center',
  },
  heroDescription: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: typography.fontFamily.regular,
  },
  allHeaderRow: {
    minHeight: 56,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
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
  allHeaderText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  allHeaderTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
    textAlign: 'center',
  },
  allHeaderSubtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 3,
  },
  headerGhost: {
    width: 42,
    height: 42,
  },
  addCardWrapper: {
    borderRadius: 32,
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.26,
    shadowRadius: 30,
    elevation: 10,
  },
  addCard: {
    minHeight: 104,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 80,
    position: 'relative',
  },
  addCardTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    textAlign: 'center',
  },
  addCardSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
  },
  plusCircle: {
    position: 'absolute',
    right: 18,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  editorCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: 'rgba(19, 16, 24, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 14,
  },
  editorTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    textAlign: 'right',
  },
  fieldBlock: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    textAlign: 'right',
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    color: colors.text,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: typography.fontFamily.regular,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleChip: {
    flex: 1,
    minHeight: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  toggleChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderColor: 'rgba(16, 185, 129, 0.22)',
  },
  toggleChipInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.14)',
  },
  toggleText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
  },
  toggleTextActive: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
  },
  editorActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
  },
  saveButtonWrap: {
    flex: 1,
  },
  saveButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.76,
  },
  saveButtonText: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
  },
  searchBar: {
    minHeight: 58,
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
  sectionHeader: {
    marginTop: 2,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
  },
  showAllText: {
    color: colors.primaryLight,
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
  },
  allCounterText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
  },
  grid: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 12,
  },
  loadingState: {
    width: '100%',
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
  card: {
    borderRadius: 24,
    backgroundColor: 'rgba(21, 20, 28, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingTop: 26,
    paddingHorizontal: 10,
  },
  cardBodyPressed: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  cardActions: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionButtonEdit: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  actionButtonDelete: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  actionButtonPressed: {
    opacity: 0.78,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 4,
    minHeight: 40,
  },
  cardCount: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    textAlign: 'center',
  },
  emptyState: {
    width: '100%',
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
