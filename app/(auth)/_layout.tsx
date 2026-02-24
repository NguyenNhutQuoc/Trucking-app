// app/(auth)/_layout.tsx
// Auth group layout - stack navigator for authentication screens
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="station-selection" />
      <Stack.Screen name="station-user-login" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
