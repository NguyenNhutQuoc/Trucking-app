// src/screens/management/AddCompanyScreen.tsx
import React from "react";
import { useRouter } from "expo-router";

import Header from "@/components/common/Header";
import CompanyForm from "@/components/forms/CompanyForm";
import ThemedView from "@/components/common/ThemedView";
import { Khachhang } from "@/types/api.types";
import { useNavigationStore } from "@/store/navigationStore";

const AddCompanyScreen: React.FC = () => {
  const router = useRouter();
  const { selectedCompany: company } = useNavigationStore();
  const editMode = !!company;

  const handleSubmitSuccess = (updatedCompany: Khachhang) => {
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ThemedView useSafeArea style={{ flex: 1 }}>
      <Header
        title={editMode ? "Sửa Khách Hàng" : "Thêm Khách Hàng Mới"}
        showBack
      />

      <CompanyForm
        company={company ?? undefined}
        onSubmitSuccess={handleSubmitSuccess}
        onCancel={handleCancel}
      />
    </ThemedView>
  );
};

export default AddCompanyScreen;
