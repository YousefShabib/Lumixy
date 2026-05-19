import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  extractErrorMessage,
  fetchProviderStatus,
  getSupportWhatsappUrl,
  logoutProvider,
  providerProfileQueryKey,
  providerStatusQueryKey,
} from '@/services/provider-api';
import {
  getProviderSession,
  loadProviderSession,
  providerSessionQueryKey,
} from '@/services/provider-session';
import { colors } from '@/theme';

export default function WaitingApprovalScreen() {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: providerSessionQueryKey,
    queryFn: loadProviderSession,
    initialData: getProviderSession() ?? undefined,
    staleTime: Number.POSITIVE_INFINITY,
  });
  const session = sessionQuery.data ?? null;

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

  const normalizedUserStatus = session?.user?.status?.trim().toLowerCase() ?? null;
  const applicationStatus = statusQuery.data?.applicationStatus ?? null;
  const rejectionNotes = statusQuery.data?.notes ?? null;
  const isRejected = applicationStatus === 'rejected';
  const isInactiveAccount = normalizedUserStatus === 'inactive';
  const isPending = applicationStatus === 'pending' || (!applicationStatus && isInactiveAccount);

  useEffect(() => {
    if (!isPending && !isRejected) {
      router.replace('/provider/tabs/profile');
    }
  }, [isPending, isRejected]);

  const handleContact = async () => {
    const url = getSupportWhatsappUrl();

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
        return;
      }

      Alert.alert('تعذر فتح الرابط', 'واتساب غير متاح على هذا الجهاز.');
    } catch (error) {
      Alert.alert('تعذر فتح الرابط', extractErrorMessage(error));
    }
  };

  const handleLogout = async () => {
    await logoutProvider();
    queryClient.removeQueries({ queryKey: providerSessionQueryKey });
    queryClient.removeQueries({ queryKey: providerProfileQueryKey });
    queryClient.removeQueries({ queryKey: providerStatusQueryKey });
    router.replace('/entry');
  };

  const title = isPending ? 'حسابك قيد المراجعة' : 'تمت إعادة الملف للتعديل';
  const description = isPending
    ? 'حسابك قيد المراجعة. لتفعيل ظهورك لجميع العملاء، يتطلب الأمر مراجعة البيانات والاشتراك في الخطة.'
    : 'راجعت الإدارة الطلب وطلبت تعديل بعض البيانات قبل إعادة إرسال الملف للمراجعة.';
  const statusLabel = isPending ? 'جاري المعالجة' : 'بحاجة إلى تعديل';

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

  if (statusQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primaryLight} />
        <Text className="mt-4 font-cairo text-[14px] text-text-secondary">جارٍ جلب الحالة...</Text>
      </SafeAreaView>
    );
  }

  if (!isPending && !isRejected) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-7 pb-7 pt-1"
        showsVerticalScrollIndicator={false}>
        <View className="mb-8 items-center border-b border-white/5 pb-5 pt-2">
          <Text className="font-cairo-bold text-[14px] tracking-[0.9px] text-text">LUMIXY</Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <View className="relative mb-9 items-center justify-center">
            <View className="absolute left-0 top-3 h-10 w-10 items-center justify-center rounded-full border border-[#6D28D9]/50 bg-[#231235]">
              <Ionicons name="search-outline" size={16} color={colors.text} />
            </View>

            <View className="h-[196px] w-[196px] items-center justify-center rounded-full border border-[#6D28D9]/40 bg-[rgba(109,40,217,0.12)]">
              <View className="h-[136px] w-[136px] items-center justify-center rounded-full border border-[#8B5CF6]/35 bg-[rgba(139,92,246,0.18)]">
                <View className="h-[94px] w-[94px] items-center justify-center rounded-full bg-[rgba(109,40,217,0.45)]">
                  <Ionicons
                    name={isRejected ? 'refresh-outline' : 'hourglass-outline'}
                    size={46}
                    color="#E9D5FF"
                  />
                </View>
              </View>
            </View>

            <View
              className="absolute bottom-[4px] right-[6px] h-[50px] w-[50px] items-center justify-center rounded-[18px] bg-primary"
              style={{ transform: [{ rotate: '12deg' }] }}>
              <Ionicons
                name={isRejected ? 'create-outline' : 'shield-checkmark-outline'}
                size={20}
                color={colors.text}
              />
            </View>
          </View>

          <Text className="mb-3 text-center font-cairo-bold text-[25px] leading-[38px] text-text">
            {title}
          </Text>

          <Text className="mb-7 text-center font-cairo text-[14px] leading-8 text-text">
            {description}
          </Text>

          {isPending ? (
            <View className="mb-7 w-full rounded-[18px] border border-white/10 bg-white/[0.04] px-5 py-5">
              <Text className="mb-2 text-center font-cairo text-[13px] text-text">
                قيمة الاشتراك المطلوبة
              </Text>
              <Text className="text-center font-cairo-bold text-[19px] text-[#2FE06A]">
                100 شيكل لمرة واحدة
              </Text>
            </View>
          ) : null}

          {isRejected && rejectionNotes ? (
            <View className="mb-6 w-full rounded-[18px] border border-[#F97316]/30 bg-[#2B170D] px-5 py-4">
              <Text className="mb-2 text-right font-cairo-bold text-[14px] text-[#FDBA74]">
                ملاحظات الإدارة
              </Text>
              <Text className="text-right font-cairo text-[13px] leading-7 text-[#FED7AA]">
                {rejectionNotes}
              </Text>
            </View>
          ) : null}

          <View className="mb-8 flex-row-reverse items-center justify-center gap-3 rounded-full border border-[#6D28D9]/40 bg-[#241433] px-6 py-3">
            <View className="h-2.5 w-2.5 rounded-full bg-[#C084FC]" />
            <Text className="font-cairo-bold text-[14px] text-[#C084FC]">{statusLabel}</Text>
          </View>

          {isPending ? (
            <TouchableOpacity
              className="mb-7 w-full flex-row-reverse items-center justify-center gap-3 rounded-[16px] bg-[#2BD465] px-5 py-4"
              onPress={() => {
                void handleContact();
              }}
              activeOpacity={0.85}>
              <Ionicons name="chatbox-ellipses-outline" size={19} color="#07140A" />
              <Text className="font-cairo-bold text-[16px] text-[#07140A]">تواصل لتفعيل الحساب</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="mb-7 w-full flex-row-reverse items-center justify-center gap-3 rounded-[16px] bg-[#2BD465] px-5 py-4"
              onPress={() => router.replace('/provider/tabs/edit-profile')}
              activeOpacity={0.85}>
              <Ionicons name="create-outline" size={19} color="#07140A" />
              <Text className="font-cairo-bold text-[16px] text-[#07140A]">تعديل الملف</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              void handleLogout();
            }}
            activeOpacity={0.75}>
            <Text className="font-cairo text-[14px] text-[#8B8DAA]">تسجيل الخروج</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
