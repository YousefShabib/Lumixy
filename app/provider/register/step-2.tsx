import {
  fetchServiceCategories,
  ServiceCategory,
} from "@/services/providerRegister";
import { useProviderRegister } from "@/store/provider-register-store";
import { typography } from "@/theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

const availableServices = ["تصوير", "تصميم", "مونتاج", "برمجة", "تسويق", "كتابة محتوى"];

export default function StepTwoScreen() {
  const { form, setForm } = useProviderRegister();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [showServices, setShowServices] = useState(false);
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

  const remainingServices = useMemo(
    () => availableServices.filter((service) => !form.services.includes(service)),
    [form.services]
  );

  const handleAddService = (service: string) => {
    setForm((prev) => ({
      ...prev,
      services: [...prev.services, service],
    }));
    setShowServices(false);
  };

  const handleRemoveService = (service: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.filter((item) => item !== service),
    }));
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
            <View style={styles.progressLineInactive} />
            <View style={styles.progressLineInactive} />
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>الخطوة 2 من 3</Text>
          </View>

          <Text style={styles.sectionTitle}>وصف الخدمة والمهارات</Text>
          <Text style={styles.sectionDesc}>
            أدخل المعلومات الأساسية عن خدمتك حتى يتمكن العملاء من فهم ما الذي تقدمه.
          </Text>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>الاسم الظاهر</Text>
            <TextInput
              placeholder="أدخل الاسم الظاهر"
              placeholderTextColor="#6F6F7B"
              style={styles.input}
              textAlign="right"
              value={form.displayName}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, displayName: text }))
              }
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>نبذة تعريفية بالعربية</Text>
            <TextInput
              placeholder="اكتب نبذة احترافية قصيرة"
              placeholderTextColor="#6F6F7B"
              style={styles.textArea}
              multiline
              textAlignVertical="top"
              textAlign="right"
              maxLength={500}
              value={form.bio}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, bio: text }))
              }
            />
            <Text style={styles.counter}>{form.bio.length} / 500</Text>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>التصنيف</Text>
            <TouchableOpacity
              style={styles.selectorBox}
              onPress={() => setShowCategories((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Text
                style={form.categoryId ? styles.selectedText : styles.selectorPlaceholder}
              >
                {selectedCategoryName || (loadingCategories ? "جاري التحميل..." : "اختر التصنيف")}
              </Text>
              <Ionicons
                name={showCategories ? "chevron-up" : "chevron-down"}
                size={18}
                color="#A1A1AA"
              />
            </TouchableOpacity>

            {showCategories && (
              <View style={styles.dropdownBox}>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setForm((prev) => ({ ...prev, categoryId: category.id }));
                        setShowCategories(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{category.name}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyDropdownText}>
                    {loadingCategories ? "جاري تحميل التصنيفات..." : "لا يوجد تصنيفات"}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>الخدمات التي تقدمها</Text>
            <TouchableOpacity
              style={styles.selectorBox}
              onPress={() => setShowServices((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Text style={styles.selectorPlaceholder}>
                {form.services.length > 0 ? "اخترت خدمات" : "اختر الخدمات"}
              </Text>
              <Ionicons
                name={showServices ? "chevron-up" : "chevron-down"}
                size={18}
                color="#A1A1AA"
              />
            </TouchableOpacity>

            {showServices && remainingServices.length > 0 && (
              <View style={styles.dropdownBox}>
                {remainingServices.map((service) => (
                  <TouchableOpacity
                    key={service}
                    style={styles.dropdownItem}
                    onPress={() => handleAddService(service)}
                  >
                    <Text style={styles.dropdownItemText}>{service}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {showServices && remainingServices.length === 0 && (
              <View style={styles.dropdownBox}>
                <Text style={styles.emptyDropdownText}>تمت إضافة جميع الخدمات المتاحة</Text>
              </View>
            )}
          </View>

          <View style={styles.tagsRow}>
            {form.services.map((service) => (
              <View key={service} style={styles.tag}>
                <TouchableOpacity onPress={() => handleRemoveService(service)}>
                  <Ionicons name="close" size={14} color="#E9D5FF" />
                </TouchableOpacity>
                <Text style={styles.tagText}>{service}</Text>
              </View>
            ))}
          </View>

            <TouchableOpacity
              style={styles.nextButton}
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
                  Alert.alert("تنبيه", "اختار خدمة واحدة على الأقل.");
                  return;
                }

                router.push("/provider/register/step-3");
              }}
            >
              <Ionicons name="arrow-back" size={18} color="#fff" />
              <Text style={styles.nextButtonText}>الخطوة التالية</Text>
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
    minHeight: 120,
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
  counter: {
    color: "#7C7C88",
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
    marginTop: 6,
    textAlign: "left",
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
  emptyDropdownText: {
    color: "#7C7C88",
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
    textAlign: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  tagsRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  tag: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2A163B",
    borderWidth: 1,
    borderColor: "#5B21B6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tagText: {
    color: "#E9D5FF",
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
  },
  nextButton: {
    backgroundColor: "#9333EA",
    borderRadius: 16,
    height: 56,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: "auto",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
  },
});
