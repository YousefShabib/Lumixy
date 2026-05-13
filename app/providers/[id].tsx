import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image as NativeImage,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { useAdminSession } from '@/contexts/admin-session-context';
import { useAdminProvidersQuery } from '@/hooks/admin/use-admin-providers';
import { resolveApiAssetUrl } from '@/services/api';
import type {
  AdminProviderApplication,
  AdminProviderGalleryItem,
  AdminProviderRecord,
} from '@/services/admin-api';
import {
  fetchPublicProviderDetails,
  formatWorkingDay,
  type PublicProviderDetails,
  type PublicWorkingHour,
} from '@/services/public-directory';
import { colors } from '@/theme';

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

function resolveAdminGalleryUrl(item: AdminProviderGalleryItem | string | null | undefined) {
  if (!item) {
    return null;
  }

  if (typeof item === 'string') {
    return resolveApiAssetUrl(item);
  }

  return resolveApiAssetUrl(
    item.image_url ?? item.image_path ?? item.path ?? item.url ?? item.secure_url ?? item.image
  );
}

function mapAdminProviderToPublicDetails(record: AdminProviderRecord): PublicProviderDetails {
  const latestApplication = getLatestApplication(record.applications);
  const workingHours: PublicWorkingHour[] = (record.working_hours ?? []).map((item, index) => ({
    id: item.id ?? `${record.id}-working-hour-${index}`,
    dayOfWeek: item.day_of_week ?? '',
    startTime: item.start_time ?? '--:--',
    endTime: item.end_time ?? '--:--',
    isActive: item.is_active ?? true,
  }));
  const galleryImages = [
    ...(record.gallery ?? []),
    ...(record.gallery_images ?? []),
    ...(record.works ?? []),
  ]
    .map((item) => resolveAdminGalleryUrl(item))
    .filter((item): item is string => Boolean(item));
  const imageUrl =
    resolveApiAssetUrl(record.profile_image_url ?? record.image_url ?? record.profile_image) ??
    galleryImages[0] ??
    null;

  return {
    id: record.id,
    name: record.provider_name?.trim() || record.user?.full_name?.trim() || 'مزود بدون اسم',
    bio: record.bio?.trim() || latestApplication?.notes?.trim() || '',
    city: record.city?.trim() || '',
    locationText: record.location_text?.trim() || record.city?.trim() || '',
    categoryId: record.category?.id ?? null,
    categoryName: record.category?.name?.trim() || '',
    categoryIcon: 'storefront-outline',
    imageUrl,
    galleryImages,
    customServices: (record.custom_services ?? []).filter(Boolean),
    whatsappNumber: record.whatsapp_number ?? record.user?.phone ?? null,
    instagramUsername: record.instagram_username ?? null,
    facebookUrl: record.facebook_url ?? null,
    isFeatured: false,
    workingHours,
  };
}

