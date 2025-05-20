// src/screens/management/AddPermissionGroupScreen.tsx (updated with real API)
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import { permissionApi } from "@/api/permission";
import Header from "@/components/common/Header";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import colors from "@/constants/colors";
import { NhomQuyenCreate, NhomQuyenUpdate } from "@/types/api.types";
import { ManagementStackParamList } from "@/types/navigation.types";

type AddPermissionGroupScreenRouteProp = RouteProp<
  ManagementStackParamList,
  "AddPermissionGroup"
>;

const AddPermissionGroupScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddPermissionGroupScreenRouteProp>();
  const { group } = route.params || {};
  const editMode = !!group;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ma: "",
    ten: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editMode && group) {
      setFormData({
        ma: group.ma,
        ten: group.ten,
      });
    }
  }, [group]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.ma) {
      newErrors.ma = "Vui lòng nhập mã nhóm quyền";
    }

    if (!formData.ten) {
      newErrors.ten = "Vui lòng nhập tên nhóm quyền";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
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

      let response;
      if (editMode) {
        const updateData: NhomQuyenUpdate = {
          ten: formData.ten,
        };

        if (formData.ma !== group.ma) {
          updateData.ma = formData.ma;
        }

        response = await permissionApi.updateGroup(group.nhomId, updateData);
      } else {
        const createData: NhomQuyenCreate = {
          ma: formData.ma,
          ten: formData.ten,
        };

        response = await permissionApi.createGroup(createData);
      }

      if (response.success) {
        Alert.alert(
          "Thành công",
          editMode
            ? "Cập nhật nhóm quyền thành công"
            : "Tạo nhóm quyền mới thành công",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } else {
        Alert.alert(
          "Lỗi",
          response.message || "Có lỗi xảy ra khi lưu thông tin nhóm quyền",
        );
      }
    } catch (error) {
      console.error("Save permission group error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu thông tin nhóm quyền");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={editMode ? "Sửa Nhóm Quyền" : "Thêm Nhóm Quyền Mới"}
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
            label="Mã nhóm quyền *"
            value={formData.ma}
            onChangeText={(text) => handleInputChange("ma", text)}
            error={errors.ma}
            leftIcon={
              <Ionicons name="code-outline" size={20} color={colors.gray600} />
            }
            editable={!editMode} // Không cho phép sửa mã khi đang chỉnh sửa
          />

          <Input
            label="Tên nhóm quyền *"
            value={formData.ten}
            onChangeText={(text) => handleInputChange("ten", text)}
            error={errors.ten}
            leftIcon={
              <Ionicons
                name="people-outline"
                size={20}
                color={colors.gray600}
              />
            }
          />

          <View style={styles.noteContainer}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.info}
            />
            <Text style={styles.noteText}>
              Sau khi tạo nhóm quyền, bạn có thể phân quyền chi tiết trong màn
              hình danh sách nhóm quyền.
            </Text>
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
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.info + "15",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  noteText: {
    fontSize: 14,
    color: colors.info,
    marginLeft: 8,
    flex: 1,
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

export default AddPermissionGroupScreen;
