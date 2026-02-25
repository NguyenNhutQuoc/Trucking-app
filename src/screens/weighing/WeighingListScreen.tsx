// src/screens/weighing/WeighingListScreen.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";

import { weighingApi } from "@/api/weighing";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import LoadMoreButton from "@/components/common/LoadMoreButton";
import { Phieucan } from "@/types/api.types";
import { formatWeight, formatDate } from "@/utils/formatters";
import { spacing } from "@/styles/spacing";
import { useNavigationStore } from "@/store/navigationStore";

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
  const router = useRouter();
  const { colors } = useAppTheme();
  const { setSelectedWeighing } = useNavigationStore();

  const [activeFilter, setActiveFilter] = useState<FilterState>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    sortBy: "date",
    sortOrder: "desc",
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDateRangeFilter, setShowDateRangeFilter] = useState(false);
  const [dateFilterField, setDateFilterField] = useState<
    "ngaycan1" | "ngaycan2"
  >("ngaycan1");

  const dateOnly = (date: Date) => date.toISOString().split("T")[0];

  // Parse a DD-MM-YYYY string into a Date (returns null if invalid)
  const parseDMY = (str: string): Date | null => {
    const parts = str.split("-");
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts.map(Number);
    if (!dd || !mm || !yyyy || yyyy < 1000) return null;
    return new Date(yyyy, mm - 1, dd);
  };

  const getDateRangeForFilter = (filter: FilterState) => {
    const now = new Date();

    switch (filter) {
      case "today": {
        const today = dateOnly(now);
        return { startDate: today, endDate: today + "T23:59:59" };
      }
      case "yesterday": {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const day = dateOnly(yesterday);
        return { startDate: day, endDate: day + "T23:59:59" };
      }
      case "thisWeek": {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        return {
          startDate: dateOnly(startOfWeek),
          endDate: dateOnly(now) + "T23:59:59",
        };
      }
      case "thisMonth": {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          startDate: dateOnly(startOfMonth),
          endDate: dateOnly(now) + "T23:59:59",
        };
      }
      default:
        return null;
    }
  };

  const fetchWeighings = useCallback(
    async (page: number, pageSize: number) => {
      const dateRange = getDateRangeForFilter(activeFilter);

      if (dateRange) {
        return weighingApi.getWeighingsByDateRange(
          dateRange.startDate,
          dateRange.endDate,
          { page, pageSize },
        );
      }

      if (activeFilter === "completed") {
        return weighingApi.getCompletedWeighings({ page, pageSize });
      }

      if (activeFilter === "pending") {
        return weighingApi.getPendingWeighings({ page, pageSize });
      }

      return weighingApi.getWeighings({ page, pageSize });
    },
    [activeFilter],
  );

  const infiniteScrollOptions = useMemo(() => ({ pageSize: 20 }), []);

  // ✅ UPDATED: Use infinite scroll pagination hook
  const {
    items: weighings,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    refresh,
    isRefreshing,
  } = useInfiniteScroll<Phieucan>(fetchWeighings, infiniteScrollOptions);

  // Effects
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const didInitFilterRefresh = useRef(false);
  useEffect(() => {
    if (!didInitFilterRefresh.current) {
      didInitFilterRefresh.current = true;
      return;
    }
    refresh();
  }, [activeFilter, refresh]);

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
    if (weighing.ngaycan2) {
      return colors.success;
    }
    return colors.warning;
  };

  const getStatusText = (weighing: Phieucan) => {
    if (weighing.ngaycan2) {
      return "Hoàn thành";
    }
    return "Đang chờ";
  };

  const filteredWeighings = useMemo(() => {
    let result = [...weighings];

    // Import/Export filters are applied client-side (no API endpoint)
    if (activeFilter === "import") {
      result = result.filter((item) => item.xuatnhap.toLowerCase() === "nhập");
    } else if (activeFilter === "export") {
      result = result.filter((item) => item.xuatnhap.toLowerCase() === "xuất");
    }

    // Apply date range filter client-side
    if (dateFrom || dateTo) {
      const fromDate = dateFrom ? parseDMY(dateFrom) : null;
      const toDate = dateTo ? parseDMY(dateTo) : null;
      if (fromDate) fromDate.setHours(0, 0, 0, 0);
      if (toDate) toDate.setHours(23, 59, 59, 999);
      result = result.filter((item) => {
        const dateValue =
          dateFilterField === "ngaycan1" ? item.ngaycan1 : item.ngaycan2;
        if (!dateValue) return false;
        const d = new Date(dateValue);
        if (fromDate && d < fromDate) return false;
        if (toDate && d > toDate) return false;
        return true;
      });
    }

    // Apply search query client-side
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

    return result;
  }, [
    weighings,
    activeFilter,
    searchQuery,
    filterOptions,
    dateFrom,
    dateTo,
    dateFilterField,
  ]);

  // Event Handlers
  const handleFilterChange = (filter: FilterState) => {
    setActiveFilter(filter);
  };

  const handleWeighingPress = (weighing: Phieucan) => {
    setSelectedWeighing(weighing);
    router.push(`/(main)/(weighing)/${weighing.stt}`);
  };

  const handleNewWeighing = () => {
    // AddEditWeighing is not yet available
    console.log("AddEditWeighing is not yet available");
  };

  // Table Header Component
  const TableHeader = () => (
    <View style={[styles.tableHeader, { backgroundColor: colors.gray100 }]}>
      <ThemedText style={[styles.tableHeaderCell, styles.sttColumn]}>
        STT
      </ThemedText>
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
    const importExportColor = getImportExportColor(item.xuatnhap);

    const date = new Date(item.ngaycan1);
    const dateString = `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}`;

    return (
      <TouchableOpacity
        style={[
          styles.tableRow,
          {
            backgroundColor: index % 2 === 0 ? colors.card : colors.gray200,
            borderLeftColor: importExportColor,
          },
        ]}
        onPress={() => handleWeighingPress(item)}
      >
        <ThemedText
          style={[styles.tableCell, styles.sttColumn]}
          numberOfLines={1}
        >
          {index + 1}
        </ThemedText>
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
          {item.sophieu}
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
          {Math.round(item.tlcan1).toLocaleString("vi-VN")}kg
        </ThemedText>
        <ThemedText
          style={[styles.tableCell, styles.weightColumn]}
          numberOfLines={1}
        >
          {item.tlcan2
            ? `${Math.round(item.tlcan2).toLocaleString("vi-VN")}kg`
            : "-"}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  // List Item Component (existing)
  const renderListItem = ({ item }: { item: Phieucan }) => {
    const statusColor = getStatusColor(item);
    const statusText = getStatusText(item);
    const importExportColor = getImportExportColor(item.xuatnhap);

    const dateString = formatDate(item.ngaycan1);
    const date = new Date(item.ngaycan1);
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
              {item.sophieu}
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

    // M3 Filter Chips with proper styling
    return (
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive
                      ? colors.primaryContainer || colors.primary + "20"
                      : colors.surfaceContainer || colors.gray100,
                    borderColor: isActive ? colors.primary : "transparent",
                  },
                ]}
                onPress={() => onFilterChange(filter.key)}
              >
                {filter.icon && (
                  <Ionicons
                    name={filter.icon as any}
                    size={16}
                    color={isActive ? colors.primary : colors.textSecondary}
                    style={styles.filterChipIcon}
                  />
                )}
                <ThemedText
                  style={[
                    styles.filterChipText,
                    {
                      color: isActive ? colors.primary : colors.text,
                      fontWeight: isActive ? "600" : "400",
                    },
                  ]}
                >
                  {filter.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <ThemedView useSafeArea>
      <Header title="Danh Sách Cân" showBack />

      <View style={styles.container}>
        {/* M3 Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.outlineVariant || colors.gray200,
            },
          ]}
        >
          <View
            style={[
              styles.searchInputContainer,
              { backgroundColor: colors.surfaceContainer || colors.gray100 },
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Tìm biển số, phiếu, khách hàng..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.surfaceContainer || colors.gray100 },
            ]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options-outline" size={20} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.surfaceContainer || colors.gray100 },
            ]}
            onPress={() => setViewMode(viewMode === "list" ? "table" : "list")}
          >
            <Ionicons
              name={viewMode === "list" ? "grid-outline" : "list-outline"}
              size={20}
              color={colors.text}
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

        {/* Date range filter */}
        <View
          style={[
            styles.dateRangeHeader,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.outlineVariant || colors.gray200,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.dateRangeToggle}
            onPress={() => setShowDateRangeFilter(!showDateRangeFilter)}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.primary}
            />
            <ThemedText
              style={[styles.dateRangeToggleText, { color: colors.primary }]}
            >
              Lọc theo{" "}
              {dateFilterField === "ngaycan1" ? "Ngày cân 1" : "Ngày cân 2"}
              {dateFrom || dateTo
                ? ` (${dateFrom || "..."} → ${dateTo || "..."})`
                : ""}
            </ThemedText>
            <Ionicons
              name={showDateRangeFilter ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.primary}
            />
            {(dateFrom || dateTo) && (
              <TouchableOpacity
                onPress={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                style={styles.dateRangeClear}
              >
                <Ionicons name="close-circle" size={16} color={colors.error} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
        {showDateRangeFilter && (
          <View
            style={[
              styles.dateRangeContainer,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.outlineVariant || colors.gray200,
              },
            ]}
          >
            {/* Date field selector */}
            <View style={styles.dateFieldSelector}>
              <TouchableOpacity
                style={styles.dateFieldOption}
                onPress={() => setDateFilterField("ngaycan1")}
              >
                <View
                  style={[
                    styles.dateFieldRadio,
                    {
                      borderColor: colors.primary,
                      backgroundColor:
                        dateFilterField === "ngaycan1"
                          ? colors.primary
                          : "transparent",
                    },
                  ]}
                />
                <ThemedText
                  style={[
                    styles.dateFieldOptionText,
                    {
                      color:
                        dateFilterField === "ngaycan1"
                          ? colors.primary
                          : colors.text,
                    },
                  ]}
                >
                  Ngày cân 1
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateFieldOption}
                onPress={() => setDateFilterField("ngaycan2")}
              >
                <View
                  style={[
                    styles.dateFieldRadio,
                    {
                      borderColor: colors.primary,
                      backgroundColor:
                        dateFilterField === "ngaycan2"
                          ? colors.primary
                          : "transparent",
                    },
                  ]}
                />
                <ThemedText
                  style={[
                    styles.dateFieldOptionText,
                    {
                      color:
                        dateFilterField === "ngaycan2"
                          ? colors.primary
                          : colors.text,
                    },
                  ]}
                >
                  Ngày cân 2
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Date inputs */}
            <View style={styles.dateRangeRow}>
              <View style={styles.dateRangeField}>
                <ThemedText style={styles.dateRangeLabel}>Từ ngày:</ThemedText>
                <TextInput
                  style={[
                    styles.dateRangeInput,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor:
                        colors.surfaceContainer || colors.gray100,
                    },
                  ]}
                  placeholder="DD-MM-YYYY"
                  placeholderTextColor={colors.textSecondary}
                  value={dateFrom}
                  onChangeText={setDateFrom}
                />
              </View>
              <View style={styles.dateRangeField}>
                <ThemedText style={styles.dateRangeLabel}>Đến ngày:</ThemedText>
                <TextInput
                  style={[
                    styles.dateRangeInput,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor:
                        colors.surfaceContainer || colors.gray100,
                    },
                  ]}
                  placeholder="DD-MM-YYYY"
                  placeholderTextColor={colors.textSecondary}
                  value={dateTo}
                  onChangeText={setDateTo}
                />
              </View>
            </View>
          </View>
        )}

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
  // M3 Search Bar - 48dp height, rounded corners
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    alignItems: "center",
    gap: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 28, // M3 full rounded
    paddingHorizontal: spacing.md,
    height: 48, // M3 search bar height
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  // M3 Icon buttons - 40dp
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 20, // M3 circular
  },
  // M3 Filter Chips container
  filterTabsContainer: {
    paddingTop: spacing.sm,
  },
  filtersContainer: {
    paddingBottom: spacing.sm,
  },
  filtersScrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  // Date range filter
  dateRangeHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  dateRangeToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateRangeToggleText: {
    fontSize: 13,
    flex: 1,
  },
  dateRangeClear: {
    marginLeft: 4,
  },
  dateRangeContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  dateFieldSelector: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 10,
  },
  dateFieldOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateFieldRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  dateFieldOptionText: {
    fontSize: 13,
    fontWeight: "500",
  },
  dateRangeRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateRangeField: {
    flex: 1,
  },
  dateRangeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateRangeInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
  },
  // M3 Filter Chip - 32dp height, 8dp corner radius
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    height: 32,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
  },
  filterChipIcon: {
    marginRight: spacing.xs,
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
  sttColumn: {
    flex: 0.6,
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
