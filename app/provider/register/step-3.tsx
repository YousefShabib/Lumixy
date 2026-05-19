import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProviderRegister } from "../../../store/provider-register-store";

const cities = ["رام الله", "نابلس", "جنين", "طولكرم", "طوباس", "الخليل", "بيت لحم"];
const workingDaysList = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const timeOptions = ["08:00", "09:00", "10:00", "17:00", "18:00", "19:00"];

const selectorClasses =
  "min-h-[52px] flex-row-reverse items-center justify-between rounded-2xl border border-[#2C2C36] bg-[#111115] px-4";
const dropdownClasses =
  "z-10 mt-2.5 overflow-hidden rounded-2xl border border-[#27272A] bg-[#111115]";

export default function StepThreeScreen() {
  const { form, setForm } = useProviderRegister();
  const [showCities, setShowCities] = useState(false);
  const [showFromTimes, setShowFromTimes] = useState(false);
  const [showToTimes, setShowToTimes] = useState(false);

  const toggleDay = (day: string) => {
    setForm((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((item) => item !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleNext = () => {
    if (!form.city.trim()) {
      Alert.alert("تنبيه", "اختر المدينة أولًا.");
      return;
    }

    if (form.workingDays.length === 0) {
      Alert.alert("تنبيه", "اختر يوم عمل واحد على الأقل.");
      return;
    }

    if (form.fromTime >= form.toTime) {
      Alert.alert("تنبيه", "وقت بداية العمل يجب أن يكون قبل وقت النهاية.");
      return;
    }

    router.push("/provider/register/step-4");
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
              <Text className="font-cairo-bold text-[18px] text-white">تسجيل مزود الخدمة</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View className="mb-4 flex-row gap-2">
              <View className="h-1 flex-1 rounded-full bg-[#A855F7]" />
              <View className="h-1 flex-1 rounded-full bg-[#A855F7]" />
              <View className="h-1 flex-1 rounded-full bg-[#A855F7]" />
              <View className="h-1 flex-1 rounded-full bg-[#3A2257]" />
              <View className="h-1 flex-1 rounded-full bg-[#3A2257]" />
            </View>

            <View className="mb-[18px] self-start rounded-full border border-[#5B21B6] bg-[#221133] px-3 py-1.5">
              <Text className="font-cairo-bold text-[12px] text-[#D8B4FE]">الخطوة 3 من 5</Text>
            </View>

            <Text className="mb-2 text-right font-cairo-bold text-[32px] text-white">
              الموقع وساعات العمل
            </Text>
            <Text className="mb-6 text-right font-cairo text-[14px] leading-[21px] text-[#B5B5C3]">
              أخبرنا أين يقع عملك ومتى تتوفر لتقديم الخدمات.
            </Text>

            <View className="mb-[18px] rounded-[22px] border border-[#24172F] bg-[#121218] p-4">
              <View className="mb-2 flex-row-reverse items-center gap-1.5">
                <Text className="font-cairo-bold text-[16px] text-white">المدينة</Text>
                <Ionicons name="location-outline" size={16} color="#A855F7" />
              </View>

              <Text className="mb-2.5 text-right font-cairo text-[12px] text-[#7C7C88]">
                اختر المدينة
              </Text>

              <TouchableOpacity
                className={selectorClasses}
                onPress={() => setShowCities((prev) => !prev)}
                activeOpacity={0.8}
              >
                <Text className={`font-cairo text-[14px] ${form.city ? "text-white" : "text-[#6F6F7B]"}`}>
                  {form.city || "اختر المدينة"}
                </Text>
                <Ionicons name={showCities ? "chevron-up" : "chevron-down"} size={18} color="#A1A1AA" />
              </TouchableOpacity>

              {showCities && (
                <View className={dropdownClasses}>
                  {cities.map((city) => (
                    <TouchableOpacity
                      key={city}
                      className="border-b border-[#1C1C22] px-4 py-[14px]"
                      onPress={() => {
                        setForm((prev) => ({ ...prev, city }));
                        setShowCities(false);
                      }}
                    >
                      <Text className="text-right font-cairo text-[14px] text-white">{city}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View className="mb-[18px] rounded-[22px] border border-[#24172F] bg-[#121218] p-4">
              <View className="mb-2 flex-row-reverse items-center gap-1.5">
                <Text className="font-cairo-bold text-[16px] text-white">ساعات العمل اليومية</Text>
                <Ionicons name="time-outline" size={16} color="#A855F7" />
              </View>

              <View className="mb-2 flex-row justify-between px-1">
                <Text className="font-cairo-bold text-[13px] text-[#D4D4D8]">إلى</Text>
                <Text className="font-cairo-bold text-[13px] text-[#D4D4D8]">من</Text>
              </View>

              <View className="mb-4 flex-row gap-3">
                <View className="flex-1">
                  <TouchableOpacity
                    className={selectorClasses}
                    onPress={() => {
                      setShowToTimes((prev) => !prev);
                      setShowFromTimes(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text className="font-cairo text-[14px] text-white">{form.toTime}</Text>
                    <Ionicons name="time-outline" size={18} color="#A1A1AA" />
                  </TouchableOpacity>

                  {showToTimes && (
                    <View className={dropdownClasses}>
                      {timeOptions.map((time) => (
                        <TouchableOpacity
                          key={time}
                          className="border-b border-[#1C1C22] px-4 py-[14px]"
                          onPress={() => {
                            setForm((prev) => ({ ...prev, toTime: time }));
                            setShowToTimes(false);
                          }}
                        >
                          <Text className="text-right font-cairo text-[14px] text-white">{time}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View className="flex-1">
                  <TouchableOpacity
                    className={selectorClasses}
                    onPress={() => {
                      setShowFromTimes((prev) => !prev);
                      setShowToTimes(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text className="font-cairo text-[14px] text-white">{form.fromTime}</Text>
                    <Ionicons name="time-outline" size={18} color="#A1A1AA" />
                  </TouchableOpacity>

                  {showFromTimes && (
                    <View className={dropdownClasses}>
                      {timeOptions.map((time) => (
                        <TouchableOpacity
                          key={time}
                          className="border-b border-[#1C1C22] px-4 py-[14px]"
                          onPress={() => {
                            setForm((prev) => ({ ...prev, fromTime: time }));
                            setShowFromTimes(false);
                          }}
                        >
                          <Text className="text-right font-cairo text-[14px] text-white">{time}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <Text className="mb-2.5 text-right font-cairo text-[12px] text-[#7C7C88]">
                أيام العمل
              </Text>

              <View className="flex-row-reverse flex-wrap gap-2.5">
                {workingDaysList.map((day) => {
                  const isSelected = form.workingDays.includes(day);

                  return (
                    <TouchableOpacity
                      key={day}
                      className={`rounded-full border px-[14px] py-2 ${
                        isSelected ? "border-[#A855F7] bg-[#7C3AED]" : "border-[#473656] bg-[#2A2132]"
                      }`}
                      onPress={() => toggleDay(day)}
                    >
                      <Text
                        className={`font-cairo-bold text-[13px] ${
                          isSelected ? "text-white" : "text-[#D1C4E9]"
                        }`}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              className="mt-2 h-[58px] flex-row-reverse items-center justify-center gap-2 rounded-[18px] bg-[#9333EA]"
              onPress={handleNext}
            >
              <Ionicons name="arrow-forward" size={18} color="#fff" />
              <Text className="font-cairo-bold text-[16px] text-white">الخطوة التالية</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
