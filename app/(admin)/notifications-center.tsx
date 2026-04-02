import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AdminDetailShell from '@/components/admin/admin-detail-shell';
import { colors, typography } from '@/theme';

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 'approvals',
    title: 'إشعارات الموافقات',
    description: 'تنبيه عند وجود مزود جديد يحتاج مراجعة سريعة',
    enabled: true,
  },
  {
    id: 'reports',
    title: 'تقارير يومية',
    description: 'ملخص يومي عن النشاطات والتحديثات داخل المنصة',
    enabled: false,
  },
  {
    id: 'alerts',
    title: 'تنبيهات الأمان',
    description: 'إشعار مباشر عند تسجيل دخول غير معتاد أو تغيير حساس',
    enabled: true,
  },
];

export default function NotificationsCenterScreen() {
  const [items, setItems] = useState(initialNotifications);
  const [notice, setNotice] = useState<string | undefined>(undefined);

  const toggleItem = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
    setNotice('تم تحديث إعدادات الإشعارات.');
  };

  const saveNotificationSettings = () => {
    setNotice('تم حفظ إعدادات الإشعارات بنجاح.');
  };

  return (
    <AdminDetailShell
      badge="الإشعارات"
      notice={notice}
      noticeTone="warning"
      subtitle="تحكم بالإشعارات المهمة داخل الحساب"
      title="مركز التنبيهات">
      <View style={styles.card}>
        {items.map((item) => (
          <Pressable key={item.id} style={styles.row} onPress={() => toggleItem(item.id)}>
            <View style={[styles.toggle, item.enabled && styles.toggleActive]}>
              <View style={[styles.toggleThumb, item.enabled && styles.toggleThumbActive]} />
            </View>

            <View style={styles.textBlock}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowDescription}>{item.description}</Text>
            </View>

            <View style={styles.iconWrap}>
              <Ionicons
                name={item.enabled ? 'notifications' : 'notifications-off-outline'}
                size={18}
                color={item.enabled ? colors.warning : colors.textMuted}
              />
            </View>
          </Pressable>
        ))}

        <LinearGradient
          colors={['rgba(245, 158, 11, 0.16)', 'rgba(245, 158, 11, 0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.messagePreview}>
          <Feather name="message-square" size={18} color={colors.warning} />
          <Text style={styles.previewText}>نص الإشعار الحالي: تم اعتماد مزود جديد ويحتاج متابعة بسيطة.</Text>
        </LinearGradient>

        <Pressable onPress={saveNotificationSettings}>
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>حفظ الإعدادات</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </AdminDetailShell>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: 'rgba(19, 16, 24, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  row: {
    minHeight: 74,
    borderRadius: 22,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  toggle: {
    width: 46,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toggleActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.28)',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textMuted,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
    backgroundColor: colors.warning,
  },
  textBlock: {
    flex: 1,
    alignItems: 'flex-end',
    paddingHorizontal: 12,
  },
  rowTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 15,
    textAlign: 'right',
  },
  rowDescription: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  messagePreview: {
    minHeight: 58,
    borderRadius: 20,
    paddingHorizontal: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  previewText: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
  },
});
