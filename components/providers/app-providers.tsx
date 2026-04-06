import { QueryClientProvider } from '@tanstack/react-query';
import React, { type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from '@/contexts/AuthContext';
import { AdminSessionProvider } from '@/contexts/admin-session-context';
import { queryClient } from '@/lib/query-client';

type AppProvidersProps = {
  children: ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AdminSessionProvider>{children}</AdminSessionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
