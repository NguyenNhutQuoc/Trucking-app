// src/navigation/ReportsNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ReportsHomeScreen from "@/screens/reports/ReportsHomeScreen";
import { ReportsStackParamList } from "@/types/navigation.types";

const Stack = createNativeStackNavigator<ReportsStackParamList>();

const ReportsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ReportsHome" component={ReportsHomeScreen} />
    </Stack.Navigator>
  );
};

export default ReportsNavigator;
