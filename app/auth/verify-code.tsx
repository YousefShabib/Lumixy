import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import AuthScreenShell from '@/components/auth/AuthScreenShell';
import { authShared } from '@/components/auth/authTheme';
import useAuth from '@/hooks/useAuth';
import useOtpTimer from '@/hooks/useOtpTimer';
import { colors, typography } from '@/theme';


const OTP_LENGTH = 6;

export default function VerifyCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = String(params.email ?? '');

  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 370 || height < 760;
  const otpBoxSize = width < 350 ? 42 : width < 390 ? 46 : 50;
  const otpGap = width < 350 ? 6 : width < 430 ? 8 : 10;
  const largeIconSize = isSmallScreen ? 42 : 50;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const {
    error,
    isLoading,
    setError,
    sendForgotPasswordOtp,
    verifyPasswordOtp,
  } = useAuth();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { formattedTime, canResend: timerReady, restartTimer } = useOtpTimer(10 * 60);
  const isConfirming = isLoading('verifyPasswordOtp');
  const isResending = isLoading('sendForgotPasswordOtp');

  const handleChange = (value: string, index: number) => {
    const cleanValue = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = cleanValue;
    setOtp(next);

    if (cleanValue && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const otpCode = otp.join('');
  const isComplete = otp.every((d) => d.length === 1);
  const canConfirm = isComplete && !isConfirming;
  const canResend = timerReady && !isResending && !isConfirming;

  const handleConfirm = async () => {
    if (!email) {
      setError('يرجى الرجوع وإدخال البريد الإلكتروني.');
      return;
    }
    if (!isComplete) {
      setError('يرجى إدخال رمز التحقق كاملًا.');
      return;
    }

    try {
      await verifyPasswordOtp(email, otpCode);
      router.push({ pathname: './reset-password', params: { email, otp: otpCode } });
    } catch {}
  };

  const handleResend = async () => {
    if (!email) {
      setError('يرجى الرجوع وإدخال البريد الإلكتروني.');
      return;
    }
    try {
      await sendForgotPasswordOtp(email);
      restartTimer();
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

      <View style={[styles.lockCard, { marginTop: isSmallScreen ? 8 : 18 }]}>
        <Ionicons name="lock-closed-outline" size={largeIconSize} color="#B28CFF" />
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: isSmallScreen ? 28 : 32 }]}>أدخل رمز التحقق</Text>
        <Text style={[styles.subtitle, { fontSize: isSmallScreen ? 12 : 13 }]}>
          تم إرسال رمز مكوّن من 6 أرقام إلى
          {'\n'}
          {email || 'البريد الإلكتروني'}
        </Text>
      </View>

      <View style={styles.panel}>
        <View style={[styles.otpRow, { gap: otpGap }]}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              style={[
                styles.otpInput,
                { width: otpBoxSize, height: isSmallScreen ? 58 : 62 },
                digit ? styles.otpFilled : undefined,
              ]}
              textAlign="center"
              placeholder=""
              placeholderTextColor="#7A6A9D"
              selectTextOnFocus
            />
          ))}
        </View>

        <View style={styles.timerWrap}>
          <Text style={styles.timerText}>{formattedTime}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.85} style={[styles.resendWrap, !canResend && styles.resendWrapDisabled]} onPress={handleResend} disabled={!canResend}>
          {isResending ? <ActivityIndicator color="#BFA8F6" size="small" /> : <Text style={styles.resendText}>{canResend ? 'إعادة إرسال الرمز' : 'يمكن الإرسال بعد انتهاء الوقت'}</Text>}
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          activeOpacity={0.92}
          style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
          disabled={!canConfirm}
          onPress={handleConfirm}>
          {isConfirming ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>{canConfirm ? 'متابعة' : 'أدخل الرمز كاملًا'}</Text>}
        </TouchableOpacity>
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    ...authShared.content,
  },
  panel: {
    ...authShared.panel,
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
  otpRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  otpInput: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: '#F3EAFF',
    fontSize: 20,
    fontFamily: typography.fontFamily.bold,
    fontWeight: '700',
  },
  otpFilled: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.surfaceSecondary,
  },
  timerWrap: {
    marginTop: 16,
    alignSelf: 'center',
    minWidth: 96,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    color: '#C9B3FF',
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
  },
  resendWrap: {
    marginTop: 20,
    alignSelf: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#3B2D59',
    paddingBottom: 4,
  },
  resendWrapDisabled: {
    opacity: 0.5,
  },
  resendText: {
    color: '#BFA8F6',
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
  },
  errorText: {
    ...authShared.errorText,
  },
  confirmButton: {
    marginTop: 18,
    marginBottom: 4,
    width: '88%',
    alignSelf: 'center',
    minHeight: 44,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: '#CBB1FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    color: colors.text,
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
    fontWeight: '800',
    textAlign: 'center',
  },
});
