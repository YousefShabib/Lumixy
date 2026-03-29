import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from './colors';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const Logo = ({ size = 'medium', style }: LogoProps) => {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const boxSize = isSmall ? 72 : isLarge ? 236 : 124;
  const fontSize = isSmall ? 14 : isLarge ? 40 : 22;
  const borderRadius = isSmall ? 20 : isLarge ? 62 : 34;

  return (
    <View style={[styles.logoBox, { width: boxSize, height: boxSize, borderRadius }, style]}>
      <Text style={[styles.logoText, { fontSize }]}>LUMIXY</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logoBox: {
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
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
