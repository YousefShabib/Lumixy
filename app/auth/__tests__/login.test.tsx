import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { MockedFunction } from 'jest-mock';
import React from 'react';
import * as RN from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useAuth from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import LoginScreen from '../login';

jest.mock('expo-router', () => ({
  __esModule: true,
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  __esModule: true,
  default: jest.fn(),
}));

type AuthHookValue = ReturnType<typeof useAuth>;

const mockedUseRouter = useRouter as unknown as MockedFunction<typeof useRouter>;
const mockedUseAuth = jest.mocked(useAuth);

const LOGIN_TEXT = 'تسجيل الدخول';
const EMAIL_PLACEHOLDER = 'provider@lumixy.ps';
const PASSWORD_PLACEHOLDER = '••••••••';
const ERROR_TEXT = 'بيانات تسجيل الدخول غير صحيحة.';

const replace = jest.fn();
const login = jest.fn<AuthHookValue['login']>();

function mockAuth(overrides: Partial<AuthHookValue> = {}) {
  mockedUseAuth.mockReturnValue({
    error: '',
    clearError: jest.fn(),
    isLoading: () => false,
    login,
    ...overrides,
  } as AuthHookValue);
}

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

async function submitLoginForm() {
  await act(async () => {
    fireEvent.changeText(screen.getByPlaceholderText(EMAIL_PLACEHOLDER), 'user@example.com');
    fireEvent.changeText(screen.getByPlaceholderText(PASSWORD_PLACEHOLDER), 'password123');
  });

  const submitButton = screen.getAllByText(LOGIN_TEXT).at(-1);

  await act(async () => {
    fireEvent.press(submitButton!);
  });
}

describe('LoginScreen', () => {
  beforeEach(() => {
    mockedUseRouter.mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);
    login.mockResolvedValue({
      token: 'test-token',
      user: {
        id: '1',
        full_name: 'مستخدم تجريبي',
        email: 'user@example.com',
        role: 'provider' as const,
      },
    });
    mockAuth();

    jest.spyOn(RN, 'useWindowDimensions').mockReturnValue({
      width: 400,
      height: 900,
      scale: 2,
      fontScale: 1,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('renders the login screen title and fields', () => {
    renderLogin();

    expect(screen.getByText(LOGIN_TEXT)).toBeTruthy();
    expect(screen.getByPlaceholderText(EMAIL_PLACEHOLDER)).toBeTruthy();
    expect(screen.getByPlaceholderText(PASSWORD_PLACEHOLDER)).toBeTruthy();
  });

  it('calls login and redirects after valid credentials are submitted', async () => {
    renderLogin();
    await submitLoginForm();

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

  it('shows the authentication error message when it exists', () => {
    mockAuth({ error: ERROR_TEXT });
    renderLogin();

    expect(screen.getByText(ERROR_TEXT)).toBeTruthy();
  });
});
