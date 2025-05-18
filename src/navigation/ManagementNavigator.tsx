// src/navigation/ManagementNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ManagementHomeScreen from "@/screens/management/ManagementHomeScreen";
import VehicleListScreen from "@/screens/management/VehicleListScreen";
import CompanyListScreen from "@/screens/management/CompanyListScreen";
import ProductListScreen from "@/screens/management/ProductListScreen";
import AddVehicleScreen from "@/screens/management/AddVehicleScreen";
import AddCompanyScreen from "@/screens/management/AddCompanyScreen";
import AddProductScreen from "@/screens/management/AddProductScreen";
import { ManagementStackParamList } from "@/types/navigation.types";

const Stack = createNativeStackNavigator<ManagementStackParamList>();

const ManagementNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ManagementHome" component={ManagementHomeScreen} />
      <Stack.Screen name="VehicleList" component={VehicleListScreen} />
      <Stack.Screen name="CompanyList" component={CompanyListScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
      <Stack.Screen name="AddCompany" component={AddCompanyScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
    </Stack.Navigator>
  );
};

export default ManagementNavigator;
