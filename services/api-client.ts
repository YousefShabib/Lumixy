import Constants from 'expo-constants';
import { Platform } from 'react-native';

type ApiMethod = 'DELETE' | 'GET' | 'POST' | 'PUT';

type RequestApiOptions = {
  baseUrl?: string | null;
  body?: BodyInit | FormData | Record<string, unknown> | null;
  headers?: Record<string, string>;
  method?: ApiMethod;
  path: string;
  token?: string | null;
  timeoutMs?: number;
};

type ErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

type ExpoConstantsLike = typeof Constants & {
  expoGoConfig?: {
    debuggerHost?: string;
  };
  manifest2?: {
    extra?: {
      expoGo?: {
        debuggerHost?: string;
      };
    };
  };
};

export class ApiRequestError extends Error {
  baseUrl: string | null;
  details: string[];
  isNetworkError: boolean;
  payload: unknown;
  status: number | null;
  triedUrls: string[];

  constructor({
    baseUrl = null,
    details = [],
    isNetworkError = false,
    message,
    payload = null,
    status = null,
    triedUrls = [],
  }: {
    baseUrl?: string | null;
    details?: string[];
    isNetworkError?: boolean;
    message: string;
    payload?: unknown;
    status?: number | null;
    triedUrls?: string[];
  }) {
    super(message);
    this.name = 'ApiRequestError';
    this.baseUrl = baseUrl;
    this.details = details;
    this.isNetworkError = isNetworkError;
    this.payload = payload;
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

function getDebuggerHost() {
  const constants = Constants as ExpoConstantsLike;
  const rawHost =
    constants.expoGoConfig?.debuggerHost ??
    constants.manifest2?.extra?.expoGo?.debuggerHost ??
    null;

  return rawHost?.split(':')[0] ?? null;
}

export function getApiBaseCandidates() {
  const candidates = new Set<string>();

  addCandidate(candidates, process.env.EXPO_PUBLIC_API_URL ?? null);

  const debuggerHost = getDebuggerHost();

  if (debuggerHost && debuggerHost !== 'localhost' && debuggerHost !== '127.0.0.1') {
    addCandidate(candidates, `http://${debuggerHost}:8000`);
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

function translateBackendMessage(message: string) {
  const normalized = message.trim();

  switch (normalized) {
    case 'Invalid credentials':
      return 'بيانات تسجيل الدخول غير صحيحة. تحقق من البريد الإلكتروني وكلمة المرور.';
    case 'Account inactive':
      return 'هذا الحساب غير مفعل حالياً. تواصل مع الإدارة لتفعيل الوصول.';
    case 'Logged in successfully':
      return 'تم تسجيل الدخول بنجاح.';
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
      return 'هذا النوع من الحسابات غير مدعوم هنا حالياً.';
    case 'Unauthenticated.':
      return 'انتهت الجلسة الحالية. سجّل الدخول من جديد للمتابعة.';
    case 'This action is unauthorized.':
      return 'لا تملك صلاحية لتنفيذ هذا الإجراء من الحساب الحالي.';
    default:
      return normalized;
  }
}

function getPayloadMessage(payload: unknown, status: number | null) {
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
    return 'البيانات المُدخلة غير صحيحة. تحقق من الحقول ثم حاول مرة أخرى.';
  }

  return 'حدث خطأ غير متوقع أثناء التواصل مع الخادم.';
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

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    if (error.details.length > 0) {
      return [error.message, ...error.details].join('\n');
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'حدث خطأ غير معروف.';
}

export async function requestApi<T>({
  baseUrl,
  body,
  headers,
  method = 'GET',
  path,
  token,
  timeoutMs = 15000,
}: RequestApiOptions) {
  const candidates = baseUrl ? [normalizeApiBaseUrl(baseUrl)] : getApiBaseCandidates();
  const triedUrls: string[] = [];
  let lastError: unknown = null;

  for (const candidate of candidates) {
    const url = `${candidate}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...(headers ?? {}),
    };

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    let requestBody: BodyInit | null | undefined = undefined;

    if (body instanceof FormData) {
      requestBody = body;
    } else if (body != null) {
      requestHeaders['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(body);
    }

    triedUrls.push(url);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const payload = await parseResponsePayload(response);

      if (!response.ok) {
        throw new ApiRequestError({
          baseUrl: candidate,
          details: getPayloadDetails(payload),
          message: getPayloadMessage(payload, response.status),
          payload,
          status: response.status,
          triedUrls,
        });
      }

      return {
        baseUrl: candidate,
        data: payload as T,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiRequestError) {
        throw error;
      }

      lastError = error;
    }
  }

  throw new ApiRequestError({
    details: candidates.map((candidate) => `تمت محاولة الاتصال عبر ${candidate}`),
    isNetworkError: true,
    message:
      'تعذر الوصول إلى الخادم. تأكد من تشغيل السيرفر أو ضبط EXPO_PUBLIC_API_URL على العنوان الصحيح.',
    payload: lastError,
    triedUrls,
  });
}
