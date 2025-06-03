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
import UserListScreen from "@/screens/management/UserListScreen";
import AddUserScreen from "@/screens/management/AddUserScreen";
import AddPermissionGroupScreen from "@/screens/management/AddEditGroupPermissionScreen";
import UserPermissionsScreen from "@/screens/management/PermissionListScreen";
import GroupPermissionsScreen from "@/screens/management/GroupPermissionListScreen";

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
      {/* Add other screens here */}
      <Stack.Screen name="UserList" component={UserListScreen} />
      <Stack.Screen name="AddUser" component={AddUserScreen} />
      <Stack.Screen
        name="AddPermissionGroup"
        component={AddPermissionGroupScreen}
      />
      <Stack.Screen name="UserPermissions" component={UserPermissionsScreen} />
      <Stack.Screen
        name="GroupPermissions"
        component={GroupPermissionsScreen}
      />
    </Stack.Navigator>
  );
};

export default ManagementNavigator;
