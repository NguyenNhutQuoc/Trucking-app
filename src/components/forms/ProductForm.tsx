// src/components/forms/ProductForm.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { productApi } from "@/api/product";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import colors from "@/constants/colors";
import { Hanghoa, HanghoaCreate, HanghoaUpdate } from "@/types/api.types";

interface ProductFormProps {
  product?: Hanghoa;
  onSubmitSuccess?: (product: Hanghoa) => void;
  onCancel?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmitSuccess,
  onCancel,
}) => {
  const editMode = !!product;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<
    Partial<HanghoaCreate & HanghoaUpdate>
  >({
    ma: "",
    ten: "",
    dongia: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product && editMode) {
      setFormData({
        ma: product.ma,
        ten: product.ten,
        dongia: product.dongia,
      });
    }
  }, [product, editMode]);

  const handleInputChange = (key: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    // Clear error for this field if exists
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (
      editMode &&
      !formData.ma &&
      !formData.ten &&
      formData.dongia === undefined
    ) {
      newErrors.ten = "Vui lòng nhập ít nhất một trường để cập nhật";
      setErrors(newErrors);
      return false;
    }

    if (!formData.ma && !editMode) {
      newErrors.ma = "Vui lòng nhập mã hàng hóa";
    }

    if (!formData.ten && !editMode) {
      newErrors.ten = "Vui lòng nhập tên hàng hóa";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      let response;

      if (editMode && product) {
        const updateData: HanghoaUpdate = {
          ma: formData.ma !== product.ma ? formData.ma : undefined,
          ten: formData.ten !== product.ten ? formData.ten : undefined,
          dongia:
            formData.dongia !== product.dongia ? formData.dongia : undefined,
        };

        // Only include fields that have changed
        const hasChanges = Object.values(updateData).some(
          (value) => value !== undefined,
        );

        if (!hasChanges) {
          Alert.alert("Thông báo", "Không có thay đổi nào để cập nhật");
          return;
        }

        response = await productApi.updateProduct(product.id, updateData);
      } else {
        response = await productApi.createProduct(formData as HanghoaCreate);
      }

      if (response.success) {
        Alert.alert(
          "Thành công",
          editMode
            ? "Cập nhật thông tin hàng hóa thành công"
            : "Tạo hàng hóa mới thành công",
          [
            {
              text: "OK",
              onPress: () => {
                if (onSubmitSuccess) {
                  onSubmitSuccess(response.data);
                }
              },
            },
          ],
        );
      } else {
        Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu thông tin hàng hóa");
      }
    } catch (error) {
      console.error("Save product error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu thông tin hàng hóa");
    } finally {
      setLoading(false);
    }
  };

  const formatPriceInput = (text: string) => {
    // Remove non-numeric characters
    const numericValue = text.replace(/\D/g, "");
    return numericValue ? parseInt(numericValue, 10) : 0;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Mã hàng hóa *"
          value={formData.ma}
          onChangeText={(text) => handleInputChange("ma", text)}
          error={errors.ma}
          leftIcon={
            <Ionicons name="barcode-outline" size={20} color={colors.gray600} />
          }
          editable={!editMode} // Không cho phép sửa mã khi ở chế độ chỉnh sửa
        />

        <Input
          label="Tên hàng hóa *"
          value={formData.ten}
          onChangeText={(text) => handleInputChange("ten", text)}
          error={errors.ten}
          leftIcon={
            <Ionicons name="cube-outline" size={20} color={colors.gray600} />
          }
        />

        <Input
          label="Đơn giá (VND/kg)"
          value={formData.dongia?.toString()}
          onChangeText={(text) => {
            const price = formatPriceInput(text);
            handleInputChange("dongia", price);
          }}
          keyboardType="numeric"
          leftIcon={
            <Ionicons name="cash-outline" size={20} color={colors.gray600} />
          }
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Hủy"
            variant="outline"
            onPress={onCancel}
            contentStyle={styles.cancelButton}
          />

          <Button
            title={editMode ? "Cập nhật" : "Tạo mới"}
            onPress={handleSubmit}
            loading={loading}
            contentStyle={styles.submitButton}
          />
        </View>
      </ScrollView>

      <Loading
        loading={loading}
        overlay
        message={editMode ? "Đang cập nhật..." : "Đang tạo..."}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 2,
    marginLeft: 8,
  },
});

export default ProductForm;
