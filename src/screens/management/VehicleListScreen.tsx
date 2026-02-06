// src/screens/management/VehicleListScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { vehicleApi } from "@/api/vehicle";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Loading from "@/components/common/Loading";
import Button from "@/components/common/Button";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"; // ✅ NEW
import LoadMoreButton from "@/components/common/LoadMoreButton"; // ✅ NEW
import { Soxe } from "@/types/api.types";
import { ManagementStackScreenProps } from "@/types/navigation.types";

type NavigationProp = ManagementStackScreenProps<"VehicleList">["navigation"];
type ViewMode = "list" | "table";

const VehicleListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useAppTheme();

  // ✅ UPDATED: Use infinite scroll pagination hook
  const {
    items: vehicles,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    refresh,
    isRefreshing,
  } = useInfiniteScroll<Soxe>(
    async (page, pageSize) => {
      const response = await vehicleApi.getVehicles({ page, pageSize });
      return response.success ? response.data : null;
    },
    { pageSize: 20 },
  );

  const [filteredVehicles, setFilteredVehicles] = useState<Soxe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, []),
  );

  useEffect(() => {
    applySearch();
  }, [vehicles, searchQuery]);

  const applySearch = () => {
    if (!searchQuery.trim()) {
      setFilteredVehicles(vehicles);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = vehicles.filter((vehicle) => {
      return vehicle.soxe.toLowerCase().includes(query);
    });

    setFilteredVehicles(filtered);
  };

  const handleAddVehicle = () => {
    navigation.navigate("AddVehicle", { vehicle: undefined });
  };

  const handleEditVehicle = (vehicle: Soxe) => {
    navigation.navigate("AddVehicle", { vehicle });
  };

  const handleDeleteVehicle = (vehicle: Soxe) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa xe ${vehicle.soxe}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await vehicleApi.deleteVehicle(vehicle.id);
              if (response.success) {
                Alert.alert("Thành công", "Xóa xe thành công");
                refresh();
              } else {
                Alert.alert("Lỗi", "Không thể xóa xe");
              }
            } catch (error) {
              console.error("Delete vehicle error:", error);
              Alert.alert("Lỗi", "Không thể xóa xe");
            }
          },
        },
      ],
    );
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "list" ? "table" : "list");
  };

  // Table Header Component
  const TableHeader = () => (
    <View style={[styles.tableHeader, { backgroundColor: colors.gray100 }]}>
      <ThemedText style={[styles.tableHeaderCell, styles.vehicleColumn]}>
        Biển số xe
      </ThemedText>
      <ThemedText style={[styles.tableHeaderCell, styles.weightColumn]}>
        Trọng lượng (kg)
      </ThemedText>
      <ThemedText style={[styles.tableHeaderCell, styles.actionColumn]}>
        Thao tác
      </ThemedText>
    </View>
  );

  // Table Row Component
  const renderTableRow = ({ item, index }: { item: Soxe; index: number }) => {
    return (
      <View
        style={[
          styles.tableRow,
          {
            backgroundColor: index % 2 === 0 ? colors.card : colors.gray50,
          },
        ]}
      >
        <ThemedText
          style={[styles.tableCell, styles.vehicleColumn]}
          numberOfLines={1}
        >
          {item.soxe}
        </ThemedText>
        <ThemedText
          style={[styles.tableCell, styles.weightColumn]}
          numberOfLines={1}
        >
          {item.trongluong.toLocaleString()}
        </ThemedText>
        <View style={styles.actionColumn}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.primary + "20" },
              ]}
              onPress={() => handleEditVehicle(item)}
            >
              <Ionicons
                name="create-outline"
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.error + "20" },
              ]}
              onPress={() => handleDeleteVehicle(item)}
            >
              <Ionicons name="trash-outline" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // List Item Component
  const renderListItem = ({ item }: { item: Soxe }) => {
    return (
      <Card style={styles.vehicleCard}>
        <View style={styles.vehicleInfo}>
          <View
            style={[
              styles.vehicleIconContainer,
              { backgroundColor: colors.primary + "15" },
            ]}
          >
            <Ionicons name="car" size={24} color={colors.primary} />
          </View>
          <View style={styles.vehicleDetails}>
            <ThemedText style={styles.vehicleNumber}>{item.soxe}</ThemedText>
            <ThemedText type="subtitle" style={styles.vehicleWeight}>
              Trọng lượng: {item.trongluong.toLocaleString()} kg
            </ThemedText>
          </View>
        </View>

        <View
          style={[styles.cardActionButtons, { borderTopColor: colors.gray200 }]}
        >
          <TouchableOpacity
            style={[
              styles.cardActionButton,
              { backgroundColor: colors.gray100 },
            ]}
            onPress={() => handleEditVehicle(item)}
          >
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cardActionButton,
              { backgroundColor: colors.gray100 },
            ]}
            onPress={() => handleDeleteVehicle(item)}
          >
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <ThemedView useSafeArea>
      <Header
        title="Danh Sách Xe"
        showBack
        rightComponent={
          <TouchableOpacity style={styles.addButton} onPress={handleAddVehicle}>
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
              placeholder="Tìm kiếm biển số xe..."
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

          <TouchableOpacity
            style={[styles.viewModeButton, { backgroundColor: colors.gray100 }]}
            onPress={toggleViewMode}
          >
            <Ionicons
              name={viewMode === "list" ? "grid-outline" : "list-outline"}
              size={20}
              color={colors.gray700}
            />
          </TouchableOpacity>
        </View>

        {viewMode === "table" ? (
          <View style={styles.tableContainer}>
            <TableHeader />
            <FlatList
              data={filteredVehicles}
              renderItem={renderTableRow}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.tableContent}
              refreshing={isRefreshing}
              onRefresh={refresh}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  {loading ? (
                    <Loading loading />
                  ) : (
                    <>
                      <Ionicons
                        name="car-outline"
                        size={48}
                        color={colors.gray400}
                      />
                      <ThemedText style={styles.emptyText}>
                        {searchQuery
                          ? "Không tìm thấy xe nào phù hợp"
                          : "Chưa có xe nào được thêm"}
                      </ThemedText>
                    </>
                  )}
                </View>
              }
              ListFooterComponent={
                !loading && !searchQuery ? (
                  <LoadMoreButton
                    onPress={loadMore}
                    loading={loadingMore}
                    hasMore={hasMore}
                  />
                ) : null
              }
            />
          </View>
        ) : (
          <FlatList
            data={filteredVehicles}
            renderItem={renderListItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshing={isRefreshing}
            onRefresh={refresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                {loading ? (
                  <Loading loading />
                ) : (
                  <>
                    <Ionicons
                      name="car-outline"
                      size={48}
                      color={colors.gray400}
                    />
                    <ThemedText style={styles.emptyText}>
                      {searchQuery
                        ? "Không tìm thấy xe nào phù hợp"
                        : "Chưa có xe nào được thêm"}
                    </ThemedText>
                    <Button
                      title="Thêm xe mới"
                      onPress={handleAddVehicle}
                      variant="primary"
                      size="small"
                      contentStyle={styles.emptyButton}
                    />
                  </>
                )}
              </View>
            }
            ListFooterComponent={
              !loading && !searchQuery ? (
                <LoadMoreButton
                  onPress={loadMore}
                  loading={loadingMore}
                  hasMore={hasMore}
                />
              ) : null
            }
          />
        )}
      </View>

      <Loading loading={loading && !isRefreshing} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
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
  viewModeButton: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 8,
  },

  // Table Styles
  tableContainer: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tableHeaderCell: {
    fontWeight: "600",
    fontSize: 14,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    alignItems: "center",
  },
  tableCell: {
    fontSize: 14,
  },
  vehicleColumn: {
    flex: 3,
  },
  weightColumn: {
    flex: 2,
    textAlign: "center",
  },
  actionColumn: {
    flex: 2,
    alignItems: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  tableContent: {
    paddingBottom: 20,
  },

  // List Item Styles
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  vehicleCard: {
    marginBottom: 12,
  },
  vehicleInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  vehicleWeight: {
    fontSize: 14,
  },
  cardActionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  cardActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  // Common Styles
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

export default VehicleListScreen;
