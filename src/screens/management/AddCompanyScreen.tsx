// src/screens/management/AddCompanyScreen.tsx
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import Header from "@/components/common/Header";
import CompanyForm from "@/components/forms/CompanyForm";
import colors from "@/constants/colors";
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
    <SafeAreaView style={styles.safeArea}>
      <Header title={editMode ? "Sửa Công Ty" : "Thêm Công Ty Mới"} showBack />

      <CompanyForm
        company={company}
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

export default AddCompanyScreen;
