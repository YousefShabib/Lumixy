import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AdminDetailShell from '@/components/admin/admin-detail-shell';
import StatusBanner from '@/components/ui/status-banner';
import { useAdminSession } from '@/contexts/admin-session-context';
import {
  deleteAdminAccount,
  fetchAdminAccounts,
  type AdminAccountRecord,
} from '@/services/admin-api';
import { ApiError, getReadableError } from '@/services/api';
import { colors, typography } from '@/theme';

export default function AdminSettingsScreen() {
  const { adminUser, logout } = useAdminSession();
  const [admins, setAdmins] = useState<AdminAccountRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyDeleteId, setBusyDeleteId] = useState<string | null>(null);

  const handleUnauthorized = useCallback(
    async (error: unknown) => {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        await logout();
        return true;
      }

      return false;
    },
    [logout]
  );

  const loadAdmins = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data } = await fetchAdminAccounts();
      setAdmins(data);
    } catch (error) {
      console.error('فشل تحميل قائمة الأدمنز:', error);

      if (await handleUnauthorized(error)) {
        return;
      }

      setErrorMessage(getReadableError(error));
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  const sortedAdmins = useMemo(() => {
    return [...admins].sort((first, second) => {
      if (first.id === adminUser?.id) {
        return -1;
      }

      if (second.id === adminUser?.id) {
        return 1;
      }

      return (second.created_at ?? '').localeCompare(first.created_at ?? '');
    });
  }, [adminUser?.id, admins]);

  const handleDeleteAdmin = (admin: AdminAccountRecord) => {
    if (admin.id === adminUser?.id) {
      Alert.alert('غير متاح', 'لا يمكنك حذف حسابك الإداري الحالي.');
      return;
    }

    Alert.alert('حذف الأدمن', `هل تريد حذف حساب ${admin.full_name} من النظام؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setBusyDeleteId(admin.id);
            setErrorMessage(null);

            try {
              const { data } = await deleteAdminAccount(admin.id);
              Alert.alert('تم الحذف', data.message);
              await loadAdmins();
            } catch (error) {
              console.error('فشل حذف الأدمن:', error);

              if (await handleUnauthorized(error)) {
                return;
              }

              setErrorMessage(getReadableError(error));
            } finally {
              setBusyDeleteId(null);
            }
          })();
        },
      },
    ]);
  };

  return (
    <AdminDetailShell
      badge="إعدادات الأدمن"
      notice="يمكنك مراجعة جميع حسابات الأدمن وحذف أي حساب غير مطلوب مع حماية حسابك الحالي."
      subtitle="عرض جميع الحسابات الإدارية الموجودة في النظام"
      title="عرض وإعدادات الأدمن">
      <View style={styles.summaryCard}>
        <View style={styles.summaryBadge}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.primaryLight} />
        </View>
        <View style={styles.summaryTextBlock}>
          <Text style={styles.summaryValue}>{admins.length}</Text>
          <Text style={styles.summaryLabel}>إجمالي حسابات الأدمن</Text>
        </View>
      </View>

      {errorMessage ? (
        <StatusBanner
          message={errorMessage}
          tone="error"
          actionLabel="إعادة المحاولة"
          onAction={() => {
            void loadAdmins();
          }}
        />
      ) : null}

      <View style={styles.listCard}>
        <View style={styles.listHeader}>
          <Text style={styles.listSubtitle}>كل حساب يظهر هنا مع خيار حذف مباشر</Text>
          <Text style={styles.listTitle}>قائمة الأدمنز</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={colors.primaryLight} />
            <Text style={styles.loadingText}>جار تحميل الأدمنز...</Text>
          </View>
        ) : sortedAdmins.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={24} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>لا توجد حسابات أدمن حالياً</Text>
            <Text style={styles.emptyText}>يمكنك إضافة حساب جديد من شاشة إضافة أدمن جديد.</Text>
          </View>
        ) : (
          <View style={styles.adminList}>
            {sortedAdmins.map((admin) => {
              const isCurrentAdmin = admin.id === adminUser?.id;
              const isDeleting = busyDeleteId === admin.id;

              return (
                <View key={admin.id} style={styles.adminRow}>
                  <Pressable
                    onPress={() => handleDeleteAdmin(admin)}
                    disabled={isCurrentAdmin || isDeleting}
                    style={({ pressed }) => [
                      styles.deleteButton,
                      isCurrentAdmin ? styles.deleteButtonDisabled : null,
                      pressed && !isCurrentAdmin && !isDeleting ? styles.deleteButtonPressed : null,
                    ]}>
                    {isDeleting ? (
                      <ActivityIndicator size="small" color={colors.error} />
                    ) : (
                      <Feather
                        name="trash-2"
                        size={16}
                        color={isCurrentAdmin ? colors.textMuted : colors.error}
                      />
                    )}
                  </Pressable>

                  <View style={styles.adminText}>
                    <View style={styles.rowTitleLine}>
                      {isCurrentAdmin ? (
                        <LinearGradient
                          colors={['rgba(139, 92, 246, 0.22)', 'rgba(109, 40, 217, 0.12)']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>أنت</Text>
                        </LinearGradient>
                      ) : null}
                      <Text style={styles.adminName}>{admin.full_name}</Text>
                    </View>

                    <Text style={styles.adminMeta}>{admin.email}</Text>
                    <Text style={styles.adminMeta}>
                      {admin.phone?.trim() ? admin.phone : 'لا يوجد رقم جوال محفوظ'}
                    </Text>
                  </View>

                  <View style={styles.avatarWrap}>
                    <Ionicons
                      name={isCurrentAdmin ? 'shield-half-outline' : 'person-circle-outline'}
                      size={22}
                      color={colors.primaryLight}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </AdminDetailShell>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    minHeight: 92,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: 'rgba(19, 16, 24, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
  },
  summaryBadge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.10)',
  },
  summaryTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
  },
  summaryValue: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 28,
    textAlign: 'right',
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    textAlign: 'right',
    marginTop: 2,
  },
  listCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: 'rgba(19, 16, 24, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 14,
  },
  listHeader: {
    alignItems: 'flex-end',
  },
  listTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    textAlign: 'right',
  },
  listSubtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 4,
  },
  loadingState: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
  },
  emptyState: {
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 17,
    marginTop: 10,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
  },
  adminList: {
    gap: 12,
  },
  adminRow: {
    minHeight: 94,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.14)',
  },
  deleteButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  deleteButtonPressed: {
    opacity: 0.82,
  },
  adminText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  rowTitleLine: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  adminName: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    textAlign: 'right',
  },
  adminMeta: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    textAlign: 'right',
    lineHeight: 18,
  },
  currentBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  currentBadgeText: {
    color: colors.accent,
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.10)',
  },
});
