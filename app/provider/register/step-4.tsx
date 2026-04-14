import { typography } from "@/theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function StepFourScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.phoneFrame}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>تسجيل مزود الخدمة</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.progressRow}>
          <View style={styles.progressLineInactive} />
          <View style={styles.progressLineInactive} />
          <View style={styles.progressLineActive} />
          <View style={styles.progressLineActive} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>الخطوة 4 من 6</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>الخطوة الرابعة</Text>
          <Text style={styles.description}>
            هذه الصفحة مؤقتة حاليًا، ويمكنك إضافة بيانات التواصل أو الحساب هنا لاحقًا.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push("/provider/register/waiting-approval")}
        >
          <Ionicons name="arrow-back" size={18} color="#fff" />
          <Text style={styles.nextButtonText}>التالي</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0F",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  phoneFrame: {
    width: "100%",
    maxWidth: 380,
    height: "92%",
    backgroundColor: "#050507",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#1A1A22",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
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
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  progressLineInactive: {
    width: 34,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#2A1A3D",
  },
  progressLineActive: {
    width: 34,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#A855F7",
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#40304F",
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    color: "#B5B5C3",
    fontSize: 15,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 24,
    textAlign: "center",
  },
  nextButton: {
    backgroundColor: "#9333EA",
    borderRadius: 18,
    height: 58,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
  },
});
