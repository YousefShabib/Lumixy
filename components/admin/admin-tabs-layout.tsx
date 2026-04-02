import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { colors, typography } from '@/theme';

const hiddenScreenOptions = {
  href: null,
  tabBarStyle: { display: 'none' as const },
};

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.46)',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          direction: 'rtl',
          flexDirection: 'row-reverse',
          backgroundColor: '#251136',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.06)',
          height: Platform.OS === 'ios' ? 88 : 82,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 22 : 14,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.22,
          shadowRadius: 16,
          elevation: 18,
        },
        tabBarItemStyle: {
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.semiBold,
          fontSize: 11,
          textAlign: 'center',
          writingDirection: 'rtl',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="providers"
        options={{
          title: 'المزودون',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size + 1} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="providers-management"
        options={{
          title: 'الخدمات',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shape-outline" size={size + 1} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'الملف الشخصي',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size + 1} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="profile-details" options={hiddenScreenOptions} />
      <Tabs.Screen name="add-admin" options={hiddenScreenOptions} />
      <Tabs.Screen name="notifications-center" options={hiddenScreenOptions} />
      <Tabs.Screen name="security-center" options={hiddenScreenOptions} />
    </Tabs>
  );
}
