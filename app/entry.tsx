import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

export default function EntryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Logo Section */}
      <View className="items-center mt-16 mb-12">
        <View className="w-20 h-20 rounded-2xl bg-[#7c3aed] items-center justify-center mb-5 shadow-lg">
          <Ionicons name="sparkles" size={38} color="#fff" />
        </View>
        <Text className="text-white text-4xl font-bold tracking-wide" style={{ fontFamily: typography.fontFamily.bold }}>LUMIXY</Text>
        <Text
          className="text-[#c4b5d4] text-sm mt-2 text-center px-8"
          style={{ textAlign: 'center', fontFamily: typography.fontFamily.regular }}
        >
          الرابط بينك وبين أفضل مزودي الخدمات في فلسطين
        </Text>
      </View>

      {/* Cards */}
      <View className="flex-1 px-5 gap-4">

        {/* Search for a service */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
          className="bg-[#2a1045] rounded-3xl p-6 flex-row items-center justify-between border border-[#3d1a6e]"
          style={{ minHeight: 130 }}
          activeOpacity={0.85}
        >
          <View className="flex-1 items-end">
            <Text className="text-white text-2xl font-bold mb-2" style={{ textAlign: 'right', fontFamily: typography.fontFamily.bold }}>
              أبحث عن خدمة
            </Text>
            <Text className="text-[#a78bca] text-sm leading-5" style={{ textAlign: 'right', fontFamily: typography.fontFamily.regular }}>
              تصفح كمستخدم للعثور على ما تحتاجه من خدمات{'\n'}منزلية، تقنية، أو مهنية
            </Text>
          </View>
          <View className="w-11 h-11 rounded-full bg-[#7c3aed]/20 items-center justify-center ml-4">
            <Ionicons name="search" size={22} color="#a78bfa" />
          </View>
        </TouchableOpacity>

        {/* Offer a service */}
        <TouchableOpacity
          onPress={() => router.push('/provider/portfolio')}
          className="rounded-3xl p-6 flex-row items-center justify-between"
          style={{ minHeight: 130, backgroundColor: '#7c3aed' }}
          activeOpacity={0.85}
        >
          <View className="flex-1 items-end">
            <Text className="text-white text-2xl font-bold mb-2" style={{ textAlign: 'right', fontFamily: typography.fontFamily.bold }}>
              أريد تقديم خدماتي
            </Text>
            <Text className="text-purple-200 text-sm leading-5" style={{ textAlign: 'right', fontFamily: typography.fontFamily.regular }}>
              انضم إلى شبكة مزودي الخدمات في لوميكسي وقم{'\n'}بزيادة دخلك وتوسيع قاعدة عملائك
            </Text>
          </View>
          <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center ml-4">
            <Ionicons name="briefcase-outline" size={22} color="#fff" />
          </View>
        </TouchableOpacity>

      </View>

      <View className="pb-8" />
    </SafeAreaView>
  );
}