// src/screens/management/AddUserScreen.tsx (updated with real API)
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import { userApi } from "@/api/user";
import { permissionApi } from "@/api/permission";
import Header from "@/components/common/Header";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import colors from "@/constants/colors";
import { ManagementStackParamList } from "@/types/navigation.types";
import { NhanvienCreate, NhanvienUpdate, NhomQuyen } from "@/types/api.types";

type AddUserScreenRouteProp = RouteProp<ManagementStackParamList, "AddUser">;

const AddUserScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddUserScreenRouteProp>();
  const { user } = route.params || {};
  const editMode = !!user;

  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<NhomQuyen[]>([]);
  const [formData, setFormData] = useState({
    nvId: "",
    tenNV: "",
    matkhau: "",
    xacNhanMatKhau: "",
    trangthai: 0,
    type: 0,
    nhomId: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadGroups();
    if (editMode && user) {
      setFormData({
        nvId: user.nvId,
        tenNV: user.tenNV,
        matkhau: "",
        xacNhanMatKhau: "",
        trangthai: user.trangthai,
        type: user.type,
        nhomId: user.nhomId,
      });
    }
  }, [user]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await permissionApi.getAllGroups();
      if (response.success) {
        setGroups(response.data);
      } else {
        Alert.alert(
          "Lỗi",
          response.message || "Không thể tải danh sách nhóm quyền",
        );
      }
    } catch (error) {
      console.error("Load groups error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tải danh sách nhóm quyền");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editMode && !formData.nvId) {
      newErrors.nvId = "Vui lòng nhập tên đăng nhập";
    }

    if (!formData.tenNV) {
      newErrors.tenNV = "Vui lòng nhập tên người dùng";
    }

    if (!editMode && !formData.matkhau) {
      newErrors.matkhau = "Vui lòng nhập mật khẩu";
    }

    if (!editMode && formData.matkhau !== formData.xacNhanMatKhau) {
      newErrors.xacNhanMatKhau = "Mật khẩu xác nhận không khớp";
    }

    if (
      editMode &&
      formData.matkhau &&
      formData.matkhau !== formData.xacNhanMatKhau
    ) {
      newErrors.xacNhanMatKhau = "Mật khẩu xác nhận không khớp";
    }

    if (formData.nhomId === 0) {
      newErrors.nhomId = "Vui lòng chọn nhóm quyền";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Prepare data for API call
      if (editMode) {
        const updateData: NhanvienUpdate = {
          tenNV: formData.tenNV,
          trangthai: formData.trangthai,
          type: formData.type,
          nhomId: formData.nhomId,
        };

        // Only include password if provided
        if (formData.matkhau) {
          updateData.matkhau = formData.matkhau;
        }

        const response = await userApi.updateUser(user.nvId, updateData);

        if (response.success) {
          Alert.alert("Thành công", "Cập nhật người dùng thành công", [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]);
        } else {
          Alert.alert(
            "Lỗi",
            response.message || "Có lỗi xảy ra khi cập nhật người dùng",
          );
        }
      } else {
        // Create new user
        const createData: NhanvienCreate = {
          nvId: formData.nvId,
          tenNV: formData.tenNV,
          matkhau: formData.matkhau,
          trangthai: formData.trangthai,
          type: formData.type,
          nhomId: formData.nhomId,
        };

        const response = await userApi.createUser(createData);

        if (response.success) {
          Alert.alert("Thành công", "Tạo người dùng mới thành công", [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]);
        } else {
          Alert.alert(
            "Lỗi",
            response.message || "Có lỗi xảy ra khi tạo người dùng mới",
          );
        }
      }
    } catch (error) {
      console.error("Save user error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const getGroupName = (groupId: number): string => {
    const group = groups.find((g) => g.nhomId === groupId);
    return group ? group.ten : "";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={editMode ? "Sửa Người Dùng" : "Thêm Người Dùng Mới"}
        showBack
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Tên đăng nhập *"
            value={formData.nvId}
            onChangeText={(text) => handleInputChange("nvId", text)}
            error={errors.nvId}
            leftIcon={
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.gray600}
              />
            }
            editable={!editMode} // Không cho phép sửa tên đăng nhập khi đang chỉnh sửa
          />

          <Input
            label="Tên người dùng *"
            value={formData.tenNV}
            onChangeText={(text) => handleInputChange("tenNV", text)}
            error={errors.tenNV}
            leftIcon={
              <Ionicons name="text-outline" size={20} color={colors.gray600} />
            }
          />

          <Input
            label={editMode ? "Mật khẩu mới" : "Mật khẩu *"}
            value={formData.matkhau}
            onChangeText={(text) => handleInputChange("matkhau", text)}
            error={errors.matkhau}
            secure
            leftIcon={
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.gray600}
              />
            }
          />

          <Input
            label={editMode ? "Xác nhận mật khẩu mới" : "Xác nhận mật khẩu *"}
            value={formData.xacNhanMatKhau}
            onChangeText={(text) => handleInputChange("xacNhanMatKhau", text)}
            error={errors.xacNhanMatKhau}
            secure
            leftIcon={
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={colors.gray600}
              />
            }
          />

          <Text style={styles.sectionTitle}>Nhóm quyền & Trạng thái</Text>

          <View style={styles.groupSelector}>
            {groups.map((group) => (
              <TouchableOpacity
                key={group.nhomId}
                style={[
                  styles.groupOption,
                  formData.nhomId === group.nhomId &&
                    styles.groupOptionSelected,
                ]}
                onPress={() => handleInputChange("nhomId", group.nhomId)}
              >
                <Ionicons
                  name={
                    formData.nhomId === group.nhomId
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={
                    formData.nhomId === group.nhomId
                      ? colors.primary
                      : colors.gray500
                  }
                />
                <Text
                  style={[
                    styles.groupOptionText,
                    formData.nhomId === group.nhomId &&
                      styles.groupOptionTextSelected,
                  ]}
                >
                  {group.ten}
                </Text>
              </TouchableOpacity>
            ))}
            {errors.nhomId && (
              <Text style={styles.errorText}>{errors.nhomId}</Text>
            )}
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Loại tài khoản:</Text>
            <View style={styles.switchOptions}>
              <TouchableOpacity
                style={[
                  styles.switchOption,
                  formData.type === 0 && styles.switchOptionSelected,
                ]}
                onPress={() => handleInputChange("type", 0)}
              >
                <Ionicons
                  name={
                    formData.type === 0 ? "radio-button-on" : "radio-button-off"
                  }
                  size={20}
                  color={formData.type === 0 ? colors.primary : colors.gray500}
                />
                <Text
                  style={[
                    styles.switchOptionText,
                    formData.type === 0 && styles.switchOptionTextSelected,
                  ]}
                >
                  Người dùng thường
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.switchOption,
                  formData.type === 1 && styles.switchOptionSelected,
                ]}
                onPress={() => handleInputChange("type", 1)}
              >
                <Ionicons
                  name={
                    formData.type === 1 ? "radio-button-on" : "radio-button-off"
                  }
                  size={20}
                  color={formData.type === 1 ? colors.primary : colors.gray500}
                />
                <Text
                  style={[
                    styles.switchOptionText,
                    formData.type === 1 && styles.switchOptionTextSelected,
                  ]}
                >
                  Quản trị viên
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Trạng thái:</Text>
            <View style={styles.switchOptions}>
              <TouchableOpacity
                style={[
                  styles.switchOption,
                  formData.trangthai === 0 && styles.switchOptionSelected,
                ]}
                onPress={() => handleInputChange("trangthai", 0)}
              >
                <Ionicons
                  name={
                    formData.trangthai === 0
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={
                    formData.trangthai === 0 ? colors.primary : colors.gray500
                  }
                />
                <Text
                  style={[
                    styles.switchOptionText,
                    formData.trangthai === 0 && styles.switchOptionTextSelected,
                  ]}
                >
                  Hoạt động
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.switchOption,
                  formData.trangthai === 1 && styles.switchOptionSelected,
                ]}
                onPress={() => handleInputChange("trangthai", 1)}
              >
                <Ionicons
                  name={
                    formData.trangthai === 1
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={
                    formData.trangthai === 1 ? colors.primary : colors.gray500
                  }
                />
                <Text
                  style={[
                    styles.switchOptionText,
                    formData.trangthai === 1 && styles.switchOptionTextSelected,
                  ]}
                >
                  Vô hiệu hóa
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Hủy"
              variant="outline"
              onPress={() => navigation.goBack()}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  groupSelector: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  groupOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  groupOptionSelected: {
    backgroundColor: colors.primary + "15",
  },
  groupOptionText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  groupOptionTextSelected: {
    fontWeight: "600",
    color: colors.primary,
  },
  switchContainer: {
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray700,
    marginBottom: 8,
  },
  switchOptions: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  switchOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  switchOptionSelected: {
    backgroundColor: colors.primary + "15",
  },
  switchOptionText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  switchOptionTextSelected: {
    fontWeight: "600",
    color: colors.primary,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
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

export default AddUserScreen;
