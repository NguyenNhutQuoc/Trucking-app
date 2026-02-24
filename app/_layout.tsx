// app/_layout.tsx
// Root layout - wraps the entire app with global providers
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LogBox, ActivityIndicator, View, Text } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import {
  useFonts,
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "react-native-gesture-handler";

LogBox.ignoreLogs([
  "Overwriting fontFamily style attribute preprocessor",
  "VirtualizedLists should never be nested",
]);

// Listens to authLevel changes and redirects to the correct screen
function InitialLayout() {
  const { authLevel, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inMainGroup = segments[0] === "(main)";

    if (authLevel === "full" && !inMainGroup) {
      router.replace("/(main)");
    } else if (
      authLevel === "station" &&
      segments[1] !== "station-user-login"
    ) {
      router.replace("/(auth)/station-user-login");
    } else if (authLevel === "tenant" && segments[1] !== "station-selection") {
      router.replace("/(auth)/station-selection");
    } else if (authLevel === "none" && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
  }, [authLevel, isLoading]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    ...Ionicons.font,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FEFBFF",
        }}
      >
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={{ marginTop: 16, color: "#49454F" }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <StatusBar style="auto" />
          <InitialLayout />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
