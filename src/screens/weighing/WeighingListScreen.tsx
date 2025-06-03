// src/screens/weighing/WeighingListScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  TextInput,
  ScrollView,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { weighingApi } from "@/api/weighing";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Phieucan } from "@/types/api.types";
import { formatWeight } from "@/utils/formatters";
import colors from "@/constants/colors";

// Cập nhật type FilterState để bao gồm các trạng thái lọc mới
type FilterState =
  | "all"
  | "completed"
  | "pending"
  | "today"
  | "import"
  | "export";

const WeighingListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useAppTheme();

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

  // Hàm lấy màu dựa trên loại nhập/xuất
  const getImportExportColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case "nhập":
        return colors.chartBlue;
      case "xuất":
        return colors.chartGreen;
      default:
        return colors.gray400;
    }
  };

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
    } else if (activeFilter === "import") {
      result = result.filter((item) => item.xuatnhap.toLowerCase() === "nhập");
    } else if (activeFilter === "export") {
      result = result.filter((item) => item.xuatnhap.toLowerCase() === "xuất");
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

  // Cập nhật renderWeighingItem
  const renderWeighingItem = ({ item }: { item: Phieucan }) => {
    const statusColor = getStatusColor(item);
    const statusText = getStatusText(item);
    const importExportColor = getImportExportColor(item.xuatnhap);

    const date = new Date(item.ngaycan1);
    const dateString = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
        style={{
          ...styles.weighingCard,
          borderLeftWidth: 4,
          borderLeftColor: importExportColor,
        }}
        rightContent={
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <ThemedText style={styles.statusText}>{statusText}</ThemedText>
          </View>
        }
      >
        <View style={styles.weighingHeader}>
          <View style={styles.weighingHeaderLeft}>
            <ThemedText style={styles.vehicleNumber}>{item.soxe}</ThemedText>
            <ThemedText style={styles.weighTicketNumber}>
              #{item.sophieu}
            </ThemedText>
          </View>
        </View>

        <View style={styles.weighingDetails}>
          <View style={styles.weighingDetailRow}>
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Ngày:</ThemedText>
              <ThemedText style={styles.detailValue}>{dateString}</ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Vào:</ThemedText>
              <ThemedText style={styles.detailValue}>{timeString}</ThemedText>
            </View>
          </View>

          <View style={styles.weighingDetailRow}>
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>TL vào:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {formatWeight(item.tlcan1, false)}
              </ThemedText>
            </View>

            {item.ngaycan2 && (
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>TL ra:</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {formatWeight(item.tlcan2 || 0, false)}
                </ThemedText>
              </View>
            )}
          </View>

          {netWeight && (
            <View style={styles.netWeightContainer}>
              <ThemedText style={styles.detailLabel}>TL hàng:</ThemedText>
              <ThemedText
                style={[styles.netWeightValue, { color: importExportColor }]}
              >
                {formatWeight(netWeight, false)}
              </ThemedText>
            </View>
          )}

          <View style={styles.typeContainer}>
            <View
              style={[
                styles.typeTag,
                { backgroundColor: importExportColor + "20" },
              ]}
            >
              <ThemedText
                style={[styles.typeText, { color: importExportColor }]}
              >
                {item.xuatnhap}
              </ThemedText>
            </View>
            {item.kho && (
              <View style={styles.storeTag}>
                <Ionicons
                  name="home-outline"
                  size={12}
                  color={colors.gray600}
                />
                <ThemedText style={styles.storeText}>{item.kho}</ThemedText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.weighingFooter}>
          <View style={styles.footerLeft}>
            <Ionicons
              name="cube-outline"
              size={14}
              color={colors.gray600}
              style={styles.footerIcon}
            />
            <ThemedText style={styles.productName}>{item.loaihang}</ThemedText>
          </View>
          <View style={styles.footerRight}>
            <Ionicons
              name="business-outline"
              size={14}
              color={colors.gray600}
              style={styles.footerIcon}
            />
            <ThemedText style={styles.customerName}>
              {item.khachhang}
            </ThemedText>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ThemedView useSafeArea>
      <Header title="Danh Sách Cân" showBack />

      <View style={styles.container}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.card, borderBottomColor: colors.gray200 },
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

          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.gray100 }]}
          >
            <Ionicons name="options-outline" size={20} color={colors.gray700} />
          </TouchableOpacity>
        </View>

        <View
          style={[styles.filterTabsContainer, { backgroundColor: colors.card }]}
        >
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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={colors.gray400}
              />
              <ThemedText style={styles.emptyText}>
                {searchQuery
                  ? "Không tìm thấy kết quả phù hợp"
                  : "Không có phiếu cân nào"}
              </ThemedText>
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
    </ThemedView>
  );
};

// Cập nhật component ScrollableFilter
interface ScrollableFilterProps {
  activeFilter: FilterState;
  onFilterChange: (filter: FilterState) => void;
}

const ScrollableFilter: React.FC<ScrollableFilterProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const { colors } = useAppTheme();

  const filters: { key: FilterState; label: string; icon?: string }[] = [
    { key: "all", label: "Tất cả", icon: "list-outline" },
    { key: "pending", label: "Đang chờ", icon: "time-outline" },
    { key: "completed", label: "Hoàn thành", icon: "checkmark-circle-outline" },
    { key: "import", label: "Nhập", icon: "arrow-down-outline" },
    { key: "export", label: "Xuất", icon: "arrow-up-outline" },
    { key: "today", label: "Hôm nay", icon: "calendar-outline" },
  ];

  return (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              activeFilter === filter.key
                ? {
                    backgroundColor: colors.primary,
                  }
                : {
                    backgroundColor: "transparent",
                  },
            ]}
            onPress={() => onFilterChange(filter.key)}
          >
            {filter.icon && (
              <Ionicons
                name={filter.icon as any}
                size={14}
                color={activeFilter === filter.key ? colors.white : colors.text}
                style={styles.filterIcon}
              />
            )}
            <ThemedText
              style={[
                styles.filterText,
                {
                  color:
                    activeFilter === filter.key ? colors.white : colors.text,
                },
              ]}
            >
              {filter.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
  filterButton: {
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  filterTabsContainer: {
    paddingTop: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
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
  filterIcon: {
    marginRight: 6,
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
    marginRight: 8,
  },
  weighTicketNumber: {
    fontSize: 14,
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
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  netWeightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  netWeightValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  weighingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
  },
  productName: {
    fontSize: 14,
  },
  customerName: {
    fontSize: 14,
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
  // Style mới
  typeContainer: {
    flexDirection: "row",
    marginTop: 8,
    alignItems: "center",
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  storeTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  storeText: {
    fontSize: 12,
    color: colors.gray600,
    marginLeft: 4,
  },
  footerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  footerRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  footerIcon: {
    marginRight: 4,
  },
});

export default WeighingListScreen;
