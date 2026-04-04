import { Platform } from 'react-native'; 
 
import { clearToken, getStoredToken } from '@/services/storage'; 
 
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'http://192.168.88.3:8000/api';
const REQUEST_TIMEOUT_MS = 15000;
 
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
 
function buildUrl(path: string) { 
  if (path.startsWith('http://') || path.startsWith('https://')) { 
    return path; 
  } 
  
  const normalizedBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL; 
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path; 
  return normalizedBase + '/' + normalizedPath; 
} 
 
function extractApiMessage(payload: any, fallbackMessage: string) { 
  if (payload && typeof payload === 'object' && typeof payload.message === 'string' && payload.message.trim().length > 0) { 
    return payload.message; 
  } 
  return fallbackMessage; 
} 
 
export async function apiRequest(path: string, config: { method?: string; body?: any; headers?: Record<string, string>; requiresAuth?: boolean } = {}) { 
  const method = config.method ?? 'GET'; 
  const body = config.body; 
  const headers = config.headers ?? {}; 
  const requiresAuth = config.requiresAuth ?? false; 
 
  const controller = new AbortController(); 
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS); 
 
  const requestHeaders: Record<string, string> = { 
    Accept: 'application/json', 
    ...headers, 
  }; 
 
  let requestBody: BodyInit | undefined; 
  if (body !== undefined) { 
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData; 
    if (isFormData) { 
      requestBody = body as FormData; 
    } else { 
      requestHeaders['Content-Type'] = 'application/json'; 
      requestBody = JSON.stringify(body); 
    } 
  } 
 
  if (requiresAuth) { 
    const token = await getStoredToken(); 
    if (token) { 
      requestHeaders.Authorization = 'Bearer ' + token; 
    } 
  } 
 
  try { 
    const response = await fetch(buildUrl(path), { method, headers: requestHeaders, body: requestBody, signal: controller.signal }); 
    const textResponse = await response.text(); 
    const payload = textResponse ? JSON.parse(textResponse) : null; 
 
    if (!response.ok) { 
      const message = extractApiMessage(payload, 'Request failed.'); 
      const errors = payload && typeof payload === 'object' ? payload.errors : undefined; 
      if (response.status === 401 && requiresAuth) { await clearToken(); } 
      throw new ApiError(message, response.status, errors); 
    } 
 
    return payload; 
  } catch (error) { 
    if (error instanceof ApiError) { throw error; } 
    if (error instanceof SyntaxError) { throw new ApiError('Invalid server response.', 500); } 
    if (error instanceof Error && error.name === 'AbortError') { throw new ApiError('Request timeout. Please try again.', 408); } 
    throw new ApiError(`Unable to connect to server. Check your API URL and network. (${API_BASE_URL})`, 0); 
  } finally { 
    clearTimeout(timeout); 
  } 
} 
 
export function getReadableError(error: unknown) { 
  if (error instanceof ApiError) { return error.message; } 
  if (error instanceof Error && error.message.trim().length > 0) { return error.message; } 
  return 'Unexpected error.'; 
}
