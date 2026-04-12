import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type StyleProp,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusMessage } from '@/components/ui/status-message';
import { fetchHomeData, type HomeData, type ProviderItem, type ServiceItem } from '@/services/home';
import { colors, typography } from '@/theme';

type HeroCardProps = {
  rotatingMessage: string;
  onStartPress: () => void;
};

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

type ServiceCardProps = {
  service: ServiceItem;
  width: number;
  onPress: () => void;
};

type ProviderCardProps = {
  provider: ProviderItem;
  width: number;
};

type AnimatedTapProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
  pressScale?: number;
};

const defaultRotatingMessages = [
  'ابحث عن مزودي الخدمات المعتمدين',
  'تابع التصنيفات المتاحة لحظيًا',
  'اختر المزود المناسب بسهولة',
];

function AnimatedTap({
  children,
  onPress,
  style,
  hitSlop,
  pressScale = 0.95,
}: AnimatedTapProps) {
  const scale = React.useRef(new Animated.Value(1)).current;

  function animateTo(toValue: number) {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 28,
      bounciness: 6,
    }).start();
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animateTo(pressScale)}
      onPressOut={() => animateTo(1)}
      hitSlop={hitSlop}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

function HeroCard({ rotatingMessage, onStartPress }: HeroCardProps) {
  return (
    <LinearGradient
      colors={['#5F1DBB', '#8C36F3']}
      start={{ x: 0, y: 0.15 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}>
      <View style={styles.heroIconBox}>
        <Ionicons name="storefront-outline" size={20} color={colors.text} />
      </View>

      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>
          أهلًا بك في{'\n'}لوميكسي
        </Text>
        <Text style={styles.heroSubtitle}>
          تصفح الدليل العام للمزودين{'\n'}
          {rotatingMessage}
        </Text>
      </View>

      <View style={styles.heroButtonRow}>
        <AnimatedTap style={styles.heroButton} onPress={onStartPress}>
          <Text style={styles.heroButtonText}>ابدأ البحث</Text>
          <Ionicons name="arrow-back" size={17} color="#9D4DFF" />
        </AnimatedTap>
      </View>
    </LinearGradient>
  );
}

function SectionHeader({ title, actionLabel, onActionPress }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? (
        <AnimatedTap onPress={onActionPress} hitSlop={8} pressScale={0.92}>
          <Text style={styles.sectionLink}>{actionLabel}</Text>
        </AnimatedTap>
      ) : (
        <View />
      )}
    </View>
  );
}

function ServiceCard({ service, width, onPress }: ServiceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.servicePressable,
        { width },
        pressed && styles.cardPressed,
      ]}>
      <LinearGradient
        colors={service.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.serviceCard, { borderColor: service.borderColor }]}>
        <View style={[styles.serviceGlow, { backgroundColor: service.glowColor }]} />

        <View
          style={[
            styles.serviceIconWrap,
            {
              borderColor: service.borderColor,
              backgroundColor: `${service.iconTint}18`,
            },
          ]}>
          <Ionicons
            name={service.icon as React.ComponentProps<typeof Ionicons>['name']}
            size={25}
            color={service.iconTint}
          />
        </View>

        <Text style={[styles.serviceTitle, { color: service.textTint }]} numberOfLines={2}>
          {service.title}
        </Text>

        <View style={[styles.countPill, { backgroundColor: service.pillBackground }]}>
          <Text style={[styles.countText, { color: service.textTint }]}>{service.count}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function ProviderCard({ provider, width }: ProviderCardProps) {
  return (
    <View style={[styles.providerCard, { width }]}>
      <View style={styles.providerTopRow}>
        <View style={styles.providerAvatarWrap}>
          <LinearGradient
            colors={['#5B786D', '#6F9485']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.providerAvatar}>
            <Ionicons name="sparkles-outline" size={15} color="#D8E8DF" />
          </LinearGradient>
        </View>

        <View style={styles.providerTextBlock}>
          <Text style={styles.providerName} numberOfLines={1}>
            {provider.name}
          </Text>
          <View style={styles.providerCategoryRow}>
            <Ionicons name="pricetag-outline" size={12} color={provider.accent} />
            <Text style={[styles.providerCategory, { color: provider.accent }]} numberOfLines={1}>
              {provider.category}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.providerMetaPill}>
        <View style={styles.providerMetaSection}>
          <Ionicons name="construct-outline" size={14} color="#2CD0A1" />
          <Text style={styles.providerMetaText}>{provider.servicesLabel}</Text>
        </View>
        <View style={styles.providerMetaDivider} />
        <View style={styles.providerMetaSection}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.providerLocationText}>{provider.location}</Text>
        </View>
      </View>
    </View>
  );
}

