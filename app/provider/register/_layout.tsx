import { Stack } from "expo-router";
import { ProviderRegisterProvider } from "@/store/provider-register-store";

export default function ProviderRegisterLayout() {
  return (
    <ProviderRegisterProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="step-1" />
        <Stack.Screen name="step-2" />
        <Stack.Screen name="step-3" />
        <Stack.Screen name="step-4" />
        <Stack.Screen name="waiting-approval" />
      </Stack>
    </ProviderRegisterProvider>
  );
}