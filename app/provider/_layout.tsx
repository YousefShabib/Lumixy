import { Stack } from 'expo-router';
import React from 'react';

export default function ProviderLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
