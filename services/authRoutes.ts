import { Href } from 'expo-router';

import { AuthRole } from '@/services/auth';

export function getRouteForRole(role: AuthRole): Href {
  return role === 'admin'
    ? { pathname: '/admin/tabs' as const }
    : { pathname: '/provider/tabs' as const };
}
