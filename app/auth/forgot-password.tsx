import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { useForm } from 'react-hook-form';

import AuthBackButton from '@/components/auth/AuthBackButton';
import AuthControlledField from '@/components/auth/AuthControlledField';
import AuthPrimaryButton from '@/components/auth/AuthPrimaryButton';
import AuthScreenShell from '@/components/auth/AuthScreenShell';
import { authClassNames, authStyles } from '@/components/auth/authTheme';
import { EMAIL_REGEX, authValidationMessages } from '@/components/auth/authValidation';
import useAuth from '@/hooks/useAuth';
import { colors } from '@/theme';

type ForgotPasswordFormValues = {
  email: string;
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 370 || height < 760;
  const iconCardMarginClassName = isSmallScreen ? 'mt-4' : 'mt-[26px]';
  const titleClassName = isSmallScreen ? 'text-[26px]' : 'text-[30px]';
  const subtitleClassName =
    isSmallScreen ? 'text-[12px] leading-[25px]' : 'text-[13px] leading-[25px]';
  const iconSize = isSmallScreen ? 40 : 48;
  const { error, clearError, isLoading, sendForgotPasswordOtp } = useAuth();
  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });
  const loading = isLoading('sendForgotPasswordOtp');
  const canSubmit = isValid && !loading;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const email = values.email.trim();
      await sendForgotPasswordOtp(email);
      router.push({ pathname: '/auth/verify-code', params: { email } });
    } catch {}
  });

  return (
    <AuthScreenShell
      isSmallScreen={isSmallScreen}
      topPaddingSmall={24}
      topPaddingLarge={40}
      bottomPaddingSmall={24}
      bottomPaddingLarge={36}>
      <AuthBackButton onPress={() => router.back()} />

      <View
        className={`${authClassNames.screen.iconCard} ${iconCardMarginClassName}`}
        style={[authStyles.iconCardShadow]}>
        <Ionicons name="mail-open-outline" size={iconSize} color={colors.accent} />
      </View>

      <View className="mt-6 items-center">
        <Text className={`${authClassNames.text.title} ${titleClassName} text-center`}>
          نسيت كلمة المرور؟
        </Text>
        <Text
          className={`${authClassNames.text.subtitle} ${subtitleClassName} mt-[10px] text-center`}>
          لا تقلق. أدخل بريدك الإلكتروني وسنرسل لك
          {'\n'}
          رمز التحقق لإعادة تعيين كلمة المرور.
        </Text>
      </View>

      <View className={`${authClassNames.screen.panel} mt-6`}>
        <View className="mt-5">
          <AuthControlledField
            authError={error}
            clearAuthError={clearError}
            control={control}
            name="email"
            rules={{
              pattern: {
                message: authValidationMessages.invalidEmail,
                value: EMAIL_REGEX,
              },
              required: authValidationMessages.requiredEmail,
            }}
            label="البريد الإلكتروني"
            placeholder="example@domain.com"
            icon="mail-outline"
            keyboardType="email-address"
          />
        </View>

        {error ? <Text className={authClassNames.text.error}>{error}</Text> : null}

        <AuthPrimaryButton
          title={canSubmit ? 'إرسال رمز التحقق' : 'أدخل البريد الإلكتروني'}
          loading={loading}
          disabled={!canSubmit}
          onPress={onSubmit}
          marginTop={18}
        />
      </View>
    </AuthScreenShell>
  );
}
