// src/screens/management/VehicleListScreen.tsx
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

import { vehicleApi } from "@/api/vehicle";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Loading from "@/components/common/Loading";
import Button from "@/components/common/Button";
import colors from "@/constants/colors";
import { Soxe } from "@/types/api.types";
import { ManagementStackScreenProps } from "@/types/navigation.types";

type NavigationProp = ManagementStackScreenProps<"VehicleList">["navigation"];

const VehicleListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState<Soxe[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Soxe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, []),
  );

  useEffect(() => {
    applySearch();
  }, [vehicles, searchQuery]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleApi.getAllVehicles();
      if (response.success) {
        setVehicles(response.data);
      }
    } catch (error) {
      console.error("Load vehicles error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadVehicles();
    } finally {
      setRefreshing(false);
    }
  };

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
    navigation.navigate({
      name: "AddVehicle",
      params: { vehicle: null },
      merge: true,
    });
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
              setLoading(true);
              const response = await vehicleApi.deleteVehicle(vehicle.id);
              if (response.success) {
                // Cập nhật danh sách sau khi xóa thành công
                setVehicles((prevVehicles) =>
                  prevVehicles.filter((v) => v.id !== vehicle.id),
                );
                Alert.alert("Thành công", "Xóa xe thành công");
              } else {
                Alert.alert("Lỗi", "Không thể xóa xe");
              }
            } catch (error) {
              console.error("Delete vehicle error:", error);
              Alert.alert("Lỗi", "Không thể xóa xe");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const renderVehicleItem = ({ item }: { item: Soxe }) => {
    return (
      <Card style={styles.vehicleCard}>
        <View style={styles.vehicleInfo}>
          <View style={styles.vehicleIconContainer}>
            <Ionicons name="car" size={24} color={colors.primary} />
          </View>
          <View style={styles.vehicleDetails}>
            <Text style={styles.vehicleNumber}>{item.soxe}</Text>
            <Text style={styles.vehicleWeight}>
              Trọng lượng: {item.trongluong} kg
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditVehicle(item)}
          >
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteVehicle(item)}
          >
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
        </View>

        <FlatList
          data={filteredVehicles}
          renderItem={renderVehicleItem}
          keyExtractor={(item) => item.id.toString()}
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
                    name="car-outline"
                    size={48}
                    color={colors.gray400}
                  />
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? "Không tìm thấy xe nào phù hợp"
                      : "Chưa có xe nào được thêm"}
                  </Text>
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
    backgroundColor: colors.primary + "15",
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
    color: colors.text,
    marginBottom: 4,
  },
  vehicleWeight: {
    fontSize: 14,
    color: colors.gray600,
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

export default VehicleListScreen;
