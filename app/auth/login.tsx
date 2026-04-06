import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { useForm } from 'react-hook-form';

import AuthBrandHeader from '@/components/auth/AuthBrandHeader';
import AuthControlledField from '@/components/auth/AuthControlledField';
import AuthPrimaryButton from '@/components/auth/AuthPrimaryButton';
import AuthScreenShell from '@/components/auth/AuthScreenShell';
import { authClassNames } from '@/components/auth/authTheme';
import { EMAIL_REGEX, authValidationMessages } from '@/components/auth/authValidation';
import useAuth from '@/hooks/useAuth';
import { getRouteForRole } from '@/services/authRoutes';
import { colors } from '@/theme';

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 370 || height < 760;
  const brandSpacingClassName = isSmallScreen ? 'mb-6' : 'mb-9';
  const loginLogoClassName = width < 370 ? 'text-[34px]' : 'text-[40px]';
  const loginTitleClassName =
    width < 370
      ? 'text-[26px] leading-[38px]'
      : width < 430
        ? 'text-[30px] leading-[42px]'
        : 'text-[32px] leading-[44px]';
  const loginSubtitleClassName = isSmallScreen
    ? 'text-[13px] leading-[22px]'
    : 'text-[15px] leading-[26px]';
  const fieldsGapClassName = isSmallScreen ? 'w-full gap-3' : 'w-full gap-4';
  const { error, clearError, isLoading, login } = useAuth();
  const {
    control,
    handleSubmit,
    watch,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });
  const emailValue = watch('email');
  const passwordValue = watch('password');
  const loading = isLoading('login');
  const canSubmit = Boolean(emailValue.trim() && passwordValue.trim()) && !loading;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await login({
        email: values.email.trim(),
        password: values.password,
      });
      router.replace(getRouteForRole(response.user.role));
    } catch {}
  });

  return (
    <AuthScreenShell
      isSmallScreen={isSmallScreen}
      topPaddingSmall={24}
      topPaddingLarge={40}
      bottomPaddingSmall={24}
      bottomPaddingLarge={36}
      contentContainerStyle={{ paddingHorizontal: 6 }}>
      <AuthBrandHeader
        brandColor={colors.primary}
        containerClassName={brandSpacingClassName}
        logoClassName={loginLogoClassName}
        subtitleClassName="mt-[6px] text-[11px] tracking-[2.8px]"
      />

      <View className={`${authClassNames.screen.panel} mt-2 rounded-[22px] py-[18px]`}>
        <View className="mb-5 items-end">
          <Text className={`${authClassNames.text.title} ${loginTitleClassName} text-right`}>
            تسجيل الدخول
          </Text>
          <Text
            className={`${authClassNames.text.subtitle} ${loginSubtitleClassName} mt-[10px] text-right`}>
            أهلًا بك. أدخل بريدك الإلكتروني وكلمة المرور وسنوجهك لحسابك مباشرة
          </Text>
        </View>

        <View className={fieldsGapClassName}>
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
            placeholder="provider@lumixy.ps"
            icon="mail-outline"
            keyboardType="email-address"
          />
          <AuthControlledField
            authError={error}
            clearAuthError={clearError}
            control={control}
            name="password"
            rules={{
              required: authValidationMessages.requiredPassword,
            }}
            label="كلمة المرور"
            placeholder="••••••••"
            secureTextEntry
            icon="lock-closed-outline"
          />
        </View>

        {error ? <Text className={authClassNames.text.error}>{error}</Text> : null}

        <Link href="/auth/forgot-password" asChild>
          <Text className="mt-3 self-end text-[14px] text-[#AFA4C5]">نسيت كلمة المرور؟</Text>
        </Link>

        <AuthPrimaryButton
          title={canSubmit ? 'تسجيل الدخول' : 'أدخل البيانات للمتابعة'}
          loading={loading}
          disabled={!canSubmit}
          onPress={onSubmit}
          marginTop={isSmallScreen ? 14 : 18}
        />

        <View className="mt-6 flex-row-reverse items-center justify-center">
          <Text className="font-cairo-bold text-[15px] text-textMuted">ليس لديك حساب ؟ </Text>
          <Link href="/auth/signup" asChild>
            <Text className="font-cairo-bold text-[16px] font-bold text-[#E6DEFF]">سجل الآن</Text>
          </Link>
        </View>

        <Link href="/entry" asChild>
          <Text className="mt-[34px] self-center font-cairo-bold text-[14px] text-[#8B8DAA]">
            العودة إلى الصفحة الرئيسية
          </Text>
        </Link>
      </View>
    </AuthScreenShell>
  );
}
