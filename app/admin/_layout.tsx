import { router, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAdminSession } from '@/contexts/admin-session-context';
import { colors } from '@/theme';

export default function AdminLayout() {
  const { isAuthenticated, isAuthenticating } = useAdminSession();

  useEffect(() => {
    if (!isAuthenticated && !isAuthenticating) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isAuthenticating]);

  if (!isAuthenticated) {
    return (
      <View style={styles.fallback}>
        <ActivityIndicator size="large" color={colors.primaryLight} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
