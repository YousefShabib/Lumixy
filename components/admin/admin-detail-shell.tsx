import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography } from '@/theme';

type AdminDetailShellProps = {
  badge?: string;
  children: ReactNode;
  notice?: string;
  noticeTone?: 'primary' | 'success' | 'warning';
  subtitle: string;
  title: string;
};

const noticeTones = {
  primary: {
    background: ['rgba(139, 92, 246, 0.22)', 'rgba(109, 40, 217, 0.10)'] as [string, string],
    icon: colors.primaryLight,
  },
  success: {
    background: ['rgba(16, 185, 129, 0.22)', 'rgba(16, 185, 129, 0.10)'] as [string, string],
    icon: colors.success,
  },
  warning: {
    background: ['rgba(245, 158, 11, 0.22)', 'rgba(245, 158, 11, 0.10)'] as [string, string],
    icon: colors.warning,
  },
};

export default function AdminDetailShell({
  badge = 'إدارة الأدمن',
  children,
  notice,
  noticeTone = 'primary',
  subtitle,
  title,
}: AdminDetailShellProps) {
  const router = useRouter();
  const tone = noticeTones[noticeTone];

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
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.replace('/admin/tabs/profile')} style={styles.backButton}>
              <Ionicons name="arrow-forward" size={20} color={colors.text} />
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          </View>

          {notice ? (
            <LinearGradient
              colors={tone.background}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.noticeCard}>
              <Ionicons name="notifications-outline" size={18} color={tone.icon} />
              <Text style={styles.noticeText}>{notice}</Text>
            </LinearGradient>
          ) : null}

          {children}
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
    top: -34,
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
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  headerText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 28,
    textAlign: 'right',
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    textAlign: 'right',
    marginTop: 2,
  },
  badge: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.16)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: colors.accent,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 12,
  },
  noticeCard: {
    minHeight: 54,
    borderRadius: 20,
    paddingHorizontal: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  noticeText: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 13,
    textAlign: 'right',
  },
});
