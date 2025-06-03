// Now for CompanyListScreen.tsx with dark mode:

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
import { useAppTheme } from "@/hooks/useAppTheme";
import { Khachhang } from "@/types/api.types";
import { ManagementStackScreenProps } from "@/types/navigation.types";
import { formatPhoneNumber } from "@/utils/formatters";

type NavigationProp = ManagementStackScreenProps<"CompanyList">["navigation"];

const CompanyListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useAppTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [companies, setCompanies] = useState<Khachhang[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Khachhang[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadCompanies();
    }, []),
  );

  useEffect(() => {
    applySearch();
  }, [companies, searchQuery]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await customerApi.getAllCustomers();
      if (response.success) {
        setCompanies(response.data);
      }
    } catch (error) {
      console.error("Load companies error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadCompanies();
    } finally {
      setRefreshing(false);
    }
  };

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
              setLoading(true);
              const response = await customerApi.deleteCustomer(company.id);
              if (response.success) {
                // Cập nhật danh sách sau khi xóa thành công
                setCompanies((prevCompanies) =>
                  prevCompanies.filter((c) => c.id !== company.id),
                );
                Alert.alert("Thành công", "Xóa Khách Hàng thành công");
              } else {
                Alert.alert("Lỗi", "Không thể xóa Khách Hàng");
              }
            } catch (error) {
              console.error("Delete company error:", error);
              Alert.alert("Lỗi", "Không thể xóa Khách Hàng");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

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
          style={[styles.actionButtons, { borderTopColor: colors.gray200 }]}
        >
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.gray100 }]}
            onPress={() => handleEditCompany(item)}
          >
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.gray100 }]}
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
        </View>

        <FlatList
          data={filteredCompanies}
          renderItem={renderCompanyItem}
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

export default CompanyListScreen;
