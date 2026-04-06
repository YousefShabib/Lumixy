import { ViewStyle } from 'react-native';

import { colors } from '@/theme';

export const authClassNames = {
  brand: {
    logo: 'font-cairo-bold font-extrabold tracking-[-1px]',
    subtitle: 'font-cairo-bold text-[#A2A0B3]',
  },
  screen: {
    container: 'flex-1 bg-background px-[18px]',
    topRow: 'flex-row-reverse',
    backButton: 'h-[46px] w-[46px] items-center justify-center rounded-full border border-border bg-surface',
    iconCard:
      'h-[120px] w-[120px] self-center items-center justify-center rounded-[28px] border border-border bg-surfaceSecondary',
    panel: 'rounded-[20px] border border-border bg-surface px-[14px] py-4',
  },
  text: {
    title: 'font-cairo-bold font-extrabold text-text',
    subtitle: 'font-cairo-bold text-textSecondary',
    error: 'mt-2 text-right font-cairo-bold text-[13px] text-error',
  },
  field: {
    wrapper: 'items-end',
    label: 'mb-2 font-cairo-bold text-[14px] text-[#B6A9D2]',
    inputWrap: 'relative w-full',
    input:
      'h-14 w-full rounded-[14px] border border-border bg-surface pr-[46px] text-right font-cairo-bold text-[15px] text-text',
    inputError: 'border-error',
    inputWithEye: 'pl-[46px]',
    inputWithoutEye: 'pl-4',
    error: 'mt-2 self-end text-right font-cairo-bold text-[12px] text-error',
  },
  button: {
    primary:
      'min-h-[46px] self-center items-center justify-center rounded-[14px] px-[22px] py-2',
    primaryActive:
      'border border-[#D8C4FF] bg-primary',
    primaryInactive:
      'border border-[#5B4386] bg-[#4A2A74]',
    primaryText: 'font-cairo-bold text-[17px] font-extrabold',
    primaryTextActive: 'text-white',
    primaryTextInactive: 'text-[#B7A8D6]',
  },
  state: {
    active: 'opacity-100',
    muted: 'opacity-50',
  },
};

export const authStyles = {
  iconCardShadow: {
    shadowColor: '#7E48FF',
    shadowOpacity: 0.65,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  } satisfies ViewStyle,
  primaryButtonShadow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.65,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  } satisfies ViewStyle,
  primaryButtonMutedShadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  } satisfies ViewStyle,
  confirmButtonShadow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  } satisfies ViewStyle,
  successIconCard: {
    backgroundColor: 'rgba(27, 87, 53, 0.24)',
    borderColor: 'rgba(124, 255, 178, 0.32)',
    shadowColor: '#52D98C',
  } satisfies ViewStyle,
};
