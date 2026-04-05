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

export default function SignupScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 370 || height < 760;
  const logoSize = width < 370 ? 30 : width < 430 ? 32 : 34;
  const isVerySmallScreen = width < 350;
  const titleSize = isVerySmallScreen ? 23 : width < 370 ? 24 : width < 430 ? 26 : 28;
  const subtitleSize = width < 370 ? 12 : 13;
  const { error, clearError, isLoading, register, setError } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const loading = isLoading('register');
  const canSubmit =
    Boolean(fullName.trim() && email.trim() && password && confirmPassword) &&
    password === confirmPassword &&
    !loading;

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('يرجى تعبئة الحقول المطلوبة.');
      return;
    }

    if (password !== confirmPassword) {
      setError('تأكيد كلمة المرور غير مطابق.');
      return;
    }

    try {
      const response = await register({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        password_confirmation: confirmPassword,
      });
      router.replace(getRouteForUser(response.user));
    } catch {}
  };

  return (
    <AuthScreenShell
      isSmallScreen={isSmallScreen}
      topPaddingSmall={30}
      topPaddingLarge={36}
      bottomPaddingSmall={16}
      bottomPaddingLarge={20}
      contentContainerStyle={styles.contentContainer}>
      <View style={[styles.logoWrap, { marginBottom: isSmallScreen ? 10 : 14 }]}>
        <Text style={[styles.logo, { fontSize: logoSize }]}>LUMIXY</Text>
        <Text style={styles.subLogo}>PREMIUM PROVIDER PORTAL</Text>
      </View>

      <View style={styles.panel}>
        <View style={[styles.headerWrap, { marginBottom: isSmallScreen ? 12 : 16 }]}>
          <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize + 12 }]}>
            إنشاء حساب جديد
          </Text>
          <Text style={[styles.subtitle, { fontSize: subtitleSize, lineHeight: subtitleSize + 8 }]}>
            انضم إلى شبكة مزودي الخدمات في لومكسي وابدأ عملك اليوم
          </Text>
        </View>

        <View style={[styles.form, { gap: isSmallScreen ? 12 : 14 }]}>
          <AuthField
            label="الاسم الكامل"
            placeholder="أدخل اسمك الكامل"
            icon="person-outline"
            value={fullName}
            onChangeText={(value) => {
              setFullName(value);
              if (error) clearError();
            }}
          />
          <AuthField
            label="البريد الإلكتروني"
            placeholder="example@domain.com"
            keyboardType="email-address"
            icon="mail-outline"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (error) clearError();
            }}
          />
          <AuthField
            label="رقم الهاتف"
            placeholder="+970 5xx xxx xxx"
            keyboardType="phone-pad"
            icon="call-outline"
            value={phone}
            onChangeText={(value) => {
              setPhone(value);
              if (error) clearError();
            }}
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
          <AuthField
            label="تأكيد كلمة المرور"
            placeholder="••••••••"
            secureTextEntry
            icon="shield-checkmark-outline"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              if (error) clearError();
            }}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <AuthPrimaryButton
          title={canSubmit ? 'إنشاء الحساب' : 'أكمل الحقول المطلوبة'}
          loading={loading}
          disabled={!canSubmit}
          onPress={handleSignup}
          marginTop={12}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>لديك حساب بالفعل؟ </Text>
          <Link href="/auth/login" style={styles.footerLink}>
            تسجيل الدخول
          </Link>
        </View>
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 2,
    flexGrow: 1,
  },
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subLogo: {
    color: '#A2A0B3',
    marginTop: 2,
    fontSize: 9,
    letterSpacing: 1.8,
    fontWeight: '600',
  },
  headerWrap: {
    alignItems: 'flex-end',
  },
  panel: {
    ...authShared.panel,
    marginTop: 10,
    paddingHorizontal: 12,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontWeight: '800',
    textAlign: 'right',
    paddingTop: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
    fontFamily: typography.fontFamily.bold,
  },
  form: {
    width: '100%',
  },
  errorText: {
    ...authShared.errorText,
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
  },
  footerLink: {
    color: '#C5B8FF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'none',
  },
});
