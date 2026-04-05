import { Href } from 'expo-router';

import { AuthRole, AuthUser } from '@/services/auth';

type AuthRouteUser = Pick<AuthUser, 'role' | 'status'>;

export function isProviderPendingApproval(user: AuthRouteUser | null | undefined) {
  return user?.role === 'provider' && user.status !== 'active';
}

export function getRouteForUser(user: AuthRouteUser): Href {
  if (user.role === 'admin') {
    return { pathname: '/admin/tabs' as const };
  }

  return isProviderPendingApproval(user)
    ? { pathname: '/provider/waiting-approval' as const }
    : { pathname: '/provider/tabs' as const };
}

export function getRouteForRole(role: AuthRole): Href {
  return role === 'admin'
    ? { pathname: '/admin/tabs' as const }
    : { pathname: '/provider/tabs' as const };
}
