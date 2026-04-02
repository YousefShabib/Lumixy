import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import AdminDetailShell from '@/components/admin/admin-detail-shell';
import StatusBanner from '@/components/ui/status-banner';
import { useAdminSession } from '@/contexts/admin-session-context';
import { colors, typography } from '@/theme';

export default function ProfileDetailsScreen() {
  const { adminUser, updateProfile } = useAdminSession();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!adminUser) {
      return;
    }

    setFullName(adminUser.full_name);
    setPhone(adminUser.phone ?? '');
    setEmail(adminUser.email);
  }, [adminUser]);

  const handleSave = async () => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      setErrorMessage('الاسم الكامل والبريد الإلكتروني مطلوبان قبل الحفظ.');
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    const result = await updateProfile({
      full_name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
    });

    if (result.success) {
      Alert.alert('تم الحفظ', 'تم تحديث المعلومات الشخصية بنجاح.');
    } else {
      setErrorMessage(result.message);
    }

    setIsSaving(false);
  };

  return (
    <AdminDetailShell
      badge="الملف الشخصي"
      subtitle="عدّل بيانات الحساب الأساسية وسيتم حفظها فوراً على الخادم"
      title="المعلومات الشخصية">
      <View style={styles.card}>
        {errorMessage ? <StatusBanner message={errorMessage} tone="error" /> : null}

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>الاسم الكامل</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            textAlign="right"
            placeholder="أدخل الاسم الكامل"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>رقم الجوال</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
            textAlign="right"
            placeholder="+97059XXXXXXX"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>البريد الإلكتروني</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            textAlign="right"
            placeholder="admin@lumixy.app"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <LinearGradient
          colors={['rgba(139, 92, 246, 0.18)', 'rgba(109, 40, 217, 0.10)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
          <Text style={styles.infoText}>تأكد من صحة البيانات قبل الحفظ حتى تظهر بشكل صحيح داخل الحساب.</Text>
        </LinearGradient>

        <Pressable onPress={handleSave} disabled={isSaving}>
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.primaryButton, isSaving && styles.disabledButton]}>
            {isSaving ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.primaryButtonText}>حفظ التغييرات</Text>
            )}
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
    gap: 14,
  },
  fieldBlock: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 14,
    textAlign: 'right',
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    color: colors.text,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: typography.fontFamily.regular,
  },
  infoBox: {
    minHeight: 54,
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
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
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.76,
  },
  primaryButtonText: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
  },
});
