import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  extractErrorMessage,
  fetchProviderProfile,
  fetchProviderStatus,
  logoutProvider,
  providerProfileQueryKey,
  providerStatusQueryKey,
  type ProviderWorkingHour,
} from '@/services/provider-api';
import {
  getProviderSession,
  loadProviderSession,
  providerSessionQueryKey,
} from '@/services/provider-session';
import { colors } from '@/theme';

const arabicDayLabels: Record<ProviderWorkingHour['dayOfWeek'], string> = {
  saturday: 'السبت',
  sunday: 'الأحد',
  monday: 'الاثنين',
  tuesday: 'الثلاثاء',
  wednesday: 'الأربعاء',
  thursday: 'الخميس',
  friday: 'الجمعة',
};

export default function ProviderProfileScreen() {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
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

  const statusQuery = useQuery({
    queryKey: providerStatusQueryKey,
    queryFn: fetchProviderStatus,
    enabled: Boolean(session?.token),
  });

  useEffect(() => {
    if (!sessionQuery.isLoading && !session) {
      router.replace('/auth/login');
    }
  }, [session, sessionQuery.isLoading]);

  useEffect(() => {
    if (
      session?.user?.status?.trim().toLowerCase() === 'inactive' ||
      statusQuery.data?.applicationStatus === 'pending' ||
      statusQuery.data?.applicationStatus === 'rejected'
    ) {
      router.replace('/provider/waiting-approval');
    }
  }, [session?.user?.status, statusQuery.data?.applicationStatus]);

  const providerProfile = profileQuery.data;
  const displayedWorks = providerProfile?.works ?? [];
  const activeWorkingDays =
    providerProfile?.workingHours
      ?.filter((item) => item.isActive)
      .map((item) => arabicDayLabels[item.dayOfWeek]) ?? [];
  const workingDaysText =
    activeWorkingDays.length > 0 ? activeWorkingDays.join(' - ') : 'لم يتم تحديد الأيام بعد';

  const openExternalLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return;
      }

      Alert.alert('تعذر فتح الرابط', 'هذا الرابط غير مدعوم على جهازك.');
    } catch (error) {
      Alert.alert('تعذر فتح الرابط', extractErrorMessage(error));
    }
  };

  const handleCall = () => {
    if (!providerProfile?.phone) {
      Alert.alert('تنبيه', 'لا يوجد رقم هاتف محفوظ في الحساب.');
      return;
    }

    void openExternalLink(`tel:${providerProfile.phone}`);
  };

  const handleWhatsApp = () => {
    if (!providerProfile?.whatsapp) {
      Alert.alert('تنبيه', 'لا يوجد رقم واتساب محفوظ في الملف.');
      return;
    }

    const cleanNumber = providerProfile.whatsapp.replace(/\D/g, '');
    void openExternalLink(`https://wa.me/${cleanNumber}`);
  };

  const handleInstagram = () => {
    if (!providerProfile?.instagram) {
      Alert.alert('تنبيه', 'لا يوجد حساب إنستغرام محفوظ.');
      return;
    }

    const username = providerProfile.instagram.replace(/^@/, '');
    void openExternalLink(`https://instagram.com/${username}`);
  };

  const handleFacebook = () => {
    if (!providerProfile?.facebook) {
      Alert.alert('تنبيه', 'لا يوجد رابط فيسبوك محفوظ.');
      return;
    }

    void openExternalLink(providerProfile.facebook);
  };

  const handleLogout = async () => {
    await logoutProvider();
    queryClient.removeQueries({ queryKey: providerSessionQueryKey });
    queryClient.removeQueries({ queryKey: providerProfileQueryKey });
    queryClient.removeQueries({ queryKey: providerStatusQueryKey });
    router.replace('/entry');
  };

  if (sessionQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primaryLight} />
        <Text className="mt-4 font-cairo text-[14px] text-text">جارٍ التحقق من الجلسة...</Text>
      </SafeAreaView>
    );
  }

  if (!session) {
    return null;
  }

  if (profileQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primaryLight} />
        <Text className="mt-4 font-cairo text-[14px] text-text">جارٍ تحميل الملف...</Text>
      </SafeAreaView>
    );
  }

  if (!providerProfile || profileQuery.isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-3 text-center font-cairo-bold text-[18px] text-text">
          تعذر تحميل الملف
        </Text>
        <Text className="mb-5 text-center font-cairo text-[14px] leading-6 text-text">
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
        contentContainerClassName="px-[14px] pt-[6px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 112 }}
        showsVerticalScrollIndicator={false}>
        <View className="relative mb-[22px] min-h-10 items-center justify-center">
          <Text className="font-cairo-bold text-[15px] tracking-[0.9px] text-text">LUMIXY</Text>

          <TouchableOpacity
            className="absolute right-0 h-8 w-8 items-center justify-center rounded-full border border-border bg-[#23122E]"
            onPress={() => router.push('/provider/tabs/edit-profile')}
            activeOpacity={0.85}>
            <Ionicons name="create-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View className="mb-5 items-center">
          <TouchableOpacity
            onPress={() => router.push('/provider/tabs/edit-profile')}
            activeOpacity={0.9}
            className="relative mb-[14px] h-[116px] w-[116px] items-center justify-center rounded-full">
            <View
              className="h-[108px] w-[108px] items-center justify-center rounded-full border-[2.5px] border-primary bg-[#120715]"
              style={{
                shadowColor: colors.primaryLight,
                shadowOpacity: 0.35,
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 14,
                elevation: 9,
              }}>
              <Image source={{ uri: providerProfile.avatar }} className="h-[92px] w-[92px] rounded-full" />
            </View>
            <View className="absolute bottom-4 right-[10px] h-[14px] w-[14px] rounded-full border-2 border-background bg-[#22C55E]" />
          </TouchableOpacity>

          <Text className="mb-2 text-center font-cairo-bold text-[24px] leading-[34px] text-text">
            {providerProfile.name}
          </Text>

          <View className="mb-3 flex-row-reverse items-center gap-1">
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text className="font-cairo text-[12px] text-text">
              {providerProfile.location || 'لم يتم تحديد الموقع بعد'}
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
              <Text className="font-cairo text-[12px] text-text">
                ساعات العمل: من {providerProfile.workTime} - {providerProfile.workTimeEnd}
              </Text>
              <Text className="font-cairo text-[11px] text-textSecondary">الأيام: {workingDaysText}</Text>
            </View>
          </View>

          {providerProfile.categoryName ? (
            <View className="mt-3 self-stretch flex-row-reverse items-center justify-between rounded-[20px] border border-border bg-[#1A0E24] px-5 py-4">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-[#2B1937]">
                <Ionicons name="pricetag-outline" size={22} color={colors.accent} />
              </View>

              <View className="flex-1 items-end pr-3">
                <Text className="mb-1 font-cairo text-[12px] text-text">التصنيف</Text>
                <Text className="font-cairo-bold text-[18px] text-text">
                  {providerProfile.categoryName}
                </Text>
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
            {providerProfile.about || 'لم تتم إضافة نبذة بعد.'}
          </Text>
        </View>

        <View className="mb-[14px] rounded-[16px] border border-border bg-[#1A0E24] p-4">
          <View className="mb-3 flex-row-reverse items-center gap-1.5">
            <Ionicons name="flash-outline" size={15} color={colors.accent} />
            <Text className="font-cairo-bold text-[17px] text-text">الخدمات</Text>
          </View>

          <View className="flex-row-reverse flex-wrap gap-2">
            {providerProfile.services.length > 0 ? (
              providerProfile.services.map((item) => (
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
                  <Image source={{ uri: item }} className="h-full w-full" />
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-right font-cairo text-[13px] text-text">
              لم تتم إضافة صور للأعمال بعد.
            </Text>
          )}
        </View>
        <TouchableOpacity
          className="mb-[14px] flex-row-reverse items-center justify-center gap-2 rounded-[16px] border border-[#5B1F2A] bg-[#2A1218] px-4 py-4"
          onPress={() => {
            void handleLogout();
          }}
          activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color="#FCA5A5" />
          <Text className="font-cairo-bold text-[14px] text-[#FCA5A5]">تسجيل الخروج</Text>
        </TouchableOpacity>
      </ScrollView>

      <View
        className="absolute left-3 right-3 bg-transparent"
        style={{ bottom: insets.bottom + 18 }}>
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
      </View>
    </SafeAreaView>
  );
}
