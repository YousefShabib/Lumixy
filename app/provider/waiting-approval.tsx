import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { typography } from '@/theme';

export default function WaitingApprovalScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="time-outline" size={28} color="#C084FC" />
        </View>

        <Text style={styles.title}>طلبك قيد المراجعة</Text>
        <Text style={styles.message}>
          سيتم إشعارك بعد اعتماد الحساب من لوحة الإدارة، وبعدها سيصبح ملفك ظاهرًا في الدليل العام.
        </Text>

        <Pressable style={styles.button} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.buttonText}>العودة للرئيسية</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09030C',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#09030C',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(157, 77, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(157, 77, 255, 0.28)',
  },
  title: {
    marginTop: 18,
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
    textAlign: 'center',
  },
  message: {
    marginTop: 12,
    color: '#B6AFC5',
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    minWidth: 164,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7B3FE4',
    paddingHorizontal: 18,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
  },
});
