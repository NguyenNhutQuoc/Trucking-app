// app/(main)/(management)/_layout.tsx
// Management stack navigator - organized by feature domain
import { Stack } from "expo-router";

export default function ManagementLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="vehicles/index" />
      <Stack.Screen name="vehicles/[id]" />
      <Stack.Screen name="companies/index" />
      <Stack.Screen name="companies/[id]" />
      <Stack.Screen name="products/index" />
      <Stack.Screen name="products/[id]" />
      <Stack.Screen name="users/index" />
      <Stack.Screen name="users/[id]" />
      <Stack.Screen name="permissions/index" />
      <Stack.Screen name="permissions/[id]" />
    </Stack>
  );
}
