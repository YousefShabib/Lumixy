import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import {
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
} from '@expo-google-fonts/cairo';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { I18nManager, Platform, Text, TextInput } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/theme';

void SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'index',
};

type ComponentWithDefaults = {
  defaultProps?: Record<string, unknown>;
};

function applyGlobalTypography() {
  const TextComponent = Text as unknown as ComponentWithDefaults;
  const TextInputComponent = TextInput as unknown as ComponentWithDefaults;

  const textDefaults = TextComponent.defaultProps ?? {};
  const textInputDefaults = TextInputComponent.defaultProps ?? {};

  TextComponent.defaultProps = {
    ...textDefaults,
    allowFontScaling: false,
    style: [
      {
        fontFamily: 'Cairo_400Regular',
        writingDirection: 'rtl',
      },
      textDefaults.style,
    ],
  };

  TextInputComponent.defaultProps = {
    ...textInputDefaults,
    allowFontScaling: false,
    textAlign: 'right',
    placeholderTextColor: colors.textMuted,
    style: [
      {
        fontFamily: 'Cairo_400Regular',
        writingDirection: 'rtl',
      },
      textInputDefaults.style,
    ],
  };
}

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    primary: colors.primaryLight,
    text: colors.text,
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      if (Platform.OS !== 'web' && !I18nManager.isRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
      }

      applyGlobalTypography();
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
