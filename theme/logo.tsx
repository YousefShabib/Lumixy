import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors } from './colors';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export function Logo({ size = 'medium', style }: LogoProps) {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const boxSize = isSmall ? 72 : isLarge ? 200 : 124;
  const fontSize = isSmall ? 14 : isLarge ? 34 : 22;
  const borderRadius = isSmall ? 20 : isLarge ? 52 : 34;

  return (
    <View style={[styles.logoBox, { width: boxSize, height: boxSize, borderRadius }, style]}>
      <Text style={[styles.logoText, { fontSize }]}>LUMIXY</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoBox: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#000',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  logoText: {
    color: '#F3F3F3',
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});
