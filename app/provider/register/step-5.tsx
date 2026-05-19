import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  type DimensionValue,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApiError } from "@/services/api";
import {
  submitProviderApplication,
  updateProviderBusiness,
  updateProviderContact,
  updateProviderLocationSchedule,
  uploadProviderGallery,
  uploadProviderImage,
} from "../../../services/providerRegister";
import { useProviderRegister } from "../../../store/provider-register-store";

const dayMap: Record<string, string> = {
  السبت: "saturday",
  الأحد: "sunday",
  الاثنين: "monday",
  الثلاثاء: "tuesday",
  الأربعاء: "wednesday",
  الخميس: "thursday",
  الجمعة: "friday",
};

export default function StepFiveScreen() {
  const router = useRouter();
  const { form, setForm } = useProviderRegister();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    whatsappNumber: "",
    instagramUsername: "",
    facebookUrl: "",
  });

  const completedFields = useMemo(
    () =>
      [form.whatsappNumber, form.instagramUsername, form.facebookUrl].filter(
        (value) => value.trim().length > 0
      ).length,
    [form.facebookUrl, form.instagramUsername, form.whatsappNumber]
  );

  const progressWidth = `${(completedFields / 3) * 100}%`;

  const buildLocationText = () =>
    [form.address.trim(), form.locationDescription.trim()].filter(Boolean).join(" - ");

  const buildHoursPayload = () =>
    form.workingDays
      .map((day) => dayMap[day])
      .filter((day): day is string => Boolean(day))
      .map((day_of_week) => ({
        day_of_week,
        start_time: form.fromTime,
        end_time: form.toTime,
        is_active: true,
      }));

  const validateWhatsapp = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "");

    if (!digitsOnly) return "رقم الواتساب مطلوب";
    if (digitsOnly.length < 9) return "أدخل رقم واتساب صحيح";
    return "";
  };

  const validateInstagram = (value: string) => {
    const normalizedValue = value.trim();

    if (!normalizedValue) return "";
    if (!/^@?[a-zA-Z0-9._]{3,30}$/.test(normalizedValue)) {
      return "اسم المستخدم في إنستغرام غير صالح";
    }

    return "";
  };

  const validateFacebook = (value: string) => {
    const normalizedValue = value.trim();

    if (!normalizedValue) return "";
    if (!/^(https?:\/\/)?(www\.)?facebook\.com\/[^\s]+$/i.test(normalizedValue)) {
      return "رابط فيسبوك غير صالح";
    }

    return "";
  };

  const validateBeforeSubmit = () => {
    const nextErrors = {
      whatsappNumber: validateWhatsapp(form.whatsappNumber),
      instagramUsername: validateInstagram(form.instagramUsername),
      facebookUrl: validateFacebook(form.facebookUrl),
    };

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return false;
    }

    if (!form.token) {
      Alert.alert("تنبيه", "يجب تسجيل الدخول أولًا قبل إرسال الطلب.");
      return false;
    }

    if (!form.imageUri || !form.displayName.trim() || !form.bio.trim() || !form.categoryId.trim()) {
      Alert.alert("تنبيه", "يوجد بيانات ناقصة في الخطوات السابقة.");
      return false;
    }

    if (!form.city.trim() || form.workingDays.length === 0 || form.fromTime >= form.toTime) {
      Alert.alert("تنبيه", "راجع بيانات الموقع وساعات العمل قبل الإرسال.");
      return false;
    }

    if (buildHoursPayload().length === 0) {
      Alert.alert("تنبيه", "أيام العمل غير صالحة، ارجع للخطوة السابقة واخترها من جديد.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateBeforeSubmit() || !form.token) {
      return;
    }

    setIsSubmitting(true);

    try {
      await uploadProviderImage(form.imageUri!);

      await updateProviderBusiness({
        provider_name: form.displayName.trim(),
        bio: form.bio.trim(),
        category_id: form.categoryId,
        custom_services: form.services,
        onboarding_step: 2,
      });

      await updateProviderLocationSchedule({
        city: form.city.trim(),
        location_text: buildLocationText(),
        onboarding_step: 3,
        hours: buildHoursPayload(),
      });

      await updateProviderContact({
        whatsapp_number: form.whatsappNumber.trim(),
        instagram_username: form.instagramUsername.trim() || undefined,
        facebook_url: form.facebookUrl.trim() || undefined,
        onboarding_step: 5,
      });

      if (form.portfolioImages.length > 0) {
        await uploadProviderGallery(form.portfolioImages);
      }

      try {
        await submitProviderApplication();
      } catch (error) {
        if (!(error instanceof ApiError) || !error.message.toLowerCase().includes("pending application")) {
          throw error;
        }
      }

      router.replace("/provider/waiting-approval");
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إرسال الطلب.";

      Alert.alert("خطأ", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    isSubmitting || !form.whatsappNumber.trim() || Object.values(errors).some((value) => Boolean(value));

  return (
    <SafeAreaView className="flex-1 bg-[#111015]">
      <StatusBar barStyle="light-content" backgroundColor="#111015" />

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-[#1e1c24] items-center justify-center"
            >
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-cairo-bold">تسجيل مزود الخدمة</Text>
            <View className="w-10" />
          </View>

          <View className="px-5 mb-4">
            <View className="mb-4 flex-row gap-2">
              <View className="h-1 flex-1 rounded-full bg-[#A855F7]" />
              <View className="h-1 flex-1 rounded-full bg-[#A855F7]" />
              <View className="h-1 flex-1 rounded-full bg-[#A855F7]" />
              <View className="h-1 flex-1 rounded-full bg-[#A855F7]" />
              <View className="h-1 flex-1 rounded-full bg-[#A855F7]" />
            </View>

            <View className="mb-4 self-start rounded-full border border-[#5B21B6] bg-[#221133] px-3 py-1.5">
              <Text className="font-cairo-bold text-[12px] text-[#D8B4FE]">الخطوة 5 من 5</Text>
            </View>

            <View className="flex-row justify-end mb-1">
              <Text className="text-[#7c3aed] text-xs font-cairo-bold">الحقول المكتملة</Text>
              <Text className="text-[#7c3aed] text-xs font-cairo-bold mr-2">{completedFields}/3</Text>
            </View>
            <View className="h-1.5 bg-[#2a1045] rounded-full">
              <View
                className="h-1.5 bg-[#7c3aed] rounded-full"
                style={{ width: progressWidth as DimensionValue }}
              />
            </View>
          </View>

          <View className="px-5 mb-8 items-end">
            <Text className="text-white text-2xl font-cairo-bold mb-2" style={{ textAlign: "right" }}>
              معلومات التواصل
            </Text>
            <Text className="text-[#a78bca] text-sm leading-6 font-cairo" style={{ textAlign: "right" }}>
              هذه هي الخطوة الأخيرة. بعد الإرسال سيظهر لك إشعار انتظار المراجعة.
            </Text>
          </View>

          <View className="px-5 gap-5">
            <View>
              <View className="flex-row justify-end items-center mb-2 gap-1">
                <Text className="text-xs text-red-400 font-cairo">مطلوب</Text>
                <Text className="text-[#c4b5d4] text-sm font-cairo" style={{ textAlign: "right" }}>
                  رقم الواتساب
                </Text>
              </View>
              <View className="bg-[#1e1c24] rounded-2xl flex-row items-center px-4 border border-[#2e2a38]">
                <View className="flex-1">
                  <TextInput
                    value={form.whatsappNumber}
                    onChangeText={(value) => {
                      setForm((prev) => ({ ...prev, whatsappNumber: value }));
                      setErrors((prev) => ({ ...prev, whatsappNumber: validateWhatsapp(value) }));
                    }}
                    placeholder="05X XXX XXXX"
                    placeholderTextColor="#4a4560"
                    className="text-white py-4 text-right font-cairo"
                    keyboardType="phone-pad"
                    style={{ textAlign: "right" }}
                  />
                </View>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#7c3aed" />
              </View>
              {!!errors.whatsappNumber && (
                <Text className="text-red-400 text-xs mt-2 font-cairo" style={{ textAlign: "right" }}>
                  {errors.whatsappNumber}
                </Text>
              )}
            </View>

            <View>
              <Text className="text-[#c4b5d4] text-sm mb-2 font-cairo" style={{ textAlign: "right" }}>
                اسم المستخدم في إنستغرام
              </Text>
              <View className="bg-[#1e1c24] rounded-2xl flex-row items-center px-4 border border-[#2e2a38]">
                <View className="flex-1">
                  <TextInput
                    value={form.instagramUsername}
                    onChangeText={(value) => {
                      setForm((prev) => ({ ...prev, instagramUsername: value }));
                      setErrors((prev) => ({ ...prev, instagramUsername: validateInstagram(value) }));
                    }}
                    placeholder="@username"
                    placeholderTextColor="#4a4560"
                    className="text-white py-4 text-right font-cairo"
                    style={{ textAlign: "right" }}
                    autoCapitalize="none"
                  />
                </View>
                <FontAwesome name="instagram" size={20} color="#7c3aed" />
              </View>
              {!!errors.instagramUsername && (
                <Text className="text-red-400 text-xs mt-2 font-cairo" style={{ textAlign: "right" }}>
                  {errors.instagramUsername}
                </Text>
              )}
            </View>

            <View>
              <Text className="text-[#c4b5d4] text-sm mb-2 font-cairo" style={{ textAlign: "right" }}>
                رابط حساب فيسبوك
              </Text>
              <View className="bg-[#1e1c24] rounded-2xl flex-row items-center px-4 border border-[#2e2a38]">
                <View className="flex-1">
                  <TextInput
                    value={form.facebookUrl}
                    onChangeText={(value) => {
                      setForm((prev) => ({ ...prev, facebookUrl: value }));
                      setErrors((prev) => ({ ...prev, facebookUrl: validateFacebook(value) }));
                    }}
                    placeholder="facebook.com/username"
                    placeholderTextColor="#4a4560"
                    className="text-white py-4 text-right font-cairo"
                    style={{ textAlign: "right" }}
                    autoCapitalize="none"
                  />
                </View>
                <FontAwesome name="facebook-square" size={20} color="#7c3aed" />
              </View>
              {!!errors.facebookUrl && (
                <Text className="text-red-400 text-xs mt-2 font-cairo" style={{ textAlign: "right" }}>
                  {errors.facebookUrl}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>

        <View className="px-5 pb-6 pt-3 bg-[#111015]">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
            className={`rounded-2xl py-4 flex-row items-center justify-center gap-2 ${
              isSubmitDisabled ? "bg-[#3a2b57]" : "bg-[#7c3aed]"
            }`}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            )}
            <Text className="text-white font-cairo-bold text-base">
              {isSubmitting ? "جارٍ إرسال الطلب..." : "إرسال الطلب"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
