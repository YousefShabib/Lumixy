import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

export default function ContactInfoScreen() {
  const router = useRouter();
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [errors, setErrors] = useState({
    whatsapp: '',
    instagram: '',
    facebook: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completedFields = [whatsapp, instagram, facebook].filter((value) => value.trim().length > 0).length;
  const progressWidth = `${(completedFields / 3) * 100}%`;

  const validateWhatsapp = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');

    if (!digitsOnly) {
      return 'رقم الواتساب مطلوب';
    }

    if (digitsOnly.length < 9) {
      return 'أدخل رقم واتساب صحيح';
    }

    return '';
  };

  const validateInstagram = (value: string) => {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return '';
    }

    if (!/^@?[a-zA-Z0-9._]{3,30}$/.test(normalizedValue)) {
      return 'اسم المستخدم في إنستغرام غير صالح';
    }

    return '';
  };

  const validateFacebook = (value: string) => {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return '';
    }

    if (!/^(https?:\/\/)?(www\.)?facebook\.com\/[^\s]+$/i.test(normalizedValue)) {
      return 'رابط فيسبوك غير صالح';
    }

    return '';
  };

  const handleWhatsappChange = (value: string) => {
    setWhatsapp(value);
    setErrors((prev) => ({ ...prev, whatsapp: validateWhatsapp(value) }));
  };

  const handleInstagramChange = (value: string) => {
    setInstagram(value);
    setErrors((prev) => ({ ...prev, instagram: validateInstagram(value) }));
  };

  const handleFacebookChange = (value: string) => {
    setFacebook(value);
    setErrors((prev) => ({ ...prev, facebook: validateFacebook(value) }));
  };

  const handleCompleteRegistration = async () => {
    const nextErrors = {
      whatsapp: validateWhatsapp(whatsapp),
      instagram: validateInstagram(instagram),
      facebook: validateFacebook(facebook),
    };

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    const contactInfoPayload = {
      whatsapp: whatsapp.trim(),
      instagram: instagram.trim(),
      facebook: facebook.trim(),
    };
    void contactInfoPayload;

    setIsSubmitting(true);

    try {
      // TODO: اربط هذا الـ payload مع خدمة حفظ معلومات التواصل.
      // await saveProviderContactInfo(contactInfoPayload);
      router.push('/provider/portfolio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = isSubmitting || !whatsapp.trim() || Object.values(errors).some(Boolean);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>

          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
            <View className="w-10" />
            <Text className="text-white text-lg font-semibold" style={{ fontFamily: typography.fontFamily.bold }}>معلومات التواصل</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-[#1e1c24] items-center justify-center"
            >
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Progress */}
          <View className="px-5 mb-6">
            <View className="flex-row justify-end mb-1">
              <Text className="text-[#7c3aed] text-xs font-medium" style={{ fontFamily: typography.fontFamily.bold }}>الحقول المكتملة</Text>
              <Text className="text-[#7c3aed] text-xs font-medium mr-2" style={{ fontFamily: typography.fontFamily.bold }}>{completedFields}/3</Text>
            </View>
            <View className="h-1.5 bg-[#2a1045] rounded-full">
              <View className="h-1.5 bg-[#7c3aed] rounded-full" style={{ width: progressWidth }} />
            </View>
          </View>

          {/* Title */}
          <View className="px-5 mb-8 items-end">
            <Text className="text-white text-2xl font-bold mb-2" style={{ textAlign: 'right', fontFamily: typography.fontFamily.bold }}>
              معلومات التواصل والتقديم
            </Text>
            <Text className="text-[#a78bca] text-sm leading-6" style={{ textAlign: 'right', fontFamily: typography.fontFamily.regular }}>
              يرجى إدخال تفاصيل التواصل الخاصة بك{'\n'}للمتابعة مع العملاء.
            </Text>
          </View>

          {/* Form */}
          <View className="px-5 gap-5">

            {/* WhatsApp */}
            <View>
              <View className="flex-row justify-end items-center mb-2 gap-1">
                <Text className="text-xs text-red-400" style={{ fontFamily: typography.fontFamily.regular }}>مطلوب</Text>
                <Text className="text-[#c4b5d4] text-sm" style={{ textAlign: 'right', fontFamily: typography.fontFamily.regular }}>
                  رقم الواتساب
                </Text>
              </View>
              <View className="bg-[#1e1c24] rounded-2xl flex-row items-center px-4 border border-[#2e2a38]">
                <View className="flex-1">
                  <TextInput
                    value={whatsapp}
                    onChangeText={handleWhatsappChange}
                    placeholder="05X XXX XXXX"
                    placeholderTextColor="#4a4560"
                    className="text-white py-4 text-right"
                    keyboardType="phone-pad"
                    style={{ textAlign: 'right' }}
                  />
                </View>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#7c3aed" />
              </View>
              {!!errors.whatsapp && (
                <Text className="text-red-400 text-xs mt-2" style={{ textAlign: 'right' }}>
                  {errors.whatsapp}
                </Text>
              )}
            </View>

            {/* Instagram */}
            <View>
              <Text className="text-[#c4b5d4] text-sm mb-2" style={{ textAlign: 'right', fontFamily: typography.fontFamily.regular }}>
                اسم المستخدم في إنستغرام
              </Text>
              <View className="bg-[#1e1c24] rounded-2xl flex-row items-center px-4 border border-[#2e2a38]">
                <View className="flex-1">
                  <TextInput
                    value={instagram}
                    onChangeText={handleInstagramChange}
                    placeholder="@username"
                    placeholderTextColor="#4a4560"
                    className="text-white py-4 text-right"
                    style={{ textAlign: 'right' }}
                    autoCapitalize="none"
                  />
                </View>
                <FontAwesome name="instagram" size={20} color="#7c3aed" />
              </View>
              {!!errors.instagram && (
                <Text className="text-red-400 text-xs mt-2" style={{ textAlign: 'right' }}>
                  {errors.instagram}
                </Text>
              )}
            </View>

            {/* Facebook */}
            <View>
              <Text className="text-[#c4b5d4] text-sm mb-2" style={{ textAlign: 'right', fontFamily: typography.fontFamily.regular }}>
                رابط حساب فيسبوك
              </Text>
              <View className="bg-[#1e1c24] rounded-2xl flex-row items-center px-4 border border-[#2e2a38]">
                <View className="flex-1">
                  <TextInput
                    value={facebook}
                    onChangeText={handleFacebookChange}
                    placeholder="facebook.com/username"
                    placeholderTextColor="#4a4560"
                    className="text-white py-4 text-right"
                    style={{ textAlign: 'right' }}
                    autoCapitalize="none"
                  />
                </View>
                <FontAwesome name="facebook-square" size={20} color="#7c3aed" />
              </View>
              {!!errors.facebook && (
                <Text className="text-red-400 text-xs mt-2" style={{ textAlign: 'right' }}>
                  {errors.facebook}
                </Text>
              )}
            </View>

          </View>
        </ScrollView>

        {/* Bottom */}
        <View className="px-5 pb-6 pt-3" style={{ backgroundColor: colors.background }}>
          <TouchableOpacity
            onPress={handleCompleteRegistration}
            disabled={isSubmitDisabled}
            className={`rounded-2xl py-4 flex-row items-center justify-center gap-2 mb-3 ${
              isSubmitDisabled ? 'bg-[#3a2b57]' : 'bg-[#7c3aed]'
            }`}
            activeOpacity={0.85}
          >
            <Ionicons name="play-outline" size={20} color="#fff" />
            <Text className="text-white font-bold text-base" style={{ fontFamily: typography.fontFamily.bold }}>
              {isSubmitting ? 'جارٍ التجهيز...' : 'إكمال التسجيل'}
            </Text>
          </TouchableOpacity>
          <Text className="text-[#6b6480] text-xs text-center" style={{ fontFamily: typography.fontFamily.regular }}>
            بالنقر على إكمال التسجيل، فأنت توافق على شروط الخدمة لـ LUMIXY
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
