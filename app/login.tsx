import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography } from '@/theme';

const mockUser = {
  name: 'Admin',
  role: 'admin',
};

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (mockUser.role === 'admin') {
      router.replace('/(admin)/providers-management');
      return;
    }

    router.replace('/provider/tabs');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>01</Text>
            </View>
            <Text style={styles.title}>تسجيل الدخول</Text>
            <Text style={styles.subtitle}>
              واجهة عربية حديثة لمزودي الخدمات، متناسقة مع هوية Lumixy وبنفس الثيم الداكن.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.infoPill}>
              <Text style={styles.infoPillText}>الدخول التجريبي الحالي: {mockUser.name}</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>رقم الجوال</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="05XXXXXXXX"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>كلمة المرور</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="أدخل كلمة المرور"
                secureTextEntry
                style={styles.input}
              />
            </View>

            <Pressable style={styles.primaryButtonWrapper} onPress={handleLogin}>
              <LinearGradient
                colors={[colors.primaryLight, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>دخول</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
              <Text style={styles.secondaryButtonText}>رجوع</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  glowTop: {
    position: 'absolute',
    top: 26,
    right: -40,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
  },
  glowBottom: {
    position: 'absolute',
    left: -60,
    bottom: 80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(109, 40, 217, 0.15)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 26,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.accent,
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 34,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 320,
  },
  card: {
    backgroundColor: 'rgba(21, 10, 29, 0.92)',
    borderRadius: 34,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 18,
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 8,
  },
  infoPill: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  infoPillText: {
    color: colors.accent,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 13,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 14,
    textAlign: 'right',
  },
  input: {
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: colors.text,
    paddingHorizontal: 18,
    fontSize: 15,
  },
  primaryButtonWrapper: {
    marginTop: 8,
  },
  primaryButton: {
    minHeight: 62,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
  },
  secondaryButton: {
    minHeight: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 16,
  },
});
