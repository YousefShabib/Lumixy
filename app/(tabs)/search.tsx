import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/theme';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>البحث</Text>
      <Text style={styles.text}>هنا نضيف لاحقًا البحث عن الخدمات أو مزودي الخدمة.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 28,
    marginBottom: 10,
  },
  text: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
});
