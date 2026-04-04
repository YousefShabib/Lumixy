import { TextStyle, ViewStyle } from 'react-native';

import { colors, typography } from '@/theme';

export const authShared = {
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 18,
  } as ViewStyle,
  content: {
    flexGrow: 1,
  } as ViewStyle,
  topRow: {
    flexDirection: 'row-reverse',
  } as ViewStyle,
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  iconCard: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7E48FF',
    shadowOpacity: 0.65,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  } as ViewStyle,
  header: {
    marginTop: 22,
    alignItems: 'center',
  } as ViewStyle,
  title: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontWeight: '800',
    textAlign: 'center',
  } as TextStyle,
  subtitle: {
    marginTop: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 25,
    fontFamily: typography.fontFamily.bold,
  } as TextStyle,
  panel: {
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  } as ViewStyle,
  errorText: {
    marginTop: 8,
    color: colors.error,
    textAlign: 'right',
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
  } as TextStyle,
};
