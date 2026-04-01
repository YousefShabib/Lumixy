import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/theme';

export default function EntryScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />



      <View style={styles.cards}>
        <Pressable style={[styles.card, styles.cardDark]} onPress={() => router.replace('/(tabs)')}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>⌕</Text>
          </View>
          <Text style={styles.cardTitle}>ابحث عن خدمة</Text>
          <Text style={styles.cardText}>ادخل إلى الصفحة الرئيسية واستكشف مزودي الخدمات بسهولة.</Text>
        </Pressable>

        <Pressable
          style={[styles.card, styles.cardPrimary]}
          onPress={() => router.replace('/auth/login')}>
          <View style={[styles.badge, styles.badgeLight]}>
            <Text style={styles.badgeText}>▣</Text>
          </View>
          <Text style={styles.cardTitle}>أريد تقديم خدماتي</Text>
          <Text style={styles.cardText}>ابدأ من مسار مزود الخدمة وكمّل التجهيز بشكل مرتب.</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  glowTop: {
    position: 'absolute',
    top: 48,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(109, 40, 217, 0.18)',
  },
  glowBottom: {
    position: 'absolute',
    right: -50,
    bottom: 120,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(167, 139, 250, 0.14)',
  },
  hero: {
    alignItems: 'center',
    gap: 14,
  },
  brand: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  cards: {
    gap: 18,
  },
  card: {
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 22,
    borderWidth: 1,
  },
  cardDark: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  cardPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  badgeLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  badgeText: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 28,
    textAlign: 'right',
    marginBottom: 10,
  },
  cardText: {
    color: 'rgba(255,255,255,0.82)',
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
  },
});
