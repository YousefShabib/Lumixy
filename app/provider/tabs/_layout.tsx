import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { colors, typography } from '@/theme';

export default function ProviderTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          direction: 'rtl',
          flexDirection: 'row-reverse',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.12)',
          backgroundColor: 'rgba(8, 13, 30, 0.94)',
          paddingTop: 8,
          paddingBottom: 12,
          paddingHorizontal: 8,
          height: 78,
        },
        tabBarItemStyle: {
          minWidth: 0,
          paddingHorizontal: 4,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.bold,
          fontSize: 11,
          writingDirection: 'rtl',
          textAlign: 'center',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'البحث',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'بروفايل',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
