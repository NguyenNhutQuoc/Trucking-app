// src/navigation/AppNavigator.tsx - Updated version
import React from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import Loading from "@/components/common/Loading";
import NavigationErrorBoundary from "@/components/common/NavigationErrorBoundary";

// Screens
import WeighingDetailScreen from "@/screens/weighing/WeighingDetailScreen";

// Types
import { RootStackParamList } from "@/types/navigation.types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const { isDarkMode, colors } = useAppTheme();

  // Create custom navigation theme
  const navigationTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  if (isLoading) {
    return <Loading loading fullscreen message="Đang tải..." />;
  }

  return (
    <NavigationErrorBoundary>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Main" component={MainNavigator} />
              <Stack.Screen
                name="WeighingDetail"
                component={WeighingDetailScreen}
              />
            </>
          ) : (
            <Stack.Screen
              name="Auth"
              component={AuthNavigator}
              options={{ gestureEnabled: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationErrorBoundary>
  );
};

export default AppNavigator;
