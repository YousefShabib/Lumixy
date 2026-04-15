import {
  fetchServiceCategories,
  ServiceCategory,
} from "../../../services/providerRegister";
import { useProviderRegister } from "../../../store/provider-register-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const inputClasses =
  "h-[52px] rounded-2xl border border-[#27272A] bg-[#111115] px-4 text-right font-cairo text-[14px] text-white";
const textAreaClasses =
  "min-h-[120px] rounded-[18px] border border-[#27272A] bg-[#111115] px-4 pt-3.5 text-right font-cairo text-[14px] text-white";
const selectorClasses =
  "min-h-[52px] flex-row-reverse items-center justify-between rounded-2xl border border-[#27272A] bg-[#111115] px-4";
const dropdownClasses =
  "z-10 mt-2.5 overflow-hidden rounded-2xl border border-[#27272A] bg-[#111115]";

export default function StepTwoScreen() {
  const { form, setForm } = useProviderRegister();

  const [serviceInput, setServiceInput] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const result = await fetchServiceCategories();
        setCategories(result);
      } catch (error: any) {
        console.log("Categories error:", error);
        Alert.alert("خطأ", "فشل تحميل التصنيفات من الباك.");
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const selectedCategoryName =
    categories.find((item) => item.id === form.categoryId)?.name || "";

  const handleAddService = () => {
    const value = serviceInput.trim();

    if (!value) {
      return;
    }

    const alreadyExists = form.services.some(
      (service) => service.trim().toLowerCase() === value.toLowerCase()
    );

    if (alreadyExists) {
      Alert.alert("تنبيه", "هذه الخدمة تمت إضافتها بالفعل.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      services: [...prev.services, value],
    }));
    setServiceInput("");
  };

  const handleRemoveService = (service: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.filter((item) => item !== service),
    }));
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
          <View className="w-full max-w-none">
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
              <View className="h-1 flex-1 rounded-full bg-[#3A2257]" />
              <View className="h-1 flex-1 rounded-full bg-[#3A2257]" />
              <View className="h-1 flex-1 rounded-full bg-[#3A2257]" />
            </View>

            <View className="mb-[18px] self-start rounded-full border border-[#5B21B6] bg-[#221133] px-3 py-1.5">
              <Text className="font-cairo-bold text-[12px] text-[#D8B4FE]">
                الخطوة 2 من 5
              </Text>
            </View>

            <Text className="mb-2 text-right font-cairo-bold text-[24px] text-white">
              وصف الخدمة والمهارات
            </Text>
            <Text className="mb-6 text-right font-cairo text-[14px] leading-[21px] text-[#B5B5C3]">
              أدخل المعلومات الأساسية عن خدمتك حتى يتمكن العملاء من فهم ما الذي
              تقدمه.
            </Text>

            <View className="mb-[18px]">
              <Text className="mb-2.5 text-right font-cairo-bold text-[14px] text-white">
                الاسم الظاهر
              </Text>
              <TextInput
                placeholder="أدخل الاسم الظاهر"
                placeholderTextColor="#6F6F7B"
                className={inputClasses}
                value={form.displayName}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, displayName: text }))
                }
              />
            </View>

            <View className="mb-[18px]">
              <Text className="mb-2.5 text-right font-cairo-bold text-[14px] text-white">
                نبذة تعريفية بالعربية
              </Text>
              <TextInput
                placeholder="اكتب نبذة احترافية قصيرة"
                placeholderTextColor="#6F6F7B"
                className={textAreaClasses}
                multiline
                textAlignVertical="top"
                maxLength={500}
                value={form.bio}
                onChangeText={(text) => setForm((prev) => ({ ...prev, bio: text }))}
              />
              <Text className="mt-1.5 text-left font-cairo text-[12px] text-[#7C7C88]">
                {form.bio.length} / 500
              </Text>
            </View>

            <View className="mb-[18px]">
              <Text className="mb-2.5 text-right font-cairo-bold text-[14px] text-white">
                التصنيف
              </Text>
              <TouchableOpacity
                className={selectorClasses}
                onPress={() => setShowCategories((prev) => !prev)}
                activeOpacity={0.8}
              >
                <Text
                  className={`font-cairo text-[14px] ${
                    form.categoryId ? "text-[#D4D4D8]" : "text-[#6F6F7B]"
                  }`}
                >
                  {selectedCategoryName ||
                    (loadingCategories ? "جاري التحميل..." : "اختر التصنيف")}
                </Text>
                <Ionicons
                  name={showCategories ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#A1A1AA"
                />
              </TouchableOpacity>

              {showCategories && (
                <View className={dropdownClasses}>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        className="border-b border-[#1C1C22] px-4 py-[14px]"
                        onPress={() => {
                          setForm((prev) => ({ ...prev, categoryId: category.id }));
                          setShowCategories(false);
                        }}
                      >
                        <Text className="text-right font-cairo text-[14px] text-white">
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text className="px-3 py-4 text-center font-cairo text-[13px] text-[#7C7C88]">
                      {loadingCategories
                        ? "جاري تحميل التصنيفات..."
                        : "لا يوجد تصنيفات"}
                    </Text>
                  )}
                </View>
              )}
            </View>

            <View className="mb-[18px]">
              <Text className="text-right font-cairo-bold text-[20px] text-white">
                الخدمات التي تقدمها
              </Text>
              <Text className="mb-4 mt-1 text-right font-cairo text-[14px] leading-6 text-[#7C7C88]">
                أضف الخدمات والمهارات الفنية التي تتقنها
              </Text>

              <View className="mb-4 flex-row items-center gap-3">
                <TouchableOpacity
                  className="h-[58px] w-[58px] items-center justify-center rounded-full bg-[#8B2CF5]"
                  onPress={handleAddService}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>

                <View className="flex-1 rounded-full border border-[#35353B] bg-[#1A1A1F] px-5">
                  <TextInput
                    placeholder="مثال: تطوير تطبيقات، تصوير هدايا..."
                    placeholderTextColor="#6F6F7B"
                    className="h-[58px] text-right font-cairo text-[15px] text-white"
                    value={serviceInput}
                    onChangeText={setServiceInput}
                    onSubmitEditing={handleAddService}
                    returnKeyType="done"
                  />
                </View>
              </View>

              <View className="flex-row-reverse flex-wrap gap-2.5">
                {form.services.map((service) => (
                  <View
                    key={service}
                    className="flex-row-reverse items-center gap-2 rounded-full border border-[#3A3A40] bg-[#26262B] px-4 py-2.5"
                  >
                    <TouchableOpacity onPress={() => handleRemoveService(service)}>
                      <Ionicons name="close" size={18} color="#B8BDC7" />
                    </TouchableOpacity>
                    <Text className="font-cairo-bold text-[14px] text-white">
                      {service}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              className="mt-2 h-14 flex-row-reverse items-center justify-center gap-2 rounded-2xl bg-[#9333EA]"
              onPress={() => {
                if (!form.displayName.trim()) {
                  Alert.alert("تنبيه", "أدخل الاسم الظاهر أولًا.");
                  return;
                }

                if (!form.bio.trim()) {
                  Alert.alert("تنبيه", "أدخل النبذة التعريفية أولًا.");
                  return;
                }

                if (!form.categoryId.trim()) {
                  Alert.alert("تنبيه", "اختار التصنيف أولًا.");
                  return;
                }

                if (form.services.length === 0) {
                  Alert.alert("تنبيه", "أضف خدمة واحدة على الأقل.");
                  return;
                }

                router.push("/provider/register/step-3");
              }}
            >
              <Ionicons name="arrow-forward" size={18} color="#fff" />
              <Text className="font-cairo-bold text-[16px] text-white">
                الخطوة التالية
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
