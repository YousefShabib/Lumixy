import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

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
          paddingBottom: Platform.OS === 'ios' ? 12 : 10,
          paddingHorizontal: 8,
          height: Platform.OS === 'ios' ? 78 : 72,
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
          marginTop: 3,
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
          title: 'الملف الشخصي',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
