import { useProviderRegister } from "@/store/provider-register-store";
import { typography } from "@/theme/typography";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
    Alert.alert("اختيار الصورة", "اختار الطريقة المناسبة", [
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
        </View>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>الخطوة 1 من 3</Text>
        </View>

        <Text style={styles.title}>صورة الملف الشخصي</Text>
        <Text style={styles.description}>
          ارفع صورة واضحة وجذابة لملفك الشخصي حتى يظهر بشكل احترافي داخل التطبيق.
        </Text>

        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imageCircle} onPress={openPickerOptions}>
            {form.imageUri ? (
              <Image source={{ uri: form.imageUri }} style={styles.previewImage} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={34} color="#B15CFF" />
                <Text style={styles.imageText}>رفع صورة</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.addButton} onPress={openPickerOptions}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#A855F7" />
            <Text style={styles.infoText}>يفضّل استخدام صورة احترافية أو لوجو</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#A855F7" />
            <Text style={styles.infoText}>اختر صورة واضحة وبجودة جيدة</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            if (!form.imageUri) {
              Alert.alert("تنبيه", "لازم تختار صورة الملف الشخصي أولًا.");
              return;
            }

            router.push("/provider/register/step-2");
          }}
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
    minHeight: 760,
    backgroundColor: "#050507",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#1A1A22",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
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
  progressLineInactive: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#3A2257",
  },
  progressLineActive: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#A855F7",
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
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 10,
    textAlign: "right",
  },
  description: {
    color: "#B5B5C3",
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 22,
    marginBottom: 28,
    textAlign: "right",
  },
  imageSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    position: "relative",
  },
  imageCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#7E22CE",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F0A16",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  imageText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
    marginTop: 10,
  },
  addButton: {
    position: "absolute",
    bottom: 6,
    right: 70,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#A855F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0F0A16",
  },
  infoBox: {
    backgroundColor: "#100C18",
    borderWidth: 1,
    borderColor: "#24172F",
    borderRadius: 18,
    padding: 16,
    gap: 14,
    marginBottom: 28,
  },
  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  infoText: {
    color: "#D4D4D8",
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
    marginRight: 10,
  },
  nextButton: {
    backgroundColor: "#9333EA",
    borderRadius: 16,
    height: 56,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
  },
});
