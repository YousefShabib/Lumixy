import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { useForm } from 'react-hook-form';

import AuthBackButton from '@/components/auth/AuthBackButton';
import AuthControlledField from '@/components/auth/AuthControlledField';
import AuthPrimaryButton from '@/components/auth/AuthPrimaryButton';
import AuthScreenShell from '@/components/auth/AuthScreenShell';
import { authClassNames, authStyles } from '@/components/auth/authTheme';
import {
  PASSWORD_MIN_LENGTH,
  authValidationMessages,
} from '@/components/auth/authValidation';
import useAuth from '@/hooks/useAuth';
import { colors } from '@/theme';

type ResetPasswordFormValues = {
  confirmPassword: string;
  password: string;
};

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; otp?: string }>();
  const email = String(params.email ?? '');
  const otp = String(params.otp ?? '');

  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 370 || height < 760;
  const iconCardMarginClassName = isSmallScreen ? 'mt-2' : 'mt-[18px]';
  const titleClassName = isSmallScreen ? 'text-[28px] leading-[48px]' : 'text-[32px] leading-[48px]';
  const subtitleClassName =
    isSmallScreen ? 'text-[12px] leading-[25px]' : 'text-[13px] leading-[25px]';
  const largeIconSize = isSmallScreen ? 42 : 50;
  const fieldGroupClassName = 'gap-[14px]';
  const { error, clearError, isLoading, resetPassword, setError } = useAuth();
  const {
    control,
    formState: { isValid },
    getValues,
    handleSubmit,
    trigger,
    watch,
  } = useForm<ResetPasswordFormValues>({
    defaultValues: {
      confirmPassword: '',
      password: '',
    },
    mode: 'onChange',
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');
  const loading = isLoading('resetPassword');
  const canSubmit = isValid && !loading;

  useEffect(() => {
    if (confirmPasswordValue) {
      void trigger('confirmPassword');
    }
  }, [confirmPasswordValue, passwordValue, trigger]);

  const onSubmit = handleSubmit(async (values) => {
    if (!email || !otp) {
      setError('انتهت الجلسة. يرجى إعادة إرسال الرمز.');
      return;
    }

    try {
      await resetPassword(email, otp, values.password, values.confirmPassword);
      setIsSuccess(true);
    } catch {}
  });

  return (
    <AuthScreenShell
      isSmallScreen={isSmallScreen}
      topPaddingSmall={20}
      topPaddingLarge={34}
      bottomPaddingSmall={24}
      bottomPaddingLarge={34}>
      <AuthBackButton onPress={() => router.back()} />

      <View
        className={`${authClassNames.screen.iconCard} ${iconCardMarginClassName} rounded-[30px]`}
        style={[
          authStyles.iconCardShadow,
          isSuccess ? authStyles.successIconCard : undefined,
        ]}>
        <Ionicons
          name={isSuccess ? 'checkmark-circle' : 'shield-checkmark-outline'}
          size={largeIconSize}
          color={isSuccess ? colors.success : colors.accent}
        />
      </View>

      <View className="mt-[22px] items-center">
        <Text className={`${authClassNames.text.title} ${titleClassName} pt-[10px] text-center`}>
          {isSuccess ? 'تم تغيير كلمة المرور' : 'تعيين كلمة مرور جديدة'}
        </Text>
        <Text
          className={`${authClassNames.text.subtitle} ${subtitleClassName} mt-[10px] text-center`}>
          {isSuccess
            ? 'تم تحديث كلمة المرور بنجاح.'
            : `أدخل كلمة مرور جديدة لحسابك\n${email || 'البريد الإلكتروني'}`}
        </Text>
      </View>

      <View className={`${authClassNames.screen.panel} mt-[18px]`}>
        {isSuccess ? (
          <View className="items-center pb-[6px] pt-2">
            <View className="mb-[18px] flex-row-reverse items-center gap-2 rounded-full bg-success px-[14px] py-2">
              <Ionicons name="sparkles" size={18} color="#0A2D1C" />
              <Text className="font-cairo-bold text-[13px] text-[#0A2D1C]">نجاح</Text>
            </View>
            <Text className="mb-1 text-center font-cairo-bold text-[23px] text-text">
              كلمة المرور الجديدة أصبحت فعالة
            </Text>
            <AuthPrimaryButton
              title="الذهاب إلى تسجيل الدخول"
              onPress={() => router.replace('/auth/login')}
              marginTop={22}
              fullWidth="88%"
            />
          </View>
        ) : (
          <View className={fieldGroupClassName}>
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
                required: authValidationMessages.requiredResetPassword,
              }}
              label="كلمة المرور الجديدة"
              placeholder="كلمة المرور الجديدة"
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
              placeholder="تأكيد كلمة المرور الجديدة"
              secureTextEntry
              icon="shield-checkmark-outline"
            />

            {error ? <Text className={authClassNames.text.error}>{error}</Text> : null}

            <AuthPrimaryButton
              title={canSubmit ? 'حفظ كلمة المرور' : 'أدخل البيانات كاملة'}
              loading={loading}
              disabled={!canSubmit}
              onPress={onSubmit}
              marginTop={18}
              fullWidth="88%"
            />
          </View>
        )}
      </View>
    </AuthScreenShell>
  );
}
