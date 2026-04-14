import { useProviderRegister } from "@/store/provider-register-store";
import { typography } from "@/theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const cities = ["رام الله", "نابلس", "جنين", "طولكرم", "طوباس", "الخليل", "بيت لحم"];
const workingDaysList = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const timeOptions = ["08:00", "09:00", "10:00", "17:00", "18:00", "19:00"];

export default function StepThreeScreen() {
  const { form, setForm } = useProviderRegister();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

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
      Alert.alert("تنبيه", "اختار المدينة أولًا.");
      return;
    }

    if (!form.address.trim()) {
      Alert.alert("تنبيه", "أدخل العنوان أولًا.");
      return;
    }

    if (form.workingDays.length === 0) {
      Alert.alert("تنبيه", "اختار يوم عمل واحد على الأقل.");
      return;
    }

    router.replace("/provider/register/waiting-approval");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.phoneFrame, isTablet && styles.phoneFrameTablet]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>تسجيل مزود الخدمة</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.progressRow}>
            <View style={styles.progressLineActive} />
            <View style={styles.progressLineActive} />
            <View style={styles.progressLineInactive} />
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>الخطوة 3 من 3</Text>
          </View>

          <Text style={styles.sectionTitle}>الموقع وساعات العمل</Text>
          <Text style={styles.sectionDesc}>
            أكمل بيانات الموقع وأوقات العمل الخاصة بك.
          </Text>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>المدينة</Text>
            <TouchableOpacity
              style={styles.selectorBox}
              onPress={() => setShowCities((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Text style={form.city ? styles.selectedText : styles.selectorPlaceholder}>
                {form.city || "اختر المدينة"}
              </Text>
              <Ionicons
                name={showCities ? "chevron-up" : "chevron-down"}
                size={18}
                color="#A1A1AA"
              />
            </TouchableOpacity>

            {showCities && (
              <View style={styles.dropdownBox}>
                {cities.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setForm((prev) => ({ ...prev, city }));
                      setShowCities(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{city}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>العنوان</Text>
            <TextInput
              placeholder="أدخل العنوان"
              placeholderTextColor="#6F6F7B"
              style={styles.input}
              textAlign="right"
              value={form.address}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, address: text }))
              }
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>وصف الموقع</Text>
            <TextInput
              placeholder="اكتب تفاصيل إضافية عن الموقع"
              placeholderTextColor="#6F6F7B"
              style={styles.textArea}
              multiline
              textAlignVertical="top"
              textAlign="right"
              value={form.locationDescription}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, locationDescription: text }))
              }
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>أيام العمل</Text>
            <View style={styles.daysWrapper}>
              {workingDaysList.map((day) => {
                const isSelected = form.workingDays.includes(day);

                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayTag, isSelected && styles.dayTagSelected]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[styles.dayTagText, isSelected && styles.dayTagTextSelected]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeBoxWrapper}>
              <Text style={styles.label}>من</Text>
              <TouchableOpacity
                style={styles.selectorBox}
                onPress={() => {
                  setShowFromTimes((prev) => !prev);
                  setShowToTimes(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.selectedText}>{form.fromTime}</Text>
                <Ionicons name="time-outline" size={18} color="#A1A1AA" />
              </TouchableOpacity>

              {showFromTimes && (
                <View style={styles.dropdownBox}>
                  {timeOptions.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setForm((prev) => ({ ...prev, fromTime: time }));
                        setShowFromTimes(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{time}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.timeBoxWrapper}>
              <Text style={styles.label}>إلى</Text>
              <TouchableOpacity
                style={styles.selectorBox}
                onPress={() => {
                  setShowToTimes((prev) => !prev);
                  setShowFromTimes(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.selectedText}>{form.toTime}</Text>
                <Ionicons name="time-outline" size={18} color="#A1A1AA" />
              </TouchableOpacity>

              {showToTimes && (
                <View style={styles.dropdownBox}>
                  {timeOptions.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setForm((prev) => ({ ...prev, toTime: time }));
                        setShowToTimes(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{time}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleNext}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.submitButtonText}>الخطوة التالية</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0A0F",
  },
  container: {
    flex: 1,
    backgroundColor: "#0A0A0F",
  },
  phoneFrame: {
    flex: 1,
    width: "100%",
    backgroundColor: "#050507",
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 20,
  },
  phoneFrameTablet: {
    maxWidth: 560,
    alignSelf: "center",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#1A1A22",
    marginVertical: 12,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: typography.fontFamily.bold,
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  progressLineActive: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#A855F7",
  },
  progressLineInactive: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#3A2257",
  },
  stepBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#221133",
    borderWidth: 1,
    borderColor: "#5B21B6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 18,
  },
  stepBadgeText: {
    color: "#D8B4FE",
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 8,
    textAlign: "right",
  },
  sectionDesc: {
    color: "#B5B5C3",
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 21,
    marginBottom: 24,
    textAlign: "right",
  },
  fieldBlock: {
    marginBottom: 18,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 10,
    textAlign: "right",
  },
  input: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272A",
    backgroundColor: "#111115",
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
  },
  textArea: {
    minHeight: 110,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#27272A",
    backgroundColor: "#111115",
    paddingHorizontal: 16,
    paddingTop: 14,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
  },
  selectorBox: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272A",
    backgroundColor: "#111115",
    paddingHorizontal: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorPlaceholder: {
    color: "#6F6F7B",
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
  },
  selectedText: {
    color: "#D4D4D8",
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
  },
  dropdownBox: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272A",
    backgroundColor: "#111115",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C22",
  },
  dropdownItemText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    textAlign: "right",
  },
  daysWrapper: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10,
  },
  dayTag: {
    backgroundColor: "#1A1222",
    borderWidth: 1,
    borderColor: "#3A2A4D",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  dayTagSelected: {
    backgroundColor: "#2A163B",
    borderColor: "#5B21B6",
  },
  dayTagText: {
    color: "#B8A9CA",
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
  },
  dayTagTextSelected: {
    color: "#E9D5FF",
  },
  timeRow: {
    flexDirection: "row-reverse",
    gap: 12,
    marginBottom: 28,
  },
  timeBoxWrapper: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#9333EA",
    borderRadius: 16,
    height: 56,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: "auto",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
  },
});