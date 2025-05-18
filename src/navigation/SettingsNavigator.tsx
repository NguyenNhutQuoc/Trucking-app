// src/navigation/SettingsNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SettingsHomeScreen from "@/screens/settings/SettingsHomeScreen";
import { SettingsStackParamList } from "@/types/navigation.types";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SettingsHome" component={SettingsHomeScreen} />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
