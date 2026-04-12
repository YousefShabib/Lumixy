import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

export type ApiConnectionMode =
  | 'configured'
  | 'expo-host'
  | 'android-emulator'
  | 'localhost-fallback'
  | 'unavailable';

export type ApiConnectionInfo = {
  baseUrl?: string;
  mode: ApiConnectionMode;
  message: string;
};

function normalizeBaseUrl(value?: string | null) {
  const normalized = value?.trim().replace(/\/+$/, '');
  return normalized ? normalized : undefined;
}

function extractHost(value?: string | null) {
  const candidate = value?.trim();

  if (!candidate) {
    return undefined;
  }

  return candidate.replace(/^https?:\/\//, '').split('/')[0]?.split(':')[0];
}

function resolveApiConnectionInfo(): ApiConnectionInfo {
  const configuredUrl = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);

  if (configuredUrl) {
    return {
      baseUrl: configuredUrl,
      mode: 'configured',
      message: 'تم استخدام عنوان الخادم المحدد في EXPO_PUBLIC_API_URL.',
    };
  }

  const expoHost = extractHost(
    Constants.expoConfig?.hostUri ??
      Constants.expoGoConfig?.debuggerHost ??
      Constants.platform?.hostUri,
  );

  if (expoHost) {
    return {
      baseUrl: `http://${expoHost}:8000/api`,
      mode: 'expo-host',
      message: 'تم استنتاج عنوان Laravel من عنوان Expo المحلي أثناء التطوير.',
    };
  }

  if (Platform.OS === 'android') {
    return {
      baseUrl: 'http://10.0.2.2:8000/api',
      mode: 'android-emulator',
      message: 'تم استخدام 10.0.2.2 كعنوان افتراضي لمحاكي أندرويد.',
    };
  }

  if (Platform.OS === 'ios' || Platform.OS === 'web') {
    return {
      baseUrl: 'http://127.0.0.1:8000/api',
      mode: 'localhost-fallback',
      message: 'تم استخدام localhost كعنوان افتراضي للخادم المحلي.',
    };
  }

  return {
    mode: 'unavailable',
    message: 'تعذر تحديد عنوان الخادم. عرّف EXPO_PUBLIC_API_URL يدويًا.',
  };
}

const apiConnectionInfo = resolveApiConnectionInfo();
const apiBaseUrl = apiConnectionInfo.baseUrl;
const lastSuccessfulApiContactKey = 'lumixy:last-successful-api-contact';

function extractErrorMessage(error: AxiosError<ApiErrorPayload>) {
  const fieldErrors = error.response?.data?.errors;

  if (fieldErrors) {
    const firstFieldError = Object.values(fieldErrors).flat()[0];

    if (firstFieldError) {
      return firstFieldError;
    }
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === 'ERR_NETWORK') {
    return `تعذر الوصول إلى الخادم. تأكد من تشغيل Laravel على ${apiBaseUrl ?? 'العنوان الصحيح'}.`;
  }

  if (error.response?.status === 404) {
    return 'المورد المطلوب غير موجود.';
  }

  if (error.response?.status === 422) {
    return 'البيانات المرسلة غير صالحة.';
  }

  if (error.response?.status && error.response.status >= 500) {
    return 'حدث خطأ داخلي في الخادم.';
  }

  return error.message || 'حدث خطأ غير متوقع أثناء التواصل مع الخادم.';
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 12000,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = AxiosHeaders.from(config.headers);

  headers.set('X-App-Client', 'lumixy-mobile');
  headers.set('X-Requested-At', new Date().toISOString());

  config.headers = headers;
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    void AsyncStorage.setItem(
      lastSuccessfulApiContactKey,
      JSON.stringify({
        baseUrl: apiBaseUrl ?? null,
        path: response.config.url ?? null,
        at: new Date().toISOString(),
      }),
    );

    return response;
  },
  (error: AxiosError<ApiErrorPayload>) => Promise.reject(new Error(extractErrorMessage(error))),
);

export function getApiBaseUrl() {
  return apiBaseUrl;
}

export function getApiOrigin() {
  return apiBaseUrl?.replace(/\/api$/, '');
}

export function hasApiBaseUrl() {
  return Boolean(apiBaseUrl);
}

export function getApiConnectionInfo() {
  return apiConnectionInfo;
}

export function buildPublicAssetUrl(path?: string | null) {
  const value = path?.trim();

  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const origin = getApiOrigin();

  if (!origin) {
    return value;
  }

  if (value.startsWith('/')) {
    return `${origin}${value}`;
  }

  if (value.startsWith('storage/')) {
    return `${origin}/${value}`;
  }

  return `${origin}/storage/${value}`;
}
