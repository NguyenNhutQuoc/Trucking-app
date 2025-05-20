// src/navigation/ReportsNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ReportsHomeScreen from "@/screens/reports/ReportsHomeScreen";
import CompanyReportsScreen from "@/screens/reports/CompanyReportScreen";
import ProductReportsScreen from "@/screens/reports/ProductReportScreen";
import VehicleReportsScreen from "@/screens/reports/VehicleReportScreen";
import DateRangeReportsScreen from "@/screens/reports/DataRangeReportScreen";
import CustomReportScreen from "@/screens/reports/CustomReportScreen";
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
      <Stack.Screen name="CompanyReports" component={CompanyReportsScreen} />
      <Stack.Screen name="ProductReports" component={ProductReportsScreen} />
      <Stack.Screen name="VehicleReports" component={VehicleReportsScreen} />
      <Stack.Screen
        name="DateRangeReports"
        component={DateRangeReportsScreen}
      />
      <Stack.Screen name="CustomReport" component={CustomReportScreen} />
    </Stack.Navigator>
  );
};

export default ReportsNavigator;
