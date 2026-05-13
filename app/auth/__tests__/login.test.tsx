import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import * as RN from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

jest.mock('expo-router', () => ({
  __esModule: true,
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import LoginScreen from '../login';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'expo-router';

const mockedUseRouter = jest.mocked(useRouter);
const mockedUseAuth = jest.mocked(useAuth);

function renderLogin() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 900, width: 400, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}>
      <LoginScreen />
    </SafeAreaProvider>
  );
}

describe('LoginScreen', () => {
  let replace: jest.Mock;
  let login: jest.Mock;

  beforeEach(() => {
    replace = jest.fn();
    mockedUseRouter.mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);

    login = jest.fn().mockResolvedValue({
      token: 'test-token',
      user: {
        id: '1',
        full_name: 'مستخدم تجريبي',
        email: 'user@example.com',
        role: 'provider' as const,
      },
    });

    mockedUseAuth.mockReturnValue({
      error: '',
      clearError: jest.fn(),
      isLoading: () => false,
      login,
    } as unknown as ReturnType<typeof useAuth>);

    jest.spyOn(RN, 'useWindowDimensions').mockReturnValue({
      width: 400,
      height: 900,
      scale: 2,
      fontScale: 1,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('يعرض عنوان شاشة تسجيل الدخول', () => {
    renderLogin();

    expect(screen.getByText('تسجيل الدخول')).toBeTruthy();
    expect(screen.getByPlaceholderText('provider@lumixy.ps')).toBeTruthy();
    expect(screen.getByPlaceholderText('••••••••')).toBeTruthy();
  });

  it('يستدعي login ثم يوجّه المستخدم بعد إدخال بيانات صالحة', async () => {
    renderLogin();

    await act(async () => {
      fireEvent.changeText(screen.getByPlaceholderText('provider@lumixy.ps'), 'user@example.com');
      fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'password123');
    });

    const loginTexts = screen.getAllByText('تسجيل الدخول');
    expect(loginTexts.length).toBeGreaterThanOrEqual(2);

    await act(async () => {
      fireEvent.press(loginTexts[loginTexts.length - 1]!);
    });

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: '/provider/tabs' })
      );
    });
  });

  it('يعرض رسالة الخطأ عند وجودها', () => {
    mockedUseAuth.mockReturnValue({
      error: 'بيانات تسجيل الدخول غير صحيحة.',
      clearError: jest.fn(),
      isLoading: () => false,
      login,
    } as unknown as ReturnType<typeof useAuth>);

    renderLogin();

    expect(screen.getByText('بيانات تسجيل الدخول غير صحيحة.')).toBeTruthy();
  });
});
