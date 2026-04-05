import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import AuthField from '@/components/auth/AuthField';
import AuthPrimaryButton from '@/components/auth/AuthPrimaryButton';
import AuthScreenShell from '@/components/auth/AuthScreenShell';
import { authShared } from '@/components/auth/authTheme';
import useAuth from '@/hooks/useAuth';
import { getRouteForUser } from '@/services/authRoutes';
import { colors, typography } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 370 || height < 760;
  const loginLogoSize = width < 370 ? 34 : 40;
  const loginTitleSize = width < 370 ? 26 : width < 430 ? 30 : 32;
  const loginSubtitleSize = isSmallScreen ? 13 : 15;
  const { error, clearError, isLoading, login, setError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loading = isLoading('login');
  const canSubmit = Boolean(email.trim() && password.trim()) && !loading;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    try {
      const response = await login({ email: email.trim(), password });
      router.replace(getRouteForUser(response.user));
    } catch {}
  };

  return (
    <AuthScreenShell
      isSmallScreen={isSmallScreen}
      topPaddingSmall={24}
      topPaddingLarge={40}
      bottomPaddingSmall={24}
      bottomPaddingLarge={36}
      contentContainerStyle={styles.contentContainer}>
      <View style={[styles.logoWrap, { marginBottom: isSmallScreen ? 24 : 36 }]}>
        <Text style={[styles.logo, { fontSize: loginLogoSize }]}>LUMIXY</Text>
        <Text style={styles.subLogo}>PREMIUM PROVIDER PORTAL</Text>
      </View>

      <View style={styles.panel}>
        <View style={styles.headerWrap}>
          <Text style={[styles.title, { fontSize: loginTitleSize, lineHeight: loginTitleSize + 12 }]}>تسجيل الدخول</Text>
          <Text style={[styles.subtitle, { fontSize: loginSubtitleSize, lineHeight: isSmallScreen ? 22 : 26 }]}>
            أهلًا بك. أدخل بريدك الإلكتروني وكلمة المرور وسنوجهك لحسابك مباشرة
          </Text>
        </View>

        <View style={[styles.form, { gap: isSmallScreen ? 12 : 16 }]}>
          <AuthField
            label="البريد الإلكتروني"
            placeholder="provider@lumixy.ps"
            icon="mail-outline"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (error) clearError();
            }}
            keyboardType="email-address"
          />
          <AuthField
            label="كلمة المرور"
            placeholder="••••••••"
            secureTextEntry
            icon="lock-closed-outline"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (error) clearError();
            }}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Link href="/auth/forgot-password" style={styles.forgotLink}>
          نسيت كلمة المرور؟
        </Link>

        <AuthPrimaryButton
          title={canSubmit ? 'تسجيل الدخول' : 'أدخل البيانات للمتابعة'}
          loading={loading}
          disabled={!canSubmit}
          onPress={handleLogin}
          marginTop={isSmallScreen ? 14 : 18}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>ليس لديك حساب ؟ </Text>
          <Link href="/auth/signup" style={styles.footerLink}>
            سجل الآن
          </Link>
        </View>

        <Link href="/entry" style={styles.backHomeLink}>
          العودة إلى الصفحة الرئيسية
        </Link>
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 6,
    flexGrow: 1,
  },
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subLogo: {
    color: '#A2A0B3',
    marginTop: 6,
    fontSize: 11,
    letterSpacing: 2.8,
    fontWeight: '600',
    fontFamily: typography.fontFamily.bold,
  },
  headerWrap: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  panel: {
    ...authShared.panel,
    marginTop: 8,
    paddingVertical: 18,
    borderRadius: 22,
  },
  title: {
    color: colors.text,
    fontWeight: '800',
    fontFamily: typography.fontFamily.bold,
    textAlign: 'right',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 10,
    fontFamily: typography.fontFamily.bold,
  },
  form: {
    width: '100%',
  },
  errorText: {
    ...authShared.errorText,
  },
  forgotLink: {
    marginTop: 12,
    alignSelf: 'flex-end',
    color: '#AFA4C5',
    fontSize: 14,
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 15,
    fontFamily: typography.fontFamily.bold,
  },
  footerLink: {
    color: '#E6DEFF',
    fontSize: 16,
    fontWeight: '700',
    textDecorationLine: 'none',
    fontFamily: typography.fontFamily.bold,
  },
  backHomeLink: {
    marginTop: 34,
    alignSelf: 'center',
    color: '#8B8DAA',
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
  },
});
