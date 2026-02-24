// app/(main)/(reports)/_layout.tsx
// Reports stack navigator
import { Stack } from "expo-router";

export default function ReportsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="company" />
      <Stack.Screen name="product" />
      <Stack.Screen name="vehicle" />
      <Stack.Screen name="date-range" />
      <Stack.Screen name="custom" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
