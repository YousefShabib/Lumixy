import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';

import AdminDetailShell from '@/components/admin/admin-detail-shell';
import StatusBanner from '@/components/ui/status-banner';
import { useCreateAdminMutation } from '@/hooks/admin/use-admin-accounts';
import { getReadableError } from '@/services/api';

type AddAdminFormValues = {
  email: string;
  full_name: string;
  password: string;
  password_confirmation: string;
  phone: string;
};

export default function AddAdminScreen() {
  const createAdminMutation = useCreateAdminMutation();
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm<AddAdminFormValues>({
    defaultValues: {
      email: '',
      full_name: '',
      password: '',
      password_confirmation: '',
      phone: '',
    },
  });

  const passwordValue = watch('password');

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await createAdminMutation.mutateAsync({
        email: values.email.trim(),
        full_name: values.full_name.trim(),
        password: values.password,
        password_confirmation: values.password_confirmation,
        phone: values.phone.trim(),
      });

      Alert.alert('تم الإنشاء', `تم إنشاء حساب ${result.user.full_name} بنجاح.`);
      reset();
    } catch (error) {
      Alert.alert('تعذر الإنشاء', getReadableError(error));
    }
  });

  return (
    <AdminDetailShell
      badge="إدارة الحسابات"
      notice="سيصبح الحساب جاهزاً لتسجيل الدخول بعد إنشائه مباشرة."
      subtitle="أنشئ حساباً إدارياً جديداً من داخل اللوحة"
      title="إضافة أدمن جديد">
      <View className="gap-4 rounded-[28px] border border-white/10 bg-admin-panel p-4.5">
        {createAdminMutation.isError ? (
          <StatusBanner message={getReadableError(createAdminMutation.error)} tone="error" />
        ) : null}

        {[
          {
            keyboardType: 'default' as const,
            label: 'اسم الأدمن',
            name: 'full_name' as const,
            placeholder: 'أدخل الاسم الكامل',
            rules: { required: 'اسم الأدمن مطلوب.' },
            secureTextEntry: false,
          },
          {
            keyboardType: 'email-address' as const,
            label: 'البريد الإلكتروني',
            name: 'email' as const,
            placeholder: 'name@lumixy.app',
            rules: {
              pattern: {
                message: 'أدخل بريداً إلكترونياً صحيحاً.',
                value: /\S+@\S+\.\S+/,
              },
              required: 'البريد الإلكتروني مطلوب.',
            },
            secureTextEntry: false,
          },
          {
            keyboardType: 'phone-pad' as const,
            label: 'رقم الجوال',
            name: 'phone' as const,
            placeholder: '+97059XXXXXXX',
            rules: {},
            secureTextEntry: false,
          },
          {
            keyboardType: 'default' as const,
            label: 'كلمة المرور',
            name: 'password' as const,
            placeholder: 'أدخل كلمة مرور قوية',
            rules: {
              minLength: {
                message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
                value: 8,
              },
              required: 'كلمة المرور مطلوبة.',
            },
            secureTextEntry: true,
          },
          {
            keyboardType: 'default' as const,
            label: 'تأكيد كلمة المرور',
            name: 'password_confirmation' as const,
            placeholder: 'أعد كتابة كلمة المرور',
            rules: {
              required: 'تأكيد كلمة المرور مطلوب.',
              validate: (value: string) =>
                value === passwordValue || 'تأكيد كلمة المرور غير مطابق.',
            },
            secureTextEntry: true,
          },
        ].map((field) => (
          <View key={field.name} className="gap-2">
            <Text className="text-right font-cairo-bold text-[14px] text-admin-text">
              {field.label}
            </Text>
            <Controller
              control={control}
              name={field.name}
              rules={field.rules}
              render={({ field: controllerField }) => (
                <TextInput
                  autoCapitalize={field.name === 'email' ? 'none' : 'sentences'}
                  className="min-h-[54px] rounded-[18px] border border-white/10 bg-white/5 px-4 text-right font-cairo text-[15px] text-admin-text"
                  keyboardType={field.keyboardType}
                  onBlur={controllerField.onBlur}
                  onChangeText={controllerField.onChange}
                  placeholder={field.placeholder}
                  placeholderTextColor="#6B7280"
                  secureTextEntry={field.secureTextEntry}
                  value={controllerField.value}
                />
              )}
            />
            {errors[field.name] ? (
              <StatusBanner message={errors[field.name]?.message ?? ''} tone="warning" />
            ) : null}
          </View>
        ))}

        <LinearGradient
          colors={['rgba(139, 92, 246, 0.18)', 'rgba(109, 40, 217, 0.10)']}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={{
            borderRadius: 20,
            padding: 16,
          }}>
          <Text className="text-right font-cairo-bold text-[15px] text-admin-text">
            ما الذي سيحدث بعد الإنشاء؟
          </Text>
          <View className="mt-2 gap-1.5">
            <View className="flex-row-reverse items-center gap-2">
              <Ionicons color="#A78BFA" name="checkmark-circle-outline" size={14} />
              <Text className="flex-1 text-right font-cairo text-[13px] text-admin-muted">
                سيتم حفظ الحساب مباشرة داخل النظام.
              </Text>
            </View>
            <View className="flex-row-reverse items-center gap-2">
              <Ionicons color="#A78BFA" name="checkmark-circle-outline" size={14} />
              <Text className="flex-1 text-right font-cairo text-[13px] text-admin-muted">
                يمكن استخدام البريد وكلمة المرور فوراً في شاشة تسجيل الدخول.
              </Text>
            </View>
          </View>
        </LinearGradient>

        <Pressable disabled={createAdminMutation.isPending} onPress={() => void onSubmit()}>
          <LinearGradient
            colors={['#8B5CF6', '#6D28D9']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={{
              alignItems: 'center',
              borderRadius: 20,
              justifyContent: 'center',
              minHeight: 56,
              opacity: createAdminMutation.isPending ? 0.76 : 1,
            }}>
            {createAdminMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-cairo-bold text-[16px] text-admin-text">إنشاء حساب الأدمن</Text>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </AdminDetailShell>
  );
}
