// src/components/forms/VehicleForm.tsx
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

import { vehicleApi } from "@/api/vehicle";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import colors from "@/constants/colors";
import { Soxe, SoxeCreate, SoxeUpdate } from "@/types/api.types";

interface VehicleFormProps {
  vehicle?: Soxe;
  onSubmitSuccess?: (vehicle: Soxe) => void;
  onCancel?: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  vehicle,
  onSubmitSuccess,
  onCancel,
}) => {
  const editMode = !!vehicle;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<SoxeCreate & SoxeUpdate>>({
    soxe: "",
    trongluong: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (vehicle && editMode) {
      setFormData({
        soxe: vehicle.soxe,
        trongluong: vehicle.trongluong,
      });
    }
  }, [vehicle, editMode]);

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

    if (editMode && !formData.soxe && formData.trongluong === undefined) {
      newErrors.soxe = "Vui lòng nhập ít nhất một trường để cập nhật";
      setErrors(newErrors);
      return false;
    }

    if (!formData.soxe && !editMode) {
      newErrors.soxe = "Vui lòng nhập biển số xe";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      let response;

      if (editMode && vehicle) {
        const updateData: SoxeUpdate = {
          soxe: formData.soxe !== vehicle.soxe ? formData.soxe : undefined,
          trongluong:
            formData.trongluong !== vehicle.trongluong
              ? formData.trongluong
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

        response = await vehicleApi.updateVehicle(vehicle.id, updateData);
      } else {
        response = await vehicleApi.createVehicle(formData as SoxeCreate);
      }

      if (response.success) {
        Alert.alert(
          "Thành công",
          editMode
            ? "Cập nhật thông tin xe thành công"
            : "Tạo xe mới thành công",
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
        Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu thông tin xe");
      }
    } catch (error) {
      console.error("Save vehicle error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu thông tin xe");
    } finally {
      setLoading(false);
    }
  };

  const formatWeightInput = (text: string) => {
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
          label="Biển số xe *"
          value={formData.soxe}
          onChangeText={(text) => handleInputChange("soxe", text)}
          error={errors.soxe}
          leftIcon={
            <Ionicons name="car-outline" size={20} color={colors.gray600} />
          }
          editable={!editMode} // Không cho phép sửa biển số khi ở chế độ chỉnh sửa
        />

        <Input
          label="Trọng lượng xe (kg)"
          value={formData.trongluong?.toString()}
          onChangeText={(text) => {
            const weight = formatWeightInput(text);
            handleInputChange("trongluong", weight);
          }}
          keyboardType="numeric"
          leftIcon={
            <Ionicons name="scale-outline" size={20} color={colors.gray600} />
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

export default VehicleForm;
