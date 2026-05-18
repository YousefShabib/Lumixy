import React, { useEffect } from 'react';
import { Redirect, router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuthContext } from '@/contexts/AuthContext';
import { getRouteForUser } from '@/services/authRoutes';
import { colors, Logo } from '@/theme';

function SplashLogo() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
      }}>
      <Logo size="large" />
      <ActivityIndicator color={colors.primaryLight} style={{ marginTop: 24 }} />
    </View>
  );
}

export default function IndexScreen() {
  const { isAuthenticated, isHydrating, user } = useAuthContext();

  useEffect(() => {
    if (!isHydrating && !isAuthenticated) {
      const timeout = setTimeout(() => {
        router.replace('/entry');
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, isHydrating]);

  if (isHydrating) {
    return <SplashLogo />;
  }

  if (isAuthenticated && user) {
    return <Redirect href={getRouteForUser(user)} />;
  }

  return <SplashLogo />;
}
