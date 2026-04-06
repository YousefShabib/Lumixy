import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
} as const;

export type StoredAuthRole = 'admin' | 'provider';

export type StoredAuthUser = Record<string, unknown> & {
  role?: StoredAuthRole;
};

export type StoredAuthSession = {
  token: string;
  role: StoredAuthRole;
  user: StoredAuthUser;
};

let tokenCache: string | null = null;
let userCache: StoredAuthUser | null = null;
let tokenHydrated = false;
let userHydrated = false;

function parseStoredUser(data: string | null) {
  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data) as StoredAuthUser;
  } catch {
    return null;
  }
}

function setTokenCache(token: string | null) {
  tokenCache = token;
  tokenHydrated = true;
}

function setUserCache(user: StoredAuthUser | null) {
  userCache = user;
  userHydrated = true;
}

async function hydrateTokenCache() {
  if (tokenHydrated) {
    return;
  }

  try {
    setTokenCache(await SecureStore.getItemAsync(STORAGE_KEYS.token));
  } catch {
    setTokenCache(null);
  }
}

async function hydrateUserCache() {
  if (userHydrated) {
    return;
  }

  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.user);
    const parsedUser = parseStoredUser(data);
    if (parsedUser) {
      setUserCache(parsedUser);
      return;
    }
  } catch {
    // Fall through to SecureStore fallback.
  }

  try {
    const secureData = await SecureStore.getItemAsync(STORAGE_KEYS.user);
    setUserCache(parseStoredUser(secureData));
  } catch {
    setUserCache(null);
  }
}

async function saveSession(session: StoredAuthSession) {
  await Promise.all([
    StorageService.saveToken(session.token),
    StorageService.saveUser({
      ...session.user,
      role: session.role,
    }),
  ]);
}

async function getSession() {
  const [token, user] = await Promise.all([StorageService.getToken(), StorageService.getUser()]);

  if (!token || !user || !user.role) {
    return null;
  }

  return {
    token,
    role: user.role,
    user,
  } satisfies StoredAuthSession;
}

async function removeSession() {
  await Promise.all([StorageService.removeToken(), StorageService.removeUser()]);
}

const StorageService = {
  async saveToken(token: string) {
    setTokenCache(token);

    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.token, token);
    } catch {
      // Keep the in-memory token so auth can continue in this session.
    }
  },

  async getToken() {
    await hydrateTokenCache();
    return tokenCache;
  },

  async removeToken() {
    setTokenCache(null);

    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.token);
    } catch {
      // Ignore storage cleanup errors.
    }
  },

  async saveUser(user: StoredAuthUser) {
    setUserCache(user);
    const serializedUser = JSON.stringify(user);

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.user, serializedUser);
      return;
    } catch {
      // Fall back to SecureStore when AsyncStorage isn't available.
    }

    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.user, serializedUser);
    } catch {
      // Keep the in-memory user so auth can continue in this session.
    }
  },

  async getUser() {
    await hydrateUserCache();
    return userCache;
  },

  async removeUser() {
    setUserCache(null);

    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.user);
    } catch {
      // Ignore storage cleanup errors.
    }

    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.user);
    } catch {
      // Ignore storage cleanup errors.
    }
  },

  async clearAsyncStorage() {
    setUserCache(null);

    try {
      await AsyncStorage.clear();
    } catch {
      // Ignore storage cleanup errors.
    }

    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.user);
    } catch {
      // Ignore storage cleanup errors.
    }
  },

  getSession,
  saveSession,
  removeSession,
};

export default StorageService;
