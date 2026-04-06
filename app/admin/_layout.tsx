import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAdminSession } from '@/contexts/admin-session-context';
import { colors } from '@/theme';

export default function AdminLayout() {
  const router = useRouter();
  const { isAuthenticated, isAuthenticating } = useAdminSession();

  useEffect(() => {
    if (!isAuthenticated && !isAuthenticating) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isAuthenticating, router]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-[#080d1e]">
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator size="large" color={colors.primaryLight} />
        </View>
      </SafeAreaView>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