function HorizontalSeparator() {
  return <View style={styles.itemSeparator} />;
}

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeMessageIndex, setActiveMessageIndex] = useState(0);
  const { data: homeData, isLoading, error, refetch } = useQuery<HomeData>({
    queryKey: ['home-data'],
    queryFn: ({ signal }) => fetchHomeData(signal),
  });
  const errorMessage = error instanceof Error ? error.message : null;
  const serviceCardWidth = Math.min(Math.max(width * 0.39, 102), 122);
  const providerCardWidth = Math.min(Math.max(width * 0.76, 214), 252);

  const rotatingMessages = homeData?.rotatingMessages?.length
    ? homeData.rotatingMessages
    : defaultRotatingMessages;

  useEffect(() => {
    setActiveMessageIndex(0);

    if (rotatingMessages.length < 2) {
      return undefined;
    }

    const timerId = setInterval(() => {
      setActiveMessageIndex((currentIndex) => (currentIndex + 1) % rotatingMessages.length);
    }, 3200);

    return () => {
      clearInterval(timerId);
    };
  }, [rotatingMessages]);

  const activeMessage = rotatingMessages[activeMessageIndex] ?? defaultRotatingMessages[0];
  const services = homeData?.services ?? [];
  const providers = homeData?.providers ?? [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.page}>
        <LinearGradient
          colors={['rgba(98, 37, 169, 0.36)', 'rgba(35, 10, 54, 0.12)', 'transparent']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.7, y: 0.42 }}
          style={styles.headerGlow}
        />

        <View style={styles.topOrb} />
        <View style={styles.heroOrb} />

        <View style={styles.header}>
          <Text style={styles.logo}>لوميكسي</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <HeroCard
            rotatingMessage={activeMessage}
            onStartPress={() => {
              router.push('/search');
            }}
          />

          {isLoading && !homeData ? (
            <StatusMessage
              style={styles.statusBlock}
              title="جاري تحميل الصفحة"
              message="نحصل الآن على التصنيفات والمزودين المعتمدين من Laravel."
              variant="info"
            />
          ) : null}

          {errorMessage ? (
            <StatusMessage
              style={styles.statusBlock}
              title="تعذر تحميل البيانات"
              message={errorMessage}
              variant="error"
              actionLabel="إعادة المحاولة"
              onActionPress={() => {
                void refetch();
              }}
            />
          ) : null}

          {!isLoading && !errorMessage && homeData && homeData.stats.approvedProviders === 0 ? (
            <StatusMessage
              style={styles.statusBlock}
              title="لا يوجد مزودون معتمدون حتى الآن"
              message="عند اعتماد أول مزود خدمة سيظهر هنا مباشرة في الصفحة الرئيسية والبحث."
              variant="warning"
            />
          ) : null}

          <SectionHeader title="التصنيفات المتاحة" />
          {services.length > 0 ? (
            <FlatList
              horizontal
              inverted
              data={services}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ServiceCard
                  service={item}
                  width={serviceCardWidth}
                  onPress={() => {
                    router.push({
                      pathname: '/search',
                      params: { categoryId: item.id },
                    });
                  }}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.servicesTrack}
              style={styles.horizontalCarousel}
              ItemSeparatorComponent={HorizontalSeparator}
              nestedScrollEnabled
            />
          ) : (
            <StatusMessage
              style={styles.emptySectionCard}
              title="لا توجد تصنيفات نشطة"
              message="فعّل تصنيفات الخدمة في لوحة الإدارة لتظهر هنا."
              variant="warning"
            />
          )}

          <SectionHeader
            title="المزودون الظاهرون الآن"
            actionLabel={providers.length > 0 ? 'عرض الكل' : undefined}
            onActionPress={() => {
              router.push('/search');
            }}
          />

          {providers.length > 0 ? (
            <FlatList
              horizontal
              inverted
              data={providers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ProviderCard provider={item} width={providerCardWidth} />}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.providersTrack}
              style={styles.horizontalCarousel}
              ItemSeparatorComponent={HorizontalSeparator}
              nestedScrollEnabled
            />
          ) : !isLoading ? (
            <StatusMessage
              style={styles.emptySectionCard}
              title="قائمة المزودين فارغة"
              message="بعد اعتماد مزود واحد على الأقل ستظهر بطاقاته هنا."
              variant="info"
            />
          ) : (
            <View style={styles.loaderRow}>
              <ActivityIndicator color="#B04BFF" />
            </View>
          )}
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
  headerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  topOrb: {
    position: 'absolute',
    top: -56,
    right: -34,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(117, 44, 214, 0.16)',
  },
  heroOrb: {
    position: 'absolute',
    top: 184,
    left: -68,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(104, 26, 182, 0.10)',
  },
  header: {
    height: 50,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(18, 8, 23, 0.72)',
  },
  logo: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 28,
    textAlign: 'left',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 16,
    paddingBottom: 124,
  },
  heroCard: {
    marginHorizontal: 16,
    minHeight: 182,
    borderRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.34,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  heroIconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.17)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    marginTop: 26,
    alignItems: 'flex-end',
  },
  heroTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
    lineHeight: 29,
    textAlign: 'right',
  },
  heroSubtitle: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.84)',
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'right',
  },
  heroButtonRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  heroButton: {
    marginTop: 14,
    minWidth: 136,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 7,
    alignSelf: 'flex-end',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  heroButtonText: {
    color: '#9D4DFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginLeft: 7,
  },
  statusBlock: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    textAlign: 'right',
    flex: 1,
    writingDirection: 'rtl',
  },
  sectionLink: {
    color: '#B04BFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    textAlign: 'left',
    writingDirection: 'rtl',
    minWidth: 60,
  },
  horizontalCarousel: {
    overflow: 'visible',
  },
  servicesTrack: {
    paddingHorizontal: 16,
  },
  providersTrack: {
    paddingHorizontal: 16,
  },
  itemSeparator: {
    width: 12,
  },
  servicePressable: {
    borderRadius: 20,
  },
  serviceCard: {
    minHeight: 114,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 11,
    borderWidth: 1,
    overflow: 'hidden',
  },
  serviceGlow: {
    position: 'absolute',
    top: -16,
    left: -18,
    width: 82,
    height: 82,
    borderRadius: 41,
  },
  serviceIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 13,
  },
  serviceTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  countPill: {
    alignSelf: 'center',
    marginTop: 9,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  countText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  providerCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(24, 11, 31, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(155, 99, 208, 0.18)',
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  providerTopRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  providerAvatarWrap: {
    position: 'relative',
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 2,
  },
  providerName: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    lineHeight: 23,
    textAlign: 'right',
  },
  providerCategoryRow: {
    marginTop: 2,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
  },
  providerCategory: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
  },
  providerMetaPill: {
    marginTop: 16,
    minHeight: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 13,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(14, 10, 19, 0.72)',
  },
  providerMetaSection: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  providerMetaDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  providerMetaText: {
    color: '#DDF9F1',
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
  },
  providerLocationText: {
    color: '#B8B4C2',
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
  },
  emptySectionCard: {
    marginHorizontal: 16,
  },
  loaderRow: {
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
