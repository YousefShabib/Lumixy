import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { typography } from '@/theme';

type StatusVariant = 'info' | 'success' | 'warning' | 'error';

type StatusMessageProps = {
  title: string;
  message?: string;
  variant?: StatusVariant;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const variantStyles: Record<
  StatusVariant,
  {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    iconColor: string;
    borderColor: string;
    backgroundColor: string;
    titleColor: string;
    messageColor: string;
    actionBackground: string;
  }
> = {
  info: {
    icon: 'information-circle-outline',
    iconColor: '#93C5FD',
    borderColor: 'rgba(96, 165, 250, 0.28)',
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
    titleColor: '#E0F2FE',
    messageColor: '#BFDBFE',
    actionBackground: 'rgba(59, 130, 246, 0.18)',
  },
  success: {
    icon: 'checkmark-circle-outline',
    iconColor: '#6EE7B7',
    borderColor: 'rgba(16, 185, 129, 0.28)',
    backgroundColor: 'rgba(6, 24, 18, 0.92)',
    titleColor: '#D1FAE5',
    messageColor: '#A7F3D0',
    actionBackground: 'rgba(16, 185, 129, 0.16)',
  },
  warning: {
    icon: 'alert-circle-outline',
    iconColor: '#FCD34D',
    borderColor: 'rgba(245, 158, 11, 0.28)',
    backgroundColor: 'rgba(35, 20, 5, 0.94)',
    titleColor: '#FEF3C7',
    messageColor: '#FDE68A',
    actionBackground: 'rgba(245, 158, 11, 0.18)',
  },
  error: {
    icon: 'warning-outline',
    iconColor: '#FDA4AF',
    borderColor: 'rgba(244, 63, 94, 0.28)',
    backgroundColor: 'rgba(41, 10, 18, 0.94)',
    titleColor: '#FFE4E6',
    messageColor: '#FECDD3',
    actionBackground: 'rgba(244, 63, 94, 0.18)',
  },
};

export function StatusMessage({
  title,
  message,
  variant = 'info',
  actionLabel,
  onActionPress,
  style,
}: StatusMessageProps) {
  const currentVariant = variantStyles[variant];

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: currentVariant.borderColor,
          backgroundColor: currentVariant.backgroundColor,
        },
        style,
      ]}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name={currentVariant.icon} size={21} color={currentVariant.iconColor} />
        </View>

        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: currentVariant.titleColor }]}>{title}</Text>
          {message ? (
            <Text style={[styles.message, { color: currentVariant.messageColor }]}>{message}</Text>
          ) : null}
        </View>
      </View>

      {actionLabel && onActionPress ? (
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: currentVariant.actionBackground },
            pressed && styles.actionButtonPressed,
          ]}
          onPress={onActionPress}>
          <Text style={[styles.actionText, { color: currentVariant.titleColor }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  content: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  message: {
    marginTop: 4,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actionButton: {
    alignSelf: 'flex-end',
    minWidth: 92,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPressed: {
    opacity: 0.88,
  },
  actionText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    writingDirection: 'rtl',
  },
});
