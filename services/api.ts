import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

import StorageService from '@/services/storage';

export const API_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'http://192.168.88.7:8000/api';

const REQUEST_TIMEOUT_MS = 15000;

type ErrorPayload = {
  errors?: Record<string, string[]>;
  message?: string;
};

export type ApiRequestConfig = {
  body?: unknown;
  headers?: Record<string, string>;
  method?: AxiosRequestConfig['method'];
  requiresAuth?: boolean;
};

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

function extractApiMessage(payload: ErrorPayload | undefined, fallbackMessage: string) {
  if (payload?.message && payload.message.trim().length > 0) {
    return payload.message;
  }

  return fallbackMessage;
}

function buildUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return path.startsWith('/') ? path : `/${path}`;
}

function toApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorPayload>;
    const status = axiosError.response?.status ?? 0;
    const payload = axiosError.response?.data;

    if (status > 0) {
      return new ApiError(
        extractApiMessage(payload, 'Request failed.'),
        status,
        payload?.errors
      );
    }

    if (axiosError.code === 'ECONNABORTED') {
      return new ApiError('Request timeout. Please try again.', 408);
    }
  }

  return new ApiError(
    `Unable to connect to server. Check your API URL and network. (${API_URL})`,
    0
  );
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const headers = AxiosHeaders.from(config.headers);
    const token = await StorageService.getToken();

    headers.set('Content-Type', 'application/json');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    config.headers = headers;
    return config;
  },
  async (error) => Promise.reject(toApiError(error))
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await StorageService.removeToken();
    }

    return Promise.reject(toApiError(error));
  }
);

export default axiosInstance;

export async function apiRequest<T = unknown>(path: string, config: ApiRequestConfig = {}) {
  const { body, headers, method = 'GET', requiresAuth = false } = config;

  try {
    const response = await axiosInstance.request<T>({
      url: buildUrl(path),
      method,
      data: body,
      headers: {
        ...headers,
        ...(requiresAuth ? { 'X-Requires-Auth': 'true' } : {}),
      },
    });

    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export function getReadableError(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Unexpected error.';
}
