import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProviderRegister } from "../../../store/provider-register-store";

export default function StepOneScreen() {
  const { form, setForm } = useProviderRegister();

  const pickFromLibrary = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("تنبيه", "لازم تسمح بالوصول إلى الصور أولًا.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setForm((prev) => ({
          ...prev,
          imageUri: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.log("Library error:", error);
      Alert.alert("خطأ", "صار خطأ أثناء فتح الألبوم.");
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("تنبيه", "لازم تسمح باستخدام الكاميرا أولًا.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setForm((prev) => ({
          ...prev,
          imageUri: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.log("Camera error:", error);
      Alert.alert("خطأ", "صار خطأ أثناء فتح الكاميرا.");
    }
  };

  const openPickerOptions = () => {
    Alert.alert("اختيار الصورة", "اختر الطريقة المناسبة", [
      {
        text: "فتح الكاميرا",
        onPress: takePhoto,
      },
      {
        text: "اختيار من الألبوم",
        onPress: pickFromLibrary,
      },
      {
        text: "إلغاء",
        style: "cancel",
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0A0F" }} edges={["top", "bottom"]}>
      <View className="flex-1 bg-[#050507]">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex-grow px-5 pb-6 pt-5"
        >
          <View className="flex-1">
            <View className="mb-[18px] flex-row-reverse items-center justify-between">
              <Text className="font-cairo-bold text-[18px] text-white">تسجيل مزود الخدمة</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View className="mb-4 flex-row gap-2">
              <View className="h-1 flex-1 rounded-full bg-[#A855F7]" />
              <View className="h-1 flex-1 rounded-full bg-[#3A2257]" />
              <View className="h-1 flex-1 rounded-full bg-[#3A2257]" />
              <View className="h-1 flex-1 rounded-full bg-[#3A2257]" />
              <View className="h-1 flex-1 rounded-full bg-[#3A2257]" />
            </View>

            <View className="mb-[18px] self-start rounded-full border border-[#5B21B6] bg-[#221133] px-3 py-1.5">
              <Text className="font-cairo-bold text-[12px] text-[#D8B4FE]">الخطوة 1 من 5</Text>
            </View>

            <Text className="mb-2.5 text-right font-cairo-bold text-[26px] text-white">
              صورة الملف الشخصي
            </Text>
            <Text className="mb-7 text-right font-cairo text-[14px] leading-[22px] text-[#B5B5C3]">
              ارفع صورة واضحة وجذابة لملفك الشخصي حتى يظهر بشكل احترافي داخل التطبيق.
            </Text>

            <View className="relative mb-7 items-center justify-center">
              <TouchableOpacity
                className="h-[190px] w-[190px] items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#7E22CE] bg-[#0F0A16]"
                onPress={openPickerOptions}
              >
                {form.imageUri ? (
                  <Image source={{ uri: form.imageUri }} className="h-full w-full" />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={34} color="#B15CFF" />
                    <Text className="mt-2.5 font-cairo-bold text-[14px] text-white">
                      رفع صورة
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="absolute bottom-1.5 right-[70px] h-[42px] w-[42px] items-center justify-center rounded-full border-2 border-[#0F0A16] bg-[#A855F7]"
                onPress={openPickerOptions}
              >
                <Ionicons name="add" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <View className="mb-7 gap-[14px] rounded-[18px] border border-[#24172F] bg-[#100C18] p-4">
              <View className="flex-row-reverse items-center">
                <Ionicons name="checkmark-circle-outline" size={18} color="#A855F7" />
                <Text className="mr-2.5 font-cairo text-[13px] text-[#D4D4D8]">
                  يفضّل استخدام صورة احترافية أو لوجو
                </Text>
              </View>

              <View className="flex-row-reverse items-center">
                <Ionicons name="checkmark-circle-outline" size={18} color="#A855F7" />
                <Text className="mr-2.5 font-cairo text-[13px] text-[#D4D4D8]">
                  اختر صورة واضحة وبجودة جيدة
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="mt-auto h-14 flex-row-reverse items-center justify-center gap-2 rounded-2xl bg-[#9333EA]"
              onPress={() => {
                if (!form.imageUri) {
                  Alert.alert("تنبيه", "لازم تختار صورة الملف الشخصي أولًا.");
                  return;
                }

                router.push("/provider/register/step-2");
              }}
            >
              <Ionicons name="arrow-forward" size={18} color="#fff" />
              <Text className="font-cairo-bold text-[16px] text-white">التالي</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
