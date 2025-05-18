// src/screens/management/AddProductScreen.tsx
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import Header from "@/components/common/Header";
import ProductForm from "@/components/forms/ProductForm";
import colors from "@/constants/colors";
import { ManagementStackParamList } from "@/types/navigation.types";
import { Hanghoa } from "@/types/api.types";

type AddProductScreenRouteProp = RouteProp<
  ManagementStackParamList,
  "AddProduct"
>;

const AddProductScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddProductScreenRouteProp>();

  const product = route.params?.product;
  const editMode = !!product;

  const handleSubmitSuccess = (updatedProduct: Hanghoa) => {
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={editMode ? "Sửa Hàng Hóa" : "Thêm Hàng Hóa Mới"}
        showBack
      />

      <ProductForm
        product={product}
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

export default AddProductScreen;