export default function ProviderDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const providerId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { isAuthenticated: isAdminAuthenticated } = useAdminSession();
  const providerQuery = useQuery<PublicProviderDetails>({
    queryKey: ['public-provider-details', providerId],
    queryFn: ({ signal }) => fetchPublicProviderDetails(providerId as string, signal),
    enabled: Boolean(providerId),
  });
  const adminProvidersQuery = useAdminProvidersQuery();
  const adminFallbackProvider = useMemo(() => {
    if (!isAdminAuthenticated || !providerId || !adminProvidersQuery.data) {
      return null;
    }

    const matchedProvider = adminProvidersQuery.data.find((item) => item.id === providerId);
    return matchedProvider ? mapAdminProviderToPublicDetails(matchedProvider) : null;
  }, [adminProvidersQuery.data, isAdminAuthenticated, providerId]);

  const provider = providerQuery.data ?? adminFallbackProvider;
  const displayedWorks = useMemo(() => provider?.galleryImages ?? [], [provider?.galleryImages]);
  const avatarCandidates = useMemo(() => {
    const uniqueCandidates = new Set<string>();

    for (const candidate of [provider?.imageUrl, displayedWorks[0]]) {
      if (candidate) {
        uniqueCandidates.add(candidate);
      }
    }

    return Array.from(uniqueCandidates);
  }, [displayedWorks, provider?.imageUrl]);
  const [activeAvatarIndex, setActiveAvatarIndex] = useState(0);
  const [failedWorkItems, setFailedWorkItems] = useState<Record<string, boolean>>({});
  const activeWorkingHours = provider?.workingHours.filter((item) => item.isActive) ?? [];
  const workingDaysText =
    activeWorkingHours.length > 0
      ? activeWorkingHours.map((item) => formatWorkingDay(item.dayOfWeek)).join(' - ')
      : 'لم يتم تحديد الأيام بعد';
  const workingHoursText =
    activeWorkingHours.length > 0
      ? `ساعات العمل: من ${activeWorkingHours[0]?.startTime ?? '--:--'} - ${
          activeWorkingHours[activeWorkingHours.length - 1]?.endTime ?? '--:--'
        }`
      : 'ساعات العمل: غير محددة';

  const activeAvatarUri = avatarCandidates[activeAvatarIndex] ?? null;

  useEffect(() => {
    setActiveAvatarIndex(0);
  }, [provider?.id, provider?.imageUrl]);

  useEffect(() => {
    setFailedWorkItems({});
  }, [provider?.id, displayedWorks.length]);

  const openExternalLink = async (url: string, unsupportedMessage: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return;
      }

      Alert.alert('تعذر فتح الرابط', unsupportedMessage);
    } catch (error) {
      Alert.alert(
        'تعذر فتح الرابط',
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : 'حدث خطأ غير متوقع.'
      );
    }
  };

  const handleCall = () => {
    if (!provider?.whatsappNumber) {
      Alert.alert('تنبيه', 'لا يوجد رقم محفوظ للتواصل.');
      return;
    }

    void openExternalLink(`tel:${provider.whatsappNumber}`, 'هذا الرابط غير مدعوم على جهازك.');
  };

  const handleWhatsApp = () => {
    if (!provider?.whatsappNumber) {
      Alert.alert('تنبيه', 'لا يوجد رقم واتساب محفوظ في الملف.');
      return;
    }

    const cleanNumber = provider.whatsappNumber.replace(/\D/g, '');
    void openExternalLink(`https://wa.me/${cleanNumber}`, 'هذا الرابط غير مدعوم على جهازك.');
  };

  const handleInstagram = () => {
    if (!provider?.instagramUsername) {
      Alert.alert('تنبيه', 'لا يوجد حساب إنستغرام محفوظ.');
      return;
    }

    const username = provider.instagramUsername.replace(/^@/, '');
    void openExternalLink(`https://instagram.com/${username}`, 'هذا الرابط غير مدعوم على جهازك.');
  };

  const handleFacebook = () => {
    if (!provider?.facebookUrl) {
      Alert.alert('تنبيه', 'لا يوجد رابط فيسبوك محفوظ.');
      return;
    }

    void openExternalLink(provider.facebookUrl, 'هذا الرابط غير مدعوم على جهازك.');
  };

  if (providerQuery.isLoading && (!isAdminAuthenticated || adminProvidersQuery.isLoading)) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primaryLight} />
        <Text className="mt-4 font-cairo text-[14px] text-text">جارٍ تحميل الملف...</Text>
      </SafeAreaView>
    );
  }

  if (!provider) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-3 text-center font-cairo-bold text-[18px] text-text">
          تعذر تحميل الملف
        </Text>
        <Text className="mb-5 text-center font-cairo text-[14px] leading-6 text-text">
          {providerQuery.error instanceof Error ? providerQuery.error.message : 'حدث خطأ غير متوقع.'}
        </Text>
        <TouchableOpacity
          className="rounded-[14px] bg-primary px-5 py-3"
          onPress={() => {
            void providerQuery.refetch();
            void adminProvidersQuery.refetch();
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
        contentContainerClassName="px-[14px] pt-[6px] pb-32"
        showsVerticalScrollIndicator={false}>
        <View className="relative mb-[22px] min-h-10 items-center justify-center">
          <Text className="font-cairo-bold text-[15px] tracking-[0.9px] text-text">LUMIXY</Text>

          <Pressable
            className="absolute right-0 h-8 w-8 items-center justify-center rounded-full border border-border bg-[#23122E]"
            onPress={() => router.back()}>
            <Ionicons name="arrow-forward" size={18} color={colors.text} />
          </Pressable>
        </View>

        <View className="mb-5 items-center">
          <View className="relative mb-[14px] h-[116px] w-[116px] items-center justify-center rounded-full">
            <View
              className="h-[108px] w-[108px] items-center justify-center rounded-full border-[2.5px] border-primary bg-[#120715]"
              style={{
                shadowColor: colors.primaryLight,
                shadowOpacity: 0.35,
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 14,
                elevation: 9,
              }}>
              {activeAvatarUri ? (
                <NativeImage
                  source={{ uri: activeAvatarUri }}
                  className="h-[92px] w-[92px] rounded-full"
                  resizeMode="cover"
                  onError={() => {
                    setActiveAvatarIndex((currentIndex) => currentIndex + 1);
                  }}
                />
              ) : (
                <View className="h-[92px] w-[92px] items-center justify-center rounded-full bg-[#2B1937]">
                  <Ionicons name="person-outline" size={32} color={colors.text} />
                </View>
              )}
            </View>
            <View className="absolute bottom-4 right-[10px] h-[14px] w-[14px] rounded-full border-2 border-background bg-[#22C55E]" />
          </View>

          <Text className="mb-2 text-center font-cairo-bold text-[24px] leading-[34px] text-text">
            {provider.name}
          </Text>

          <View className="mb-3 flex-row-reverse items-center gap-1">
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text className="font-cairo text-[12px] text-text">
              {provider.locationText || 'لم يتم تحديد الموقع بعد'}
            </Text>
          </View>

          <View className="mb-3 flex-row gap-2.5">
            <TouchableOpacity
              className="h-8 w-8 items-center justify-center rounded-full border border-border bg-[#1A0E24]"
              onPress={handleInstagram}
              activeOpacity={0.85}>
              <Ionicons name="logo-instagram" size={16} color="#E879F9" />
            </TouchableOpacity>

            <TouchableOpacity
              className="h-8 w-8 items-center justify-center rounded-full border border-border bg-[#1A0E24]"
              onPress={handleFacebook}
              activeOpacity={0.85}>
              <Ionicons name="logo-facebook" size={16} color="#60A5FA" />
            </TouchableOpacity>
          </View>

          <View className="flex-row-reverse items-center gap-1.5 rounded-full border border-border bg-[#1A0E24] px-3 py-2">
            <Ionicons name="time-outline" size={14} color={colors.accent} />
            <View className="items-end">
              <Text className="font-cairo text-[12px] text-text">{workingHoursText}</Text>
              <Text className="font-cairo text-[11px] text-textSecondary">الأيام: {workingDaysText}</Text>
            </View>
          </View>

          {provider.categoryName ? (
            <View className="mt-3 self-stretch flex-row-reverse items-center justify-between rounded-[20px] border border-border bg-[#1A0E24] px-5 py-4">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-[#2B1937]">
                <Ionicons name="pricetag-outline" size={22} color={colors.accent} />
              </View>

              <View className="flex-1 items-end pr-3">
                <Text className="mb-1 font-cairo text-[12px] text-text">التصنيف</Text>
                <Text className="font-cairo-bold text-[18px] text-text">{provider.categoryName}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View className="mb-[14px] rounded-[16px] border border-border bg-[#1A0E24] p-4">
          <View className="mb-3 flex-row-reverse items-center gap-1.5">
            <Ionicons name="person-outline" size={15} color={colors.accent} />
            <Text className="font-cairo-bold text-[17px] text-text">عن المزود</Text>
          </View>

          <Text className="text-right font-cairo text-[13px] leading-6 text-text">
            {provider.bio || 'لم تتم إضافة نبذة بعد.'}
          </Text>
        </View>

        <View className="mb-[14px] rounded-[16px] border border-border bg-[#1A0E24] p-4">
          <View className="mb-3 flex-row-reverse items-center gap-1.5">
            <Ionicons name="flash-outline" size={15} color={colors.accent} />
            <Text className="font-cairo-bold text-[17px] text-text">الخدمات</Text>
          </View>

          <View className="flex-row-reverse flex-wrap gap-2">
            {provider.customServices.length > 0 ? (
              provider.customServices.map((item) => (
                <View key={item} className="rounded-full border border-border bg-[#2B1937] px-3 py-2">
                  <Text className="font-cairo text-[12px] text-text">{item}</Text>
                </View>
              ))
            ) : (
              <Text className="font-cairo text-[13px] text-text">لا توجد خدمات مضافة بعد.</Text>
            )}
          </View>
        </View>

        <View className="mb-[14px] rounded-[16px] border border-border bg-[#1A0E24] p-4">
          <View className="mb-3 flex-row-reverse items-center gap-1.5">
            <Ionicons name="images-outline" size={15} color={colors.accent} />
            <Text className="font-cairo-bold text-[17px] text-text">الأعمال السابقة</Text>
          </View>

          {displayedWorks.length > 0 ? (
            <View className="mb-3 flex-row-reverse flex-wrap gap-2.5">
              {displayedWorks.map((item, index) => (
                <View
                  key={`${item}-${index}`}
                  className="h-[122px] w-[48%] overflow-hidden rounded-[14px] border border-border bg-[#251531]">
                  {failedWorkItems[`${item}-${index}`] ? (
                    <View className="h-full w-full items-center justify-center bg-[#2B1937]">
                      <Ionicons name="image-outline" size={26} color={colors.textSecondary} />
                    </View>
                  ) : (
                    <NativeImage
                      source={{ uri: item }}
                      className="h-full w-full"
                      resizeMode="cover"
                      onError={() => {
                        setFailedWorkItems((currentState) => ({
                          ...currentState,
                          [`${item}-${index}`]: true,
                        }));
                      }}
                    />
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-right font-cairo text-[13px] text-text">
              لم تتم إضافة صور للأعمال بعد.
            </Text>
          )}
        </View>
      </ScrollView>

      <SafeAreaView className="absolute bottom-[10px] left-3 right-3 bg-transparent" edges={['bottom']}>
        <View className="flex-row gap-2.5">
          <TouchableOpacity
            className="flex-1 flex-row-reverse items-center justify-center gap-2 rounded-[12px] bg-primary py-[14px]"
            onPress={handleCall}
            activeOpacity={0.85}>
            <Ionicons name="call-outline" size={18} color={colors.text} />
            <Text className="font-cairo-bold text-[15px] text-text">اتصال</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row-reverse items-center justify-center gap-2 rounded-[12px] bg-[#38E06B] py-[14px]"
            onPress={handleWhatsApp}
            activeOpacity={0.85}>
            <Ionicons name="logo-whatsapp" size={18} color={colors.text} />
            <Text className="font-cairo-bold text-[15px] text-text">واتساب</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}
