// src/navigation/WeighingNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WeighingListScreen from "@/screens/weighing/WeighingListScreen";
import WeighingDetailScreen from "@/screens/weighing/WeighingDetailScreen";
import CompleteWeighingScreen from "@/screens/weighing/CompleteWeighingScreen";
import { WeighingStackParamList } from "@/types/navigation.types";

const Stack = createNativeStackNavigator<WeighingStackParamList>();

const WeighingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="WeighingListScreen" component={WeighingListScreen} />
      <Stack.Screen name="WeighingDetail" component={WeighingDetailScreen} />
      <Stack.Screen
        name="CompleteWeighing"
        component={CompleteWeighingScreen}
      />
    </Stack.Navigator>
  );
};

export default WeighingNavigator;
