// src/screens/management/AddProductScreen.tsx
import React from "react";
import { useRouter } from "expo-router";

import Header from "@/components/common/Header";
import ProductForm from "@/components/forms/ProductForm";
import ThemedView from "@/components/common/ThemedView";
import { Hanghoa } from "@/types/api.types";
import { useNavigationStore } from "@/store/navigationStore";

const AddProductScreen: React.FC = () => {
  const router = useRouter();
  const { selectedProduct: product } = useNavigationStore();
  const editMode = !!product;

  const handleSubmitSuccess = (updatedProduct: Hanghoa) => {
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ThemedView useSafeArea style={{ flex: 1 }}>
      <Header
        title={editMode ? "Sửa Hàng Hóa" : "Thêm Hàng Hóa Mới"}
        showBack
      />

      <ProductForm
        product={product ?? undefined}
        onSubmitSuccess={handleSubmitSuccess}
        onCancel={handleCancel}
      />
    </ThemedView>
  );
};

export default AddProductScreen;
