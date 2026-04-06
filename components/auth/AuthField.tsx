import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { authClassNames } from '@/components/auth/authTheme';
import { colors } from '@/theme';

export type AuthFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  errorMessage?: string;
};

export default function AuthField({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  icon,
  secureTextEntry,
  keyboardType = 'default',
  errorMessage,
}: AuthFieldProps) {
  const [isHidden, setIsHidden] = useState(Boolean(secureTextEntry));
  const inputClassName = `${authClassNames.field.input} ${
    secureTextEntry ? authClassNames.field.inputWithEye : authClassNames.field.inputWithoutEye
  } ${errorMessage ? authClassNames.field.inputError : ''}`;

  return (
    <View className={authClassNames.field.wrapper}>
      <Text className={authClassNames.field.label}>{label}</Text>
      <View className={authClassNames.field.inputWrap}>
        {icon ? (
          <View className="absolute right-[14px] top-[18px] z-[1]">
            <Ionicons name={icon} size={19} color={colors.primaryLight} />
          </View>
        ) : null}
        {secureTextEntry ? (
          <TouchableOpacity
            className="absolute left-[14px] top-[17px] z-[2]"
            onPress={() => setIsHidden((prev) => !prev)}
            activeOpacity={0.8}>
            <Ionicons
              name={isHidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.accent}
            />
          </TouchableOpacity>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isHidden}
          keyboardType={keyboardType}
          autoCapitalize="none"
          className={inputClassName}
        />
      </View>
      {errorMessage ? <Text className={authClassNames.field.error}>{errorMessage}</Text> : null}
    </View>
  );
}
