import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import useAuth from '@/hooks/useAuth';

export default function ProviderProfileScreen() {
  const { isLoading, logout } = useAuth();
  const isLoggingOut = isLoading('logout');

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-admin-background" edges={['top']}>
      <StatusBar style="light" />

      <View className="flex-1 justify-end px-5 pb-7">
        <Pressable
          className="min-h-[84px] flex-row-reverse items-center rounded-[26px] border border-admin-danger/15 bg-[#1A1217] px-4"
          disabled={isLoggingOut}
          onPress={() => {
            void handleLogout();
          }}>
          <View className="h-[42px] w-[42px] items-center justify-center rounded-full bg-admin-danger/10">
            <MaterialCommunityIcons color="#EF4444" name="logout" size={20} />
          </View>

          <View className="flex-1 px-3">
            <Text className="text-right font-cairo-bold text-[17px] text-admin-danger">
              تسجيل الخروج
            </Text>
            <Text className="mt-1 text-right font-cairo text-[12px] leading-5 text-admin-muted">
              إنهاء الجلسة الحالية والعودة للشاشة الرئيسية
            </Text>
          </View>

          {isLoggingOut ? (
            <ActivityIndicator color="#6B7280" size="small" />
          ) : (
            <Feather color="#6B7280" name="chevron-left" size={18} />
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
