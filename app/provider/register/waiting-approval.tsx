import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function WaitingApprovalScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>تم إرسال طلبك</Text>
        <Text style={styles.subtitle}>طلبك الآن قيد المراجعة وبانتظار الموافقة.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050507",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#0F0A16",
    borderWidth: 1,
    borderColor: "#24172F",
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    color: "#B5B5C3",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
});