import "../../global.css";
import React from "react";
import { Stack } from "expo-router";

export default function ProviderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="waiting-approval" />
      <Stack.Screen name="tabs" />
    </Stack>
  );
}
