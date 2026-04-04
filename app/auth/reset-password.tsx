import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import AuthField from '@/components/auth/AuthField';
import AuthPrimaryButton from '@/components/auth/AuthPrimaryButton';
import AuthScreenShell from '@/components/auth/AuthScreenShell';
import { authShared } from '@/components/auth/authTheme';
import useAuth from '@/hooks/useAuth';
import { colors, typography } from '@/theme';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; otp?: string }>();
  const email = String(params.email ?? '');
  const otp = String(params.otp ?? '');

  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 370 || height < 760;
  const largeIconSize = isSmallScreen ? 42 : 50;
  const { error, clearError, isLoading, resetPassword, setError } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const loading = isLoading('resetPassword');

  const canSubmit =
    Boolean(password && confirmPassword) &&
    password === confirmPassword &&
    !loading;

  const handleReset = async () => {
    if (!email || !otp) {
      setError('انتهت الجلسة. يرجى إعادة إرسال الرمز.');
      return;
    }
    if (!password || !confirmPassword) {
      setError('يرجى إدخال كلمة المرور الجديدة.');
      return;
    }
    if (password !== confirmPassword) {
      setError('تأكيد كلمة المرور غير مطابق.');
      return;
    }

    try {
      await resetPassword(email, otp, password, confirmPassword);
      setIsSuccess(true);
    } catch {}
  };

  return (
    <AuthScreenShell
      isSmallScreen={isSmallScreen}
      topPaddingSmall={20}
      topPaddingLarge={34}
      bottomPaddingSmall={24}
      bottomPaddingLarge={34}
      contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="arrow-forward" size={18} color="#B8B0D8" />
        </TouchableOpacity>
      </View>

      <View style={[styles.lockCard, styles.statusCard, isSuccess ? styles.successIconCard : null, { marginTop: isSmallScreen ? 8 : 18 }]}>
        <Ionicons
          name={isSuccess ? 'checkmark-circle' : 'shield-checkmark-outline'}
          size={largeIconSize}
          color={isSuccess ? '#7CFFB2' : '#B28CFF'}
        />
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: isSmallScreen ? 28 : 32 }]}>
          {isSuccess ? 'تم تغيير كلمة المرور' : 'تعيين كلمة مرور جديدة'}
        </Text>
        <Text style={[styles.subtitle, { fontSize: isSmallScreen ? 12 : 13 }]}>
          {isSuccess
            ? 'تم تحديث كلمة المرور بنجاح.'
            : `أدخل كلمة مرور جديدة لحسابك\n${email || 'البريد الإلكتروني'}`}
        </Text>
      </View>

      <View style={styles.panel}>
        {isSuccess ? (
          <View style={styles.successPanel}>
            <View style={styles.successBadge}>
              <Ionicons name="sparkles" size={18} color="#0A2D1C" />
              <Text style={styles.successBadgeText}>نجاح</Text>
            </View>
            <Text style={styles.successTitle}>كلمة المرور الجديدة أصبحت فعالة</Text>
            <AuthPrimaryButton
              title="الذهاب إلى تسجيل الدخول"
              onPress={() => router.replace('/auth/login')}
              marginTop={22}
              fullWidth="88%"
            />
          </View>
        ) : (
          <>
            <AuthField
              label="كلمة المرور الجديدة"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (error) clearError();
              }}
              secureTextEntry
              placeholder="كلمة المرور الجديدة"
              icon="lock-closed-outline"
            />
            <AuthField
              label="تأكيد كلمة المرور"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (error) clearError();
              }}
              secureTextEntry
              placeholder="تأكيد كلمة المرور الجديدة"
              icon="shield-checkmark-outline"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <AuthPrimaryButton
              title={canSubmit ? 'حفظ كلمة المرور' : 'أدخل البيانات كاملة'}
              loading={loading}
              disabled={!canSubmit}
              onPress={handleReset}
              marginTop={18}
              fullWidth="88%"
            />
          </>
        )}
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    ...authShared.content,
  },
  topRow: {
    ...authShared.topRow,
  },
  backButton: {
    ...authShared.backButton,
  },
  lockCard: {
    ...authShared.iconCard,
  },
  statusCard: {
    borderRadius: 30,
  },
  successIconCard: {
    backgroundColor: 'rgba(27, 87, 53, 0.24)',
    borderColor: 'rgba(124, 255, 178, 0.32)',
    shadowColor: '#52D98C',
  },
  header: {
    ...authShared.header,
  },
  title: {
    ...authShared.title,
    lineHeight: 48,
    paddingTop: 10,
    fontFamily: typography.fontFamily.bold,
  },
  subtitle: {
    ...authShared.subtitle,
    fontFamily: typography.fontFamily.bold,
  },
  panel: {
    ...authShared.panel,
  },
  successPanel: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 6,
  },
  successBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(124, 255, 178, 0.9)',
    marginBottom: 18,
  },
  successBadgeText: {
    color: '#0A2D1C',
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
  },
  successTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 23,
    textAlign: 'center',
    marginBottom: 4,
  },
  errorText: {
    ...authShared.errorText,
  },
});
