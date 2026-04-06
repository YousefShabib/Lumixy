import { Link, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { useForm } from 'react-hook-form';

import AuthBrandHeader from '@/components/auth/AuthBrandHeader';
import AuthControlledField from '@/components/auth/AuthControlledField';
import AuthPrimaryButton from '@/components/auth/AuthPrimaryButton';
import AuthScreenShell from '@/components/auth/AuthScreenShell';
import { authClassNames } from '@/components/auth/authTheme';
import {
  EMAIL_REGEX,
  PASSWORD_MIN_LENGTH,
  PHONE_REGEX,
  authValidationMessages,
} from '@/components/auth/authValidation';
import useAuth from '@/hooks/useAuth';
import { getRouteForRole } from '@/services/authRoutes';
import { colors } from '@/theme';

type SignupFormValues = {
  confirmPassword: string;
  email: string;
  fullName: string;
  password: string;
  phone: string;
};

export default function SignupScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 370 || height < 760;
  const brandSpacingClassName = isSmallScreen ? 'mb-[10px]' : 'mb-[14px]';
  const logoClassName = width < 370 ? 'text-[30px]' : width < 430 ? 'text-[32px]' : 'text-[34px]';
  const isVerySmallScreen = width < 350;
  const titleClassName = isVerySmallScreen
    ? 'text-[23px] leading-[35px]'
    : width < 370
      ? 'text-[24px] leading-[36px]'
      : width < 430
        ? 'text-[26px] leading-[38px]'
        : 'text-[28px] leading-[40px]';
  const subtitleClassName =
    width < 370 ? 'text-[12px] leading-[20px]' : 'text-[13px] leading-[21px]';
  const titleBlockClassName = isSmallScreen ? 'mb-3 items-end' : 'mb-4 items-end';
  const fieldsGapClassName = isSmallScreen ? 'w-full gap-3' : 'w-full gap-[14px]';
  const { error, clearError, isLoading, register } = useAuth();
  const {
    control,
    formState: { isValid },
    getValues,
    handleSubmit,
    trigger,
    watch,
  } = useForm<SignupFormValues>({
    defaultValues: {
      confirmPassword: '',
      email: '',
      fullName: '',
      password: '',
      phone: '',
    },
    mode: 'onChange',
  });
  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');
  const loading = isLoading('register');
  const canSubmit = isValid && !loading;

  useEffect(() => {
    if (confirmPasswordValue) {
      void trigger('confirmPassword');
    }
  }, [confirmPasswordValue, passwordValue, trigger]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await register({
        full_name: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
        password_confirmation: values.confirmPassword,
      });
      router.replace(getRouteForRole(response.user.role));
    } catch {}
  });

  return (
    <AuthScreenShell
      isSmallScreen={isSmallScreen}
      topPaddingSmall={30}
      topPaddingLarge={36}
      bottomPaddingSmall={16}
      bottomPaddingLarge={20}
      contentContainerStyle={{ paddingHorizontal: 2 }}>
      <AuthBrandHeader
        brandColor={colors.primary}
        containerClassName={brandSpacingClassName}
        logoClassName={logoClassName}
        subtitleClassName="mt-[2px] text-[9px] font-semibold tracking-[1.8px]"
      />

      <View className={`${authClassNames.screen.panel} mt-[10px] px-3`}>
        <View className={titleBlockClassName}>
          <Text className={`${authClassNames.text.title} ${titleClassName} pt-[6px] text-right`}>
            إنشاء حساب جديد
          </Text>
          <Text className={`${authClassNames.text.subtitle} ${subtitleClassName} mt-1 text-right`}>
            انضم إلى شبكة مزودي الخدمات في لومكسي وابدأ عملك اليوم
          </Text>
        </View>

        <View className={fieldsGapClassName}>
          <AuthControlledField
            authError={error}
            clearAuthError={clearError}
            control={control}
            name="fullName"
            rules={{
              minLength: {
                message: authValidationMessages.nameMinLength,
                value: 2,
              },
              required: authValidationMessages.requiredFullName,
            }}
            label="الاسم الكامل"
            placeholder="أدخل اسمك الكامل"
            icon="person-outline"
          />
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
            keyboardType="email-address"
            icon="mail-outline"
          />
          <AuthControlledField
            authError={error}
            clearAuthError={clearError}
            control={control}
            name="phone"
            rules={{
              validate: (value) =>
                value.trim().length === 0 ||
                PHONE_REGEX.test(value) ||
                authValidationMessages.invalidPhone,
            }}
            label="رقم الهاتف"
            placeholder="+970 5xx xxx xxx"
            keyboardType="phone-pad"
            icon="call-outline"
          />
          <AuthControlledField
            authError={error}
            clearAuthError={clearError}
            control={control}
            name="password"
            rules={{
              minLength: {
                message: authValidationMessages.passwordMinLength,
                value: PASSWORD_MIN_LENGTH,
              },
              required: authValidationMessages.requiredPassword,
            }}
            label="كلمة المرور"
            placeholder="••••••••"
            secureTextEntry
            icon="lock-closed-outline"
          />
          <AuthControlledField
            authError={error}
            clearAuthError={clearError}
            control={control}
            name="confirmPassword"
            rules={{
              required: authValidationMessages.requiredConfirmPassword,
              validate: (value) =>
                value === getValues('password') || authValidationMessages.confirmPasswordMismatch,
            }}
            label="تأكيد كلمة المرور"
            placeholder="••••••••"
            secureTextEntry
            icon="shield-checkmark-outline"
          />
        </View>

        {error ? <Text className={authClassNames.text.error}>{error}</Text> : null}

        <AuthPrimaryButton
          title={canSubmit ? 'إنشاء الحساب' : 'أكمل الحقول المطلوبة'}
          loading={loading}
          disabled={!canSubmit}
          onPress={onSubmit}
          marginTop={12}
        />

        <View className="mt-3 flex-row-reverse items-center justify-center">
          <Text className="font-cairo-bold text-[14px] text-textMuted">لديك حساب بالفعل؟ </Text>
          <Link href="/auth/login" asChild>
            <Text className="font-cairo-bold text-[14px] font-bold text-[#C5B8FF]">
              تسجيل الدخول
            </Text>
          </Link>
        </View>
      </View>
    </AuthScreenShell>
  );
}
