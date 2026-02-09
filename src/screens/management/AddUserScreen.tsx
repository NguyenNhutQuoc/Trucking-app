// src/screens/management/AddUserScreen.tsx (updated with dark mode support)
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import ResultModal, { ResultModalType } from "@/components/common/ResultModal";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ManagementStackParamList } from "@/types/navigation.types";
import { NhanvienCreate, NhanvienUpdate, NhomQuyen } from "@/types/api.types";

type AddUserScreenRouteProp = RouteProp<ManagementStackParamList, "AddUser">;

const AddUserScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddUserScreenRouteProp>();
  const { colors } = useAppTheme();
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

  // ✅ NEW: Result Modal state
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultModalMessage, setResultModalMessage] = useState("");
  const [resultModalType, setResultModalType] =
    useState<ResultModalType>("success");
  const [resultModalTitle, setResultModalTitle] = useState("");

  // ✅ NEW: Show result modal and navigate back when closed
  const showResultModalAndGoBack = (
    title: string,
    message: string,
    type: ResultModalType,
  ) => {
    setResultModalTitle(title);
    setResultModalMessage(message);
    setResultModalType(type);
    setResultModalVisible(true);
  };

  const handleResultModalClose = () => {
    setResultModalVisible(false);
    navigation.goBack();
  };

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
      const response = await permissionApi.getGroups({
        page: 1,
        pageSize: 100,
      });
      if (response) {
        setGroups(response.items);
      } else {
        showResultModalAndGoBack(
          "Lỗi",
          "Không thể tải danh sách nhóm quyền",
          "error",
        );
      }
    } catch (error) {
      console.error("Load groups error:", error);
      showResultModalAndGoBack(
        "Lỗi",
        "Có lỗi xảy ra khi tải danh sách nhóm quyền",
        "error",
      );
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
          nvId: formData.nvId,
        };

        // Only include password if provided
        if (formData.matkhau) {
          updateData.matkhau = formData.matkhau;
        }

        console.log("updateData", updateData);
        const response = await userApi.updateUser(user.nvId, updateData);

        if (response) {
          // ✅ UPDATED: Use ResultModal with yellow gradient for edit
          showResultModalAndGoBack(
            "Cập nhật thành công",
            `Người dùng "${formData.tenNV}" đã được cập nhật thành công`,
            "warning",
          );
        } else {
          showResultModalAndGoBack(
            "Lỗi",
            "Có lỗi xảy ra khi cập nhật người dùng",
            "error",
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

        if (response) {
          // ✅ UPDATED: Use ResultModal with green gradient for create
          showResultModalAndGoBack(
            "Thêm mới thành công",
            `Người dùng "${formData.tenNV}" đã được tạo thành công`,
            "success",
          );
        } else {
          showResultModalAndGoBack(
            "Lỗi",
            "Có lỗi xảy ra khi tạo người dùng mới",
            "error",
          );
        }
      }
    } catch (error) {
      console.error("Save user error:", error);
      showResultModalAndGoBack(
        "Lỗi",
        "Có lỗi xảy ra khi lưu thông tin người dùng",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const getGroupName = (groupId: number): string => {
    const group = groups.find((g) => g.nhomId === groupId);
    return group ? group.ten : "";
  };

  return (
    <ThemedView useSafeArea>
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

          <ThemedText style={styles.sectionTitle}>
            Nhóm quyền & Trạng thái
          </ThemedText>

          <View
            style={[
              styles.groupSelector,
              {
                backgroundColor: colors.card,
                borderColor: colors.gray200,
              },
            ]}
          >
            {groups.map((group) => (
              <TouchableOpacity
                key={group.nhomId}
                style={[
                  styles.groupOption,
                  formData.nhomId === group.nhomId && {
                    backgroundColor: colors.primary + "15",
                  },
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
                <ThemedText
                  style={[
                    styles.groupOptionText,
                    formData.nhomId === group.nhomId
                      ? { fontWeight: "600", color: colors.primary }
                      : { color: colors.text },
                  ]}
                >
                  {group.ten}
                </ThemedText>
              </TouchableOpacity>
            ))}
            {errors.nhomId && (
              <ThemedText style={styles.errorText} color={colors.error}>
                {errors.nhomId}
              </ThemedText>
            )}
          </View>

          <View style={styles.switchContainer}>
            <ThemedText style={styles.switchLabel}>Loại tài khoản:</ThemedText>
            <View
              style={[
                styles.switchOptions,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.gray200,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.switchOption,
                  formData.type === 0 && {
                    backgroundColor: colors.primary + "15",
                  },
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
                <ThemedText
                  style={[
                    styles.switchOptionText,
                    formData.type === 0
                      ? {
                          fontWeight: "600",
                          color: colors.primary,
                        }
                      : {
                          color: colors.text,
                        },
                  ]}
                >
                  Người dùng thường
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.switchOption,
                  formData.type === 1 && {
                    backgroundColor: colors.primary + "15",
                  },
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
                <ThemedText
                  style={[
                    styles.switchOptionText,
                    formData.type === 1
                      ? {
                          fontWeight: "600",
                          color: colors.primary,
                        }
                      : {
                          color: colors.text,
                        },
                  ]}
                >
                  Quản trị viên
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.switchContainer}>
            <ThemedText style={styles.switchLabel}>Trạng thái:</ThemedText>
            <View
              style={[
                styles.switchOptions,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.gray200,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.switchOption,
                  formData.trangthai === 1 && {
                    backgroundColor: colors.primary + "15",
                  },
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
                <ThemedText
                  style={[
                    styles.switchOptionText,
                    formData.trangthai === 1
                      ? {
                          fontWeight: "600",
                          color: colors.primary,
                        }
                      : {
                          color: colors.text,
                        },
                  ]}
                >
                  Hoạt động
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.switchOption,
                  formData.trangthai === 0 && {
                    backgroundColor: colors.primary + "15",
                  },
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
                <ThemedText
                  style={[
                    styles.switchOptionText,
                    formData.trangthai === 0
                      ? {
                          fontWeight: "600",
                          color: colors.primary,
                        }
                      : {
                          color: colors.text,
                        },
                  ]}
                >
                  Vô hiệu hóa
                </ThemedText>
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

      <Loading loading={loading} />

      {/* ✅ NEW: Result Modal notification */}
      <ResultModal
        visible={resultModalVisible}
        onClose={handleResultModalClose}
        type={resultModalType}
        title={resultModalTitle}
        message={resultModalMessage}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
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
    marginTop: 20,
    marginBottom: 12,
  },
  groupSelector: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  groupOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  groupOptionText: {
    fontSize: 14,
    marginLeft: 8,
  },
  switchContainer: {
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  switchOptions: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
  },
  switchOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  switchOptionText: {
    fontSize: 14,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
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
