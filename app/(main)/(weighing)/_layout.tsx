// app/(main)/(weighing)/_layout.tsx
// Weighing stack navigator
import { Stack } from "expo-router";

export default function WeighingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
