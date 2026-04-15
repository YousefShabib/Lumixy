import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, typography } from '@/theme';

export default function EntryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View className="items-center mt-16 mb-12">
        <View
          className="w-20 h-20 rounded-2xl items-center justify-center mb-5 shadow-lg"
          style={{ backgroundColor: colors.primaryLight }}
        >
          <Ionicons name="sparkles" size={38} color={colors.text} />
        </View>
        <Text
          className="text-4xl tracking-wide"
          style={{ color: colors.text, fontFamily: typography.fontFamily.bold }}
        >
          LUMIXY
        </Text>
        <Text
          className="text-sm mt-2 text-center px-8"
          style={{
            color: colors.textSecondary,
            textAlign: 'center',
            fontFamily: typography.fontFamily.regular,
          }}
        >
          الرابط بينك وبين أفضل مزودي الخدمات في فلسطين
        </Text>
      </View>

      <View className="flex-1 px-5 gap-4">
        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
          className="rounded-3xl p-6 flex-row items-center justify-between border"
          style={{
            minHeight: 130,
            backgroundColor: colors.surfaceSecondary,
            borderColor: colors.border,
          }}
          activeOpacity={0.85}
        >
          <View className="flex-1 items-end">
            <Text
              className="text-2xl mb-2"
              style={{
                color: colors.text,
                textAlign: 'right',
                fontFamily: typography.fontFamily.bold,
              }}
            >
              أبحث عن خدمة
            </Text>
            <Text
              className="text-sm leading-5"
              style={{
                color: colors.accent,
                textAlign: 'right',
                fontFamily: typography.fontFamily.regular,
              }}
            >
              تصفح كمستخدم للعثور على ما تحتاجه من خدمات{'\n'}منزلية، تقنية، أو مهنية
            </Text>
          </View>
          <View
            className="w-11 h-11 rounded-full items-center justify-center ml-4"
            style={{ backgroundColor: 'rgba(109, 40, 217, 0.2)' }}
          >
            <Ionicons name="search" size={22} color={colors.accent} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/auth/login')}
          className="rounded-3xl p-6 flex-row items-center justify-between"
          style={{ minHeight: 130, backgroundColor: colors.primaryLight }}
          activeOpacity={0.85}
        >
          <View className="flex-1 items-end">
            <Text
              className="text-2xl mb-2"
              style={{
                color: colors.text,
                textAlign: 'right',
                fontFamily: typography.fontFamily.bold,
              }}
            >
              أريد تقديم خدماتي
            </Text>
            <Text
              className="text-sm leading-5"
              style={{
                color: colors.text,
                textAlign: 'right',
                fontFamily: typography.fontFamily.regular,
              }}
            >
              انضم إلى شبكة مزودي الخدمات في لوميكسي وقم{'\n'}بزيادة دخلك وتوسيع قاعدة عملائك
            </Text>
          </View>
          <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center ml-4">
            <Ionicons name="briefcase-outline" size={22} color={colors.text} />
          </View>
        </TouchableOpacity>
      </View>

      <View className="pb-8" />
    </SafeAreaView>
  );
}
