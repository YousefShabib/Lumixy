import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import AdminTabsLayout from '@/components/admin/admin-tabs-layout';
import { useAdminSession } from '@/contexts/admin-session-context';
import { colors } from '@/theme';

export default function AdminGroupLayout() {
  const { isAuthenticated, isAuthenticating } = useAdminSession();

  useEffect(() => {
    if (!isAuthenticated && !isAuthenticating) {
      router.replace('/login');
    }
  }, [isAuthenticated, isAuthenticating]);

  if (!isAuthenticated) {
    return (
      <View style={styles.fallback}>
        <ActivityIndicator size="large" color={colors.primaryLight} />
      </View>
    );
  }

  return <AdminTabsLayout />;
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
