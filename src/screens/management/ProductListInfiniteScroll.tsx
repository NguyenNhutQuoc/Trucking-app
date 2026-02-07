// src/screens/management/ProductListInfiniteScroll.tsx
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
import LoadMoreButton from "@/components/common/LoadMoreButton";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Hanghoa } from "@/types/api.types";
import { ManagementStackScreenProps } from "@/types/navigation.types";

type NavigationProp = ManagementStackScreenProps<"ProductList">["navigation"];

/**
 * Screen hiển thị danh sách sản phẩm với infinite scroll/load more
 * Ví dụ: Dùng cho mobile-first interface
 */
const ProductListInfiniteScroll: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useAppTheme();

  const [searchQuery, setSearchQuery] = React.useState("");

  const infiniteScroll = useInfiniteScroll<Hanghoa>({
    initialPageSize: 20,
    onLoadMore: handleLoadMore,
  });

  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, []),
  );

  const loadInitialData = async () => {
    try {
      infiniteScroll.setLoading(true);
      const response = await productApi.getProducts({
        page: 1,
        pageSize: infiniteScroll.pageSize,
      });

      if (response) {
        infiniteScroll.setData(response);
      }
    } catch (error) {
      console.error("Load initial data error:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách hàng hóa");
    } finally {
      infiniteScroll.setLoading(false);
    }
  };

  async function handleLoadMore() {
    if (infiniteScroll.loadingMore || !infiniteScroll.hasMore) {
      return;
    }

    try {
      infiniteScroll.setLoadingMore(true);
      const response = await productApi.getProducts({
        page: infiniteScroll.currentPage + 1,
        pageSize: infiniteScroll.pageSize,
      });

      if (response.success) {
        infiniteScroll.appendData(response.data);
      }
    } catch (error) {
      console.error("Load more error:", error);
      Alert.alert("Lỗi", "Không thể tải thêm dữ liệu");
    } finally {
      infiniteScroll.setLoadingMore(false);
    }
  }

  const handleRefresh = async () => {
    try {
      infiniteScroll.setRefreshing(true);
      const response = await productApi.getProducts({
        page: 1,
        pageSize: infiniteScroll.pageSize,
      });

      if (response.success) {
        infiniteScroll.setData(response.data);
      }
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      infiniteScroll.setRefreshing(false);
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
              handleRefresh();
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

  const renderFooter = () => {
    if (infiniteScroll.allItems.length === 0) return null;

    return (
      <LoadMoreButton
        onLoadMore={infiniteScroll.loadMore}
        loading={infiniteScroll.loadingMore}
        hasMore={infiniteScroll.hasMore}
        currentCount={infiniteScroll.allItems.length}
        totalCount={infiniteScroll.totalCount}
      />
    );
  };

  if (infiniteScroll.loading) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Danh sách hàng hóa" showBack />
        <Loading />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header title="Danh sách hàng hóa (Infinite Scroll)" showBack />

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

        {/* Product list with infinite scroll */}
        <FlatList
          data={infiniteScroll.allItems}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onRefresh={handleRefresh}
          refreshing={infiniteScroll.refreshing}
          onEndReached={infiniteScroll.loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={64} color={colors.disabled} />
              <ThemedText style={styles.emptyText}>
                Chưa có hàng hóa nào
              </ThemedText>
            </View>
          }
        />

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

export default ProductListInfiniteScroll;
