import React from 'react';
import { ActivityIndicator, DimensionValue, Text, TouchableOpacity } from 'react-native';

import { authClassNames, authStyles } from '@/components/auth/authTheme';

const WIDTH_CLASS_NAMES = {
  '88%': 'w-[88%]',
  '90%': 'w-[90%]',
} as const;

const MARGIN_TOP_CLASS_NAMES = {
  12: 'mt-3',
  14: 'mt-[14px]',
  18: 'mt-[18px]',
  22: 'mt-[22px]',
} as const;

type Props = {
  title: string;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  fullWidth?: DimensionValue;
  marginTop?: number;
};

export default function AuthPrimaryButton({
  title,
  disabled = false,
  loading = false,
  onPress,
  fullWidth = '90%',
  marginTop = 14,
}: Props) {
  const blocked = disabled || loading;
  const widthClassName =
    typeof fullWidth === 'string' ? WIDTH_CLASS_NAMES[fullWidth as keyof typeof WIDTH_CLASS_NAMES] ?? '' : '';
  const marginTopClassName =
    MARGIN_TOP_CLASS_NAMES[marginTop as keyof typeof MARGIN_TOP_CLASS_NAMES] ?? '';
  const buttonStateClassName = blocked
    ? authClassNames.button.primaryInactive
    : authClassNames.button.primaryActive;
  const textStateClassName = blocked
    ? authClassNames.button.primaryTextInactive
    : authClassNames.button.primaryTextActive;
  const fallbackStyle = {
    ...(widthClassName ? {} : { width: fullWidth }),
    ...(marginTopClassName ? {} : { marginTop }),
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className={`${authClassNames.button.primary} ${buttonStateClassName} ${widthClassName} ${marginTopClassName} ${
        blocked ? 'opacity-85' : authClassNames.state.active
      }`}
      style={[
        blocked ? authStyles.primaryButtonMutedShadow : authStyles.primaryButtonShadow,
        fallbackStyle,
      ]}
      onPress={onPress}
      disabled={blocked}>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className={`${authClassNames.button.primaryText} ${textStateClassName} tracking-[0.2px]`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
