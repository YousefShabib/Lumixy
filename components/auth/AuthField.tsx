import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { colors, typography } from '@/theme';

type Props = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
};

export default function AuthField({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry,
  keyboardType = 'default',
}: Props) {
  const [isHidden, setIsHidden] = useState(Boolean(secureTextEntry));

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        {icon ? <Ionicons name={icon} size={19} color="#8E6AC9" style={styles.inputIcon} /> : null}
        {secureTextEntry ? (
          <TouchableOpacity style={styles.eyeButton} onPress={() => setIsHidden((prev) => !prev)} activeOpacity={0.8}>
            <Ionicons name={isHidden ? 'eye-off-outline' : 'eye-outline'} size={20} color="#A88DDF" />
          </TouchableOpacity>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isHidden}
          keyboardType={keyboardType}
          autoCapitalize="none"
          style={[styles.input, secureTextEntry ? styles.inputWithEye : undefined]}
          textAlign="right"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: {
    alignItems: 'flex-end',
  },
  label: {
    color: '#B6A9D2',
    fontSize: 14,
    marginBottom: 8,
    fontFamily: typography.fontFamily.bold,
  },
  inputWrap: {
    width: '100%',
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingRight: 46,
    paddingLeft: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 15,
    fontFamily: typography.fontFamily.bold,
  },
  inputWithEye: {
    paddingLeft: 46,
  },
  inputIcon: {
    position: 'absolute',
    right: 14,
    top: 18,
  },
  eyeButton: {
    position: 'absolute',
    left: 14,
    top: 17,
    zIndex: 2,
  },
});
