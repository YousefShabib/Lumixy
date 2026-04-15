import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  extractErrorMessage,
  fetchProviderCategories,
  fetchProviderProfile,
  fetchProviderStatus,
  providerCategoriesQueryKey,
  providerProfileQueryKey,
  providerStatusQueryKey,
  saveProviderProfile,
  type ProviderGalleryImage,
} from '@/services/provider-api';
import {
  getProviderSession,
  loadProviderSession,
  providerSessionQueryKey,
} from '@/services/provider-session';
import { colors } from '@/theme';

type EditProfileFormValues = {
  providerName: string;
  city: string;
  locationDetails: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  fromTime: string;
  toTime: string;
  about: string;
};

const inputClassName =
  'rounded-[14px] border border-border bg-surface px-[14px] py-[14px] text-right font-cairo text-[14px] text-text';
const stackedInputClassName = `${inputClassName} mb-[14px]`;
const textAreaClassName = `${stackedInputClassName} min-h-[120px]`;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export default function EditProfileScreen() {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: providerSessionQueryKey,
    queryFn: loadProviderSession,
    initialData: getProviderSession() ?? undefined,
    staleTime: Number.POSITIVE_INFINITY,
  });
  const session = sessionQuery.data ?? null;

  const profileQuery = useQuery({
    queryKey: providerProfileQueryKey,
    queryFn: fetchProviderProfile,
    enabled: Boolean(session?.token),
  });

  const categoriesQuery = useQuery({
    queryKey: providerCategoriesQueryKey,
    queryFn: fetchProviderCategories,
    enabled: Boolean(session?.token),
  });

  const statusQuery = useQuery({
    queryKey: providerStatusQueryKey,
    queryFn: fetchProviderStatus,
    enabled: Boolean(session?.token),
  });

  const [avatarUri, setAvatarUri] = useState('');
  const [originalAvatarUri, setOriginalAvatarUri] = useState('');
  const [works, setWorks] = useState<ProviderGalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [services, setServices] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState('');
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);

  const { control, handleSubmit, reset } = useForm<EditProfileFormValues>({
    defaultValues: {
      providerName: '',
      city: '',
      locationDetails: '',
      whatsapp: '',
      facebook: '',
      instagram: '',
      fromTime: '09:00',
      toTime: '18:00',
      about: '',
    },
  });

  useEffect(() => {
    if (!sessionQuery.isLoading && !session) {
      router.replace('/auth/login');
    }
  }, [session, sessionQuery.isLoading]);

  useEffect(() => {
    if (statusQuery.data?.applicationStatus === 'pending') {
      router.replace('/provider/waiting-approval');
    }
  }, [statusQuery.data?.applicationStatus]);

  useEffect(() => {
    const providerProfile = profileQuery.data;

    if (!providerProfile) {
      return;
    }

    reset({
      providerName: providerProfile.name,
      city: providerProfile.city,
      locationDetails: providerProfile.locationText,
      whatsapp: providerProfile.whatsapp,
      facebook: providerProfile.facebook,
      instagram: providerProfile.instagram,
      fromTime: providerProfile.workTime,
      toTime: providerProfile.workTimeEnd,
      about: providerProfile.about,
    });

    setAvatarUri(providerProfile.avatar);
    setOriginalAvatarUri(providerProfile.avatar);
    setWorks(providerProfile.gallery);
    setSelectedCategory(providerProfile.categoryId);
    setServices(providerProfile.services);
  }, [profileQuery.data, reset]);

  const selectedCategoryLabel = useMemo(() => {
    return categoriesQuery.data?.find((item) => item.id === selectedCategory)?.label ?? '';
  }, [categoriesQuery.data, selectedCategory]);

  const saveProfileMutation = useMutation({
    mutationFn: async (formData: EditProfileFormValues) => {
      const providerProfile = profileQuery.data;
      const providerStatus = statusQuery.data;

      if (!providerProfile || !selectedCategory) {
        throw new Error('تعذر قراءة بيانات الملف الحالية.');
      }

      return saveProviderProfile({
        providerName: formData.providerName,
        categoryId: selectedCategory,
        city: formData.city,
        locationText: formData.locationDetails,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        facebook: formData.facebook,
        about: formData.about,
        startTime: formData.fromTime,
        endTime: formData.toTime,
        services,
        avatarUri,
        gallery: works,
        initialGallery: providerProfile.gallery,
        workingHours: providerProfile.workingHours,
        shouldSubmit:
          providerStatus?.applicationStatus !== 'approved' &&
          providerStatus?.applicationStatus !== 'pending',
      });
    },
    onSuccess: ({ profile, status, submittedForReview }) => {
      queryClient.setQueryData(providerProfileQueryKey, profile);
      queryClient.setQueryData(providerStatusQueryKey, status);

      if (submittedForReview || status.applicationStatus === 'pending') {
        Alert.alert('تم الحفظ', 'تم حفظ الملف، وهو الآن بانتظار موافقة الأدمن.');
        router.replace('/provider/waiting-approval');
        return;
      }

      Alert.alert('تم الحفظ', 'تم تحديث الملف بنجاح.');
      router.back();
    },
    onError: (error) => {
      Alert.alert('تعذر الحفظ', extractErrorMessage(error));
    },
  });

  const removeAvatar = () => {
    setAvatarUri(originalAvatarUri);
  };

  const pickAvatarFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('تنبيه', 'يجب السماح بالوصول إلى الصور أولًا.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const pickAvatarFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('تنبيه', 'يجب السماح بالوصول إلى الكاميرا أولًا.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const openAvatarActions = () => {
    Alert.alert('صورة الملف', 'اختر الإجراء المناسب', [
      {
        text: 'اختيار من المعرض',
        onPress: () => {
          void pickAvatarFromGallery();
        },
      },
      {
        text: 'التقاط صورة',
        onPress: () => {
          void pickAvatarFromCamera();
        },
      },
      {
        text: 'إلغاء التغيير',
        style: 'destructive',
        onPress: removeAvatar,
      },
      {
        text: 'إلغاء',
        style: 'cancel',
      },
    ]);
  };

  const addWorkPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('تنبيه', 'يجب السماح بالوصول إلى الصور أولًا.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setWorks((prev) => [...prev, { uri: result.assets[0].uri, isRemote: false }]);
    }
  };

  const removeWorkPhoto = (index: number) => {
    setWorks((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const removeService = (serviceName: string) => {
    setServices((prev) => prev.filter((item) => item !== serviceName));
  };

  const addCustomService = () => {
    const trimmedService = serviceInput.trim();

    if (!trimmedService) {
      return;
    }

    if (services.includes(trimmedService)) {
      Alert.alert('تنبيه', 'هذه الخدمة موجودة بالفعل.');
      return;
    }

    setServices((prev) => [...prev, trimmedService]);
    setServiceInput('');
  };

  const onSubmit = (data: EditProfileFormValues) => {
    if (!selectedCategory) {
      Alert.alert('تنبيه', 'اختر تصنيفًا واحدًا على الأقل.');
      return;
    }

    if (services.length === 0) {
      Alert.alert('تنبيه', 'أضف خدمة واحدة على الأقل.');
      return;
    }

    if (!timePattern.test(data.fromTime) || !timePattern.test(data.toTime)) {
      Alert.alert('تنبيه', 'أدخل الوقت بصيغة 24 ساعة مثل 09:00 أو 18:30.');
      return;
    }

    saveProfileMutation.mutate(data);
  };

  const renderInput = (
    name: keyof EditProfileFormValues,
    placeholder: string,
    options?: {
      keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'url';
      multiline?: boolean;
    }
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline={options?.multiline}
          keyboardType={options?.keyboardType}
          textAlignVertical={options?.multiline ? 'top' : 'center'}
          className={options?.multiline ? textAreaClassName : stackedInputClassName}
        />
      )}
    />
  );

  if (sessionQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primaryLight} />
        <Text className="mt-4 font-cairo text-[14px] text-text-secondary">جارٍ التحقق من الجلسة...</Text>
      </SafeAreaView>
    );
  }

  if (!session) {
    return null;
  }

  if (profileQuery.isLoading || categoriesQuery.isLoading || statusQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primaryLight} />
        <Text className="mt-4 font-cairo text-[14px] text-text-secondary">جارٍ تجهيز الملف...</Text>
      </SafeAreaView>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-3 text-center font-cairo-bold text-[18px] text-text">
          تعذر تحميل بيانات الملف
        </Text>
        <Text className="mb-5 text-center font-cairo text-[14px] leading-6 text-text-secondary">
          {extractErrorMessage(profileQuery.error)}
        </Text>
        <TouchableOpacity
          className="rounded-[14px] bg-primary px-5 py-3"
          onPress={() => {
            void profileQuery.refetch();
          }}
          activeOpacity={0.85}>
          <Text className="font-cairo-bold text-[14px] text-text">إعادة المحاولة</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="px-[18px] pt-[18px] pb-10"
        showsVerticalScrollIndicator={false}>
        <View className="mb-5 flex-row-reverse items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
            <View className="h-[34px] w-[34px] items-center justify-center rounded-full border border-border bg-surface">
              <Ionicons name="arrow-forward" size={18} color={colors.text} />
            </View>
          </TouchableOpacity>

          <Text className="font-cairo-bold text-[20px] text-text">تعديل الملف الشخصي</Text>
          <View className="w-[34px]" />
        </View>

        <View className="mb-5 items-center">
          <TouchableOpacity
            className="relative h-[110px] w-[110px] items-center justify-center rounded-full border-[3px] border-primary"
            style={{
              shadowColor: colors.primary,
              shadowOpacity: 0.35,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 14,
              elevation: 8,
            }}
            onPress={openAvatarActions}
            activeOpacity={0.9}>
            <Image source={{ uri: avatarUri }} className="h-[94px] w-[94px] rounded-full" />

            <View className="absolute bottom-2 right-1 h-[34px] w-[34px] items-center justify-center rounded-full bg-primary">
              <Ionicons name="camera-outline" size={16} color={colors.text} />
            </View>
          </TouchableOpacity>

          <Text className="mt-3 text-center font-cairo text-[12px] text-text-secondary">
            اضغط على الصورة لاختيار صورة جديدة أو إلغاء التغيير الحالي
          </Text>
        </View>

        <Text className="mb-2 text-right font-cairo-bold text-[14px] text-text">اسم المزود</Text>
        {renderInput('providerName', 'أدخل اسم المزود')}

        <Text className="mb-2 text-right font-cairo-bold text-[14px] text-text">المدينة</Text>
        {renderInput('city', 'مثال: رام الله')}

        <Text className="mb-2 text-right font-cairo-bold text-[14px] text-text">تفاصيل الموقع</Text>
        {renderInput('locationDetails', 'شارع، منطقة، أو وصف إضافي')}

        <Text className="mb-2 text-right font-cairo-bold text-[14px] text-text">رقم واتساب</Text>
        {renderInput('whatsapp', 'أدخل رقم واتساب للتواصل', { keyboardType: 'phone-pad' })}

        <Text className="mb-2 text-right font-cairo-bold text-[14px] text-text">فيسبوك</Text>
        {renderInput('facebook', 'رابط صفحة فيسبوك', { keyboardType: 'url' })}

        <Text className="mb-2 text-right font-cairo-bold text-[14px] text-text">إنستغرام</Text>
        {renderInput('instagram', 'اسم المستخدم أو الرابط')}

        <Text className="mb-2 text-right font-cairo-bold text-[14px] text-text">ساعات العمل</Text>
        <View className="mb-[14px] flex-row-reverse gap-3">
          <View className="flex-1">{renderInput('fromTime', '09:00')}</View>
          <View className="flex-1">{renderInput('toTime', '18:00')}</View>
        </View>

        <Text className="mb-2 text-right font-cairo-bold text-[14px] text-text">عن المزود</Text>
        {renderInput('about', 'اكتب نبذة قصيرة عن خبرتك', { multiline: true })}

        <Text className="mb-2 text-right font-cairo-bold text-[18px] text-text">التصنيف</Text>
        <Text className="mb-[10px] text-right font-cairo text-[13px] text-text-muted">
          الباك يدعم تصنيفًا واحدًا للمزود، لذلك اختر التصنيف الرئيسي الذي سيظهر في الملف
        </Text>

        <TouchableOpacity
          className="mb-3 flex-row-reverse items-center rounded-[24px] border border-white/10 bg-[#14121A] px-5 py-5"
          onPress={() => setIsCategorySelectorOpen((prev) => !prev)}
          activeOpacity={0.85}>
          <Text
            className={`flex-1 text-right font-cairo text-[18px] ${
              selectedCategoryLabel ? 'text-text' : 'text-text-muted'
            }`}>
            {selectedCategoryLabel || 'اختر التصنيف'}
          </Text>

          <Ionicons
            name={isCategorySelectorOpen ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {isCategorySelectorOpen ? (
          <View className="mb-[16px] overflow-hidden rounded-[24px] border border-white/10 bg-[#14121A] p-2">
            {(categoriesQuery.data ?? []).map((category) => {
              const isSelected = selectedCategory === category.id;

              return (
                <TouchableOpacity
                  key={category.id}
                  className={`mb-2 flex-row-reverse items-center justify-between rounded-[18px] px-4 py-4 ${
                    isSelected ? 'bg-primary/15' : 'bg-transparent'
                  }`}
                  activeOpacity={0.85}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    setIsCategorySelectorOpen(false);
                  }}>
                  <Text className="flex-1 text-right font-cairo-bold text-[15px] text-text">
                    {category.label}
                  </Text>

                  <View
                    className={`mr-3 h-6 w-6 items-center justify-center rounded-full border ${
                      isSelected ? 'border-primary bg-primary' : 'border-white/15 bg-transparent'
                    }`}>
                    <Ionicons
                      name={isSelected ? 'checkmark' : 'ellipse-outline'}
                      size={14}
                      color={colors.text}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        <Text className="mb-2 text-right font-cairo-bold text-[14px] text-text">الخدمات</Text>
        <Text className="mb-[10px] text-right font-cairo text-[13px] text-text-muted">
          أضف الخدمات يدويًا لأن الباك يخزنها كقائمة نصية مرتبطة بالمزود
        </Text>

        <View className="mb-[14px] flex-row-reverse gap-2.5">
          <TextInput
            value={serviceInput}
            onChangeText={setServiceInput}
            placeholder="أضف خدمة جديدة"
            placeholderTextColor={colors.textMuted}
            className="flex-1 rounded-[14px] border border-border bg-surface px-[14px] py-[14px] text-right font-cairo text-[14px] text-text"
            onSubmitEditing={addCustomService}
          />

          <TouchableOpacity
            className="min-w-[96px] flex-row-reverse items-center justify-center gap-1.5 rounded-[14px] bg-primary px-4 py-[14px]"
            onPress={addCustomService}
            activeOpacity={0.85}>
            <Ionicons name="add" size={18} color={colors.text} />
            <Text className="font-cairo-bold text-[14px] text-text">إضافة</Text>
          </TouchableOpacity>
        </View>

        {services.length === 0 ? (
          <Text className="mb-[14px] text-right font-cairo text-[13px] text-text-muted">
            أضف خدمة واحدة على الأقل
          </Text>
        ) : (
          <View className="mb-[14px] flex-row-reverse flex-wrap gap-2.5">
            {services.map((item) => (
              <TouchableOpacity
                key={item}
                className="flex-row-reverse items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2.5"
                activeOpacity={0.85}
                onPress={() => removeService(item)}>
                <Text className="font-cairo text-[13px] text-text">{item}</Text>
                <Ionicons name="close" size={14} color={colors.text} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text className="mb-2 text-right font-cairo-bold text-[14px] text-text">الأعمال السابقة</Text>
        <View className="mb-6 flex-row-reverse flex-wrap gap-3">
          {works.map((item, index) => (
            <View
              key={`${item.uri}-${index}`}
              className="relative h-[120px] w-[48%] overflow-hidden rounded-[16px] border border-border bg-surface-secondary">
              <Image source={{ uri: item.uri }} className="h-full w-full" />
              <TouchableOpacity
                className="absolute left-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-error"
                onPress={() => removeWorkPhoto(index)}
                activeOpacity={0.8}>
                <Ionicons name="trash-outline" size={14} color={colors.text} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            className="h-[120px] w-[48%] items-center justify-center gap-2 rounded-[16px] border border-dashed border-border bg-surface"
            onPress={addWorkPhoto}
            activeOpacity={0.85}>
            <Ionicons name="camera-outline" size={24} color={colors.primaryLight} />
            <Text className="font-cairo-bold text-[14px] text-primary-light">إضافة صورة</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row-reverse gap-3">
          <TouchableOpacity
            className="flex-1 items-center rounded-[14px] border border-border bg-surface py-4"
            onPress={() => router.back()}
            activeOpacity={0.85}>
            <Text className="font-cairo-bold text-[15px] text-text">إلغاء</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row-reverse items-center justify-center gap-2 rounded-[14px] bg-primary py-4"
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.85}
            disabled={saveProfileMutation.isPending}>
            <Ionicons name="save-outline" size={18} color={colors.text} />
            <Text className="font-cairo-bold text-[15px] text-text">
              {saveProfileMutation.isPending ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
