// src/navigation/AuthNavigator.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import { useAuth } from "@/hooks/useAuth";
import LoginScreen from "@/screens/auth/LoginScreen";
import StationSelectionScreen from "@/screens/auth/StationSelectionScreen";
import StationUserLoginScreen from "@/screens/auth/StationUserLoginScreen";
import { AuthStackParamList } from "@/types/navigation.types";

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  const { authLevel } = useAuth();

  // Determine initial route based on auth level
  const getInitialRoute = (): keyof AuthStackParamList => {
    switch (authLevel) {
      case "tenant":
        return "StationSelection";
      case "station":
        return "StationUserLogin";
      default:
        return "Login";
    }
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "transparent" },
      }}
      initialRouteName={getInitialRoute()}
    >
      {authLevel === "none" && (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: "Đăng nhập",
          }}
        />
      )}

      {(authLevel === "none" || authLevel === "tenant") && (
        <Stack.Screen
          name="StationSelection"
          component={StationSelectionScreen}
          options={{
            title: "Chọn trạm cân",
            gestureEnabled: authLevel === "none", // Only allow swipe back from login flow
          }}
        />
      )}

      {authLevel === "station" && (
        <Stack.Screen
          name="StationUserLogin"
          component={StationUserLoginScreen}
          options={{
            title: "Đăng nhập trạm cân",
            gestureEnabled: false,
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AuthNavigator;
