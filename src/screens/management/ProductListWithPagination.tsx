// src/screens/management/ProductListWithPagination.tsx
import React, { useEffect, useCallback } from "react";
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
import Pagination from "@/components/common/Pagination";
import PageSizeSelector from "@/components/common/PageSizeSelector";
import { useAppTheme } from "@/hooks/useAppTheme";
import { usePagination } from "@/hooks/usePagination";
import { Hanghoa } from "@/types/api.types";
import { ManagementStackScreenProps } from "@/types/navigation.types";

type NavigationProp = ManagementStackScreenProps<"ProductList">["navigation"];

/**
 * Screen hiển thị danh sách sản phẩm với pagination buttons
 * Ví dụ: Dùng cho desktop-like interface
 */
const ProductListWithPagination: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useAppTheme();

  const [searchQuery, setSearchQuery] = React.useState("");

  const pagination = usePagination<Hanghoa>({
    initialPageSize: 10,
    onPageChange: (page) => loadProducts(page, pagination.pageSize),
    onPageSizeChange: (size) => loadProducts(1, size),
  });

  useFocusEffect(
    useCallback(() => {
      loadProducts(1, pagination.pageSize);
    }, []),
  );

  const loadProducts = async (page: number, pageSize: number) => {
    try {
      pagination.setLoading(true);
      const response = await productApi.getProducts({ page, pageSize });

      if (response.success) {
        pagination.setData(response.data);
      }
    } catch (error) {
      console.error("Load products error:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách hàng hóa");
    } finally {
      pagination.setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      pagination.setRefreshing(true);
      await loadProducts(pagination.currentPage, pagination.pageSize);
    } finally {
      pagination.setRefreshing(false);
    }
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
      `Bạn có chắc muốn xóa hàng hóa "${product.ten}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await productApi.deleteProduct(product.id);
              Alert.alert("Thành công", "Đã xóa hàng hóa");
              loadProducts(pagination.currentPage, pagination.pageSize);
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa hàng hóa");
            }
          },
        },
      ],
    );
  };

  const renderProductItem = ({ item }: { item: Hanghoa }) => (
    <Card style={styles.productCard}>
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <ThemedText style={styles.productName}>{item.ten}</ThemedText>
          <ThemedText style={styles.productCode}>#{item.ma}</ThemedText>
        </View>
        <ThemedText style={styles.productPrice}>
          {item.dongia.toLocaleString("vi-VN")} đ
        </ThemedText>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => handleEditProduct(item)}
        >
          <Ionicons name="pencil" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => handleDeleteProduct(item)}
        >
          <Ionicons name="trash" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (pagination.loading && pagination.currentPage === 1) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Danh sách hàng hóa" showBack />
        <Loading />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header title="Danh sách hàng hóa (Pagination)" showBack />

      <View style={styles.content}>
        {/* Search bar */}
        <View
          style={[styles.searchContainer, { backgroundColor: colors.card }]}
        >
          <Ionicons name="search" size={20} color={colors.text} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Tìm kiếm hàng hóa..."
            placeholderTextColor={colors.disabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Page size selector */}
        <PageSizeSelector
          pageSize={pagination.pageSize}
          onPageSizeChange={pagination.changePageSize}
          loading={pagination.loading}
        />

        {/* Product list */}
        <FlatList
          data={pagination.items}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onRefresh={handleRefresh}
          refreshing={pagination.refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={64} color={colors.disabled} />
              <ThemedText style={styles.emptyText}>
                Chưa có hàng hóa nào
              </ThemedText>
            </View>
          }
        />

        {/* Pagination controls */}
        {pagination.totalCount > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
            hasPrevious={pagination.hasPrevious}
            hasNext={pagination.hasNext}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            loading={pagination.loading}
          />
        )}

        {/* Add button */}
        <View style={styles.addButtonContainer}>
          <Button
            title="Thêm hàng hóa"
            onPress={handleAddProduct}
            icon="add-circle"
          />
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  productCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
  },
  productCode: {
    fontSize: 12,
    opacity: 0.6,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },
  productActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 16,
  },
  addButtonContainer: {
    padding: 16,
  },
});

export default ProductListWithPagination;
