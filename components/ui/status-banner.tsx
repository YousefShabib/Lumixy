import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/theme';

type StatusTone = 'error' | 'info' | 'success' | 'warning';

const toneConfig: Record<
  StatusTone,
  { background: string; border: string; color: string; icon: React.ComponentProps<typeof Ionicons>['name'] }
> = {
  error: {
    background: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.18)',
    color: colors.error,
    icon: 'alert-circle-outline',
  },
  info: {
    background: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.18)',
    color: colors.primaryLight,
    icon: 'information-circle-outline',
  },
  success: {
    background: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.18)',
    color: colors.success,
    icon: 'checkmark-circle-outline',
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.18)',
    color: colors.warning,
    icon: 'warning-outline',
  },
};

type StatusBannerProps = {
  actionLabel?: string;
  message: string;
  onAction?: () => void;
  tone?: StatusTone;
};

export default function StatusBanner({
  actionLabel,
  message,
  onAction,
  tone = 'info',
}: StatusBannerProps) {
  const config = toneConfig[tone];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.background,
          borderColor: config.border,
        },
      ]}>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <Text style={[styles.actionText, { color: config.color }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}

      <Text style={styles.message}>{message}</Text>
      <Ionicons name={config.icon} size={18} color={config.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  message: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
  },
  actionText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
  },
});
