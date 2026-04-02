import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography } from '@/theme';

const categories = [
  {
    id: 'halls',
    title: 'قاعات',
    count: '86 خدمة نشطة',
    color: '#F59E0B',
    icon: 'storefront-outline' as React.ComponentProps<typeof Ionicons>['name'],
  },
  {
    id: 'studios',
    title: 'استوديوهات',
    count: '124 خدمة نشطة',
    color: colors.primaryLight,
    icon: 'camera-outline' as React.ComponentProps<typeof Ionicons>['name'],
  },
  {
    id: 'events',
    title: 'تنظيم حفلات',
    count: '45 خدمة نشطة',
    color: '#3B82F6',
    icon: 'sparkles-outline' as React.ComponentProps<typeof Ionicons>['name'],
  },
  {
    id: 'outdoor',
    title: 'تصوير خارجي',
    count: '210 خدمة نشطة',
    color: '#34D399',
    icon: 'image-outline' as React.ComponentProps<typeof Ionicons>['name'],
  },
];

export default function ProvidersManagementScreen() {
  const [query, setQuery] = useState('');
  const { width } = useWindowDimensions();

  const horizontalPadding = 20;
  const gridGap = 14;
  const cardWidth = Math.min((width - horizontalPadding * 2 - gridGap) / 2, 220);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.background}>
        <LinearGradient
          colors={['rgba(167, 139, 250, 0.20)', 'rgba(167, 139, 250, 0.00)']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.topGlow}
        />
        <LinearGradient
          colors={['rgba(109, 40, 217, 0.22)', 'rgba(109, 40, 217, 0.00)']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.bottomGlow}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>إدارة القطاعات</Text>
              <Text style={styles.headerSubtitle}>إضافة وإدارة قطاعات المزودين</Text>
            </View>
          </View>

          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>إدارة القطاعات والخدمات</Text>
            <Text style={styles.heroDescription}>
              إضافة وإدارة قطاعات الخدمات للمزودين في المنصة
            </Text>
          </View>

          <Pressable style={styles.addCardWrapper} onPress={() => console.log('Add Category')}>
            <LinearGradient
              colors={[colors.primaryLight, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addCard}>
              <Text style={styles.addCardTitle}>إضافة قطاع جديد</Text>
              <Text style={styles.addCardSubtitle}>إنشاء فئة خدمات جديدة للمزودين</Text>

              <View style={styles.plusCircle}>
                <Ionicons name="add" size={28} color={colors.text} />
              </View>
            </LinearGradient>
          </Pressable>

          <View style={styles.searchBar}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="البحث عن قطاع أو خدمة معينة..."
              style={styles.searchInput}
            />
            <Feather name="search" size={20} color={colors.textMuted} />
          </View>

          <View style={styles.sectionHeader}>
            <Pressable>
              <Text style={styles.showAllText}>عرض الكل</Text>
            </Pressable>
            <Text style={styles.sectionTitle}>القطاعات الحالية</Text>
          </View>

          <View style={styles.grid}>
            {categories.map((category) => (
              <View key={category.id} style={[styles.card, { width: cardWidth }]}>
                <View style={styles.cardActions}>
                  <Pressable style={styles.actionButton}>
                    <Feather name="edit-2" size={14} color="rgba(255,255,255,0.58)" />
                  </Pressable>
                  <Pressable style={styles.actionButton}>
                    <Feather name="trash-2" size={14} color="rgba(255,255,255,0.46)" />
                  </Pressable>
                </View>

                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: `${category.color}1F`,
                      borderColor: `${category.color}40`,
                    },
                  ]}>
                  <Ionicons name={category.icon} size={28} color={category.color} />
                </View>

                <Text style={styles.cardTitle}>{category.title}</Text>
                <Text style={styles.cardCount}>{category.count}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    flex: 1,
    backgroundColor: '#09070D',
  },
  topGlow: {
    position: 'absolute',
    top: -18,
    right: -38,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  bottomGlow: {
    position: 'absolute',
    left: -60,
    bottom: 120,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 26,
    gap: 8,
  },
  heroTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 37,
    lineHeight: 44,
    textAlign: 'center',
  },
  heroDescription: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
  addCardWrapper: {
    marginTop: 24,
    borderRadius: 32,
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.26,
    shadowRadius: 30,
    elevation: 10,
  },
  addCard: {
    minHeight: 104,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 80,
    position: 'relative',
  },
  addCardTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    textAlign: 'center',
  },
  addCardSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
  },
  plusCircle: {
    position: 'absolute',
    right: 18,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  searchBar: {
    marginTop: 20,
    minHeight: 58,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  sectionHeader: {
    marginTop: 26,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
  },
  showAllText: {
    color: colors.primaryLight,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  card: {
    minHeight: 184,
    borderRadius: 26,
    backgroundColor: 'rgba(21, 20, 28, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActions: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardCount: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    textAlign: 'center',
  },
});
