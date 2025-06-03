// src/screens/management/AddCompanyScreen.tsx
import React from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import Header from "@/components/common/Header";
import CompanyForm from "@/components/forms/CompanyForm";
import ThemedView from "@/components/common/ThemedView";
import { ManagementStackParamList } from "@/types/navigation.types";
import { Khachhang } from "@/types/api.types";

type AddCompanyScreenRouteProp = RouteProp<
  ManagementStackParamList,
  "AddCompany"
>;

const AddCompanyScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddCompanyScreenRouteProp>();

  const company = route.params?.company;
  const editMode = !!company;

  const handleSubmitSuccess = (updatedCompany: Khachhang) => {
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ThemedView useSafeArea style={{ flex: 1 }}>
      <Header
        title={editMode ? "Sửa Khách Hàng" : "Thêm Khách Hàng Mới"}
        showBack
      />

      <CompanyForm
        company={company}
        onSubmitSuccess={handleSubmitSuccess}
        onCancel={handleCancel}
      />
    </ThemedView>
  );
};

export default AddCompanyScreen;
