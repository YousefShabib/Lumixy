import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
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

  useEffect(() => {
    if (statusQuery.data?.applicationStatus === 'approved') {
      router.replace('/provider/tabs/profile');
    }
  }, [statusQuery.data?.applicationStatus]);

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

  const applicationStatus = statusQuery.data?.applicationStatus ?? null;
  const rejectionNotes = statusQuery.data?.notes ?? null;
  const isPending = applicationStatus === 'pending';
  const isRejected = applicationStatus === 'rejected';
  const isIncomplete = applicationStatus === null;

  const title = isPending
    ? 'حسابك قيد المراجعة'
    : isRejected
      ? 'تمت إعادة الملف للتعديل'
      : 'أكمل ملفك قبل الإرسال';

  const description = isPending
    ? 'ملفك الآن عند الإدارة للمراجعة. بعد اعتماد الطلب سيتفعّل حسابك ويظهر ملفك للعملاء.'
    : isRejected
      ? 'تمت مراجعة الطلب وطلبت الإدارة تعديل بعض البيانات قبل إعادة الإرسال.'
      : 'ما زال حسابك بحاجة إلى استكمال البيانات الأساسية ثم إرساله للمراجعة.';

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

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="h-[58px] items-center justify-center border-b border-white/5">
        <Text className="font-cairo-bold text-[14px] tracking-[0.8px] text-text">LUMIXY</Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <View className="relative mb-[30px] items-center justify-center">
          <View className="h-[160px] w-[160px] items-center justify-center rounded-full bg-[rgba(109,40,217,0.10)]">
            <View className="h-[120px] w-[120px] items-center justify-center rounded-full bg-[rgba(109,40,217,0.18)]">
              <View className="h-[88px] w-[88px] items-center justify-center rounded-full border border-border bg-[rgba(167,139,250,0.10)]">
                <Ionicons
                  name={isRejected ? 'refresh-outline' : isPending ? 'hourglass-outline' : 'document-text-outline'}
                  size={44}
                  color={colors.accent}
                />
              </View>
            </View>
          </View>

          <View className="absolute bottom-[18px] right-[10px] h-[38px] w-[38px] items-center justify-center rounded-full border border-border bg-primary">
            <Ionicons
              name={isRejected || isIncomplete ? 'create-outline' : 'shield-checkmark-outline'}
              size={16}
              color={colors.text}
            />
          </View>
        </View>

        <Text className="mb-[14px] text-center font-cairo-bold text-[31px] text-text">{title}</Text>

        <Text className="mb-6 px-1.5 text-center font-cairo text-[15px] leading-6 text-text-secondary">
          {description}
        </Text>

        {isRejected && rejectionNotes ? (
          <View className="mb-4 w-full rounded-[16px] border border-[#F97316]/30 bg-[#2B170D] px-[18px] py-4">
            <Text className="mb-2 text-right font-cairo-bold text-[14px] text-[#FDBA74]">
              ملاحظات الإدارة
            </Text>
            <Text className="text-right font-cairo text-[13px] leading-6 text-[#FED7AA]">
              {rejectionNotes}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          className="mb-[18px] min-w-[160px] flex-row-reverse items-center justify-center gap-2 rounded-full border border-border bg-surface-secondary px-5 py-3"
          activeOpacity={0.85}>
          <Ionicons
            name={isPending ? 'time-outline' : 'alert-circle-outline'}
            size={16}
            color={colors.accent}
          />
          <Text className="font-cairo-bold text-[14px] text-accent">
            {isPending ? 'بانتظار المراجعة' : isRejected ? 'بحاجة إلى تعديل' : 'غير مكتمل'}
          </Text>
        </TouchableOpacity>

        {isPending ? (
          <TouchableOpacity
            className="mb-[18px] w-full flex-row-reverse items-center justify-center gap-2 rounded-[14px] bg-[#39E56A] py-4"
            onPress={() => {
              void handleContact();
            }}
            activeOpacity={0.85}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#08130A" />
            <Text className="font-cairo-bold text-[16px] text-[#08130A]">تواصل بخصوص الطلب</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="mb-[18px] w-full flex-row-reverse items-center justify-center gap-2 rounded-[14px] bg-[#39E56A] py-4"
            onPress={() => router.replace('/provider/tabs/edit-profile')}
            activeOpacity={0.85}>
            <Ionicons name="create-outline" size={18} color="#08130A" />
            <Text className="font-cairo-bold text-[16px] text-[#08130A]">إكمال وتعديل الملف</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            void handleLogout();
          }}
          activeOpacity={0.75}>
          <Text className="font-cairo text-[14px] text-text-secondary">تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
