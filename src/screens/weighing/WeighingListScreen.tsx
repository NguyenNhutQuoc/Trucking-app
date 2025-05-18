// src/screens/weighing/WeighingListScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  RefreshControl,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { weighingApi } from "@/api/weighing";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import colors from "@/constants/colors";
import { Phieucan } from "@/types/api.types";

type FilterState = "all" | "completed" | "pending" | "today";

const WeighingListScreen: React.FC = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weighings, setWeighings] = useState<Phieucan[]>([]);
  const [filteredWeighings, setFilteredWeighings] = useState<Phieucan[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterState>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  useEffect(() => {
    applyFilters();
  }, [weighings, activeFilter, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await weighingApi.getAllWeighings();
      if (response.success) {
        // Sort by date descending
        const sortedWeighings = response.data.sort((a, b) => {
          return (
            new Date(b.ngaycan1).getTime() - new Date(a.ngaycan1).getTime()
          );
        });
        setWeighings(sortedWeighings);
      }
    } catch (error) {
      console.error("Load weighings error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } catch (error) {
      console.error("Refresh data error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let result = [...weighings];

    // Apply active filter
    if (activeFilter === "completed") {
      result = result.filter((item) => item.ngaycan2);
    } else if (activeFilter === "pending") {
      result = result.filter((item) => !item.ngaycan2);
    } else if (activeFilter === "today") {
      const today = new Date().toISOString().split("T")[0];
      result = result.filter((item) => {
        const itemDate = new Date(item.ngaycan1).toISOString().split("T")[0];
        return itemDate === today;
      });
    }

    // Apply search query
    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.soxe.toLowerCase().includes(normalizedQuery) ||
          item.loaihang.toLowerCase().includes(normalizedQuery) ||
          item.khachhang.toLowerCase().includes(normalizedQuery) ||
          item.sophieu.toString().includes(normalizedQuery),
      );
    }

    setFilteredWeighings(result);
  };

  const handleFilterChange = (filter: FilterState) => {
    setActiveFilter(filter);
  };

  const handleWeighingPress = (weighing: Phieucan) => {
    // @ts-ignore
    navigation.navigate("WeighingDetail", { weighing });
  };

  const handleNewWeighing = () => {
    // @ts-ignore
    navigation.navigate("AddEditWeighing");
  };

  const getStatusColor = (weighing: Phieucan) => {
    if (weighing.uploadStatus === 1) {
      return colors.error; // Cancelled
    }
    if (weighing.ngaycan2) {
      return colors.success; // Completed
    }
    return colors.warning; // Pending
  };

  const getStatusText = (weighing: Phieucan) => {
    if (weighing.uploadStatus === 1) {
      return "Hủy";
    }
    if (weighing.ngaycan2) {
      return "Hoàn thành";
    }
    return "Đang chờ";
  };

  const renderWeighingItem = ({ item }: { item: Phieucan }) => {
    const statusColor = getStatusColor(item);
    const statusText = getStatusText(item);

    const date = new Date(item.ngaycan1);
    const timeString = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Calculate net weight if both weights exist
    const netWeight = item.ngaycan2
      ? Math.abs((item.tlcan2 ?? 0) - item.tlcan1)
      : null;

    return (
      <Card
        onPress={() => handleWeighingPress(item)}
        style={styles.weighingCard}
        rightContent={
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        }
      >
        <View style={styles.weighingHeader}>
          <View style={styles.weighingHeaderLeft}>
            <Text style={styles.vehicleNumber}>{item.soxe}</Text>
            <Text style={styles.weighTicketNumber}>#{item.sophieu}</Text>
          </View>
        </View>

        <View style={styles.weighingDetails}>
          <View style={styles.weighingDetailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Vào:</Text>
              <Text style={styles.detailValue}>{timeString}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Trọng lượng vào:</Text>
              <Text style={styles.detailValue}>{item.tlcan1} kg</Text>
            </View>
          </View>

          {item.ngaycan2 && (
            <View style={styles.weighingDetailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Ra:</Text>
                <Text style={styles.detailValue}>
                  {new Date(item.ngaycan2).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Trọng lượng ra:</Text>
                <Text style={styles.detailValue}>{item.tlcan2} kg</Text>
              </View>
            </View>
          )}

          {netWeight && (
            <View style={styles.netWeightContainer}>
              <Text style={styles.detailLabel}>Trọng lượng hàng:</Text>
              <Text style={styles.netWeightValue}>{netWeight} kg</Text>
            </View>
          )}
        </View>

        <View style={styles.weighingFooter}>
          <Text style={styles.productName}>{item.loaihang}</Text>
          <Text style={styles.customerName}>{item.khachhang}</Text>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Danh Sách Cân" showBack />

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
              placeholder="Tìm kiếm..."
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

          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color={colors.gray700} />
          </TouchableOpacity>
        </View>

        <View style={styles.filterTabsContainer}>
          <ScrollableFilter
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        </View>

        <FlatList
          data={filteredWeighings}
          renderItem={renderWeighingItem}
          keyExtractor={(item) => item.stt.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={colors.gray400}
              />
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "Không tìm thấy kết quả phù hợp"
                  : "Không có phiếu cân nào"}
              </Text>
              <Button
                title="Tạo phiếu cân mới"
                onPress={handleNewWeighing}
                variant="primary"
                size="small"
                contentStyle={styles.emptyButton}
              />
            </View>
          }
        />
      </View>

      <Loading loading={loading} />
    </SafeAreaView>
  );
};

interface ScrollableFilterProps {
  activeFilter: FilterState;
  onFilterChange: (filter: FilterState) => void;
}

const ScrollableFilter: React.FC<ScrollableFilterProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const filters: { key: FilterState; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "completed", label: "Hoàn thành" },
    { key: "pending", label: "Đang chờ" },
    { key: "today", label: "Hôm nay" },
  ];

  return (
    <View style={styles.filtersContainer}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterTab,
            activeFilter === filter.key && styles.activeFilterTab,
          ]}
          onPress={() => onFilterChange(filter.key)}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === filter.key && styles.activeFilterText,
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
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
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  searchInputContainer: {
    flex: 1,
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
  filterButton: {
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.gray100,
  },
  filterTabsContainer: {
    backgroundColor: colors.card,
    paddingTop: 8,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: colors.gray100,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.gray700,
  },
  activeFilterText: {
    color: "white",
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  weighingCard: {
    marginBottom: 12,
  },
  weighingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  weighingHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginRight: 8,
  },
  weighTicketNumber: {
    fontSize: 14,
    color: colors.gray600,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 80,
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  weighingDetails: {
    marginBottom: 8,
  },
  weighingDetailRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: "row",
    marginRight: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.gray600,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  netWeightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  netWeightValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  weighingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  productName: {
    fontSize: 14,
    color: colors.gray700,
  },
  customerName: {
    fontSize: 14,
    color: colors.gray700,
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

export default WeighingListScreen;
