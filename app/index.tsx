import React from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuthContext } from '@/contexts/AuthContext';
import { getRouteForUser } from '@/services/authRoutes';
import { colors } from '@/theme';

import EntryScreen from './entry';

export default function IndexScreen() {
  const { isAuthenticated, isHydrating, user } = useAuthContext();

  if (isHydrating) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}>
        <ActivityIndicator color={colors.primaryLight} />
      </View>
    );
  }

  if (isAuthenticated && user) {
    return <Redirect href={getRouteForUser(user)} />;
  }

  return <EntryScreen />;
}