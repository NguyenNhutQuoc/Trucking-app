// src/screens/management/AddVehicleScreen.tsx
import React from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import Header from "@/components/common/Header";
import VehicleForm from "@/components/forms/VehicleForm";
import ThemedView from "@/components/common/ThemedView";
import { ManagementStackParamList } from "@/types/navigation.types";
import { Soxe } from "@/types/api.types";

type AddVehicleScreenRouteProp = RouteProp<
  ManagementStackParamList,
  "AddVehicle"
>;

const AddVehicleScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddVehicleScreenRouteProp>();

  const vehicle = route.params?.vehicle;
  const editMode = !!vehicle;

  const handleSubmitSuccess = (updatedVehicle: Soxe) => {
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ThemedView useSafeArea style={{ flex: 1 }}>
      <Header title={editMode ? "Sửa Xe" : "Thêm Xe Mới"} showBack />

      <VehicleForm
        vehicle={vehicle}
        onSubmitSuccess={handleSubmitSuccess}
        onCancel={handleCancel}
      />
    </ThemedView>
  );
};

export default AddVehicleScreen;
