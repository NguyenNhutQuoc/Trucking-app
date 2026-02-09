// src/screens/management/CompanyListScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { customerApi } from "@/api/customer";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Loading from "@/components/common/Loading";
import Button from "@/components/common/Button";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import ResultModal, { ResultModalType } from "@/components/common/ResultModal";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"; // ✅ NEW
import LoadMoreButton from "@/components/common/LoadMoreButton"; // ✅ NEW
import { Khachhang } from "@/types/api.types";
import { ManagementStackScreenProps } from "@/types/navigation.types";
import { formatPhoneNumber } from "@/utils/formatters";

type NavigationProp = ManagementStackScreenProps<"CompanyList">["navigation"];
type ViewMode = "list" | "table";

const CompanyListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useAppTheme();

  // ✅ UPDATED: Use infinite scroll pagination hook
  const {
    items: companies,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    refresh,
    isRefreshing,
  } = useInfiniteScroll<Khachhang>(
    async (page, pageSize) => {
      const response = await customerApi.getCustomers({ page, pageSize });
      return response;
    },
    { pageSize: 20 },
  );

  const [filteredCompanies, setFilteredCompanies] = useState<Khachhang[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // ✅ NEW: Result Modal state
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultModalMessage, setResultModalMessage] = useState("");
  const [resultModalType, setResultModalType] =
    useState<ResultModalType>("success");
  const [resultModalTitle, setResultModalTitle] = useState("");

  // ✅ NEW: Show result modal helper
  const showResultModal = (
    title: string,
    message: string,
    type: ResultModalType,
  ) => {
    setResultModalTitle(title);
    setResultModalMessage(message);
    setResultModalType(type);
    setResultModalVisible(true);
  };

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, []),
  );

  useEffect(() => {
    applySearch();
  }, [companies, searchQuery]);

  const applySearch = () => {
    if (!searchQuery.trim()) {
      setFilteredCompanies(companies);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = companies.filter((company) => {
      return (
        company.ten.toLowerCase().includes(query) ||
        company.ma.toLowerCase().includes(query) ||
        (company.diachi && company.diachi.toLowerCase().includes(query)) ||
        (company.dienthoai && company.dienthoai.includes(query))
      );
    });

    setFilteredCompanies(filtered);
  };

  const handleAddCompany = () => {
    navigation.navigate({
      name: "AddCompany",
      params: { company: undefined },
    });
  };

  const handleEditCompany = (company: Khachhang) => {
    navigation.navigate("AddCompany", { company });
  };

  const handleDeleteCompany = (company: Khachhang) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa Khách Hàng "${company.ten}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await customerApi.deleteCustomer(company.id);
              showResultModal(
                "Đã xóa",
                `Khách Hàng "${company.ten}" đã được xóa thành công`,
                "error",
              );
              refresh();
            } catch (error) {
              console.error("Delete company error:", error);
              Alert.alert("Lỗi", "Không thể xóa Khách Hàng");
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
      <ThemedText style={[styles.tableHeaderCell, styles.nameColumn]}>
        Tên khách hàng
      </ThemedText>
      <ThemedText style={[styles.tableHeaderCell, styles.codeColumn]}>
        Mã
      </ThemedText>
      <ThemedText style={[styles.tableHeaderCell, styles.phoneColumn]}>
        Điện thoại
      </ThemedText>
      <ThemedText style={[styles.tableHeaderCell, styles.actionColumn]}>
        Thao tác
      </ThemedText>
    </View>
  );

  // Table Row Component
  const renderTableRow = ({
    item,
    index,
  }: {
    item: Khachhang;
    index: number;
  }) => {
    return (
      <View
        style={[
          styles.tableRow,
          {
            backgroundColor: index % 2 === 0 ? colors.card : colors.gray50,
          },
        ]}
      >
        <View style={[styles.tableCell, styles.nameColumn]}>
          <ThemedText numberOfLines={2} style={styles.tableCellText}>
            {item.ten}
          </ThemedText>
          {item.diachi && (
            <ThemedText numberOfLines={1} style={styles.tableAddressText}>
              {item.diachi}
            </ThemedText>
          )}
        </View>
        <ThemedText
          style={[styles.tableCell, styles.codeColumn]}
          numberOfLines={1}
        >
          {item.ma}
        </ThemedText>
        <ThemedText
          style={[styles.tableCell, styles.phoneColumn]}
          numberOfLines={1}
        >
          {item.dienthoai ? formatPhoneNumber(item.dienthoai) : "-"}
        </ThemedText>
        <View style={[styles.tableCell, styles.actionColumn]}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.primary + "20" },
              ]}
              onPress={() => handleEditCompany(item)}
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
              onPress={() => handleDeleteCompany(item)}
            >
              <Ionicons name="trash-outline" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // List Item Component
  const renderCompanyItem = ({ item }: { item: Khachhang }) => {
    return (
      <Card style={styles.companyCard}>
        <View style={styles.companyInfo}>
          <View
            style={[
              styles.companyIconContainer,
              { backgroundColor: colors.primary + "15" },
            ]}
          >
            <Ionicons name="business" size={24} color={colors.primary} />
          </View>
          <View style={styles.companyDetails}>
            <ThemedText style={styles.companyName}>{item.ten}</ThemedText>
            <ThemedText type="subtitle" style={styles.companyCode}>
              Mã: {item.ma}
            </ThemedText>
            {item.diachi && (
              <ThemedText type="subtitle" style={styles.companyAddress}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={colors.gray600}
                />{" "}
                {item.diachi}
              </ThemedText>
            )}
            {item.dienthoai && (
              <ThemedText type="subtitle" style={styles.companyPhone}>
                <Ionicons
                  name="call-outline"
                  size={14}
                  color={colors.gray600}
                />{" "}
                {formatPhoneNumber(item.dienthoai)}
              </ThemedText>
            )}
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
            onPress={() => handleEditCompany(item)}
          >
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cardActionButton,
              { backgroundColor: colors.gray100 },
            ]}
            onPress={() => handleDeleteCompany(item)}
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
        title="Danh Sách Khách Hàng"
        showBack
        rightComponent={
          <TouchableOpacity style={styles.addButton} onPress={handleAddCompany}>
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
              placeholder="Tìm kiếm Khách Hàng..."
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
              data={filteredCompanies}
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
                        name="business-outline"
                        size={48}
                        color={colors.gray400}
                      />
                      <ThemedText style={styles.emptyText}>
                        {searchQuery
                          ? "Không tìm thấy Khách Hàng nào phù hợp"
                          : "Chưa có Khách Hàng nào được thêm"}
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
            data={filteredCompanies}
            renderItem={renderCompanyItem}
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
                      name="business-outline"
                      size={48}
                      color={colors.gray400}
                    />
                    <ThemedText style={styles.emptyText}>
                      {searchQuery
                        ? "Không tìm thấy Khách Hàng nào phù hợp"
                        : "Chưa có Khách Hàng nào được thêm"}
                    </ThemedText>
                    <Button
                      title="Thêm Khách Hàng mới"
                      onPress={handleAddCompany}
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

      {/* ✅ NEW: Result Modal for delete success */}
      <ResultModal
        visible={resultModalVisible}
        onClose={() => setResultModalVisible(false)}
        type={resultModalType}
        title={resultModalTitle}
        message={resultModalMessage}
      />
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
    alignItems: "flex-start",
    minHeight: 60,
  },
  tableCell: {
    fontSize: 14,
    justifyContent: "center",
  },
  tableCellText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tableAddressText: {
    fontSize: 12,
    marginTop: 2,
  },
  nameColumn: {
    flex: 3,
  },
  codeColumn: {
    flex: 1.5,
    textAlign: "center",
  },
  phoneColumn: {
    flex: 2,
    textAlign: "center",
  },
  actionColumn: {
    flex: 1.5,
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
  companyCard: {
    marginBottom: 12,
  },
  companyInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  companyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  companyDetails: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  companyCode: {
    fontSize: 14,
    marginBottom: 2,
  },
  companyAddress: {
    fontSize: 14,
    marginBottom: 2,
  },
  companyPhone: {
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

export default CompanyListScreen;
