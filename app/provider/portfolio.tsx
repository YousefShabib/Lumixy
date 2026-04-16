import {
  View, Text, TouchableOpacity, Image,
  ScrollView,  StatusBar, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

export default function PortfolioScreen() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [isSavingImages, setIsSavingImages] = useState(false);
  const MAX_IMAGES = 15;
  const isNextDisabled = isSavingImages || images.length === 0;

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('الإذن مطلوب', 'يرجى السماح بالوصول إلى مكتبة الصور');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: MAX_IMAGES - images.length,
    });

    if (!result.canceled) {
      const newUris = result.assets.map(a => a.uri);
      setImages(prev => [...prev, ...newUris].slice(0, MAX_IMAGES));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleNextStep = async () => {
    const portfolioPayload = {
      images,
    };
    void portfolioPayload;

    setIsSavingImages(true);

    try {
      // TODO: اربط هذا الـ payload مع خدمة رفع/حفظ صور معرض الأعمال.
      // await saveProviderPortfolio(portfolioPayload);
      router.push('/provider/contact-info');
    } finally {
      setIsSavingImages(false);
    }
  };

  // Build grid: uploaded images + one "add more" slot if under limit
  const gridItems = images.length < MAX_IMAGES
    ? [...images, 'ADD_SLOT']
    : images;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
        <View className="w-10" />
        <TouchableOpacity
          onPress={() => router.push('/provider/contact-info')}
          className="w-10 h-10 rounded-full bg-[#1e1c24] items-center justify-center"
        >
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Title */}
        <View className="items-end mb-6">
          <Text className="text-white text-2xl font-bold mb-2" style={{ textAlign: 'right', fontFamily: typography.fontFamily.bold }}>
            معرض الأعمال
          </Text>
          <Text className="text-[#a78bca] text-sm leading-6" style={{ textAlign: 'right', fontFamily: typography.fontFamily.regular }}>
            قم بتحميل صور لأعمالك السابقة لجذب المزيد من العملاء{'\n'}وبناء الثقة.
          </Text>
        </View>

        {/* Upload Box */}
        {images.length === 0 && (
          <TouchableOpacity
            onPress={pickImages}
            className="border-2 border-dashed border-[#3d1a6e] rounded-3xl p-8 items-center justify-center bg-[#1a1026] mb-6"
            activeOpacity={0.8}
          >
            <View className="w-16 h-16 rounded-2xl bg-[#7c3aed]/20 items-center justify-center mb-4">
              <Ionicons name="camera-outline" size={30} color="#a78bfa" />
            </View>
            <Text className="text-white text-base font-semibold mb-1" style={{ fontFamily: typography.fontFamily.bold }}>إضافة صور جديدة</Text>
            <Text className="text-[#6b6480] text-xs" style={{ fontFamily: typography.fontFamily.regular }}>يمكنك رفع حتى 15 صورة (JPG, PNG)</Text>
            <TouchableOpacity
              onPress={pickImages}
              className="mt-4 bg-[#7c3aed] rounded-xl px-6 py-2.5"
            >
              <Text className="text-white text-sm font-medium" style={{ fontFamily: typography.fontFamily.bold }}>اختر ملف</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Grid */}
        {images.length > 0 && (
          <View className="mb-4">
            <Text className="text-[#c4b5d4] text-sm mb-3" style={{ textAlign: 'right', fontFamily: typography.fontFamily.regular }}>
              الصور المرفوعة ({images.length})
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {gridItems.map((item, index) =>
                item === 'ADD_SLOT' ? (
                  <TouchableOpacity
                    key="add"
                    onPress={pickImages}
                    className="bg-[#1e1c24] rounded-2xl border border-dashed border-[#3d1a6e] items-center justify-center"
                    style={{ width: '31%', aspectRatio: 1 }}
                  >
                    <Ionicons name="add" size={28} color="#7c3aed" />
                  </TouchableOpacity>
                ) : (
                  <View
                    key={index}
                    className="rounded-2xl overflow-hidden"
                    style={{ width: '31%', aspectRatio: 1 }}
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

        {/* Terms note */}
        <View className="flex-row items-start gap-2 mt-4 bg-[#1a1026] rounded-2xl p-4">
          <Ionicons name="information-circle-outline" size={16} color="#7c3aed" style={{ marginTop: 2 }} />
          <Text className="text-[#a78bca] text-xs flex-1 leading-5" style={{ textAlign: 'right', fontFamily: typography.fontFamily.regular }}>
            بإكمال التسجيل، أنت توافق على شروط الخدمة لبرنامج شركاء لوميكسي LUMIXY في فلسطين
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 border-t border-[#1e1c24]" style={{ backgroundColor: colors.background }}>
        <TouchableOpacity
          onPress={handleNextStep}
          disabled={isNextDisabled}
          className={`rounded-2xl py-4 flex-row items-center justify-center gap-2 mb-3 ${
            isNextDisabled ? 'bg-[#3a2b57]' : 'bg-[#7c3aed]'
          }`}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text className="text-white font-bold text-base" style={{ fontFamily: typography.fontFamily.bold }}>
            {isSavingImages ? 'جارٍ التجهيز...' : 'الخطوة التالية'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Text className="text-[#6b6480] text-sm" style={{ fontFamily: typography.fontFamily.regular }}>حفظ كمسودة والعودة لاحقًا</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
