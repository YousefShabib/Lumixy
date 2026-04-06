import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';

import AuthBackButton from '@/components/auth/AuthBackButton';
import AuthScreenShell from '@/components/auth/AuthScreenShell';
import { authClassNames, authStyles } from '@/components/auth/authTheme';
import { OTP_LENGTH, authValidationMessages } from '@/components/auth/authValidation';
import useAuth from '@/hooks/useAuth';
import useOtpTimer from '@/hooks/useOtpTimer';
import { colors } from '@/theme';

type VerifyCodeFormValues = {
  otp: string;
};

export default function VerifyCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = String(params.email ?? '');

  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 370 || height < 760;
  const iconCardMarginClassName = isSmallScreen ? 'mt-2' : 'mt-[18px]';
  const titleClassName = isSmallScreen ? 'text-[28px] leading-[48px]' : 'text-[32px] leading-[48px]';
  const subtitleClassName =
    isSmallScreen ? 'text-[12px] leading-[25px]' : 'text-[13px] leading-[25px]';
  const otpGapClassName = width < 350 ? 'gap-[6px]' : width < 430 ? 'gap-2' : 'gap-[10px]';
  const otpSizeClassName =
    width < 350
      ? `w-[42px] ${isSmallScreen ? 'h-[58px]' : 'h-[62px]'}`
      : width < 390
        ? `w-[46px] ${isSmallScreen ? 'h-[58px]' : 'h-[62px]'}`
        : `w-[50px] ${isSmallScreen ? 'h-[58px]' : 'h-[62px]'}`;
  const largeIconSize = isSmallScreen ? 42 : 50;
  const { error, clearError, isLoading, sendForgotPasswordOtp, setError, verifyPasswordOtp } =
    useAuth();
  const {
    control,
    formState: { isValid },
    handleSubmit,
    watch,
  } = useForm<VerifyCodeFormValues>({
    defaultValues: {
      otp: '',
    },
    mode: 'onChange',
  });
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const otpCode = watch('otp');
  const { formattedTime, canResend: timerReady, restartTimer } = useOtpTimer(10 * 60);
  const isConfirming = isLoading('verifyPasswordOtp');
  const isResending = isLoading('sendForgotPasswordOtp');
  const canConfirm = isValid && !isConfirming;
  const isOtpComplete = otpCode.length === OTP_LENGTH;
  const isConfirmButtonActive = canConfirm && isOtpComplete;
  const canResend = timerReady && !isResending && !isConfirming;

  const onConfirm = handleSubmit(async (values) => {
    if (!email) {
      setError('يرجى الرجوع وإدخال البريد الإلكتروني.');
      return;
    }

    try {
      await verifyPasswordOtp(email, values.otp);
      router.push({ pathname: '/auth/reset-password', params: { email, otp: values.otp } });
    } catch {}
  });

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
      bottomPaddingLarge={34}>
      <AuthBackButton onPress={() => router.back()} />

      <View
        className={`${authClassNames.screen.iconCard} ${iconCardMarginClassName}`}
        style={[authStyles.iconCardShadow]}>
        <Ionicons name="lock-closed-outline" size={largeIconSize} color={colors.accent} />
      </View>

      <View className="mt-[22px] items-center">
        <Text className={`${authClassNames.text.title} ${titleClassName} pt-[10px] text-center`}>
          أدخل رمز التحقق
        </Text>
        <Text
          className={`${authClassNames.text.subtitle} ${subtitleClassName} mt-[10px] text-center`}>
          تم إرسال رمز مكوّن من 6 أرقام إلى
          {'\n'}
          {email || 'البريد الإلكتروني'}
        </Text>
      </View>

      <View className={`${authClassNames.screen.panel} mt-[18px]`}>
        <Controller
          control={control}
          name="otp"
          rules={{
            minLength: {
              message: authValidationMessages.incompleteOtp,
              value: OTP_LENGTH,
            },
            required: authValidationMessages.requiredOtp,
            validate: (value) =>
              new RegExp(`^\\d{${OTP_LENGTH}}$`).test(value) || authValidationMessages.invalidOtp,
          }}
          render={({ field, fieldState }) => {
            const digits = Array.from({ length: OTP_LENGTH }, (_, index) => field.value[index] ?? '');

            const handleChange = (value: string, index: number) => {
              const cleanValue = value.replace(/\D/g, '').slice(-1);
              const nextDigits = [...digits];
              nextDigits[index] = cleanValue;

              field.onChange(nextDigits.join(''));
              if (error) {
                clearError();
              }

              if (cleanValue && index < OTP_LENGTH - 1) {
                inputRefs.current[index + 1]?.focus();
              }
            };

            const handleKeyPress = (key: string, index: number) => {
              if (key === 'Backspace' && !digits[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
              }
            };

            return (
              <>
                <View className={`mt-6 flex-row justify-center ${otpGapClassName}`}>
                  {digits.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(element) => {
                        inputRefs.current[index] = element;
                      }}
                      value={digit}
                      onBlur={field.onBlur}
                      onChangeText={(text) => handleChange(text, index)}
                      onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      className={`${otpSizeClassName} rounded-[14px] border bg-surface text-center font-cairo-bold text-[20px] font-bold text-[#F3EAFF] ${
                        digit ? 'border-primaryLight bg-surfaceSecondary' : 'border-border'
                      }`}
                      placeholder=""
                      placeholderTextColor="#7A6A9D"
                      selectTextOnFocus
                    />
                  ))}
                </View>
                {fieldState.error ? (
                  <Text className={authClassNames.field.error}>{fieldState.error.message}</Text>
                ) : null}
              </>
            );
          }}
        />

        <View className="mt-4 h-[38px] min-w-[96px] self-center items-center justify-center rounded-[20px] border border-border bg-surface px-4">
          <Text className="font-cairo-bold text-[16px] text-[#C9B3FF]">{formattedTime}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          className={`mt-5 self-center border-b border-[#3B2D59] pb-1 ${
            canResend ? authClassNames.state.active : authClassNames.state.muted
          }`}
          onPress={handleResend}
          disabled={!canResend}>
          {isResending ? (
            <ActivityIndicator color="#BFA8F6" size="small" />
          ) : (
            <Text className="font-cairo-bold text-[16px] text-[#BFA8F6]">
              {canResend ? 'إعادة إرسال الرمز' : 'يمكن الإرسال بعد انتهاء الوقت'}
            </Text>
          )}
        </TouchableOpacity>

        {error ? <Text className={authClassNames.text.error}>{error}</Text> : null}

        <TouchableOpacity
          activeOpacity={0.92}
          className={`${authClassNames.button.primary} ${
            isConfirmButtonActive
              ? authClassNames.button.primaryActive
              : authClassNames.button.primaryInactive
          } mb-1 mt-[18px] min-h-[44px] w-[88%] px-[18px] py-[6px] ${
            isConfirmButtonActive ? authClassNames.state.active : authClassNames.state.muted
          }`}
          style={[
            isConfirmButtonActive
              ? authStyles.confirmButtonShadow
              : authStyles.primaryButtonMutedShadow,
          ]}
          disabled={!isConfirmButtonActive}
          onPress={onConfirm}>
          {isConfirming ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              className={`${authClassNames.button.primaryText} ${
                isConfirmButtonActive
                  ? authClassNames.button.primaryTextActive
                  : authClassNames.button.primaryTextInactive
              } text-center text-[16px]`}>
              {isConfirmButtonActive ? 'متابعة' : 'أدخل الرمز كاملًا'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </AuthScreenShell>
  );
}
