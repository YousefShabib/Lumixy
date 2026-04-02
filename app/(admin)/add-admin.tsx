import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import AdminDetailShell from '@/components/admin/admin-detail-shell';
import { colors, typography } from '@/theme';

type AdminRole = 'مشرف' | 'مراجع' | 'دعم';

const roleOptions: AdminRole[] = ['مشرف', 'مراجع', 'دعم'];

export default function AddAdminScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('مشرف');
  const [notice, setNotice] = useState('الدعوة الجديدة سترسل مع رسالة ترحيبية وصلاحية أولية.');

  const handleInvite = () => {
    setNotice('تم تجهيز دعوة الأدمن الجديد وسيصل إشعار بالبريد خلال لحظات.');
    console.log('Invite Admin', { name, email, role });
  };

  return (
    <AdminDetailShell
      badge="دعوات الأدمن"
      notice={notice}
      noticeTone="primary"
      subtitle="أضف مسؤولاً جديداً وحدد الصلاحية المناسبة"
      title="إضافة أدمن جديد">
      <View style={styles.card}>
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>اسم الأدمن</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="أدخل الاسم الكامل"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>البريد الإلكتروني</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="name@lumixy.app"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={styles.roleSection}>
          <Text style={styles.label}>الصلاحية</Text>
          <View style={styles.rolesWrap}>
            {roleOptions.map((item) => {
              const active = role === item;

              return (
                <Pressable key={item} onPress={() => setRole(item)} style={styles.rolePressable}>
                  {active ? (
                    <LinearGradient
                      colors={[colors.primaryLight, colors.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.activeRoleChip}>
                      <Text style={styles.activeRoleText}>{item}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.roleChip}>
                      <Text style={styles.roleText}>{item}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable onPress={handleInvite}>
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>إرسال الدعوة</Text>
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
  roleSection: {
    gap: 10,
  },
  rolesWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
  },
  rolePressable: {
    flexShrink: 0,
  },
  roleChip: {
    minHeight: 38,
    borderRadius: 19,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  roleText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 13,
  },
  activeRoleChip: {
    minHeight: 38,
    borderRadius: 19,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRoleText: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
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
