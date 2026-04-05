import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useAuth from '@/hooks/useAuth';
import { colors, typography } from '@/theme';

export default function WaitingApprovalScreen() {
  const router = useRouter();
  const { isLoading, logout, user } = useAuth();
  const isLoggingOut = isLoading('logout');

  const providerName =
    typeof user?.full_name === 'string' && user.full_name.trim().length > 0
      ? user.full_name
      : 'مزود الخدمة';

  const providerEmail =
    typeof user?.email === 'string' && user.email.trim().length > 0 ? user.email : null;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace('/auth/login');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="time-outline" size={34} color={colors.text} />
          </View>

          <Text style={styles.eyebrow}>LUMIXY PROVIDER</Text>
          <Text style={styles.title}>طلبك قيد المراجعة</Text>
          <Text style={styles.subtitle}>
            تم استلام حساب {providerName}. سيقوم فريق Lumixy بمراجعة البيانات وتفعيل الوصول فور
            اكتمال المراجعة.
          </Text>

          {providerEmail ? <Text style={styles.email}>{providerEmail}</Text> : null}

          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>ماذا يحدث الآن؟</Text>
            <Text style={styles.noteText}>نراجع بيانات الحساب ونتأكد من جاهزية الملف للخدمة.</Text>
            <Text style={styles.noteText}>عند الموافقة ستتمكن من الدخول الكامل إلى لوحة المزود.</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={isLoggingOut}
            onPress={() => {
              void handleLogout();
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && !isLoggingOut ? styles.primaryButtonPressed : null,
              isLoggingOut ? styles.buttonDisabled : null,
            ]}>
            <Text style={styles.primaryButtonText}>
              {isLoggingOut ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}
            </Text>
          </Pressable>

          <Link href="/entry" style={styles.secondaryLink}>
            العودة إلى الصفحة الرئيسية
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  glowTop: {
    position: 'absolute',
    top: 64,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
  },
  glowBottom: {
    position: 'absolute',
    left: -48,
    bottom: 86,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(167, 139, 250, 0.12)',
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  iconWrap: {
    width: 74,
    height: 74,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: 20,
    shadowColor: '#7E48FF',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  eyebrow: {
    color: '#B8A8E8',
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    letterSpacing: 1.5,
    textAlign: 'right',
  },
  title: {
    marginTop: 10,
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 30,
    textAlign: 'right',
  },
  subtitle: {
    marginTop: 12,
    color: '#DDD6F8',
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    lineHeight: 26,
    textAlign: 'right',
  },
  email: {
    marginTop: 12,
    color: colors.accent,
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    textAlign: 'right',
  },
  noteBox: {
    marginTop: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  noteTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    textAlign: 'right',
  },
  noteText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'right',
  },
  primaryButton: {
    marginTop: 24,
    borderRadius: 18,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
  },
  secondaryLink: {
    marginTop: 16,
    color: '#B6B0C9',
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    textAlign: 'center',
  },
});
