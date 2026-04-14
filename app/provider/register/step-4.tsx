import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ApiError,
  registerProvider,
  submitProviderApplication,
  updateProviderBusiness,
  updateProviderContact,
  updateProviderLocationSchedule,
  uploadProviderImage,
} from "../../../services/providerRegister";
import { useProviderRegister } from "../../../store/provider-register-store";

const inputClasses =
  "h-[52px] rounded-2xl border border-[#27272A] bg-[#111115] px-4 text-right font-cairo text-[14px] text-white";

const dayMap: Record<string, string> = {
  السبت: "saturday",
  الأحد: "sunday",
  الاثنين: "monday",
  الثلاثاء: "tuesday",
  الأربعاء: "wednesday",
  الخميس: "thursday",
  الجمعة: "friday",
};

export default function StepFourScreen() {
  const { form, setForm } = useProviderRegister();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buildLocationText = () =>
    [form.address.trim(), form.locationDescription.trim()]
      .filter(Boolean)
      .join(" - ");

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

  const validateForm = () => {
    if (!form.fullName.trim()) {
      Alert.alert("تنبيه", "أدخل الاسم الكامل أولًا.");
      return false;
    }

    if (!form.email.trim()) {
      Alert.alert("تنبيه", "أدخل البريد الإلكتروني أولًا.");
      return false;
    }

    if (!form.phone.trim()) {
      Alert.alert("تنبيه", "أدخل رقم الجوال أولًا.");
      return false;
    }

    if (!form.whatsappNumber.trim()) {
      Alert.alert("تنبيه", "أدخل رقم الواتساب أولًا.");
      return false;
    }

    if (!form.password.trim()) {
      Alert.alert("تنبيه", "أدخل كلمة المرور أولًا.");
      return false;
    }

    if (form.password.length < 8) {
      Alert.alert("تنبيه", "كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      return false;
    }

    if (form.password !== form.passwordConfirmation) {
      Alert.alert("تنبيه", "تأكيد كلمة المرور غير مطابق.");
      return false;
    }

    if (form.fromTime >= form.toTime) {
      Alert.alert("تنبيه", "وقت بداية العمل يجب أن يكون قبل وقت النهاية.");
      return false;
    }

    if (buildHoursPayload().length === 0) {
      Alert.alert("تنبيه", "أيام العمل غير صالحة، ارجع للخطوة السابقة واخترها من جديد.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let token = form.token;

      if (!token) {
        const registerResult = await registerProvider({
          full_name: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          password_confirmation: form.passwordConfirmation,
        });

        token = registerResult.token;

        setForm((prev) => ({
          ...prev,
          token,
        }));
      }

      if (!token) {
        throw new Error("Missing auth token after registration");
      }

      if (form.imageUri) {
        await uploadProviderImage(token, form.imageUri);
      }

      await updateProviderBusiness(token, {
        provider_name: form.displayName.trim(),
        bio: form.bio.trim(),
        category_id: form.categoryId,
        custom_services: form.services,
        onboarding_step: 2,
      });

      await updateProviderLocationSchedule(token, {
        city: form.city.trim(),
        location_text: buildLocationText(),
        onboarding_step: 3,
        hours: buildHoursPayload(),
      });

      await updateProviderContact(token, {
        whatsapp_number: form.whatsappNumber.trim(),
        onboarding_step: 4,
      });

      try {
        await submitProviderApplication(token);
      } catch (error) {
        if (
          !(error instanceof ApiError) ||
          !error.message.toLowerCase().includes("pending application")
        ) {
          throw error;
        }
      }

      router.replace("/provider/register/waiting-approval");
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0A0F" }} edges={["top", "bottom"]}>
      <View className="flex-1 bg-[#050507]">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-5 pb-6 pt-5"
        >
          <View className="mb-[18px] flex-row-reverse items-center justify-between">
            <Text className="font-cairo-bold text-[18px] text-white">
              تسجيل مزود الخدمة
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View className="mb-4 flex-row gap-2">
            <View className="h-1 flex-1 rounded-full bg-[#A855F7]" />
            <View className="h-1 flex-1 rounded-full bg-[#A855F7]" />
            <View className="h-1 flex-1 rounded-full bg-[#A855F7]" />
            <View className="h-1 flex-1 rounded-full bg-[#A855F7]" />
          </View>

          <View className="mb-[18px] self-start rounded-full border border-[#5B21B6] bg-[#221133] px-3 py-1.5">
            <Text className="font-cairo-bold text-[12px] text-[#D8B4FE]">
              الخطوة 4 من 4
            </Text>
          </View>

          <Text className="mb-2 text-right font-cairo-bold text-[28px] text-white">
            بيانات الحساب والتواصل
          </Text>
          <Text className="mb-6 text-right font-cairo text-[14px] leading-[21px] text-[#B5B5C3]">
            هذه آخر خطوة. سننشئ الحساب، نرفع بياناتك التي أدخلتها، ثم نرسل الطلب
            للمراجعة مباشرة.
          </Text>

          <View className="mb-[18px]">
            <Text className="mb-2.5 text-right font-cairo-bold text-[14px] text-white">
              الاسم الكامل
            </Text>
            <TextInput
              placeholder="أدخل الاسم الكامل"
              placeholderTextColor="#6F6F7B"
              className={inputClasses}
              value={form.fullName}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, fullName: text }))
              }
            />
          </View>

          <View className="mb-[18px]">
            <Text className="mb-2.5 text-right font-cairo-bold text-[14px] text-white">
              البريد الإلكتروني
            </Text>
            <TextInput
              placeholder="name@example.com"
              placeholderTextColor="#6F6F7B"
              className={inputClasses}
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
            />
          </View>

          <View className="mb-[18px]">
            <Text className="mb-2.5 text-right font-cairo-bold text-[14px] text-white">
              رقم الجوال
            </Text>
            <TextInput
              placeholder="05XXXXXXXX"
              placeholderTextColor="#6F6F7B"
              className={inputClasses}
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(text) => setForm((prev) => ({ ...prev, phone: text }))}
            />
          </View>

          <View className="mb-[18px]">
            <Text className="mb-2.5 text-right font-cairo-bold text-[14px] text-white">
              رقم الواتساب
            </Text>
            <TextInput
              placeholder="05XXXXXXXX"
              placeholderTextColor="#6F6F7B"
              className={inputClasses}
              keyboardType="phone-pad"
              value={form.whatsappNumber}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, whatsappNumber: text }))
              }
            />
          </View>

          <View className="mb-[18px]">
            <Text className="mb-2.5 text-right font-cairo-bold text-[14px] text-white">
              كلمة المرور
            </Text>
            <TextInput
              placeholder="8 أحرف على الأقل"
              placeholderTextColor="#6F6F7B"
              className={inputClasses}
              secureTextEntry
              value={form.password}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, password: text }))
              }
            />
          </View>

          <View className="mb-6">
            <Text className="mb-2.5 text-right font-cairo-bold text-[14px] text-white">
              تأكيد كلمة المرور
            </Text>
            <TextInput
              placeholder="أعد إدخال كلمة المرور"
              placeholderTextColor="#6F6F7B"
              className={inputClasses}
              secureTextEntry
              value={form.passwordConfirmation}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, passwordConfirmation: text }))
              }
            />
          </View>

          <TouchableOpacity
            className={`mt-2 h-[58px] flex-row-reverse items-center justify-center gap-2 rounded-[18px] ${
              isSubmitting ? "bg-[#6B21A8]" : "bg-[#9333EA]"
            }`}
            disabled={isSubmitting}
            onPress={handleSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
            )}
            <Text className="font-cairo-bold text-[16px] text-white">
              {isSubmitting ? "جاري إرسال الطلب..." : "إرسال الطلب"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
