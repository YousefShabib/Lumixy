import type { Href } from 'expo-router';

import type { AuthRole, AuthUser } from '@/services/auth';

export function getRouteForRole(role: AuthRole): Href {
  return role === 'admin'
    ? ({ pathname: '/admin/tabs' } as const)
    : ({ pathname: '/provider/tabs' } as const);
}

export function isProviderPendingApproval(user: AuthUser | null | undefined) {
  if (!user || user.role !== 'provider') {
    return false;
  }

  const providerProfile =
    user.providerProfile && typeof user.providerProfile === 'object' ? user.providerProfile : null;
  const profileStatus =
    providerProfile && typeof providerProfile.status === 'string' ? providerProfile.status : null;
  const applicationStatus =
    providerProfile && typeof providerProfile.application_status === 'string'
      ? providerProfile.application_status
      : null;
  const userStatus = typeof user.status === 'string' ? user.status : null;

  if (applicationStatus) {
    return applicationStatus.toLowerCase() === 'pending';
  }

  if (profileStatus) {
    return profileStatus.toLowerCase() !== 'active';
  }

  if (userStatus) {
    return userStatus.toLowerCase() !== 'active';
  }

  return false;
}

export function getRouteForUser(user: AuthUser): Href {
  if (user.role === 'provider' && isProviderPendingApproval(user)) {
    return { pathname: '/provider/waiting-approval' } as const;
  }

  return getRouteForRole(user.role);
}
