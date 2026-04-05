import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { clearToken, getStoredToken } from '@/services/storage';

const REQUEST_TIMEOUT_MS = 15000;

let preferredApiBaseUrl: string | null = null;

type ErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

type ExpoConstantsLike = typeof Constants & {
  experienceUrl?: string | null;
  expoGoConfig?: {
    debuggerHost?: string;
  };
  expoConfig?: {
    hostUri?: string;
  } | null;
  manifest2?: {
    extra?: {
      expoClient?: {
        hostUri?: string;
      };
      expoGo?: {
        debuggerHost?: string;
      };
    };
  };
  platform?: {
    hostUri?: string;
  };
  linkingUri?: string;
};

export type ApiRequestConfig = {
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
  body?: BodyInit | FormData | Record<string, unknown> | null;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  timeoutMs?: number;
};

export class ApiError extends Error {
  baseUrl: string | null;
  details: string[];
  errors?: Record<string, string[]>;
  isNetworkError: boolean;
  status: number | null;
  triedUrls: string[];

  constructor({
    baseUrl = null,
    details = [],
    errors,
    isNetworkError = false,
    message,
    status = null,
    triedUrls = [],
  }: {
    baseUrl?: string | null;
    details?: string[];
    errors?: Record<string, string[]>;
    isNetworkError?: boolean;
    message: string;
    status?: number | null;
    triedUrls?: string[];
  }) {
    super(message);
    this.name = 'ApiError';
    this.baseUrl = baseUrl;
    this.details = details;
    this.errors = errors;
    this.isNetworkError = isNetworkError;
    this.status = status;
    this.triedUrls = triedUrls;
  }
}

