// src/screens/management/ProductListScreen.tsx
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

import { productApi } from "@/api/product";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Loading from "@/components/common/Loading";
import Button from "@/components/common/Button";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"; // ✅ NEW: Use infinite scroll hook
import LoadMoreButton from "@/components/common/LoadMoreButton"; // ✅ NEW: Load more button
import { Hanghoa } from "@/types/api.types";
import { ManagementStackScreenProps } from "@/types/navigation.types";

type NavigationProp = ManagementStackScreenProps<"ProductList">["navigation"];
type ViewMode = "list" | "table";

const ProductListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useAppTheme();

  // ✅ UPDATED: Use infinite scroll pagination hook
  const {
    items: products,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    refresh,
    isRefreshing,
  } = useInfiniteScroll<Hanghoa>(
    async (page, pageSize) => {
      const response = await productApi.getProducts({ page, pageSize });
      console.log("Products response:", response);
      return response;
    },
    { pageSize: 20 }, // Load 20 items per page
  );

  const [filteredProducts, setFilteredProducts] = useState<Hanghoa[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  useFocusEffect(
    useCallback(() => {
      refresh(); // Refresh on screen focus
    }, []),
  );

  useEffect(() => {
    applySearch();
  }, [products, searchQuery]);

  const applySearch = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = products.filter((product) => {
      return (
        product.ten.toLowerCase().includes(query) ||
        product.ma.toLowerCase().includes(query)
      );
    });

    setFilteredProducts(filtered);
  };

  const handleAddProduct = () => {
    navigation.navigate({
      name: "AddProduct",
      params: { product: undefined },
    });
  };

  const handleEditProduct = (product: Hanghoa) => {
    navigation.navigate("AddProduct", { product });
  };

  const handleDeleteProduct = (product: Hanghoa) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa hàng hóa "${product.ten}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await productApi.deleteProduct(product.id);
              if (response.success) {
                Alert.alert("Thành công", "Xóa hàng hóa thành công");
                refresh();
              } else {
                Alert.alert("Lỗi", "Không thể xóa hàng hóa");
              }
            } catch (error) {
              console.error("Delete product error:", error);
              Alert.alert("Lỗi", "Không thể xóa hàng hóa");
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
        Tên hàng hóa
      </ThemedText>
      <ThemedText style={[styles.tableHeaderCell, styles.codeColumn]}>
        Mã
      </ThemedText>
      <ThemedText style={[styles.tableHeaderCell, styles.priceColumn]}>
        Đơn giá (VND/kg)
      </ThemedText>
      <ThemedText style={[styles.tableHeaderCell, styles.actionColumnText]}>
        Thao tác
      </ThemedText>
    </View>
  );

  // Table Row Component
  const renderTableRow = ({
    item,
    index,
  }: {
    item: Hanghoa;
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
        <ThemedText
          style={[styles.tableCell, styles.nameColumn]}
          numberOfLines={2}
        >
          {item.ten}
        </ThemedText>
        <ThemedText
          style={[styles.tableCell, styles.codeColumn]}
          numberOfLines={1}
        >
          {item.ma}
        </ThemedText>
        <ThemedText
          style={[styles.tableCell, styles.priceColumn]}
          numberOfLines={1}
        >
          {item.dongia.toLocaleString()}
        </ThemedText>
        <View style={styles.actionColumn}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.primary + "20" },
              ]}
              onPress={() => handleEditProduct(item)}
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
              onPress={() => handleDeleteProduct(item)}
            >
              <Ionicons name="trash-outline" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // List Item Component
  const renderProductItem = ({ item }: { item: Hanghoa }) => {
    return (
      <Card style={styles.productCard}>
        <View style={styles.productInfo}>
          <View
            style={[
              styles.productIconContainer,
              { backgroundColor: colors.primary + "15" },
            ]}
          >
            <Ionicons name="cube" size={24} color={colors.primary} />
          </View>
          <View style={styles.productDetails}>
            <ThemedText style={styles.productName}>{item.ten}</ThemedText>
            <ThemedText type="subtitle" style={styles.productCode}>
              Mã: {item.ma}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.productPrice}>
              Đơn giá: {item.dongia.toLocaleString()} VND/kg
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
            onPress={() => handleEditProduct(item)}
          >
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cardActionButton,
              { backgroundColor: colors.gray100 },
            ]}
            onPress={() => handleDeleteProduct(item)}
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
        title="Danh Sách Hàng Hóa"
        showBack
        rightComponent={
          <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        }
      />

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
              placeholder="Tìm kiếm hàng hóa..."
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
              data={filteredProducts}
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
                        name="cube-outline"
                        size={48}
                        color={colors.gray400}
                      />
                      <ThemedText style={styles.emptyText}>
                        {searchQuery
                          ? "Không tìm thấy hàng hóa nào phù hợp"
                          : "Chưa có hàng hóa nào được thêm"}
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
            data={filteredProducts}
            renderItem={renderProductItem}
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
                      name="cube-outline"
                      size={48}
                      color={colors.gray400}
                    />
                    <ThemedText style={styles.emptyText}>
                      {searchQuery
                        ? "Không tìm thấy hàng hóa nào phù hợp"
                        : "Chưa có hàng hóa nào được thêm"}
                    </ThemedText>
                    <Button
                      title="Thêm hàng hóa mới"
                      onPress={handleAddProduct}
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
    minHeight: 60,
  },
  tableCell: {
    fontSize: 14,
  },
  nameColumn: {
    flex: 3,
  },
  codeColumn: {
    flex: 1.5,
    textAlign: "center",
  },
  priceColumn: {
    flex: 2,
    textAlign: "right",
  },
  actionColumn: {
    flex: 1.5,
    alignItems: "center",
  },
  actionColumnText: {
    fontSize: 14,
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
  productCard: {
    marginBottom: 12,
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  productIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  productCode: {
    fontSize: 14,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "500",
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

export default ProductListScreen;
