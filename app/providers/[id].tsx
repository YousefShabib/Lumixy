import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/theme';

export default function ProviderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تفاصيل المزود</Text>
      <Text style={styles.text}>المعرف الحالي: {id ?? 'غير محدد'}</Text>
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
    fontSize: 26,
    marginBottom: 10,
  },
  text: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    textAlign: 'center',
  },
});
