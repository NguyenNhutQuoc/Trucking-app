// src/App.tsx
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LogBox, Text, View, ActivityIndicator } from "react-native";
import {
  useFonts,
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";

import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AppNavigator from "@/navigation/AppNavigator";
import "react-native-gesture-handler";

// Ignore specific warnings
LogBox.ignoreLogs([
  "Overwriting fontFamily style attribute preprocessor",
  "VirtualizedLists should never be nested",
]);

const App: React.FC = () => {
  const [fontsLoaded] = useFonts({
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FEFBFF" }}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={{ marginTop: 16, color: "#49454F" }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
