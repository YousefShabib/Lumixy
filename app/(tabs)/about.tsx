import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAboutContent, type AboutContent } from '@/services/offlight';
import { typography } from '@/theme';

function ContactCard({
  label,
  value,
  icon,
}: AboutContent['contacts'][number]) {
  return (
    <View style={styles.contactCard}>
      <View style={styles.contactMain}>
        <View style={styles.contactIconWrap}>
          <Ionicons
            name={icon as React.ComponentProps<typeof Ionicons>['name']}
            size={18}
            color="#9D4DFF"
          />
        </View>

        <View style={styles.contactTextWrap}>
          <Text style={styles.contactLabel}>{label}</Text>
          <Text style={styles.contactValue}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    let isMounted = true;

    getAboutContent()
      .then((content) => {
        if (isMounted) {
          setAboutContent(content);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  if (!aboutContent) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style="light" />
        <View style={styles.page} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.page}>
        <View style={styles.topGlow} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.screenTitle}>{aboutContent.screenTitle}</Text>

          <View style={styles.brandBlock}>
            <View style={styles.logoFrame}>
              <Text style={styles.logoText}>LUMIXY</Text>
            </View>

            <Text style={styles.brandName}>{aboutContent.brandName}</Text>
            <Text style={styles.brandDescription}>
              {aboutContent.brandDescription}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push('/auth/signup')}
            style={({ pressed }) => [styles.ctaPressable, pressed && styles.cardPressed]}>
            <LinearGradient
              colors={['#6A2CE0', '#8E45FF']}
              start={{ x: 0, y: 0.15 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaCard}>
              <View style={styles.ctaTextWrap}>
                <Text style={styles.ctaTitle}>{aboutContent.ctaTitle}</Text>
                <Text style={styles.ctaText}>{aboutContent.ctaText}</Text>
              </View>

              <View style={styles.ctaIconWrap}>
                <Ionicons name="briefcase-outline" size={21} color="#FFFFFF" />
              </View>

              <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.24)" />
            </LinearGradient>
          </Pressable>

          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubbles-outline" size={15} color="#9D4DFF" />
            <Text style={styles.sectionTitle}>{aboutContent.sectionTitle}</Text>
          </View>

          <View style={styles.contactsList}>
            {aboutContent.contacts.map((item) => (
              <ContactCard key={item.id} {...item} />
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
    backgroundColor: '#09030C',
  },
  page: {
    flex: 1,
    backgroundColor: '#09030C',
  },
  topGlow: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: 'rgba(121, 58, 214, 0.10)',
    borderRadius: 120,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 120,
  },
  screenTitle: {
    color: '#817A92',
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 26,
  },
  logoFrame: {
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#6D28D9',
    backgroundColor: '#0D0912',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6D28D9',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  logoText: {
    color: '#F1F5F9',
    fontFamily: typography.fontFamily.bold,
    fontSize: 23,
    letterSpacing: 0.8,
  },
  brandName: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    marginTop: 14,
    marginBottom: 6,
  },
  brandDescription: {
    color: '#9B94AB',
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  ctaCard: {
    minHeight: 104,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 34,
    shadowColor: '#6D28D9',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  ctaPressable: {
    marginBottom: 34,
  },
  ctaIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    textAlign: 'right',
    marginBottom: 2,
  },
  ctaText: {
    color: 'rgba(255,255,255,0.76)',
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
  },
  contactsList: {
    gap: 12,
    marginBottom: 28,
  },
  contactCard: {
    width: '100%',
    borderRadius: 21,
    backgroundColor: '#17131B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactMain: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  contactTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  contactLabel: {
    color: '#8A819B',
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    marginBottom: 2,
    textAlign: 'right',
  },
  contactValue: {
    color: '#E8E5F1',
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    textAlign: 'right',
  },
  contactIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(157, 77, 255, 0.25)',
    backgroundColor: 'rgba(157, 77, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
