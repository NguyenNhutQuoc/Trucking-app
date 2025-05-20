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
import { Hanghoa } from "@/types/api.types";
import { ManagementStackScreenProps } from "@/types/navigation.types";

type NavigationProp = ManagementStackScreenProps<"ProductList">["navigation"];

const ProductListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useAppTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Hanghoa[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Hanghoa[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, []),
  );

  useEffect(() => {
    applySearch();
  }, [products, searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getAllProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Load products error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadProducts();
    } finally {
      setRefreshing(false);
    }
  };

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
              setLoading(true);
              const response = await productApi.deleteProduct(product.id);
              if (response.success) {
                // Cập nhật danh sách sau khi xóa thành công
                setProducts((prevProducts) =>
                  prevProducts.filter((p) => p.id !== product.id),
                );
                Alert.alert("Thành công", "Xóa hàng hóa thành công");
              } else {
                Alert.alert("Lỗi", "Không thể xóa hàng hóa");
              }
            } catch (error) {
              console.error("Delete product error:", error);
              Alert.alert("Lỗi", "Không thể xóa hàng hóa");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

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
          style={[styles.actionButtons, { borderTopColor: colors.gray200 }]}
        >
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.gray100 }]}
            onPress={() => handleEditProduct(item)}
          >
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.gray100 }]}
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
        </View>

        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
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
        />
      </View>

      <Loading loading={loading && !refreshing} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
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
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    textAlign: "center",
    marginVertical: 16,
  },
  emptyButton: {
    marginTop: 16,
  },
});

export default ProductListScreen;
