import React from 'react';
import { Text, View } from 'react-native';

import { authClassNames } from '@/components/auth/authTheme';

type Props = {
  brandColor: string;
  containerClassName: string;
  logoClassName: string;
  subtitleClassName: string;
};

export default function AuthBrandHeader({
  brandColor,
  containerClassName,
  logoClassName,
  subtitleClassName,
}: Props) {
  return (
    <View className={`items-center ${containerClassName}`}>
      <Text className={`${authClassNames.brand.logo} ${logoClassName}`} style={{ color: brandColor }}>
        LUMIXY
      </Text>
      <Text className={`${authClassNames.brand.subtitle} ${subtitleClassName}`}>
        PREMIUM PROVIDER PORTAL
      </Text>
    </View>
  );
}
