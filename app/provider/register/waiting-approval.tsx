import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useProviderRegister } from "../../../store/provider-register-store";
import { getProviderApplicationStatus } from "../../../services/providerRegister";
import { typography } from "../../../theme/typography";

export default function WaitingApprovalScreen() {
  const { form } = useProviderRegister();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("pending");
  const [notes, setNotes] = useState<string | null>(null);

  useEffect(() => {
    const loadStatus = async () => {
      if (!form.token) {
        setLoading(false);
        return;
      }

      try {
        const result = await getProviderApplicationStatus(form.token);
        setStatus(result.application_status || "pending");
        setNotes(result.notes || null);
      } catch (error) {
        console.log("Status error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [form.token]);

  const getTitle = () => {
    if (status === "approved") return "تمت الموافقة على طلبك";
    if (status === "rejected") return "تم رفض الطلب";
    return "تم إرسال طلبك";
  };

  const getSubtitle = () => {
    if (status === "approved") {
      return "مبروك، تمت مراجعة طلبك والموافقة عليه بنجاح.";
    }

    if (status === "rejected") {
      return notes || "تمت مراجعة طلبك ولكن لم تتم الموافقة عليه.";
    }

    return "طلبك الآن قيد المراجعة وبانتظار الموافقة.";
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {loading ? (
          <>
            <ActivityIndicator size="large" color="#A855F7" />
            <Text style={styles.loadingText}>جاري التحقق من حالة الطلب...</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.subtitle}>{getSubtitle()}</Text>
          </>
        )}
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
    fontFamily: typography.fontFamily.bold,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    color: "#B5B5C3",
    fontSize: 16,
    lineHeight: 24,
    fontFamily: typography.fontFamily.regular,
    textAlign: "center",
  },
  loadingText: {
    color: "#B5B5C3",
    fontSize: 15,
    fontFamily: typography.fontFamily.regular,
    marginTop: 14,
    textAlign: "center",
  },
});
