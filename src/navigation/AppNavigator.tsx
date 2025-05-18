// src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { useAuth } from "@/hooks/useAuth";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import colors from "@/constants/colors";
import Loading from "@/components/common/Loading";

// Screens
import WeighingDetailScreen from "@/screens/weighing/WeighingDetailScreen";

// Types
import { RootStackParamList } from "@/types/navigation.types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <Loading loading fullscreen message="Đang tải..." />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
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
  );
};

export default AppNavigator;
