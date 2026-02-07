// src/screens/management/UserPermissionsScreen.tsx (updated with real API)
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import { userApi } from "@/api/user";
import { permissionApi } from "@/api/permission";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Loading from "@/components/common/Loading";
import Button from "@/components/common/Button";
import colors from "@/constants/colors";
import { Form, Nhanvien, Quyen } from "@/types/api.types";
import { ManagementStackParamList } from "@/types/navigation.types";

type UserPermissionsRouteProp = RouteProp<
  ManagementStackParamList,
  "UserPermissions"
>;

const UserPermissionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<UserPermissionsRouteProp>();
  const { user } = route.params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userDetail, setUserDetail] = useState<Nhanvien | null>(null);
  const [userPermissions, setUserPermissions] = useState<number[]>([]);
  const [allForms, setAllForms] = useState<Form[]>([]);
  const [formsByCategory, setFormsByCategory] = useState<
    Record<string, Form[]>
  >({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load user permissions
      const userResponse = await userApi.getUserPermissions(user.nvId);
      if (userResponse.success) {
        const userWithPermissions = userResponse.data.data;
        setUserDetail(userWithPermissions);

        // Extract form IDs from user permissions
        const formIds =
          userWithPermissions.permissions?.map((perm) => perm.formId) || [];
        setUserPermissions(formIds);
      }

      // Load all available forms
      const formsResponse = await permissionApi.getAllForms();
      if (formsResponse.success) {
        // Group forms by category
        const forms = formsResponse.data;
        setAllForms(forms);

        const categories = forms.reduce((acc: Record<string, Form[]>, form) => {
          const category = form.vitri;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(form);
          return acc;
        }, {});

        setFormsByCategory(categories);
      }
    } catch (error) {
      console.error("Load user permissions error:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu quyền người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (formId: number) => {
    setUserPermissions((prev) => {
      if (prev.includes(formId)) {
        return prev.filter((id) => id !== formId);
      } else {
        return [...prev, formId];
      }
    });
  };

  const handleSavePermissions = async () => {
    try {
      setSubmitting(true);

      // Kiểm tra nếu người dùng không có nhóm quyền
      if (!userDetail?.nhomId) {
        Alert.alert("Lỗi", "Người dùng chưa được gán nhóm quyền");
        return;
      }

      // Cập nhật quyền cho nhóm của người dùng
      const response = await permissionApi.updateGroupPermissions(
        userDetail.nhomId,
        userPermissions,
      );

      if (response.success) {
        Alert.alert("Thành công", "Cập nhật quyền người dùng thành công", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert(
          "Lỗi",
          response.message || "Có lỗi xảy ra khi cập nhật quyền",
        );
      }
    } catch (error) {
      console.error("Update user permissions error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi cập nhật quyền");
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormItem = ({ item }: { item: Form }) => {
    const hasPermission = userPermissions.includes(item.formId);

    return (
      <View style={styles.permissionItem}>
        <View style={styles.permissionInfo}>
          <Text style={styles.permissionName}>{item.ten}</Text>
          <Text style={styles.permissionCode}>{item.form}</Text>
        </View>
        <Switch
          value={hasPermission}
          onValueChange={() => handleTogglePermission(item.formId)}
          trackColor={{ false: colors.gray300, true: colors.primary + "70" }}
          thumbColor={hasPermission ? colors.primary : colors.gray100}
        />
      </View>
    );
  };

  const renderCategorySection = (category: string, forms: Form[]) => {
    const displayName =
      {
        quanly: "Quản lý",
        baocao: "Báo cáo",
        caidat: "Cài đặt",
        danhmuc: "Danh mục",
      }[category] || category;

    return (
      <View style={styles.categorySection} key={category}>
        <Text style={styles.categoryTitle}>{displayName}</Text>
        <Card style={styles.permissionsCard}>
          <FlatList
            data={forms}
            renderItem={renderFormItem}
            keyExtractor={(item) => item.formId.toString()}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </Card>
      </View>
    );
  };

  // Nếu user là admin, thông báo không thể sửa quyền
  const isAdmin = user.type === 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={`Phân quyền: ${user.tenNV}`} showBack />

      <View style={styles.container}>
        <View style={styles.userInfoContainer}>
          <Card style={styles.userInfoCard}>
            <View style={styles.userInfo}>
              <View
                style={[
                  styles.userIconContainer,
                  isAdmin && styles.adminIconContainer,
                ]}
              >
                <Ionicons
                  name={isAdmin ? "person-circle" : "person"}
                  size={30}
                  color={isAdmin ? colors.chartPurple : colors.primary}
                />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.tenNV}</Text>
                <Text style={styles.userId}>ID: {user.nvId}</Text>
                {userDetail?.nhomId && (
                  <View style={styles.groupContainer}>
                    <Ionicons
                      name="people-outline"
                      size={14}
                      color={colors.gray600}
                    />
                    <Text style={styles.userGroup}>
                      Nhóm quyền ID: {userDetail.nhomId}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Card>
        </View>

        {isAdmin ? (
          <Card style={styles.adminNoticeCard}>
            <View style={styles.adminNotice}>
              <Ionicons
                name="information-circle"
                size={24}
                color={colors.info}
              />
              <Text style={styles.adminNoticeText}>
                Người dùng có quyền quản trị viên mặc định có đầy đủ quyền sử
                dụng hệ thống. Không thể thay đổi quyền cho quản trị viên.
              </Text>
            </View>
          </Card>
        ) : loading ? (
          <Loading loading />
        ) : (
          <FlatList
            data={Object.entries(formsByCategory)}
            keyExtractor={([category]) => category}
            renderItem={({ item: [category, forms] }) =>
              renderCategorySection(category, forms)
            }
            contentContainerStyle={styles.listContent}
          />
        )}

        {!isAdmin && (
          <View style={styles.buttonContainer}>
            <Button
              title="Hủy"
              variant="outline"
              onPress={() => navigation.goBack()}
              contentStyle={styles.cancelButton}
            />
            <Button
              title="Lưu thay đổi"
              onPress={handleSavePermissions}
              loading={submitting}
              contentStyle={styles.saveButton}
            />
          </View>
        )}
      </View>

      <Loading loading={submitting} overlay message="Đang lưu..." />
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
    padding: 16,
  },
  userInfoContainer: {
    marginBottom: 16,
  },
  userInfoCard: {
    marginBottom: 0,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  adminIconContainer: {
    backgroundColor: colors.chartPurple + "15",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 2,
  },
  groupContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userGroup: {
    fontSize: 14,
    color: colors.gray700,
    marginLeft: 4,
  },
  adminNoticeCard: {
    marginBottom: 16,
  },
  adminNotice: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  adminNoticeText: {
    flex: 1,
    fontSize: 14,
    color: colors.info,
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  permissionsCard: {
    padding: 0,
    overflow: "hidden",
  },
  permissionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 2,
  },
  permissionCode: {
    fontSize: 12,
    color: colors.gray600,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray200,
    marginLeft: 16,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 2,
    marginLeft: 8,
  },
});

export default UserPermissionsScreen;
