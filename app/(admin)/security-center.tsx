import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AdminDetailShell from '@/components/admin/admin-detail-shell';
import { colors, typography } from '@/theme';

const activeSessions = [
  {
    id: '1',
    device: 'iPhone 15 Pro',
    location: 'غزة - الآن',
    current: true,
  },
  {
    id: '2',
    device: 'MacBook Pro',
    location: 'رام الله - قبل 18 دقيقة',
    current: false,
  },
];

export default function SecurityCenterScreen() {
  const [notice, setNotice] = useState('حالة الأمان ممتازة ولا توجد محاولات تسجيل مشبوهة حالياً.');

  const handleEndSessions = () => {
    setNotice('تم تسجيل خروج جميع الجلسات الأخرى بنجاح مع الإبقاء على هذه الجلسة.');
  };

  const handleRefresh = () => {
    setNotice('تم تحديث حالة الأمان وإرسال تنبيه فوري إلى البريد الإداري.');
  };

  return (
    <AdminDetailShell
      badge="الأمان"
      notice={notice}
      noticeTone="success"
      subtitle="راجع الجلسات والحماية والتنبيهات الحساسة"
      title="الأمان والجلسات">
      <View style={styles.securityCard}>
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.22)', 'rgba(16, 185, 129, 0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statusBox}>
          <View style={styles.statusIcon}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
          </View>
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>حماية الحساب مفعلة</Text>
            <Text style={styles.statusSubtitle}>التحقق الثنائي وتنبيهات الدخول تعمل بشكل طبيعي</Text>
          </View>
        </LinearGradient>

        <View style={styles.sessionsList}>
          {activeSessions.map((session) => (
            <View key={session.id} style={styles.sessionRow}>
              <View
                style={[
                  styles.sessionBadge,
                  session.current ? styles.sessionBadgeCurrent : styles.sessionBadgeOther,
                ]}>
                <Text
                  style={[
                    styles.sessionBadgeText,
                    session.current ? styles.sessionBadgeTextCurrent : styles.sessionBadgeTextOther,
                  ]}>
                  {session.current ? 'الحالي' : 'نشط'}
                </Text>
              </View>

              <View style={styles.sessionText}>
                <Text style={styles.sessionDevice}>{session.device}</Text>
                <Text style={styles.sessionLocation}>{session.location}</Text>
              </View>

              <View style={styles.sessionIconWrap}>
                <MaterialCommunityIcons
                  name={session.current ? 'cellphone' : 'laptop'}
                  size={18}
                  color={colors.primaryLight}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actionsRow}>
          <Pressable onPress={handleRefresh} style={styles.secondaryAction}>
            <Feather name="refresh-cw" size={16} color={colors.accent} />
            <Text style={styles.secondaryActionText}>تحديث الحالة</Text>
          </Pressable>

          <Pressable onPress={handleEndSessions}>
            <LinearGradient
              colors={[colors.primaryLight, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryAction}>
              <Text style={styles.primaryActionText}>إنهاء الجلسات الأخرى</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </AdminDetailShell>
  );
}

const styles = StyleSheet.create({
  securityCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: 'rgba(19, 16, 24, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 14,
  },
  statusBox: {
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statusTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    textAlign: 'right',
  },
  statusSubtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 2,
  },
  sessionsList: {
    gap: 10,
  },
  sessionRow: {
    minHeight: 76,
    borderRadius: 22,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sessionBadge: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sessionBadgeCurrent: {
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderColor: 'rgba(16, 185, 129, 0.18)',
  },
  sessionBadgeOther: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sessionBadgeText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 12,
  },
  sessionBadgeTextCurrent: {
    color: colors.success,
  },
  sessionBadgeTextOther: {
    color: colors.textSecondary,
  },
  sessionText: {
    flex: 1,
    alignItems: 'flex-end',
    paddingHorizontal: 12,
  },
  sessionDevice: {
    color: colors.text,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 15,
    textAlign: 'right',
  },
  sessionLocation: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 2,
  },
  sessionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.10)',
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginTop: 4,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 54,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.16)',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    color: colors.text,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 14,
  },
  primaryAction: {
    flex: 1,
    minHeight: 54,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryActionText: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
  },
});
