import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { authClassNames } from '@/components/auth/authTheme';
import { colors } from '@/theme';

type Props = {
  onPress: () => void;
};

export default function AuthBackButton({ onPress }: Props) {
  return (
    <View className={authClassNames.screen.topRow}>
      <TouchableOpacity
        className={authClassNames.screen.backButton}
        onPress={onPress}
        activeOpacity={0.85}>
        <Ionicons name="arrow-forward" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}
