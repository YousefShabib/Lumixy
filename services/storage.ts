import * as SecureStore from 'expo-secure-store';

const TOKEN_STORAGE_KEY = 'lumixy-auth-token';
const AUTH_SESSION_STORAGE_KEY = 'lumixy-auth-session';

export type StoredAuthRole = 'admin' | 'provider';

export type StoredAuthSession = {
  token: string;
  role: StoredAuthRole;
  user: Record<string, unknown>;
};

let tokenCache: string | null = null;
let sessionCache: StoredAuthSession | null = null;
let tokenHydrated = false;
let sessionHydrated = false;

async function hydrateTokenFromStore() {
  if (tokenHydrated) {
    return;
  }

  tokenHydrated = true;

  try {
    const token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
    tokenCache = token || null;
  } catch {
    tokenCache = null;
  }
}

async function hydrateSessionFromStore() {
  if (sessionHydrated) {
    return;
  }

  sessionHydrated = true;

  try {
    const sessionText = await SecureStore.getItemAsync(AUTH_SESSION_STORAGE_KEY);
    sessionCache = sessionText ? (JSON.parse(sessionText) as StoredAuthSession) : null;
    tokenCache = sessionCache?.token ?? tokenCache;
  } catch {
    sessionCache = null;
  }
}

export async function getStoredToken() {
  await hydrateSessionFromStore();
  await hydrateTokenFromStore();
  return sessionCache?.token ?? tokenCache;
}

export async function saveToken(token: string) {
  tokenCache = token;
  tokenHydrated = true;
  await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
}

export async function clearToken() {
  tokenCache = null;
  tokenHydrated = true;

  try {
    await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup errors.
  }
}

export async function getStoredAuthSession() {
  await hydrateSessionFromStore();
  return sessionCache;
}

export async function saveAuthSession(session: StoredAuthSession) {
  sessionCache = session;
  sessionHydrated = true;
  await saveToken(session.token);
  await SecureStore.setItemAsync(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function clearAuthSession() {
  sessionCache = null;
  sessionHydrated = true;
  await clearToken();

  try {
    await SecureStore.deleteItemAsync(AUTH_SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup errors.
  }
}
