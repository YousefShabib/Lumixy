import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';

import AdminDetailShell from '@/components/admin/admin-detail-shell';
import StatusBanner from '@/components/ui/status-banner';
import { useAdminSession } from '@/contexts/admin-session-context';
import { useUpdateAdminProfileMutation } from '@/hooks/admin/use-admin-accounts';
import { getReadableError } from '@/services/api';

type ProfileFormValues = {
  email: string;
  full_name: string;
  phone: string;
};

export default function ProfileDetailsScreen() {
  const { adminUser, refreshProfile } = useAdminSession();
  const updateProfileMutation = useUpdateAdminProfileMutation();
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ProfileFormValues>({
    defaultValues: {
      email: '',
      full_name: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (!adminUser) {
      return;
    }

    reset({
      email: adminUser.email,
      full_name: adminUser.full_name,
      phone: adminUser.phone ?? '',
    });
  }, [adminUser, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await updateProfileMutation.mutateAsync({
        email: values.email.trim(),
        full_name: values.full_name.trim(),
        phone: values.phone.trim(),
      });

      await refreshProfile();
      Alert.alert('تم الحفظ', result.message);
    } catch (error) {
      Alert.alert('تعذر الحفظ', getReadableError(error));
    }
  });

  return (
    <AdminDetailShell
      badge="الملف الشخصي"
      notice="أي تعديل هنا ينعكس مباشرة على الحساب الإداري الحالي داخل النظام."
      subtitle="عدّل بيانات الحساب الأساسية واحفظها مباشرة"
      title="المعلومات الشخصية">
      <View className="gap-4 rounded-[28px] border border-white/10 bg-admin-panel p-4.5">
        {updateProfileMutation.isError ? (
          <StatusBanner message={getReadableError(updateProfileMutation.error)} tone="error" />
        ) : null}

        <View className="gap-2">
          <Text className="text-right font-cairo-bold text-[14px] text-admin-text">
            الاسم الكامل
          </Text>
          <Controller
            control={control}
            name="full_name"
            rules={{ required: 'الاسم الكامل مطلوب.' }}
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                className="min-h-[54px] rounded-[18px] border border-white/10 bg-white/5 px-4 text-right font-cairo text-[15px] text-admin-text"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="أدخل الاسم الكامل"
                placeholderTextColor="#6B7280"
                value={value}
              />
            )}
          />
          {errors.full_name ? <StatusBanner message={errors.full_name.message ?? ''} tone="warning" /> : null}
        </View>

        <View className="gap-2">
          <Text className="text-right font-cairo-bold text-[14px] text-admin-text">رقم الجوال</Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                className="min-h-[54px] rounded-[18px] border border-white/10 bg-white/5 px-4 text-right font-cairo text-[15px] text-admin-text"
                keyboardType="phone-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="+97059XXXXXXX"
                placeholderTextColor="#6B7280"
                value={value}
              />
            )}
          />
        </View>

        <View className="gap-2">
          <Text className="text-right font-cairo-bold text-[14px] text-admin-text">
            البريد الإلكتروني
          </Text>
          <Controller
            control={control}
            name="email"
            rules={{
              pattern: {
                message: 'أدخل بريداً إلكترونياً صحيحاً.',
                value: /\S+@\S+\.\S+/,
              },
              required: 'البريد الإلكتروني مطلوب.',
            }}
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                autoCapitalize="none"
                className="min-h-[54px] rounded-[18px] border border-white/10 bg-white/5 px-4 text-right font-cairo text-[15px] text-admin-text"
                keyboardType="email-address"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="admin@lumixy.app"
                placeholderTextColor="#6B7280"
                value={value}
              />
            )}
          />
          {errors.email ? <StatusBanner message={errors.email.message ?? ''} tone="warning" /> : null}
        </View>

        <LinearGradient
          colors={['rgba(139, 92, 246, 0.18)', 'rgba(109, 40, 217, 0.10)']}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={{
            alignItems: 'center',
            borderRadius: 18,
            flexDirection: 'row-reverse',
            gap: 10,
            minHeight: 54,
            paddingHorizontal: 16,
          }}>
          <Ionicons color="#A78BFA" name="information-circle-outline" size={18} />
          <Text className="flex-1 text-right font-cairo text-[13px] leading-5 text-admin-muted">
            تأكد من صحة البيانات قبل الحفظ حتى تظهر بشكل صحيح داخل الحساب.
          </Text>
        </LinearGradient>

        <Pressable disabled={updateProfileMutation.isPending} onPress={() => void onSubmit()}>
          <LinearGradient
            colors={['#8B5CF6', '#6D28D9']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={{
              alignItems: 'center',
              borderRadius: 20,
              justifyContent: 'center',
              minHeight: 56,
              opacity: updateProfileMutation.isPending ? 0.76 : 1,
            }}>
            {updateProfileMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-cairo-bold text-[16px] text-admin-text">حفظ التغييرات</Text>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </AdminDetailShell>
  );
}
