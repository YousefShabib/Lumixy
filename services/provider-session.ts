import StorageService, { type StoredAuthSession } from '@/services/storage';

export type ProviderSessionUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: 'provider' | 'admin';
  status: string;
};

export type ProviderSession = {
  token: string;
  role: 'provider' | 'admin';
  user: ProviderSessionUser;
};

export const providerSessionQueryKey = ['provider-session'] as const;

let currentSession: ProviderSession | null = null;

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function normalizePhone(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function normalizeStoredProviderSession(
  session: StoredAuthSession | null | undefined
): ProviderSession | null {
  if (!session || session.role !== 'provider') {
    return null;
  }

  const user = session.user;
  const idValue = user.id;
  const id =
    typeof idValue === 'string' ? idValue : typeof idValue === 'number' ? String(idValue) : '';

  return {
    token: session.token,
    role: 'provider',
    user: {
      id,
      full_name: normalizeString(user.full_name),
      email: normalizeString(user.email),
      phone: normalizePhone(user.phone),
      role: 'provider',
      status: normalizeString(user.status),
    },
  };
}

export function getProviderSession() {
  return currentSession;
}

export async function loadProviderSession() {
  if (currentSession) {
    return currentSession;
  }

  const storedSession = await StorageService.getSession();
  const normalizedSession = normalizeStoredProviderSession(storedSession);
  currentSession = normalizedSession;

  return currentSession;
}

export function setProviderSession(session: ProviderSession | null) {
  currentSession = session;
  return currentSession;
}

export function clearProviderSession() {
  currentSession = null;
}
