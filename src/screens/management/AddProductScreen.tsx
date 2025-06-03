// src/screens/management/AddProductScreen.tsx
import React from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import Header from "@/components/common/Header";
import ProductForm from "@/components/forms/ProductForm";
import ThemedView from "@/components/common/ThemedView";
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
    <ThemedView useSafeArea style={{ flex: 1 }}>
      <Header
        title={editMode ? "Sửa Hàng Hóa" : "Thêm Hàng Hóa Mới"}
        showBack
      />

      <ProductForm
        product={product}
        onSubmitSuccess={handleSubmitSuccess}
        onCancel={handleCancel}
      />
    </ThemedView>
  );
};

export default AddProductScreen;
