import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography } from '@/theme';

const profileLinks = [
  {
    id: 'details',
    title: 'المعلومات الشخصية',
    subtitle: 'تعديل الاسم ورقم الجوال والبريد الإلكتروني',
    icon: 'person-outline' as const,
    route: '/(admin)/profile-details' as const,
  },
  {
    id: 'add-admin',
    title: 'إضافة أدمن جديد',
    subtitle: 'دعوة مسؤول جديد ومنحه صلاحية مناسبة',
    icon: 'person-add-outline' as const,
    route: '/(admin)/add-admin' as const,
  },
  {
    id: 'notifications',
    title: 'التنبيهات والإشعارات',
    subtitle: 'تحديد الرسائل المهمة وتنبيهات الموافقات',
    icon: 'notifications-outline' as const,
    route: '/(admin)/notifications-center' as const,
  },
  {
    id: 'security',
    title: 'الأمان والجلسات',
    subtitle: 'حماية الحساب ومراجعة الأجهزة النشطة',
    icon: 'shield-checkmark-outline' as const,
    route: '/(admin)/security-center' as const,
  },
];

export default function AdminProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.screen}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.18)', 'rgba(139, 92, 246, 0.00)']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.topGlow}
        />
        <LinearGradient
          colors={['rgba(109, 40, 217, 0.18)', 'rgba(109, 40, 217, 0.00)']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.bottomGlow}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroCard}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>LUMIXY</Text>
            </View>

            <Text style={styles.title}>حساب الأدمن</Text>
            <Text style={styles.subtitle}>
              نقطة إدارة مبسطة للوصول السريع إلى البيانات، التنبيهات، والحماية.
            </Text>

            <LinearGradient
              colors={['rgba(139, 92, 246, 0.22)', 'rgba(109, 40, 217, 0.10)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statusBanner}>
              <Ionicons name="sparkles-outline" size={18} color={colors.accent} />
              <Text style={styles.statusBannerText}>آخر تحديث للحساب تم قبل 5 دقائق بنجاح</Text>
            </LinearGradient>
          </View>

          <View style={styles.linksList}>
            {profileLinks.map((item) => (
              <Pressable
                key={item.id}
                style={styles.linkCard}
                onPress={() => router.push(item.route)}>
                <Feather name="chevron-left" size={18} color={colors.textMuted} />

                <View style={styles.linkText}>
                  <Text style={styles.linkTitle}>{item.title}</Text>
                  <Text style={styles.linkSubtitle}>{item.subtitle}</Text>
                </View>

                <View style={styles.iconWrap}>
                  <Ionicons name={item.icon} size={18} color={colors.primaryLight} />
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={() => router.replace('/')} style={styles.logoutCard}>
            <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
            <View style={styles.logoutText}>
              <Text style={styles.logoutTitle}>تسجيل الخروج</Text>
              <Text style={styles.logoutSubtitle}>العودة إلى الشاشة الرئيسية وإنهاء الجلسة</Text>
            </View>
            <Feather name="chevron-left" size={18} color={colors.textMuted} />
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: '#09070C',
  },
  topGlow: {
    position: 'absolute',
    top: -30,
    right: -42,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 120,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 16,
  },
  heroCard: {
    borderRadius: 30,
    padding: 20,
    backgroundColor: 'rgba(21, 12, 29, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  logoBox: {
    width: 92,
    height: 92,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.34)',
    backgroundColor: '#0E0914',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 8,
  },
  logoText: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    letterSpacing: 0.7,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 32,
    marginTop: 18,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 290,
  },
  statusBanner: {
    marginTop: 18,
    minHeight: 54,
    borderRadius: 20,
    paddingHorizontal: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  statusBannerText: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 13,
    textAlign: 'right',
  },
  linksList: {
    gap: 12,
  },
  linkCard: {
    minHeight: 82,
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(19, 16, 24, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  linkText: {
    flex: 1,
    alignItems: 'flex-end',
    paddingHorizontal: 12,
  },
  linkTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    textAlign: 'right',
  },
  linkSubtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 3,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.10)',
  },
  logoutCard: {
    minHeight: 80,
    borderRadius: 26,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(26, 18, 23, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.12)',
  },
  logoutText: {
    flex: 1,
    alignItems: 'flex-end',
    paddingHorizontal: 14,
  },
  logoutTitle: {
    color: colors.error,
    fontFamily: typography.fontFamily.bold,
    fontSize: 17,
  },
  logoutSubtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
  },
});
