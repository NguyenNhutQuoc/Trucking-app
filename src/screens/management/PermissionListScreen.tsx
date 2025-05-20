// src/screens/management/PermissionListScreen.tsx (updated with real API)
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { permissionApi } from "@/api/permission";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Loading from "@/components/common/Loading";
import Button from "@/components/common/Button";
import colors from "@/constants/colors";
import { NhomQuyen } from "@/types/api.types";
import { ManagementStackScreenProps } from "@/types/navigation.types";

type NavigationProp =
  ManagementStackScreenProps<"PermissionList">["navigation"];

const PermissionListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<NhomQuyen[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<NhomQuyen[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  // Để lưu số lượng thành viên của mỗi nhóm (có thể lấy từ API hoặc tính toán)
  const [memberCounts, setMemberCounts] = useState<Record<number, number>>({});

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, []),
  );

  useEffect(() => {
    applySearch();
  }, [groups, searchQuery]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await permissionApi.getAllGroups();
      if (response.success) {
        setGroups(response.data);

        // TODO: Trong trường hợp thực tế, cần tạo endpoint để lấy số lượng thành viên
        // Ở đây tạm mô phỏng
        const mockMemberCounts: Record<number, number> = {};
        response.data.forEach((group) => {
          mockMemberCounts[group.nhomId] = Math.floor(Math.random() * 10); // Giả định số lượng ngẫu nhiên
        });
        setMemberCounts(mockMemberCounts);
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

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadGroups();
    } finally {
      setRefreshing(false);
    }
  };

  const applySearch = () => {
    if (!searchQuery.trim()) {
      setFilteredGroups(groups);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = groups.filter((group) => {
      return (
        group.ten.toLowerCase().includes(query) ||
        group.ma.toLowerCase().includes(query)
      );
    });

    setFilteredGroups(filtered);
  };

  const handleAddGroup = () => {
    navigation.navigate({
      name: "AddPermissionGroup",
      params: { group: null },
    });
  };

  const handleEditGroup = (group: NhomQuyen) => {
    navigation.navigate("AddPermissionGroup", { group });
  };

  const handleViewPermissions = (group: NhomQuyen) => {
    navigation.navigate("GroupPermissions", { group });
  };

  const handleDeleteGroup = (group: NhomQuyen) => {
    // Không cho phép xóa nhóm admin
    if (group.ma === "admin") {
      Alert.alert("Thông báo", "Không thể xóa nhóm quản trị viên");
      return;
    }

    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa nhóm quyền "${group.ten}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await permissionApi.deleteGroup(group.nhomId);
              if (response.success) {
                // Cập nhật danh sách sau khi xóa thành công
                setGroups((prevGroups) =>
                  prevGroups.filter((g) => g.nhomId !== group.nhomId),
                );
                Alert.alert("Thành công", "Xóa nhóm quyền thành công");
              } else {
                Alert.alert(
                  "Lỗi",
                  response.message || "Không thể xóa nhóm quyền",
                );
              }
            } catch (error) {
              console.error("Delete group error:", error);
              Alert.alert("Lỗi", "Có lỗi xảy ra khi xóa nhóm quyền");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const renderGroupItem = ({ item }: { item: NhomQuyen }) => {
    const isAdmin = item.ma === "admin";
    const memberCount = memberCounts[item.nhomId] || 0;

    return (
      <Card style={styles.groupCard}>
        <View style={styles.groupInfo}>
          <View
            style={[
              styles.groupIconContainer,
              isAdmin && styles.adminGroupIconContainer,
            ]}
          >
            <Ionicons
              name="people"
              size={24}
              color={isAdmin ? colors.chartPurple : colors.chartBlue}
            />
          </View>
          <View style={styles.groupDetails}>
            <View style={styles.nameContainer}>
              <Text style={styles.groupName}>{item.ten}</Text>
              {isAdmin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
              )}
            </View>
            <Text style={styles.groupCode}>Mã: {item.ma}</Text>
            <View style={styles.memberContainer}>
              <Ionicons
                name="person-outline"
                size={14}
                color={colors.gray600}
              />
              <Text style={styles.memberCount}>{memberCount} thành viên</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleViewPermissions(item)}
          >
            <Ionicons name="key-outline" size={22} color={colors.chartBlue} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, isAdmin && styles.disabledButton]}
            onPress={() => !isAdmin && handleEditGroup(item)}
            disabled={isAdmin}
          >
            <Ionicons
              name="create-outline"
              size={22}
              color={isAdmin ? colors.gray400 : colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, isAdmin && styles.disabledButton]}
            onPress={() => !isAdmin && handleDeleteGroup(item)}
            disabled={isAdmin}
          >
            <Ionicons
              name="trash-outline"
              size={22}
              color={isAdmin ? colors.gray400 : colors.error}
            />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Nhóm Quyền"
        showBack
        rightComponent={
          <TouchableOpacity style={styles.addButton} onPress={handleAddGroup}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color={colors.gray500}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm nhóm quyền..."
              placeholderTextColor={colors.gray500}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.gray500}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <FlatList
          data={filteredGroups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.nhomId.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {loading ? (
                <Loading loading />
              ) : (
                <>
                  <Ionicons
                    name="key-outline"
                    size={48}
                    color={colors.gray400}
                  />
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? "Không tìm thấy nhóm quyền nào phù hợp"
                      : "Chưa có nhóm quyền nào được thêm"}
                  </Text>
                  <Button
                    title="Thêm nhóm quyền mới"
                    onPress={handleAddGroup}
                    variant="primary"
                    size="small"
                    contentStyle={styles.emptyButton}
                  />
                </>
              )}
            </View>
          }
        />
      </View>

      <Loading loading={loading && !refreshing} />
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
  searchContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray100,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    height: "100%",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  groupCard: {
    marginBottom: 12,
  },
  groupInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  groupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginRight: 8,
  },
  adminBadge: {
    backgroundColor: colors.chartPurple + "20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: {
    fontSize: 12,
    color: colors.chartPurple,
    fontWeight: "500",
  },
  groupCode: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 2,
  },
  memberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberCount: {
    fontSize: 14,
    color: colors.gray700,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  addButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray600,
    textAlign: "center",
    marginVertical: 16,
  },
  emptyButton: {
    marginTop: 16,
  },
});

export default PermissionListScreen;
