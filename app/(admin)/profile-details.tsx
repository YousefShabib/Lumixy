import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import AdminDetailShell from '@/components/admin/admin-detail-shell';
import { colors, typography } from '@/theme';

export default function ProfileDetailsScreen() {
  const [fullName, setFullName] = useState('Admin Lumixy');
  const [phone, setPhone] = useState('+970 59 123 4567');
  const [email, setEmail] = useState('admin@lumixy.app');
  const [notice, setNotice] = useState('تمت مزامنة البيانات الحالية مع لوحة الإدارة.');

  const handleSave = () => {
    setNotice('تم تحديث المعلومات الشخصية بنجاح وسيظهر التعديل لجميع المدراء الآن.');
    console.log('Save Profile', { fullName, phone, email });
  };

  return (
    <AdminDetailShell
      badge="الملف الشخصي"
      notice={notice}
      noticeTone="success"
      subtitle="عدّل بيانات الحساب الأساسية بسهولة"
      title="المعلومات الشخصية">
      <View style={styles.card}>
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>الاسم الكامل</Text>
          <TextInput value={fullName} onChangeText={setFullName} style={styles.input} />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>رقم الجوال</Text>
          <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>البريد الإلكتروني</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <LinearGradient
          colors={['rgba(139, 92, 246, 0.18)', 'rgba(109, 40, 217, 0.10)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
          <Text style={styles.infoText}>أي تحديث هنا ينعكس مباشرة على بطاقة الأدمن والبيانات العامة.</Text>
        </LinearGradient>

        <Pressable onPress={handleSave}>
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>حفظ التغييرات</Text>
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
  primaryButtonText: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
  },
});
