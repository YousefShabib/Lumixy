import { Stack } from "expo-router";
import React, { useEffect } from "react";

import { useAuthContext } from "@/contexts/AuthContext";
import { ProviderRegisterProvider, useProviderRegister } from "../../../store/provider-register-store";

function ProviderRegisterSessionSync() {
  const { user, token } = useAuthContext();
  const { setForm } = useProviderRegister();

  useEffect(() => {
    const providerUser = user && user.role === "provider" ? user : null;

    setForm((prev) => ({
      ...prev,
      email:
        prev.email ||
        (typeof providerUser?.email === "string" ? providerUser.email : ""),
      fullName:
        prev.fullName ||
        (typeof providerUser?.full_name === "string" ? providerUser.full_name : ""),
      phone:
        prev.phone ||
        (typeof providerUser?.phone === "string" ? providerUser.phone : ""),
      token: prev.token || token || null,
    }));
  }, [setForm, token, user]);

  return null;
}

export default function ProviderRegisterLayout() {
  return (
    <ProviderRegisterProvider>
      <ProviderRegisterSessionSync />
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
