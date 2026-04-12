import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusMessage } from '@/components/ui/status-message';
import {
  fetchPublicProviderDetails,
  formatWorkingDay,
  type PublicProviderDetails,
} from '@/services/public-directory';
import { colors, typography } from '@/theme';

function normalizeId(value: string | string[] | undefined) {
  const source = Array.isArray(value) ? value[0] : value;
  return source?.trim() || '';
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={16} color="#C084FC" />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

type ContactItem = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
};

export default function ProviderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const providerId = normalizeId(id);
  const [provider, setProvider] = useState<PublicProviderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!providerId) {
      setErrorMessage('تعذر تحديد المزود المطلوب.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    async function loadProvider() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextProvider = await fetchPublicProviderDetails(providerId, controller.signal);

        if (!isMounted) {
          return;
        }

        setProvider(nextProvider);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'تعذر تحميل بيانات المزود.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProvider();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [providerId, refreshKey]);

  const contactRows: ContactItem[] = [];

  if (provider?.whatsappNumber) {
    contactRows.push({
      icon: 'logo-whatsapp',
      label: 'واتساب',
      value: provider.whatsappNumber,
    });
  }

  if (provider?.instagramUsername) {
    contactRows.push({
      icon: 'logo-instagram',
      label: 'إنستغرام',
      value: `@${provider.instagramUsername.replace(/^@/, '')}`,
    });
  }

  if (provider?.facebookUrl) {
    contactRows.push({
      icon: 'logo-facebook',
      label: 'فيسبوك',
      value: provider.facebookUrl,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>تفاصيل المزود</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {isLoading && !provider ? (
          <View style={styles.centerState}>
            <ActivityIndicator color="#B04BFF" />
            <Text style={styles.centerStateText}>جاري تحميل بيانات المزود...</Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.statusWrap}>
            <StatusMessage
              title="تعذر فتح الملف الشخصي"
              message={errorMessage}
              variant="error"
              actionLabel="إعادة المحاولة"
              onActionPress={() => setRefreshKey((value) => value + 1)}
            />
          </View>
        ) : null}

        {provider ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            <View style={styles.heroCard}>
              {provider.imageUrl ? (
                <Image source={{ uri: provider.imageUrl }} contentFit="cover" style={styles.heroImage} />
              ) : (
                <View style={styles.heroImageFallback}>
                  <Ionicons name="person-circle-outline" size={72} color="#FFFFFF" />
                </View>
              )}

              <View style={styles.heroBody}>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>{provider.categoryName}</Text>
                </View>

                <Text style={styles.providerName}>{provider.name}</Text>

                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={15} color="#C084FC" />
                  <Text style={styles.locationText}>{provider.locationText}</Text>
                </View>

                <Text style={styles.bioText}>{provider.bio}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>الخدمات</Text>
              {provider.customServices.length > 0 ? (
                <View style={styles.chipsWrap}>
                  {provider.customServices.map((service) => (
                    <View key={service} style={styles.serviceChip}>
                      <Text style={styles.serviceChipText}>{service}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <StatusMessage
                  title="لا توجد خدمات تفصيلية مضافة"
                  message="التصنيف العام ظاهر، لكن قائمة الخدمات التفصيلية لم تُملأ بعد."
                  variant="info"
                />
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>وسائل التواصل</Text>
              {contactRows.length > 0 ? (
                <View style={styles.infoList}>
                  {contactRows.map((item) => (
                    <ContactRow
                      key={`${item.label}-${item.value}`}
                      icon={item.icon}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </View>
              ) : (
                <StatusMessage
                  title="لا توجد وسائل تواصل منشورة"
                  message="هذا المزود لم يضف بيانات التواصل العامة بعد."
                  variant="warning"
                />
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>أوقات العمل</Text>
              {provider.workingHours.length > 0 ? (
                <View style={styles.scheduleList}>
                  {provider.workingHours.map((hour) => (
                    <View key={hour.id} style={styles.scheduleRow}>
                      <Text style={styles.scheduleTime}>
                        {hour.isActive ? `${hour.startTime} - ${hour.endTime}` : 'غير متاح'}
                      </Text>
                      <Text style={styles.scheduleDay}>{formatWorkingDay(hour.dayOfWeek)}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <StatusMessage
                  title="لم تُضف ساعات العمل بعد"
                  message="يمكن للمزود تحديث جدول الدوام من لوحة الملف الشخصي."
                  variant="info"
                />
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>المعرض</Text>
              {provider.galleryImages.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.galleryRow}>
                  {provider.galleryImages.map((imageUrl, index) => (
                    <Image
                      key={`${imageUrl}-${index}`}
                      source={{ uri: imageUrl }}
                      contentFit="cover"
                      style={styles.galleryImage}
                    />
                  ))}
                </ScrollView>
              ) : (
                <StatusMessage
                  title="المعرض فارغ"
                  message="لم يضف المزود صورًا إلى المعرض حتى الآن."
                  variant="warning"
                />
              )}
            </View>
          </ScrollView>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  centerStateText: {
    color: '#D8D2E6',
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
  },
  statusWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 36,
    gap: 18,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#17131B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  heroImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#120A18',
  },
  heroImageFallback: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#23113A',
  },
  heroBody: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: 'flex-end',
  },
  heroBadge: {
    borderRadius: 14,
    backgroundColor: 'rgba(192, 132, 252, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroBadgeText: {
    color: '#F3E8FF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    writingDirection: 'rtl',
  },
  providerName: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
    marginTop: 12,
    textAlign: 'right',
  },
  locationRow: {
    marginTop: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    color: '#D8C7F7',
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    textAlign: 'right',
  },
  bioText: {
    marginTop: 12,
    color: '#C9C3D7',
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'right',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    textAlign: 'right',
  },
  chipsWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceChip: {
    borderRadius: 16,
    backgroundColor: '#17131B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  serviceChipText: {
    color: '#ECE8F5',
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    writingDirection: 'rtl',
  },
  infoList: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    backgroundColor: '#17131B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(192, 132, 252, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  infoLabel: {
    color: '#9B94AB',
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    marginBottom: 2,
    textAlign: 'right',
  },
  infoValue: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    textAlign: 'right',
  },
  scheduleList: {
    gap: 10,
  },
  scheduleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    backgroundColor: '#17131B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  scheduleDay: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
  },
  scheduleTime: {
    color: '#C9C3D7',
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
  },
  galleryRow: {
    flexDirection: 'row-reverse',
    paddingLeft: 4,
    gap: 12,
  },
  galleryImage: {
    width: 180,
    height: 128,
    borderRadius: 18,
    backgroundColor: '#17131B',
  },
});
