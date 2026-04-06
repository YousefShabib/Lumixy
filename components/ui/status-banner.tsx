import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

type StatusTone = 'error' | 'info' | 'success' | 'warning';

const toneConfig: Record<
  StatusTone,
  {
    actionClassName: string;
    borderClassName: string;
    containerClassName: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    iconColor: string;
  }
> = {
  error: {
    actionClassName: 'text-admin-danger',
    borderClassName: 'border-admin-danger/20',
    containerClassName: 'bg-admin-danger/10',
    icon: 'alert-circle-outline',
    iconColor: '#EF4444',
  },
  info: {
    actionClassName: 'text-admin-primaryLight',
    borderClassName: 'border-admin-primaryLight/20',
    containerClassName: 'bg-admin-primaryLight/10',
    icon: 'information-circle-outline',
    iconColor: '#8B5CF6',
  },
  success: {
    actionClassName: 'text-admin-success',
    borderClassName: 'border-admin-success/20',
    containerClassName: 'bg-admin-success/10',
    icon: 'checkmark-circle-outline',
    iconColor: '#10B981',
  },
  warning: {
    actionClassName: 'text-admin-warning',
    borderClassName: 'border-admin-warning/20',
    containerClassName: 'bg-admin-warning/10',
    icon: 'warning-outline',
    iconColor: '#F59E0B',
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
      className={`min-h-[52px] flex-row items-center justify-between gap-3 rounded-[18px] border px-3.5 py-3 ${config.containerClassName} ${config.borderClassName}`}>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <Text className={`font-cairo-bold text-[12px] ${config.actionClassName}`}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}

      <Text className="flex-1 text-right font-cairo-bold text-[13px] leading-5 text-admin-text">
        {message}
      </Text>
      <Ionicons color={config.iconColor} name={config.icon} size={18} />
    </View>
  );
}
