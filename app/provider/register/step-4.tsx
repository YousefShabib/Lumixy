import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  type DimensionValue,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";

import { prepareImageForUpload } from "../../../services/image-processing";
import { useProviderRegister } from "../../../store/provider-register-store";

export default function StepFourScreen() {
  const { form, setForm } = useProviderRegister();
  const [isSavingImages, setIsSavingImages] = useState(false);
  const [isPreparingImages, setIsPreparingImages] = useState(false);
  const maxImages = 15;
  const images = form.portfolioImages;

  const gridItems = useMemo(
    () => (images.length < maxImages ? [...images, "ADD_SLOT"] : images),
    [images]
  );

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("الإذن مطلوب", "يرجى السماح بالوصول إلى مكتبة الصور.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: maxImages - images.length,
    });

    if (result.canceled) {
      return;
    }

    try {
      setIsPreparingImages(true);

      const nextUris = await Promise.all(
        result.assets.map((asset) =>
          prepareImageForUpload(asset.uri, {
            compress: 0.72,
            maxDimension: 1800,
          })
        )
      );

      setForm((prev) => ({
        ...prev,
        portfolioImages: [...prev.portfolioImages, ...nextUris].slice(0, maxImages),
      }));
    } catch (error) {
      console.log("Portfolio processing error:", error);
      Alert.alert("خطأ", "تعذر تجهيز صور المعرض قبل الرفع.");
    } finally {
      setIsPreparingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      portfolioImages: prev.portfolioImages.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const handleNext = async () => {
    setIsSavingImages(true);

    try {
      router.push("/provider/register/step-5");
    } finally {
      setIsSavingImages(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#111015]">
      <StatusBar barStyle="light-content" backgroundColor="#111015" />

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

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="mb-4 flex-row gap-2">
          <View className="h-1 flex-1 rounded-full bg-[#A855F7]" />
          <View className="h-1 flex-1 rounded-full bg-[#A855F7]" />
          <View className="h-1 flex-1 rounded-full bg-[#A855F7]" />
          <View className="h-1 flex-1 rounded-full bg-[#A855F7]" />
          <View className="h-1 flex-1 rounded-full bg-[#3A2257]" />
        </View>

        <View className="mb-4 self-start rounded-full border border-[#5B21B6] bg-[#221133] px-3 py-1.5">
          <Text className="font-cairo-bold text-[12px] text-[#D8B4FE]">الخطوة 4 من 5</Text>
        </View>

        <View className="items-end mb-6">
          <Text className="text-white text-2xl font-cairo-bold mb-2" style={{ textAlign: "right" }}>
            معرض الأعمال
          </Text>
          <Text className="text-[#a78bca] text-sm leading-6 font-cairo" style={{ textAlign: "right" }}>
            قم بتحميل صور لأعمالك السابقة لجذب المزيد من العملاء{'\n'}وبناء الثقة.
          </Text>
        </View>

        {images.length === 0 && (
          <TouchableOpacity
            onPress={pickImages}
            className="border-2 border-dashed border-[#3d1a6e] rounded-3xl p-8 items-center justify-center bg-[#1a1026] mb-6"
            activeOpacity={0.8}
          >
            <View className="w-16 h-16 rounded-2xl bg-[#7c3aed]/20 items-center justify-center mb-4">
              <Ionicons name="camera-outline" size={30} color="#a78bfa" />
            </View>
            <Text className="text-white text-base font-cairo-bold mb-1">إضافة صور جديدة</Text>
            <Text className="text-[#6b6480] text-xs font-cairo">يمكنك رفع حتى 15 صورة</Text>
            <TouchableOpacity
              onPress={pickImages}
              className="mt-4 bg-[#7c3aed] rounded-xl px-6 py-2.5"
            >
              <Text className="text-white text-sm font-cairo-bold">اختر ملفات</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {images.length > 0 && (
          <View className="mb-4">
            <Text className="text-[#c4b5d4] text-sm mb-3 font-cairo" style={{ textAlign: "right" }}>
              الصور المرفوعة ({images.length})
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {gridItems.map((item, index) =>
                item === "ADD_SLOT" ? (
                  <TouchableOpacity
                    key="add"
                    onPress={pickImages}
                    className="bg-[#1e1c24] rounded-2xl border border-dashed border-[#3d1a6e] items-center justify-center"
                    style={{ width: "31%" as DimensionValue, aspectRatio: 1 }}
                  >
                    <Ionicons name="add" size={28} color="#7c3aed" />
                  </TouchableOpacity>
                ) : (
                  <View
                    key={item}
                    className="rounded-2xl overflow-hidden"
                    style={{ width: "31%" as DimensionValue, aspectRatio: 1 }}
                  >
                    <Image source={{ uri: item }} className="w-full h-full" />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 items-center justify-center"
                    >
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-[#111015] border-t border-[#1e1c24]">
        <TouchableOpacity
          onPress={handleNext}
          disabled={isSavingImages || isPreparingImages}
          className={`rounded-2xl py-4 flex-row items-center justify-center gap-2 ${
            isSavingImages || isPreparingImages ? "bg-[#3a2b57]" : "bg-[#7c3aed]"
          }`}
          activeOpacity={0.85}
        >
          <Text className="text-white font-cairo-bold text-base">
            {isSavingImages || isPreparingImages ? "جارٍ تجهيز الصور..." : "الخطوة التالية"}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
