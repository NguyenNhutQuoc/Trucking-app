// src/screens/management/UserListScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { userApi } from "@/api/user";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Loading from "@/components/common/Loading";
import Button from "@/components/common/Button";
import ThemedView from "@/components/common/ThemedView"; // Import ThemedView
import ThemedText from "@/components/common/ThemedText"; // Import ThemedText
import { useAppTheme } from "@/hooks/useAppTheme"; // Import the theme hook
import { Nhanvien, NhanvienWithPermissions } from "@/types/api.types";
import { ManagementStackScreenProps } from "@/types/navigation.types";

type NavigationProp = ManagementStackScreenProps<"UserList">["navigation"];

const UserListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDarkMode } = useAppTheme(); // Use the theme hook

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<Nhanvien[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Nhanvien[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, []),
  );

  useEffect(() => {
    applySearch();
  }, [users, searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAllUsers();
      if (response.success) {
        setUsers(response.data.data);
      } else {
        Alert.alert(
          "Lỗi",
          response.message || "Không thể tải danh sách người dùng",
        );
      }
    } catch (error) {
      console.error("Load users error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadUsers();
    } finally {
      setRefreshing(false);
    }
  };

  const applySearch = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = users.filter((user) => {
      return (
        user.tenNV.toLowerCase().includes(query) ||
        user.nvId.toLowerCase().includes(query)
      );
    });

    setFilteredUsers(filtered);
  };

  const handleAddUser = () => {
    navigation.navigate({
      name: "AddUser",
      params: { user: undefined },
    });
  };

  const handleEditUser = (user: Nhanvien) => {
    navigation.navigate("AddUser", { user });
  };

  const handleViewPermissions = (user: NhanvienWithPermissions) => {
    navigation.navigate("UserPermissions", { user });
  };

  const handleDeleteUser = (user: Nhanvien) => {
    // Không cho phép xóa tài khoản admin
    if (user.type === 1) {
      Alert.alert("Thông báo", "Không thể xóa tài khoản quản trị viên");
      return;
    }

    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa người dùng "${user.tenNV}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await userApi.deleteUser(user.nvId);
              if (response.success) {
                // Cập nhật danh sách sau khi xóa thành công
                setUsers((prevUsers) =>
                  prevUsers.filter((u) => u.nvId !== user.nvId),
                );
                Alert.alert("Thành công", "Xóa người dùng thành công");
              } else {
                Alert.alert(
                  "Lỗi",
                  response.message || "Không thể xóa người dùng",
                );
              }
            } catch (error) {
              console.error("Delete user error:", error);
              Alert.alert("Lỗi", "Có lỗi xảy ra khi xóa người dùng");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const renderUserItem = ({ item }: { item: Nhanvien }) => {
    const isAdmin = item.type === 1;
    const isActive = item.trangthai === 1;

    return (
      <Card style={styles.userCard}>
        <View style={styles.userInfo}>
          <View
            style={[
              styles.userIconContainer,
              {
                backgroundColor: isAdmin
                  ? colors.chartPurple + "15"
                  : colors.primary + "15",
              },
            ]}
          >
            <Ionicons
              name={isAdmin ? "person-circle" : "person"}
              size={24}
              color={isAdmin ? colors.chartPurple : colors.primary}
            />
          </View>
          <View style={styles.userDetails}>
            <View style={styles.nameContainer}>
              <ThemedText style={styles.userName}>{item.tenNV}</ThemedText>
              {isAdmin && (
                <View
                  style={[
                    styles.adminBadge,
                    {
                      backgroundColor: colors.chartPurple + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.adminBadgeText,
                      {
                        color: colors.chartPurple,
                      },
                    ]}
                  >
                    Admin
                  </Text>
                </View>
              )}
              {!isActive && (
                <View
                  style={[
                    styles.inactiveBadge,
                    {
                      backgroundColor: colors.error + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.inactiveBadgeText,
                      {
                        color: colors.error,
                      },
                    ]}
                  >
                    Vô hiệu
                  </Text>
                </View>
              )}
            </View>
            <ThemedText type="subtitle" style={styles.userId}>
              ID: {item.nvId}
            </ThemedText>
            {item.nhomId && (
              <View style={styles.groupContainer}>
                <Ionicons
                  name="people-outline"
                  size={14}
                  color={colors.gray600}
                />
                <ThemedText type="subtitle" style={styles.userGroup}>
                  Nhóm quyền ID: {item.nhomId}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        <View
          style={[styles.actionButtons, { borderTopColor: colors.gray200 }]}
        >
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.gray100 }]}
            onPress={() =>
              handleViewPermissions(item as NhanvienWithPermissions)
            }
          >
            <Ionicons name="key-outline" size={22} color={colors.chartBlue} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.gray100 }]}
            onPress={() => handleEditUser(item)}
          >
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.gray100 },
              isAdmin && styles.disabledButton,
            ]}
            onPress={() => !isAdmin && handleDeleteUser(item)}
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
    <ThemedView useSafeArea>
      <Header
        title="Danh Sách Người Dùng"
        showBack
        rightComponent={
          <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.card,
              borderBottomColor: colors.gray200,
            },
          ]}
        >
          <View
            style={[
              styles.searchInputContainer,
              { backgroundColor: colors.gray100 },
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={colors.gray500}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Tìm kiếm người dùng..."
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
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.nvId}
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
                    name="people-outline"
                    size={48}
                    color={colors.gray400}
                  />
                  <ThemedText style={styles.emptyText}>
                    {searchQuery
                      ? "Không tìm thấy người dùng nào phù hợp"
                      : "Chưa có người dùng nào được thêm"}
                  </ThemedText>
                  <Button
                    title="Thêm người dùng mới"
                    onPress={handleAddUser}
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
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    height: "100%",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  userCard: {
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  userIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  adminBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  inactiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inactiveBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  userId: {
    fontSize: 14,
    marginBottom: 2,
  },
  groupContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userGroup: {
    fontSize: 14,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    textAlign: "center",
    marginVertical: 16,
  },
  emptyButton: {
    marginTop: 16,
  },
});

export default UserListScreen;
