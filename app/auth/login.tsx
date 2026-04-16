import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, Logo, typography } from '@/theme';

import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      alert('الرجاء إدخال رقم الجوال وكلمة المرور');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://192.168.1.13:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ phone, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'خطأ في تسجيل الدخول');
      }

      // Save token securely
      if (data.token) {
        if (Platform.OS === 'web') {
          localStorage.setItem('userToken', data.token);
        } else {
          await SecureStore.setItemAsync('userToken', data.token);
        }
        router.replace('/provider/tabs');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.header}>
        <Logo size="small" />
        <Text style={styles.title}>تسجيل دخول مزود الخدمة</Text>
        <Text style={styles.subtitle}>ادخل بياناتك للمتابعة مباشرة إلى لوحة التحكم الخاصة بك.</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="رقم الجوال"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          style={styles.input}
          textAlign="right"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="كلمة المرور"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
          textAlign="right"
        />

        <Pressable 
          style={[styles.primaryButton, isLoading && { opacity: 0.7 }]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>{isLoading ? 'جاري الدخول...' : 'دخول'}</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>رجوع</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  glowTop: {
    position: 'absolute',
    top: 40,
    left: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(109, 40, 217, 0.18)',
  },
  glowBottom: {
    position: 'absolute',
    right: -50,
    bottom: 120,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(167, 139, 250, 0.14)',
  },
  header: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 28,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
  },
  form: {
    gap: 14,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontFamily: typography.fontFamily.regular,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
  },
  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
  },
});
