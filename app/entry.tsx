import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography } from '@/theme';

export default function EntryScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#2A1241', '#180A26', '#0B0611']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.container}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <LinearGradient
              colors={[colors.primaryLight, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroIcon}>
              <Ionicons name="sparkles" size={30} color={colors.text} />
            </LinearGradient>

            <Text style={styles.brand}>LUMIXY</Text>
            <Text style={styles.subtitle}>
              الرابط بينك وبين أفضل مزودي الخدمات في فلسطين
            </Text>
          </View>

          <View style={styles.cards}>
            <Pressable style={styles.cardPressable} onPress={() => router.replace('/(tabs)')}>
              <View style={[styles.card, styles.darkCard]}>
                <Ionicons
                  name="arrow-back"
                  size={26}
                  color="rgba(255,255,255,0.55)"
                  style={styles.arrow}
                />

                <View style={[styles.cardBadge, styles.darkBadge]}>
                  <Ionicons name="search-outline" size={24} color={colors.primaryLight} />
                </View>

                <View style={styles.cardTextBlock}>
                  <Text style={styles.cardTitle}>أبحث عن خدمة</Text>
                  <Text style={styles.cardText}>
                    تصفح كمستخدم للوصول إلى ما تحتاجه من خدمات منزلية، تقنية، أو مهنية
                  </Text>
                </View>
              </View>
            </Pressable>

            <Pressable style={styles.cardPressable} onPress={() => router.push('/login')}>
              <LinearGradient
                colors={['#A855F7', '#7C3AED', '#5B21B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, styles.primaryCard]}>
                <Ionicons
                  name="arrow-back"
                  size={26}
                  color="rgba(255,255,255,0.64)"
                  style={styles.arrow}
                />

                <View style={[styles.cardBadge, styles.lightBadge]}>
                  <MaterialCommunityIcons name="briefcase-outline" size={24} color={colors.text} />
                </View>

                <View style={styles.cardTextBlock}>
                  <Text style={styles.cardTitle}>أريد تقديم خدماتي</Text>
                  <Text style={styles.cardText}>
                    انضم إلى الشبكة وقدّم خدماتك لعملائك، نظّم خدماتك ووسّع نطاق أعمالك
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1D0D2E',
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 36,
    paddingBottom: 28,
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 38,
  },
  heroIcon: {
    width: 86,
    height: 86,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.34,
    shadowRadius: 24,
    elevation: 10,
  },
  brand: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 31,
    letterSpacing: 0.8,
    marginTop: 20,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.62)',
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 12,
    maxWidth: 255,
  },
  cards: {
    gap: 18,
  },
  cardPressable: {
    width: '100%',
  },
  card: {
    minHeight: 182,
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 18,
    overflow: 'hidden',
  },
  darkCard: {
    backgroundColor: 'rgba(20, 19, 28, 0.94)',
    borderWidth: 1.2,
    borderColor: 'rgba(139, 92, 246, 0.48)',
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  primaryCard: {
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.24,
    shadowRadius: 26,
    elevation: 10,
  },
  arrow: {
    position: 'absolute',
    left: 16,
    top: 26,
  },
  cardBadge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  darkBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.22)',
  },
  lightBadge: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  cardTextBlock: {
    marginTop: 40,
    alignItems: 'flex-end',
  },
  cardTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    textAlign: 'right',
  },
  cardText: {
    color: 'rgba(255,255,255,0.76)',
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'right',
    marginTop: 10,
    maxWidth: 235,
  },
});
