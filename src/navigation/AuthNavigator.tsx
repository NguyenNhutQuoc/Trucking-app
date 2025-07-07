// src/navigation/AuthNavigator.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "@/screens/auth/LoginScreen";
import { AuthStackParamList } from "@/types/navigation.types";
import StationSelectionScreen from "@/screens/auth/StationSelectionScreen";

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "transparent" },
      }}
      initialRouteName="Login"
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "Đăng nhập",
        }}
      />
      <Stack.Screen
        name="StationSelection"
        component={StationSelectionScreen}
        options={{
          title: "Chọn trạm cân",
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
