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
  Modal,
  SafeAreaView,
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
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"; // ✅ NEW
import LoadMoreButton from "@/components/common/LoadMoreButton"; // ✅ NEW
import { Phieucan } from "@/types/api.types";
import { formatWeight } from "@/utils/formatters";

// Types
type FilterState =
  | "all"
  | "completed"
  | "pending"
  | "today"
  | "import"
  | "export"
  | "yesterday"
  | "thisWeek"
  | "thisMonth";

type ViewMode = "list" | "table";

interface FilterOptions {
  sortBy: "date" | "weight" | "vehicle" | "status";
  sortOrder: "asc" | "desc";
}

const WeighingListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useAppTheme();

  // ✅ UPDATED: Use infinite scroll pagination hook
  const {
    items: weighings,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    refresh,
    isRefreshing,
  } = useInfiniteScroll<Phieucan>(
    async (page, pageSize) => {
      const response = await weighingApi.getWeighings({ page, pageSize });
      return response.success ? response.data : null;
    },
    { pageSize: 20 },
  );

  const [filteredWeighings, setFilteredWeighings] = useState<Phieucan[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterState>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    sortBy: "date",
    sortOrder: "desc",
  });

  // Effects
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, []),
  );

  useEffect(() => {
    applyFilters();
  }, [weighings, activeFilter, searchQuery, filterOptions]);

  // Helper Functions
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

  const getStatusColor = (weighing: Phieucan) => {
    if (weighing.uploadStatus === 1) {
      return colors.error;
    }
    if (weighing.ngaycan2) {
      return colors.success;
    }
    return colors.warning;
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

  // Data Functions
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
    } else if (activeFilter === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      result = result.filter((item) => {
        const itemDate = new Date(item.ngaycan1).toISOString().split("T")[0];
        return itemDate === yesterdayStr;
      });
    } else if (activeFilter === "thisWeek") {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      result = result.filter((item) => {
        const itemDate = new Date(item.ngaycan1);
        return itemDate >= startOfWeek;
      });
    } else if (activeFilter === "thisMonth") {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      result = result.filter((item) => {
        const itemDate = new Date(item.ngaycan1);
        return itemDate >= startOfMonth;
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

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (filterOptions.sortBy) {
        case "date":
          comparison =
            new Date(a.ngaycan1).getTime() - new Date(b.ngaycan1).getTime();
          break;
        case "weight":
          comparison = a.tlcan1 - b.tlcan1;
          break;
        case "vehicle":
          comparison = a.soxe.localeCompare(b.soxe);
          break;
        case "status":
          const aStatus = a.ngaycan2 ? 2 : 1;
          const bStatus = b.ngaycan2 ? 2 : 1;
          comparison = aStatus - bStatus;
          break;
      }

      return filterOptions.sortOrder === "desc" ? -comparison : comparison;
    });

    setFilteredWeighings(result);
  };

  // Event Handlers
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

  // Table Header Component
  const TableHeader = () => (
    <View style={[styles.tableHeader, { backgroundColor: colors.gray100 }]}>
      <ThemedText style={[styles.tableHeaderCell, styles.vehicleColumn]}>
        Xe
      </ThemedText>
      <ThemedText style={[styles.tableHeaderCell, styles.ticketColumn]}>
        Phiếu
      </ThemedText>
      <ThemedText style={[styles.tableHeaderCell, styles.dateColumn]}>
        Ngày
      </ThemedText>
      <ThemedText style={[styles.tableHeaderCell, styles.weightColumn]}>
        TL Vào
      </ThemedText>
      <ThemedText style={[styles.tableHeaderCell, styles.weightColumn]}>
        TL Ra
      </ThemedText>
      <ThemedText style={[styles.tableHeaderCell, styles.statusColumn]}>
        Trạng thái
      </ThemedText>
    </View>
  );

  // Table Row Component
  const renderTableRow = ({
    item,
    index,
  }: {
    item: Phieucan;
    index: number;
  }) => {
    const statusColor = getStatusColor(item);
    const statusText = getStatusText(item);
    const importExportColor = getImportExportColor(item.xuatnhap);

    const date = new Date(item.ngaycan1);
    const dateString = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });

    return (
      <TouchableOpacity
        style={[
          styles.tableRow,
          {
            backgroundColor: index % 2 === 0 ? colors.card : colors.gray50,
            borderLeftColor: importExportColor,
          },
        ]}
        onPress={() => handleWeighingPress(item)}
      >
        <ThemedText
          style={[styles.tableCell, styles.vehicleColumn]}
          numberOfLines={1}
        >
          {item.soxe}
        </ThemedText>
        <ThemedText
          style={[styles.tableCell, styles.ticketColumn]}
          numberOfLines={1}
        >
          #{item.sophieu}
        </ThemedText>
        <ThemedText
          style={[styles.tableCell, styles.dateColumn]}
          numberOfLines={1}
        >
          {dateString}
        </ThemedText>
        <ThemedText
          style={[styles.tableCell, styles.weightColumn]}
          numberOfLines={1}
        >
          {Math.round(item.tlcan1)}kg
        </ThemedText>
        <ThemedText
          style={[styles.tableCell, styles.weightColumn]}
          numberOfLines={1}
        >
          {item.tlcan2 ? `${Math.round(item.tlcan2)}kg` : "-"}
        </ThemedText>
        <View style={styles.statusColumn}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        </View>
      </TouchableOpacity>
    );
  };

  // List Item Component (existing)
  const renderListItem = ({ item }: { item: Phieucan }) => {
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
              <View
                style={[styles.storeTag, { backgroundColor: colors.gray100 }]}
              >
                <Ionicons
                  name="home-outline"
                  size={12}
                  color={colors.gray600}
                />
                <ThemedText
                  style={[styles.storeText, { color: colors.gray600 }]}
                >
                  {item.kho}
                </ThemedText>
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

  const FilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showFilterModal}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalBackdrop}>
        <View
          style={[styles.filterModalContent, { backgroundColor: colors.card }]}
        >
          <View
            style={[
              styles.filterModalHeader,
              { borderBottomColor: colors.gray200 },
            ]}
          >
            <ThemedText style={styles.filterModalTitle}>Sắp xếp</ThemedText>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterModalBody}>
            {/* Sort Options */}
            <View style={styles.filterSection}>
              <ThemedText style={styles.filterSectionTitle}>
                Sắp xếp theo
              </ThemedText>
              {[
                { key: "date", label: "Ngày" },
                { key: "weight", label: "Trọng lượng" },
                { key: "vehicle", label: "Biển số xe" },
                { key: "status", label: "Trạng thái" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterOptionRow,
                    {
                      backgroundColor:
                        filterOptions.sortBy === option.key
                          ? colors.primary + "10"
                          : "transparent",
                    },
                  ]}
                  onPress={() =>
                    setFilterOptions((prev) => ({
                      ...prev,
                      sortBy: option.key as any,
                    }))
                  }
                >
                  <ThemedText style={styles.filterOptionRowText}>
                    {option.label}
                  </ThemedText>
                  {filterOptions.sortBy === option.key && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort Order */}
            <View style={styles.filterSection}>
              <ThemedText style={styles.filterSectionTitle}>Thứ tự</ThemedText>
              {[
                { key: "desc", label: "Giảm dần" },
                { key: "asc", label: "Tăng dần" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterOptionRow,
                    {
                      backgroundColor:
                        filterOptions.sortOrder === option.key
                          ? colors.primary + "10"
                          : "transparent",
                    },
                  ]}
                  onPress={() =>
                    setFilterOptions((prev) => ({
                      ...prev,
                      sortOrder: option.key as any,
                    }))
                  }
                >
                  <ThemedText style={styles.filterOptionRowText}>
                    {option.label}
                  </ThemedText>
                  {filterOptions.sortOrder === option.key && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View
            style={[
              styles.filterModalFooter,
              { borderTopColor: colors.gray200 },
            ]}
          >
            <Button
              title="Đặt lại"
              variant="outline"
              onPress={() => {
                setFilterOptions({
                  sortBy: "date",
                  sortOrder: "desc",
                });
              }}
              contentStyle={styles.filterResetButton}
            />
            <Button
              title="Áp dụng"
              onPress={() => setShowFilterModal(false)}
              contentStyle={styles.filterApplyButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const ScrollableFilter: React.FC<{
    activeFilter: FilterState;
    onFilterChange: (filter: FilterState) => void;
  }> = ({ activeFilter, onFilterChange }) => {
    const filters: { key: FilterState; label: string; icon?: string }[] = [
      { key: "all", label: "Tất cả", icon: "list-outline" },
      { key: "pending", label: "Đang chờ", icon: "time-outline" },
      {
        key: "completed",
        label: "Hoàn thành",
        icon: "checkmark-circle-outline",
      },
      { key: "import", label: "Nhập", icon: "arrow-down-outline" },
      { key: "export", label: "Xuất", icon: "arrow-up-outline" },
      { key: "today", label: "Hôm nay", icon: "calendar-outline" },
      { key: "yesterday", label: "Hôm qua", icon: "calendar-outline" },
      { key: "thisWeek", label: "Tuần này", icon: "calendar-outline" },
      { key: "thisMonth", label: "Tháng này", icon: "calendar-outline" },
    ];

    return (
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                {
                  backgroundColor:
                    activeFilter === filter.key
                      ? colors.primary
                      : "transparent",
                },
              ]}
              onPress={() => onFilterChange(filter.key)}
            >
              {filter.icon && (
                <Ionicons
                  name={filter.icon as any}
                  size={14}
                  color={
                    activeFilter === filter.key ? colors.white : colors.text
                  }
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
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options-outline" size={20} color={colors.gray700} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewModeButton, { backgroundColor: colors.gray100 }]}
            onPress={() => setViewMode(viewMode === "list" ? "table" : "list")}
          >
            <Ionicons
              name={viewMode === "list" ? "grid-outline" : "list-outline"}
              size={20}
              color={colors.gray700}
            />
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

        {viewMode === "table" ? (
          <View style={styles.tableContainer}>
            <TableHeader />
            <FlatList
              data={filteredWeighings}
              renderItem={renderTableRow}
              keyExtractor={(item) => item.stt.toString()}
              contentContainerStyle={styles.tableContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={refresh}
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
            data={filteredWeighings}
            renderItem={renderListItem}
            keyExtractor={(item) => item.stt.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refresh}
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

      <FilterModal />
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
  filterButton: {
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  viewModeButton: {
    marginLeft: 8,
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
  },
  filterText: {
    fontSize: 14,
  },
  filterIcon: {
    marginRight: 6,
  },

  // Table Styles
  tableContainer: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  tableHeaderCell: {
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderLeftWidth: 3,
    alignItems: "center",
  },
  tableCell: {
    fontSize: 12,
    textAlign: "center",
  },
  vehicleColumn: {
    flex: 2,
  },
  ticketColumn: {
    flex: 1.5,
  },
  dateColumn: {
    flex: 1.5,
  },
  weightColumn: {
    flex: 1.5,
  },
  statusColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tableContent: {
    paddingBottom: 20,
  },

  // List Item Styles
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  storeText: {
    fontSize: 12,
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

  // Filter Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  filterModalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    maxHeight: "80%",
  },
  filterModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  filterModalBody: {
    maxHeight: 400,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  filterOptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  filterOptionRowText: {
    fontSize: 16,
  },
  filterModalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  filterResetButton: {
    flex: 1,
  },
  filterApplyButton: {
    flex: 1,
  },

  // Common Styles
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

export default WeighingListScreen;
