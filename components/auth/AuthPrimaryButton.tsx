import React from 'react';
import { ActivityIndicator, DimensionValue, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors, typography } from '@/theme';

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

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.button, { width: fullWidth, marginTop, opacity: blocked ? 0.6 : 1 }]}
      onPress={onPress}
      disabled={blocked}>
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    minHeight: 46,
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: '#CBB1FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontWeight: '800',
    letterSpacing: 0.2,
    fontSize: 17,
  },
});
