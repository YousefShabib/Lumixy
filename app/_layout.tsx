import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Cairo_400Regular, Cairo_700Bold } from '@expo-google-fonts/cairo';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';
<<<<<<< HEAD
import '@/lib/nativewind-interop';
=======
>>>>>>> origin/feature/waleedarman-auth

import AppProviders from '@/components/providers/app-providers';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { queryClient } from '@/services/queryClient';

void SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'index',
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
<<<<<<< HEAD
    <AppProviders>
=======
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
>>>>>>> origin/feature/waleedarman-auth
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="auto" />
        </ThemeProvider>
<<<<<<< HEAD
    </AppProviders>
=======
      </AuthProvider>
    </QueryClientProvider>
>>>>>>> origin/feature/waleedarman-auth
  );
}
