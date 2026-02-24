// src/screens/management/AddVehicleScreen.tsx
import React from "react";
import { useRouter } from "expo-router";

import Header from "@/components/common/Header";
import VehicleForm from "@/components/forms/VehicleForm";
import ThemedView from "@/components/common/ThemedView";
import { Soxe } from "@/types/api.types";
import { useNavigationStore } from "@/store/navigationStore";

const AddVehicleScreen: React.FC = () => {
  const router = useRouter();
  const { selectedVehicle: vehicle } = useNavigationStore();
  const editMode = !!vehicle;

  const handleSubmitSuccess = (updatedVehicle: Soxe) => {
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ThemedView useSafeArea style={{ flex: 1 }}>
      <Header title={editMode ? "Sửa Xe" : "Thêm Xe Mới"} showBack />

      <VehicleForm
        vehicle={vehicle ?? undefined}
        onSubmitSuccess={handleSubmitSuccess}
        onCancel={handleCancel}
      />
    </ThemedView>
  );
};

export default AddVehicleScreen;
