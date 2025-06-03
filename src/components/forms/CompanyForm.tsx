// src/components/forms/CompanyForm.tsx
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

import { customerApi } from "@/api/customer";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import colors from "@/constants/colors";
import { Khachhang, KhachhangCreate, KhachhangUpdate } from "@/types/api.types";
import { formatPhoneNumber } from "@/utils/formatters";

interface CompanyFormProps {
  company?: Khachhang;
  onSubmitSuccess?: (company: Khachhang) => void;
  onCancel?: () => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({
  company,
  onSubmitSuccess,
  onCancel,
}) => {
  const editMode = !!company;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<
    Partial<KhachhangCreate & KhachhangUpdate>
  >({
    ma: "",
    ten: "",
    diachi: "",
    dienthoai: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (company && editMode) {
      setFormData({
        ma: company.ma,
        ten: company.ten,
        diachi: company.diachi || "",
        dienthoai: company.dienthoai || "",
      });
    }
  }, [company, editMode]);

  const handleInputChange = (key: string, value: string) => {
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

    if (editMode && !formData.ma && !formData.ten) {
      newErrors.ten = "Vui lòng nhập ít nhất một trường để cập nhật";
      setErrors(newErrors);
      return false;
    }

    if (!formData.ma && !editMode) {
      newErrors.ma = "Vui lòng nhập mã Khách Hàng";
    }

    if (!formData.ten && !editMode) {
      newErrors.ten = "Vui lòng nhập tên Khách Hàng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      let response;

      if (editMode && company) {
        const updateData: KhachhangUpdate = {
          ma: formData.ma !== company.ma ? formData.ma : undefined,
          ten: formData.ten !== company.ten ? formData.ten : undefined,
          diachi:
            formData.diachi !== company.diachi ? formData.diachi : undefined,
          dienthoai:
            formData.dienthoai !== company.dienthoai
              ? formData.dienthoai
              : undefined,
        };

        // Only include fields that have changed
        const hasChanges = Object.values(updateData).some(
          (value) => value !== undefined,
        );

        if (!hasChanges) {
          Alert.alert("Thông báo", "Không có thay đổi nào để cập nhật");
          return;
        }

        response = await customerApi.updateCustomer(company.id, updateData);
      } else {
        response = await customerApi.createCustomer(
          formData as KhachhangCreate,
        );
      }

      if (response.success) {
        Alert.alert(
          "Thành công",
          editMode
            ? "Cập nhật thông tin Khách Hàng thành công"
            : "Tạo Khách Hàng mới thành công",
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
        Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu thông tin Khách Hàng");
      }
    } catch (error) {
      console.error("Save company error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu thông tin Khách Hàng");
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumberInput = (text: string) => {
    // Remove non-numeric characters
    const phoneNumber = text.replace(/\D/g, "");
    return phoneNumber;
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
          label="Mã Khách Hàng *"
          value={formData.ma}
          onChangeText={(text) => handleInputChange("ma", text)}
          error={errors.ma}
          leftIcon={
            <Ionicons name="barcode-outline" size={20} color={colors.gray600} />
          }
          editable={!editMode} // Không cho phép sửa mã khi ở chế độ chỉnh sửa
        />

        <Input
          label="Tên Khách Hàng *"
          value={formData.ten}
          onChangeText={(text) => handleInputChange("ten", text)}
          error={errors.ten}
          leftIcon={
            <Ionicons
              name="business-outline"
              size={20}
              color={colors.gray600}
            />
          }
        />

        <Input
          label="Địa chỉ"
          value={formData.diachi}
          onChangeText={(text) => handleInputChange("diachi", text)}
          leftIcon={
            <Ionicons
              name="location-outline"
              size={20}
              color={colors.gray600}
            />
          }
          multiline
          numberOfLines={2}
        />

        <Input
          label="Số điện thoại"
          value={formData.dienthoai}
          onChangeText={(text) => {
            const formattedText = formatPhoneNumberInput(text);
            handleInputChange("dienthoai", formattedText);
          }}
          keyboardType="phone-pad"
          leftIcon={
            <Ionicons name="call-outline" size={20} color={colors.gray600} />
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

export default CompanyForm;
