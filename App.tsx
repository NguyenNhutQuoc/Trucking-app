// src/App.tsx
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LogBox } from "react-native";

import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AppNavigator from "@/navigation/AppNavigator";

// Ignore specific warnings
LogBox.ignoreLogs([
  "Overwriting fontFamily style attribute preprocessor",
  "VirtualizedLists should never be nested",
  // Add more warning texts to ignore as needed
]);

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
