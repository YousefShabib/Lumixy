import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';

import StatusBanner from '@/components/ui/status-banner';
import { useAdminSession } from '@/contexts/admin-session-context';
import {
  filterAdminCategories,
  useAdminCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '@/hooks/admin/use-admin-categories';
import { usePersistedState } from '@/hooks/use-persisted-state';
import type { AdminCategoryRecord } from '@/services/admin-api';
import { ApiError, getReadableError } from '@/services/api';

type EditorFormValues = {
  is_active: boolean;
  name: string;
  sort_order: string;
};

type AdminCategoriesScreenProps = {
  mode: 'all' | 'preview';
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
      color: '#8B5CF6',
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
    color: '#A78BFA',
    icon: 'layers-outline' as const,
  };
}

export default function AdminCategoriesScreen({ mode }: AdminCategoriesScreenProps) {
  const { width } = useWindowDimensions();
  const { logout } = useAdminSession();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [query, setQuery] = usePersistedState(`admin:${mode}:categories:query`, '');
  const [editorId, setEditorId] = useState<string | null>(null);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [editorOffsetY, setEditorOffsetY] = useState(0);
  const [shouldRevealEditor, setShouldRevealEditor] = useState(false);
  const categoriesQuery = useAdminCategoriesQuery();
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<EditorFormValues>({
    defaultValues: {
      is_active: true,
      name: '',
      sort_order: '0',
    },
  });

  const isPreviewMode = mode === 'preview';
  const horizontalPadding = 20;
  const gridGap = 12;
  const cardSize = Math.floor(
    Math.min((width - horizontalPadding * 2 - gridGap) / 2, isPreviewMode ? 183 : 195)
  );

  const filteredCategories = useMemo(
    () => filterAdminCategories(categoriesQuery.data ?? [], query),
    [categoriesQuery.data, query]
  );
  const visibleCategories = useMemo(() => {
    if (!isPreviewMode || query.trim().length > 0) {
      return filteredCategories;
    }

    return filteredCategories.slice(0, 4);
  }, [filteredCategories, isPreviewMode, query]);

  const activeMutationError =
    createCategoryMutation.error ??
    updateCategoryMutation.error ??
    deleteCategoryMutation.error ??
    categoriesQuery.error ??
    null;

  useEffect(() => {
    if (!(activeMutationError instanceof ApiError)) {
      return;
    }

    if (activeMutationError.status !== 401 && activeMutationError.status !== 403) {
      return;
    }

    void (async () => {
      await logout();
      router.replace('/auth/login');
    })();
  }, [activeMutationError, logout]);

  useEffect(() => {
    if (!isEditorVisible || !shouldRevealEditor || editorOffsetY <= 0) {
      return;
    }

    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        animated: true,
        y: Math.max(editorOffsetY - 18, 0),
      });
      setShouldRevealEditor(false);
    });
  }, [editorOffsetY, isEditorVisible, shouldRevealEditor]);

  const openCreateEditor = () => {
    setEditorId(null);
    reset({
      is_active: true,
      name: '',
      sort_order: '0',
    });
    setIsEditorVisible(true);
    setShouldRevealEditor(true);
  };

  const openEditEditor = (category: AdminCategoryRecord) => {
    setEditorId(category.id);
    reset({
      is_active: category.is_active,
      name: category.name,
      sort_order: String(category.sort_order ?? 0),
    });
    setIsEditorVisible(true);
    setShouldRevealEditor(true);
  };

  const closeEditor = () => {
    setEditorId(null);
    setIsEditorVisible(false);
    reset({
      is_active: true,
      name: '',
      sort_order: '0',
    });
  };

  const saveCategory = handleSubmit(async (values) => {
    const payload = {
      is_active: values.is_active,
      name: values.name.trim(),
      sort_order: Number(values.sort_order || 0),
    };

    try {
      if (editorId) {
        await updateCategoryMutation.mutateAsync({ categoryId: editorId, payload });
        Alert.alert('تم التحديث', `تم تحديث قطاع ${payload.name} بنجاح.`);
      } else {
        await createCategoryMutation.mutateAsync(payload);
        Alert.alert('تمت الإضافة', `تمت إضافة قطاع ${payload.name} بنجاح.`);
      }

      closeEditor();
    } catch (error) {
      Alert.alert('تعذر الحفظ', getReadableError(error));
    }
  });

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    Alert.alert('حذف القطاع', `هل تريد حذف قطاع ${categoryName} نهائياً؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteCategoryMutation.mutateAsync(categoryId);
              Alert.alert('تم الحذف', `تم حذف قطاع ${categoryName} بنجاح.`);
            } catch (error) {
              Alert.alert('تعذر الحذف', getReadableError(error));
            }
          })();
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-admin-background" edges={['top']}>
      <StatusBar style="light" />

      <View className="flex-1 bg-admin-background">
        <LinearGradient
          colors={['rgba(167, 139, 250, 0.20)', 'rgba(167, 139, 250, 0.00)']}
          end={{ x: 0, y: 1 }}
          start={{ x: 1, y: 0 }}
          style={{
            borderRadius: 999,
            height: 220,
            position: 'absolute',
            right: -38,
            top: -18,
            width: 220,
          }}
        />
        <LinearGradient
          colors={['rgba(109, 40, 217, 0.22)', 'rgba(109, 40, 217, 0.00)']}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 1 }}
          style={{
            borderRadius: 999,
            bottom: 120,
            height: 260,
            left: -60,
            position: 'absolute',
            width: 260,
          }}
        />

        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerClassName={`gap-3.5 px-5 pt-3 ${isPreviewMode ? 'pb-6' : 'pb-8'}`}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {isPreviewMode ? (
            <View className="items-center pt-2">
              <Text className="text-center font-cairo-bold text-[29px] leading-[40px] text-admin-text">
                إدارة القطاعات والخدمات
              </Text>
              <Text className="mt-2 text-center font-cairo text-[15px] leading-6 text-admin-muted">
                إضافة وإدارة قطاعات الخدمات للمزودين في المنصة
              </Text>
            </View>
          ) : (
            <View className="flex-row-reverse items-center">
              <Pressable
                className="h-[42px] w-[42px] items-center justify-center rounded-full border border-white/10 bg-white/5"
                onPress={() => router.replace('/admin/tabs')}>
                <Ionicons color="#FFFFFF" name="arrow-forward" size={20} />
              </Pressable>

              <View className="flex-1 px-3">
                <Text className="text-center font-cairo-bold text-[24px] text-admin-text">
                  عرض كل القطاعات
                </Text>
                <Text className="mt-1 text-center font-cairo text-[12px] text-admin-muted">
                  كل قطاعات الخدمات الموجودة في المنصة
                </Text>
              </View>

              <View className="h-[42px] w-[42px]" />
            </View>
          )}

          {activeMutationError ? (
            <StatusBanner
              actionLabel="إعادة المحاولة"
              message={getReadableError(activeMutationError)}
              onAction={() => {
                void categoriesQuery.refetch();
              }}
              tone="error"
            />
          ) : null}

          {isPreviewMode ? (
            <Pressable className="overflow-hidden rounded-[32px] shadow-glow" onPress={openCreateEditor}>
              <LinearGradient
                colors={['#8B5CF6', '#6D28D9']}
                end={{ x: 1, y: 1 }}
                start={{ x: 0, y: 0 }}
                style={{
                  alignItems: 'center',
                  borderRadius: 32,
                  justifyContent: 'center',
                  minHeight: 104,
                  paddingHorizontal: 80,
                  position: 'relative',
                }}>
                <Text className="text-center font-cairo-bold text-[20px] text-admin-text">
                  إضافة قطاع جديد
                </Text>
                <Text className="mt-1 text-center font-cairo text-[13px] text-white/85">
                  إنشاء فئة خدمات جديدة للمزودين
                </Text>

                <View className="absolute right-[18px] top-1/2 -mt-5 h-10 w-10 items-center justify-center rounded-full bg-white/15">
                  <Ionicons color="#FFFFFF" name="add" size={28} />
                </View>
              </LinearGradient>
            </Pressable>
          ) : null}

          {isEditorVisible ? (
            <View
              className="gap-3.5 rounded-[28px] border border-white/10 bg-admin-panel p-4.5"
              onLayout={(event) => setEditorOffsetY(event.nativeEvent.layout.y)}>
              <Text className="text-right font-cairo-bold text-[18px] text-admin-text">
                {editorId ? 'تعديل بيانات القطاع' : 'إضافة قطاع جديد'}
              </Text>

              <View className="gap-2">
                <Text className="text-right font-cairo-bold text-[14px] text-admin-text">
                  اسم القطاع
                </Text>
                <Controller
                  control={control}
                  name="name"
                  rules={{ required: 'اسم القطاع مطلوب قبل الحفظ.' }}
                  render={({ field }) => (
                    <TextInput
                      className="min-h-[54px] rounded-[18px] border border-white/10 bg-white/5 px-4 text-right font-cairo text-[15px] text-admin-text"
                      onBlur={field.onBlur}
                      onChangeText={field.onChange}
                      placeholder="مثال: قاعات"
                      placeholderTextColor="#6B7280"
                      value={field.value}
                    />
                  )}
                />
                {errors.name ? <StatusBanner message={errors.name.message ?? ''} tone="warning" /> : null}
              </View>

              <View className="gap-2">
                <Text className="text-right font-cairo-bold text-[14px] text-admin-text">
                  ترتيب الظهور
                </Text>
                <Controller
                  control={control}
                  name="sort_order"
                  render={({ field }) => (
                    <TextInput
                      className="min-h-[54px] rounded-[18px] border border-white/10 bg-white/5 px-4 text-right font-cairo text-[15px] text-admin-text"
                      keyboardType="numeric"
                      onBlur={field.onBlur}
                      onChangeText={(value) => field.onChange(value.replace(/[^0-9]/g, ''))}
                      placeholder="0"
                      placeholderTextColor="#6B7280"
                      value={field.value}
                    />
                  )}
                />
              </View>

              <View className="flex-row gap-2.5">
                <Pressable
                  className={`flex-1 items-center justify-center rounded-full border px-4 py-3 ${
                    !watch('is_active')
                      ? 'border-admin-danger/20 bg-admin-danger/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                  onPress={() => setValue('is_active', false)}>
                  <Text
                    className={`font-cairo-bold text-[13px] ${
                      !watch('is_active') ? 'text-admin-text' : 'text-admin-muted'
                    }`}>
                    غير مفعل
                  </Text>
                </Pressable>

                <Pressable
                  className={`flex-1 items-center justify-center rounded-full border px-4 py-3 ${
                    watch('is_active')
                      ? 'border-admin-success/20 bg-admin-success/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                  onPress={() => setValue('is_active', true)}>
                  <Text
                    className={`font-cairo-bold text-[13px] ${
                      watch('is_active') ? 'text-admin-text' : 'text-admin-muted'
                    }`}>
                    مفعل
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row gap-2.5">
                <Pressable
                  className="flex-1 items-center justify-center rounded-[18px] border border-white/10 bg-white/5 px-4 py-3.5"
                  onPress={closeEditor}>
                  <Text className="font-cairo-bold text-[14px] text-admin-muted">إلغاء</Text>
                </Pressable>

                <Pressable
                  className="flex-1"
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  onPress={() => void saveCategory()}>
                  <LinearGradient
                    colors={['#8B5CF6', '#6D28D9']}
                    end={{ x: 1, y: 1 }}
                    start={{ x: 0, y: 0 }}
                    style={{
                      alignItems: 'center',
                      borderRadius: 18,
                      justifyContent: 'center',
                      minHeight: 54,
                      opacity:
                        createCategoryMutation.isPending || updateCategoryMutation.isPending ? 0.76 : 1,
                    }}>
                    {createCategoryMutation.isPending || updateCategoryMutation.isPending ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text className="font-cairo-bold text-[15px] text-admin-text">
                        {editorId ? 'تحديث القطاع' : 'حفظ القطاع'}
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          ) : null}

          <View className="min-h-[58px] flex-row items-center gap-3 rounded-full border border-white/5 bg-white/5 px-4.5">
            <TextInput
              className="flex-1 text-right font-cairo text-[15px] text-admin-text"
              onChangeText={setQuery}
              placeholder="البحث عن قطاع أو خدمة معينة..."
              placeholderTextColor="#6B7280"
              value={query}
            />
            <Feather color="#6B7280" name="search" size={20} />
          </View>

          <View className="flex-row items-center justify-between">
            {isPreviewMode ? (
              <Pressable onPress={() => router.push('/admin/all-categories')}>
                <Text className="font-cairo-bold text-[15px] text-admin-primaryLight">عرض الكل</Text>
              </Pressable>
            ) : (
              <Text className="font-cairo text-[13px] text-admin-subtle">
                {filteredCategories.length} قطاع
              </Text>
            )}
            <Text className="font-cairo-bold text-[24px] text-admin-text">
              {isPreviewMode ? 'القطاعات الحالية' : 'كل القطاعات'}
            </Text>
          </View>

          <View
            className="w-full self-center"
            style={
              !categoriesQuery.isLoading && visibleCategories.length > 0
                ? { maxWidth: cardSize * 2 + gridGap }
                : undefined
            }>
            {categoriesQuery.isLoading ? (
              <View className="items-center justify-center gap-3 rounded-[24px] border border-white/10 bg-white/3 px-4.5 py-10">
                <ActivityIndicator color="#8B5CF6" size="large" />
                <Text className="text-center font-cairo text-[14px] text-admin-muted">
                  جار تحميل القطاعات...
                </Text>
              </View>
            ) : visibleCategories.length === 0 ? (
              <View className="items-center justify-center gap-2 rounded-[24px] border border-white/10 bg-white/3 px-4.5 py-10">
                <Ionicons color="#6B7280" name="search-outline" size={28} />
                <Text className="font-cairo-bold text-[18px] text-admin-text">
                  لا توجد قطاعات مطابقة
                </Text>
                <Text className="text-center font-cairo text-[14px] leading-6 text-admin-muted">
                  غيّر البحث أو أضف قطاعاً جديداً ليظهر هنا مباشرة من قاعدة البيانات.
                </Text>
              </View>
            ) : (
              <View className="flex-row-reverse flex-wrap justify-center gap-3">
                {visibleCategories.map((category) => {
                  const visual = resolveCategoryVisual(category.name);
                  const activeCount =
                    category.approved_providers_count || category.provider_profiles_count;
                  const isDeleting =
                    deleteCategoryMutation.isPending && deleteCategoryMutation.variables === category.id;

                  return (
                    <View
                      key={category.id}
                      className="rounded-[24px] border border-white/10 bg-[#15141C]/95 p-3"
                      style={{ height: cardSize, width: cardSize }}>
                      <View className="absolute inset-x-3 top-3 z-10 flex-row justify-between">
                        <Pressable
                          className="h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5"
                          hitSlop={10}
                          onPress={() => openEditEditor(category)}>
                          <Feather color="rgba(255,255,255,0.76)" name="edit-2" size={13} />
                        </Pressable>
                        <Pressable
                          className="h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5"
                          disabled={isDeleting}
                          hitSlop={10}
                          onPress={() => handleDeleteCategory(category.id, category.name)}>
                          {isDeleting ? (
                            <ActivityIndicator color="#EF4444" size="small" />
                          ) : (
                            <Feather color="rgba(255,255,255,0.62)" name="trash-2" size={13} />
                          )}
                        </Pressable>
                      </View>

                      <Pressable
                        className="flex-1 items-center justify-center rounded-[18px] px-2.5 pt-6"
                        onPress={() =>
                          router.push({
                            params: {
                              categoryId: category.id,
                              categoryName: category.name,
                            },
                            pathname: '/admin/category-providers',
                          })
                        }>
                        <View
                          style={{
                            alignItems: 'center',
                            backgroundColor: `${visual.color}1F`,
                            borderColor: `${visual.color}40`,
                            borderRadius: 999,
                            borderWidth: 1,
                            height: 56,
                            justifyContent: 'center',
                            marginBottom: 14,
                            width: 56,
                          }}>
                          <Ionicons color={visual.color} name={visual.icon} size={26} />
                        </View>

                        <View className="min-h-[40px] justify-center">
                          <Text className="text-center font-cairo-bold text-[15px] leading-6 text-admin-text">
                            {category.name}
                          </Text>
                        </View>
                        <Text className="mt-1.5 text-center font-cairo text-[11px] leading-5 text-admin-muted">
                          {category.is_active ? `${activeCount} مزود نشط` : 'قطاع غير مفعل'}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
