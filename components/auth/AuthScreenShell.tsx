import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authShared } from '@/components/auth/authTheme';

type Props = {
  children: ReactNode;
  isSmallScreen: boolean;
  topPaddingSmall: number;
  topPaddingLarge: number;
  bottomPaddingSmall: number;
  bottomPaddingLarge: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export default function AuthScreenShell({
  children,
  isSmallScreen,
  topPaddingSmall,
  topPaddingLarge,
  bottomPaddingSmall,
  bottomPaddingLarge,
  contentContainerStyle,
}: Props) {
  return (
    <SafeAreaView style={authShared.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={authShared.container}>
        <ScrollView
          contentContainerStyle={[
            authShared.content,
            {
              paddingTop: isSmallScreen ? topPaddingSmall : topPaddingLarge,
              paddingBottom: isSmallScreen ? bottomPaddingSmall : bottomPaddingLarge,
            },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
