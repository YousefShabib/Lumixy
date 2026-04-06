import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAdminSession } from '@/contexts/admin-session-context';

const profileLinks = [
  {
    icon: 'person-outline' as const,
    id: 'details',
    route: '/admin/profile-details' as const,
    subtitle: 'تعديل الاسم ورقم الجوال والبريد الإلكتروني',
    title: 'المعلومات الشخصية',
  },
  {
    icon: 'person-add-outline' as const,
    id: 'add-admin',
    route: '/admin/add-admin' as const,
    subtitle: 'إنشاء حساب إداري جديد من داخل لوحة التحكم',
    title: 'إضافة أدمن جديد',
  },
  {
    icon: 'settings-outline' as const,
    id: 'admin-settings',
    route: '/admin/admin-settings' as const,
    subtitle: 'عرض جميع الأدمنز الموجودين مع إمكانية حذف الحسابات',
    title: 'عرض وإعدادات الأدمن',
  },
];

export default function AdminProfileScreen() {
  const { adminUser, logout } = useAdminSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-admin-background" edges={['top']}>
      <StatusBar style="light" />

      <View className="flex-1 bg-admin-background">
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.18)', 'rgba(139, 92, 246, 0.00)']}
          end={{ x: 0, y: 1 }}
          start={{ x: 1, y: 0 }}
          style={{
            borderRadius: 999,
            height: 220,
            position: 'absolute',
            right: -42,
            top: -30,
            width: 220,
          }}
        />
        <LinearGradient
          colors={['rgba(109, 40, 217, 0.18)', 'rgba(109, 40, 217, 0.00)']}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 1 }}
          style={{
            borderRadius: 999,
            bottom: 120,
            height: 260,
            left: -70,
            position: 'absolute',
            width: 260,
          }}
        />

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 px-5 pb-7 pt-3.5"
          showsVerticalScrollIndicator={false}>
          <View className="rounded-[30px] border border-white/10 bg-admin-panel px-5 py-5">
            <View className="items-center">
              <View className="mb-4 h-[92px] w-[92px] items-center justify-center overflow-hidden rounded-[30px] border border-admin-primaryLight/35 bg-[#0E0914]">
                <Image
                  contentFit="cover"
                  source={require('../../../assets/images/icon.png')}
                  style={{ height: 78, width: 78 }}
                />
              </View>

              {adminUser ? (
                <>
                  <Text className="text-center font-cairo-bold text-[30px] text-admin-text">
                    {adminUser.full_name}
                  </Text>
                  <Text className="mt-2 text-center font-cairo text-[14px] leading-6 text-admin-muted">
                    لوحة الإدارة الرئيسية لحسابات Lumixy
                  </Text>
                  <View className="mt-5 items-center gap-2">
                    <Text className="font-cairo text-[15px] text-admin-text">{adminUser.email}</Text>
                    <Text className="font-cairo text-[15px] text-admin-text">
                      {adminUser.phone?.trim() || 'لا يوجد رقم جوال محفوظ'}
                    </Text>
                  </View>
                </>
              ) : (
                <ActivityIndicator color="#8B5CF6" size="large" />
              )}
            </View>
          </View>

          <View className="gap-3">
            {profileLinks.map((item) => (
              <Pressable
                key={item.id}
                className="min-h-[84px] flex-row-reverse items-center rounded-[24px] border border-white/10 bg-admin-panel px-4"
                onPress={() => router.push(item.route)}>
                <View className="h-[42px] w-[42px] items-center justify-center rounded-full bg-admin-primaryLight/10">
                  <Ionicons color="#8B5CF6" name={item.icon} size={18} />
                </View>

                <View className="flex-1 px-3">
                  <Text className="text-right font-cairo-bold text-[16px] text-admin-text">
                    {item.title}
                  </Text>
                  <Text className="mt-1 text-right font-cairo text-[12px] leading-5 text-admin-muted">
                    {item.subtitle}
                  </Text>
                </View>

                <Feather color="#6B7280" name="chevron-left" size={18} />
              </Pressable>
            ))}
          </View>

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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
