import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AdminDetailShellProps = {
  badge?: string;
  children: ReactNode;
  notice?: string;
  noticeTone?: 'primary' | 'success' | 'warning';
  subtitle?: string;
  title: string;
  titleClassName?: string;
};

const noticeTones = {
  primary: {
    colors: ['rgba(139, 92, 246, 0.22)', 'rgba(109, 40, 217, 0.10)'] as [string, string],
    iconColor: '#8B5CF6',
  },
  success: {
    colors: ['rgba(16, 185, 129, 0.22)', 'rgba(16, 185, 129, 0.10)'] as [string, string],
    iconColor: '#10B981',
  },
  warning: {
    colors: ['rgba(245, 158, 11, 0.22)', 'rgba(245, 158, 11, 0.10)'] as [string, string],
    iconColor: '#F59E0B',
  },
};

export default function AdminDetailShell({
  badge = 'إدارة الأدمن',
  children,
  notice,
  noticeTone = 'primary',
  subtitle,
  title,
  titleClassName,
}: AdminDetailShellProps) {
  const router = useRouter();
  const tone = noticeTones[noticeTone];

  return (
    <SafeAreaView className="flex-1 bg-admin-background" edges={['top']}>
      <StatusBar style="light" />

      <View className="flex-1 bg-admin-background">
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.18)', 'rgba(139, 92, 246, 0.00)']}
          end={{ x: 0, y: 1 }}
          start={{ x: 1, y: 0 }}
          style={{
            borderRadius: 999,
            height: 220,
            position: 'absolute',
            right: -42,
            top: -34,
            width: 220,
          }}
        />
        <LinearGradient
          colors={['rgba(109, 40, 217, 0.18)', 'rgba(109, 40, 217, 0.00)']}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 1 }}
          style={{
            borderRadius: 999,
            bottom: 120,
            height: 260,
            left: -70,
            position: 'absolute',
            width: 260,
          }}
        />

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 px-5 pb-7 pt-3.5"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-row-reverse items-center gap-3">
            <Pressable
              className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5"
              onPress={() => router.replace('/admin/tabs/profile')}>
              <Ionicons color="#FFFFFF" name="arrow-forward" size={20} />
            </Pressable>

            <View className="flex-1 items-end">
              <Text
                className={`text-right font-cairo-bold text-admin-text ${
                  titleClassName ?? 'text-[28px]'
                }`}>
                {title}
              </Text>
              {subtitle ? (
                <Text className="mt-0.5 text-right font-cairo text-[13px] text-admin-muted">
                  {subtitle}
                </Text>
              ) : null}
            </View>

            <View className="rounded-full border border-admin-accent/20 bg-admin-primaryLight/10 px-3 py-2">
              <Text className="font-cairo-bold text-[12px] text-admin-accent">{badge}</Text>
            </View>
          </View>

          {notice ? (
            <LinearGradient
              colors={tone.colors}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={{
                alignItems: 'center',
                borderColor: 'rgba(255,255,255,0.05)',
                borderRadius: 20,
                borderWidth: 1,
                flexDirection: 'row-reverse',
                gap: 10,
                minHeight: 54,
                paddingHorizontal: 16,
              }}>
              <Ionicons color={tone.iconColor} name="notifications-outline" size={18} />
              <Text className="flex-1 text-right font-cairo-bold text-[13px] text-admin-text">
                {notice}
              </Text>
            </LinearGradient>
          ) : null}

          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