function normalizeApiBaseUrl(url: string) {
  const trimmed = url.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function addCandidate(target: Set<string>, value?: string | null) {
  if (!value) {
    return;
  }

  target.add(normalizeApiBaseUrl(value));
}

function extractHost(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  try {
    return new URL(normalized).hostname;
  } catch {
    const withoutScheme = normalized.replace(/^[a-z]+:\/\//i, '');
    return withoutScheme.split('/')[0]?.split(':')[0] ?? null;
  }
}

function getDevServerHosts() {
  const constants = Constants as ExpoConstantsLike;
  const hosts = new Set<string>();

  const rawCandidates = [
    constants.expoGoConfig?.debuggerHost,
    constants.manifest2?.extra?.expoGo?.debuggerHost,
    constants.expoConfig?.hostUri,
    constants.manifest2?.extra?.expoClient?.hostUri,
    constants.platform?.hostUri,
    constants.linkingUri,
    constants.experienceUrl,
  ];

  for (const candidate of rawCandidates) {
    const host = extractHost(candidate);

    if (!host || host === 'localhost' || host === '127.0.0.1') {
      continue;
    }

    hosts.add(host);
  }

  return Array.from(hosts);
}

function getApiBaseCandidates() {
  const candidates = new Set<string>();

  addCandidate(candidates, preferredApiBaseUrl);
  addCandidate(candidates, process.env.EXPO_PUBLIC_API_BASE_URL ?? null);
  addCandidate(candidates, process.env.EXPO_PUBLIC_API_URL ?? null);

  for (const host of getDevServerHosts()) {
    addCandidate(candidates, `http://${host}:8000`);
  }

  if (Platform.OS === 'android') {
    addCandidate(candidates, 'http://10.0.2.2:8000');
    addCandidate(candidates, 'http://127.0.0.1:8000');
  } else {
    addCandidate(candidates, 'http://127.0.0.1:8000');
    addCandidate(candidates, 'http://localhost:8000');
  }

  return Array.from(candidates);
}

function buildUrl(baseUrl: string, path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${normalizedBase}/${normalizedPath}`;
}

function translateBackendMessage(message: string) {
  const normalized = message.trim();

  switch (normalized) {
    case 'Invalid credentials':
      return 'بيانات تسجيل الدخول غير صحيحة. تحقق من البريد الإلكتروني وكلمة المرور.';
    case 'Account inactive':
      return 'هذا الحساب غير مفعل حاليا. تواصل مع الإدارة لتفعيل الوصول.';
    case 'Logged in successfully':
    case 'Admin logged in successfully':
      return 'تم تسجيل الدخول بنجاح.';
    case 'Admin created successfully':
      return 'تم إنشاء الحساب بنجاح.';
    case 'Admin profile updated successfully':
      return 'تم تحديث البيانات بنجاح.';
    case 'Logged out successfully':
      return 'تم تسجيل الخروج بنجاح.';
    case 'Provider approved':
      return 'تمت الموافقة على المزود بنجاح.';
    case 'Provider rejected':
      return 'تم رفض طلب المزود.';
    case 'Provider suspended':
      return 'تم تعليق حساب المزود.';
    case 'Provider deleted successfully':
      return 'تم حذف المزود بنجاح.';
    case 'Category added successfully':
      return 'تمت إضافة القطاع بنجاح.';
    case 'Category updated successfully':
      return 'تم تحديث القطاع بنجاح.';
    case 'Category deleted successfully':
      return 'تم حذف القطاع بنجاح.';
    case 'Unauthorized role':
      return 'هذا النوع من الحسابات غير مدعوم هنا حاليا.';
    case 'Unauthenticated.':
      return 'انتهت الجلسة الحالية. سجل الدخول من جديد للمتابعة.';
    case 'This action is unauthorized.':
      return 'لا تملك صلاحية لتنفيذ هذا الإجراء من الحساب الحالي.';
    default:
      return normalized;
  }
}

function getPayloadDetails(payload: unknown) {
  if (!payload || typeof payload !== 'object' || !('errors' in payload)) {
    return [];
  }

  const errors = (payload as ErrorPayload).errors;

  if (!errors || typeof errors !== 'object') {
    return [];
  }

  return Object.values(errors).flat().map(String);
}

function extractApiMessage(payload: unknown, status: number | null, fallbackMessage: string) {
  if (typeof payload === 'string' && payload.trim().length > 0) {
    return translateBackendMessage(payload);
  }

  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as ErrorPayload).message;

    if (typeof message === 'string' && message.trim().length > 0) {
      return translateBackendMessage(message);
    }
  }

  if (status === 401 || status === 403) {
    return 'انتهت الجلسة أو لا تملك صلاحية للوصول. سجل الدخول من جديد.';
  }

  if (status === 422) {
    return 'البيانات المدخلة غير صحيحة. تحقق من الحقول ثم حاول مرة أخرى.';
  }

  return fallbackMessage;
}

async function parseResponsePayload(response: Response) {
  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    return rawText;
  }
}

export async function apiRequest<T = unknown>(
  path: string,
  config: ApiRequestConfig = {}
): Promise<T> {
  const method = config.method ?? 'GET';
  const body = config.body;
  const headers = config.headers ?? {};
  const requiresAuth = config.requiresAuth ?? false;
  const timeoutMs = config.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const token = requiresAuth ? await getStoredToken() : null;
  const candidates = getApiBaseCandidates();
  const triedUrls: string[] = [];
  let lastError: unknown = null;

  for (const candidate of candidates) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...headers,
    };

    let requestBody: BodyInit | undefined;

    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      requestBody = body;
    } else if (body != null) {
      requestHeaders['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(body);
    }

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    const url = buildUrl(candidate, path);
    triedUrls.push(url);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
      });
      const payload = await parseResponsePayload(response);

      if (!response.ok) {
        if (response.status === 401 && requiresAuth) {
          await clearToken();
        }

        throw new ApiError({
          baseUrl: candidate,
          details: getPayloadDetails(payload),
          errors: payload && typeof payload === 'object' ? (payload as ErrorPayload).errors : undefined,
          message: extractApiMessage(payload, response.status, 'Request failed.'),
          status: response.status,
          triedUrls,
        });
      }

      preferredApiBaseUrl = candidate;
      return payload as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof SyntaxError) {
        throw new ApiError({
          baseUrl: candidate,
          message: 'Invalid server response.',
          status: 500,
          triedUrls,
        });
      }

      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
  }

  const networkMessage =
    lastError instanceof Error && lastError.name === 'AbortError'
      ? 'انتهت مهلة الاتصال بالخادم. تأكد من تشغيله ثم حاول مرة أخرى.'
      : 'تعذر الوصول إلى الخادم. شغّل الـ backend أو اضبط EXPO_PUBLIC_API_BASE_URL على العنوان الصحيح.';

  throw new ApiError({
    baseUrl: preferredApiBaseUrl,
    details: candidates.map((candidate) => `تمت المحاولة عبر ${candidate}`),
    isNetworkError: true,
    message: networkMessage,
    status: 0,
    triedUrls,
  });
}

export function getReadableError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.details.length > 0) {
      return [error.message, ...error.details].join('\n');
    }

    return error.message;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Unexpected error.';
}
