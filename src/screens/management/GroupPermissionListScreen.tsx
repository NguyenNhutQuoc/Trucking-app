// src/screens/management/GroupPermissionsScreen.tsx (updated with real API)
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  Switch,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import { permissionApi } from "@/api/permission";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Loading from "@/components/common/Loading";
import Button from "@/components/common/Button";
import colors from "@/constants/colors";
import { Form, NhomQuyen } from "@/types/api.types";
import { ManagementStackParamList } from "@/types/navigation.types";

type GroupPermissionsRouteProp = RouteProp<
  ManagementStackParamList,
  "GroupPermissions"
>;

const GroupPermissionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<GroupPermissionsRouteProp>();
  const { group } = route.params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [groupDetail, setGroupDetail] = useState<NhomQuyen | null>(null);
  const [groupPermissions, setGroupPermissions] = useState<number[]>([]);
  const [allForms, setAllForms] = useState<Form[]>([]);
  const [formsByCategory, setFormsByCategory] = useState<
    Record<string, Form[]>
  >({});
  const [memberCount, setMemberCount] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load group permissions
      const groupResponse = await permissionApi.getGroupPermissions(
        group.nhomId,
      );
      if (groupResponse.success) {
        const groupWithPermissions = groupResponse.data.data;
        setGroupDetail(groupWithPermissions);

        // Extract form IDs from group permissions
        const formIds =
          groupWithPermissions.permissions?.map((perm) => perm.formId) || [];
        setGroupPermissions(formIds);

        // TODO: Trong trường hợp thực tế, cần tạo endpoint để lấy số lượng thành viên
        // Ở đây tạm mô phỏng
        setMemberCount(Math.floor(Math.random() * 10));
      }

      // Load all available forms
      const formsResponse = await permissionApi.getAllForms();
      if (formsResponse.success) {
        // Group forms by category
        const forms = formsResponse.data.data;
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
      console.error("Load group permissions error:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu quyền nhóm");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (formId: number) => {
    setGroupPermissions((prev) => {
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

      // Cập nhật quyền cho nhóm
      const response = await permissionApi.updateGroupPermissions(
        group.nhomId,
        groupPermissions,
      );

      if (response.success) {
        Alert.alert("Thành công", "Cập nhật quyền nhóm thành công", [
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
      console.error("Update group permissions error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi cập nhật quyền");
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormItem = ({ item }: { item: Form }) => {
    const hasPermission = groupPermissions.includes(item.formId);

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
          disabled={group.ma === "admin"} // Admin always has all permissions
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

  // Nếu nhóm là admin, thông báo không thể sửa quyền
  const isAdmin = group.ma === "admin";

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={`Phân quyền nhóm: ${group.ten}`} showBack />

      <View style={styles.container}>
        <View style={styles.groupInfoContainer}>
          <Card style={styles.groupInfoCard}>
            <View style={styles.groupInfo}>
              <View
                style={[
                  styles.groupIconContainer,
                  isAdmin && styles.adminGroupIconContainer,
                ]}
              >
                <Ionicons
                  name="people"
                  size={30}
                  color={isAdmin ? colors.chartPurple : colors.chartBlue}
                />
              </View>
              <View style={styles.groupDetails}>
                <Text style={styles.groupName}>{group.ten}</Text>
                <Text style={styles.groupCode}>Mã: {group.ma}</Text>
                <Text style={styles.groupMemberCount}>
                  Số thành viên: {memberCount}
                </Text>
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
                Nhóm quản trị viên mặc định có đầy đủ quyền sử dụng hệ thống.
                Không thể thay đổi quyền cho nhóm quản trị viên.
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
  groupInfoContainer: {
    marginBottom: 16,
  },
  groupInfoCard: {
    marginBottom: 0,
  },
  groupInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.chartBlue + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  adminGroupIconContainer: {
    backgroundColor: colors.chartPurple + "15",
  },
  groupDetails: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  groupCode: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 2,
  },
  groupMemberCount: {
    fontSize: 14,
    color: colors.gray700,
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

export default GroupPermissionsScreen;
