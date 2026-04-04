import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import { typography } from '@/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 370 || height < 760;
  const iconSize = isSmallScreen ? 40 : 48;
  const { error, clearError, isLoading, sendForgotPasswordOtp, setError } = useAuth();
  const [email, setEmail] = useState('');
  const loading = isLoading('sendForgotPasswordOtp');
  const canSubmit = Boolean(email.trim()) && !loading;

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني.');
      return;
    }

    try {
      await sendForgotPasswordOtp(email.trim());
      router.push({ pathname: './verify-code', params: { email: email.trim() } });
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
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="arrow-forward" size={18} color="#B8B0D8" />
        </TouchableOpacity>
      </View>

      <View style={[styles.iconCard, { marginTop: isSmallScreen ? 16 : 26 }]}>
        <Ionicons name="mail-open-outline" size={iconSize} color="#B28CFF" />
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: isSmallScreen ? 26 : 30 }]}>نسيت كلمة المرور؟</Text>
        <Text style={[styles.subtitle, { fontSize: isSmallScreen ? 12 : 13 }]}>
          لا تقلق. أدخل بريدك الإلكتروني وسنرسل لك
          {'\n'}
          رمز التحقق لإعادة تعيين كلمة المرور.
        </Text>
      </View>

      <View style={styles.panel}>
        <View style={styles.fieldWrap}>
          <AuthField
            label="البريد الإلكتروني"
            placeholder="example@domain.com"
            icon="mail-outline"
            keyboardType="email-address"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (error) clearError();
            }}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <AuthPrimaryButton
          title={canSubmit ? 'إرسال رمز التحقق' : 'أدخل البريد الإلكتروني'}
          loading={loading}
          disabled={!canSubmit}
          onPress={handleSendOtp}
          marginTop={18}
        />
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    ...authShared.content,
  },
  panel: {
    ...authShared.panel,
    marginTop: 24,
  },
  topRow: {
    ...authShared.topRow,
  },
  backButton: {
    ...authShared.backButton,
  },
  iconCard: {
    ...authShared.iconCard,
  },
  header: {
    ...authShared.header,
    marginTop: 24,
  },
  title: {
    ...authShared.title,
    fontFamily: typography.fontFamily.bold,
  },
  subtitle: {
    ...authShared.subtitle,
    fontFamily: typography.fontFamily.bold,
  },
  fieldWrap: {
    marginTop: 20,
  },
  errorText: {
    ...authShared.errorText,
  },
});
