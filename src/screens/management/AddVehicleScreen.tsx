// src/screens/management/AddVehicleScreen.tsx
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import Header from "@/components/common/Header";
import VehicleForm from "@/components/forms/VehicleForm";
import colors from "@/constants/colors";
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
    <SafeAreaView style={styles.safeArea}>
      <Header title={editMode ? "Sửa Xe" : "Thêm Xe Mới"} showBack />

      <VehicleForm
        vehicle={vehicle}
        onSubmitSuccess={handleSubmitSuccess}
        onCancel={handleCancel}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default AddVehicleScreen;
