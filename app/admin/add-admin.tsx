import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import AdminDetailShell from '@/components/admin/admin-detail-shell';
import StatusBanner from '@/components/ui/status-banner';
import { useAdminSession } from '@/contexts/admin-session-context';
import { colors, typography } from '@/theme';

export default function AddAdminScreen() {
  const { createAdmin } = useAdminSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInvite = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedEmail || !password || !passwordConfirmation) {
      setErrorMessage('أكمل جميع الحقول الأساسية قبل إنشاء الحساب.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await createAdmin({
      full_name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      password,
      password_confirmation: passwordConfirmation,
    });

    if (result.success) {
      const createdName = result.user?.full_name ?? trimmedName;
      Alert.alert('تم الإنشاء', `تم إنشاء حساب ${createdName} بنجاح.`);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setPasswordConfirmation('');
      setIsSubmitting(false);
      return;
    }

    setErrorMessage(result.message);
    setIsSubmitting(false);
  };

  return (
    <AdminDetailShell
      badge="إدارة الحسابات"
      subtitle="أنشئ حساباً إدارياً جديداً من داخل اللوحة"
      title="إضافة أدمن جديد">
      <View style={styles.card}>
        {errorMessage ? <StatusBanner message={errorMessage} tone="error" /> : null}

        <View style={styles.inlineInfo}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} />
          <Text style={styles.inlineInfoText}>سيصبح الحساب جاهزاً لتسجيل الدخول بعد إنشائه مباشرة.</Text>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>اسم الأدمن</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="أدخل الاسم الكامل"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            textAlign="right"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>البريد الإلكتروني</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="name@lumixy.app"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            textAlign="right"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>رقم الجوال</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+97059XXXXXXX"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            style={styles.input}
            textAlign="right"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>كلمة المرور</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="أدخل كلمة مرور قوية"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={styles.input}
            textAlign="right"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>تأكيد كلمة المرور</Text>
          <TextInput
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            placeholder="أعد كتابة كلمة المرور"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={styles.input}
            textAlign="right"
          />
        </View>

        <LinearGradient
          colors={['rgba(139, 92, 246, 0.18)', 'rgba(109, 40, 217, 0.10)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>ما الذي سيحدث بعد الإنشاء؟</Text>
          <Text style={styles.summaryText}>سيتم حفظ الحساب مباشرة داخل النظام.</Text>
          <Text style={styles.summaryText}>يمكن استخدام البريد وكلمة المرور فوراً في شاشة تسجيل الدخول.</Text>
        </LinearGradient>

        <Pressable onPress={handleInvite} disabled={isSubmitting}>
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.primaryButton, isSubmitting && styles.disabledButton]}>
            {isSubmitting ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.primaryButtonText}>إنشاء حساب الأدمن</Text>
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
  inlineInfo: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.16)',
    paddingHorizontal: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  inlineInfoText: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    textAlign: 'right',
    lineHeight: 20,
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
  summaryCard: {
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },
  summaryTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    textAlign: 'right',
  },
  summaryText: {
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
    marginTop: 6,
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
