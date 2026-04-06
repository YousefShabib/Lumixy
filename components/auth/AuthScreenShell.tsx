import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authClassNames } from '@/components/auth/authTheme';
import { colors } from '@/theme';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        className={authClassNames.screen.container}>
        <ScrollView
          contentContainerStyle={[
            {
              flexGrow: 1,
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
