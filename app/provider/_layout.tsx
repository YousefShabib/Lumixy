import { Redirect, Stack, usePathname } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuthContext } from '@/contexts/AuthContext';
import { isProviderPendingApproval } from '@/services/authRoutes';
import { colors } from '@/theme';

export default function ProviderLayout() {
  const pathname = usePathname();
  const { isAuthenticated, isHydrating, role, user } = useAuthContext();
  const requiresApproval = isProviderPendingApproval(user);

  if (isHydrating) {
    return (
      <View style={styles.fallback}>
        <ActivityIndicator size="large" color={colors.primaryLight} />
      </View>
    );
  }

  if (!isAuthenticated || role !== 'provider') {
    return <Redirect href="/auth/login" />;
  }

  if (requiresApproval && pathname !== '/provider/waiting-approval') {
    return <Redirect href="/provider/waiting-approval" />;
  }

  if (!requiresApproval && pathname === '/provider/waiting-approval') {
    return <Redirect href="/provider/tabs" />;
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
