// src/components/station/StationSwitcher.tsx - Fixed version with dark mode support
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { stationApi, TramCan } from "@/api/station";
import Button from "@/components/common/Button";

interface StationSwitcherProps {
  showStationName?: boolean;
  isActivated?: boolean; // Optional prop to control activation state
  iconOnly?: boolean;
}

const StationSwitcher: React.FC<StationSwitcherProps> = ({
  showStationName = true,
  isActivated = false, // Default to false if not provided
  iconOnly = false,
}) => {
  const { tenantInfo, sessionToken, getStationDisplayName, switchStation } =
    useAuth();
  const { colors, isDarkMode } = useAppTheme();

  const [showModal, setShowModal] = useState(false);
  const [stations, setStations] = useState<TramCan[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Load stations when modal opens
  useEffect(() => {
    if (showModal && stations.length === 0) {
      loadStations();
    }
  }, [showModal]);

  const loadStations = async () => {
    try {
      setLoading(true);
      console.log("🏭 Loading stations for switcher...");

      const response = await stationApi.getMyStations();
      console.log("📋 Stations response:", response);
      console.log(response.tramCans);

      if (response.tramCans) {
        setStations(response.tramCans);
        console.log("✅ Loaded stations count:", response.tramCans.length);
      } else {
        console.error("❌ Failed to load stations:");
        Alert.alert("Lỗi", "Không thể tải danh sách trạm cân");
      }
    } catch (error) {
      console.error("❌ Load stations error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tải danh sách trạm cân");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadStations();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSwitchStation = async (station: TramCan) => {
    // If selecting current station, just close modal
    if (station.id === tenantInfo?.selectedStation?.id) {
      setShowModal(false);
      return;
    }

    try {
      setSwitching(true);
      console.log("🔄 Switching to station:", station.id, station.tenTramCan);

      // ✅ FIX: Sử dụng switchStation từ useAuth thay vì stationApi trực tiếp
      const success = await switchStation(station.id);

      if (success) {
        console.log("✅ Station switched successfully to:", station.tenTramCan);

        Alert.alert("Thành công", `Đã chuyển sang trạm ${station.tenTramCan}`, [
          { text: "OK", onPress: () => setShowModal(false) },
        ]);
      } else {
        Alert.alert("Lỗi", "Không thể chuyển trạm cân");
      }
    } catch (error) {
      console.error("❌ Switch station error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi chuyển trạm cân");
    } finally {
      setSwitching(false);
    }
  };

  const renderStationItem = ({ item }: { item: TramCan }) => {
    const isCurrentStation = item.id === tenantInfo?.selectedStation?.id;

    return (
      <TouchableOpacity
        style={[
          styles.stationItem,
          {
            backgroundColor: colors.surface,
            borderColor: isCurrentStation ? colors.primary : colors.border,
            borderWidth: isCurrentStation ? 2 : 1,
          },
        ]}
        onPress={() => handleSwitchStation(item)}
        disabled={switching}
      >
        <View style={styles.stationItemLeft}>
          <View
            style={[
              styles.radioButton,
              {
                borderColor: isCurrentStation ? colors.primary : colors.border,
                backgroundColor: isCurrentStation
                  ? colors.primary
                  : "transparent",
              },
            ]}
          >
            {isCurrentStation && (
              <View
                style={[
                  styles.radioButtonInner,
                  { backgroundColor: colors.surface },
                ]}
              />
            )}
          </View>

          <View style={styles.stationInfo}>
            <Text style={[styles.stationName, { color: colors.text }]}>
              {item.tenTramCan}
            </Text>
            <Text style={[styles.stationCode, { color: colors.textSecondary }]}>
              Mã: {item.maTramCan}
            </Text>
            {item.diaChi && (
              <Text
                style={[styles.stationAddress, { color: colors.textSecondary }]}
              >
                {item.diaChi}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.stationItemRight}>
          {isCurrentStation ? (
            <View
              style={[
                styles.currentBadge,
                { backgroundColor: colors.success + "20" },
              ]}
            >
              <Text
                style={[styles.currentBadgeText, { color: colors.success }]}
              >
                Hiện tại
              </Text>
            </View>
          ) : (
            <Ionicons
              name="location-outline"
              size={20}
              color={colors.textSecondary}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={[styles.modalHeader, { backgroundColor: colors.surface }]}>
      <View style={styles.headerLeft}>
        <Text style={[styles.modalTitle, { color: colors.text }]}>
          Chọn trạm cân
        </Text>
        <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
          {tenantInfo?.khachHang?.tenKhachHang || "Khách hàng"}
        </Text>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          onPress={handleRefresh}
          style={[styles.refreshButton, { backgroundColor: colors.gray100 }]}
          disabled={refreshing || loading}
        >
          <Ionicons
            name="refresh"
            size={18}
            color={refreshing ? colors.textSecondary : colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowModal(false)}
          style={[styles.closeButton, { backgroundColor: colors.gray100 }]}
        >
          <Ionicons name="close" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="business-outline"
        size={48}
        color={colors.textSecondary}
      />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Không có trạm cân nào
      </Text>
      <Button
        title="Thử lại"
        onPress={loadStations}
        variant="outline"
        style={styles.retryButton}
      />
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
        Đang tải trạm cân...
      </Text>
    </View>
  );

  // Main trigger button
  if (iconOnly) {
    return (
      <>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={[styles.iconButton, { backgroundColor: colors.gray100 }]}
        >
          <Ionicons name="location" size={18} color={colors.primary} />
        </TouchableOpacity>

        {/* Modal */}
        <Modal
          visible={showModal}
          animationType="slide"
          presentationStyle="formSheet"
          onRequestClose={() => setShowModal(false)}
        >
          <SafeAreaView
            style={[
              styles.modalContainer,
              { backgroundColor: colors.background },
            ]}
          >
            {renderHeader()}

            {loading ? (
              renderLoadingState()
            ) : stations.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                data={stations}
                renderItem={renderStationItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.stationsList}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                  />
                }
                showsVerticalScrollIndicator={false}
              />
            )}

            {switching && (
              <View
                style={[
                  styles.switchingOverlay,
                  { backgroundColor: colors.background + "CC" },
                ]}
              >
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.switchingText, { color: colors.text }]}>
                  Đang chuyển trạm cân...
                </Text>
              </View>
            )}
          </SafeAreaView>
        </Modal>
      </>
    );
  }

  // Full button with station name
  return (
    <>
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={[styles.stationButton, { backgroundColor: colors.surface }]}
      >
        <View style={styles.stationButtonContent}>
          <Ionicons name="location" size={16} color={colors.primary} />
          {showStationName && (
            <Text
              style={[styles.stationButtonText, { color: colors.text }]}
              numberOfLines={1}
            >
              {getStationDisplayName()}
            </Text>
          )}
          <Ionicons
            name="chevron-down"
            size={14}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          {renderHeader()}

          {loading ? (
            renderLoadingState()
          ) : stations.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={stations}
              renderItem={renderStationItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.stationsList}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          )}

          {switching && (
            <View
              style={[
                styles.switchingOverlay,
                { backgroundColor: colors.background + "CC" },
              ]}
            >
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.switchingText, { color: colors.text }]}>
                Đang chuyển trạm cân...
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Trigger buttons
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  stationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    maxWidth: 200,
  },
  stationButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stationButtonText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },

  // Modal
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerLeft: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  // Station list
  stationsList: {
    padding: 16,
    paddingBottom: 32,
  },
  stationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  stationItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  stationCode: {
    fontSize: 14,
    marginBottom: 2,
  },
  stationAddress: {
    fontSize: 13,
    lineHeight: 18,
  },
  stationItemRight: {
    marginLeft: 12,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Loading and empty states
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  retryButton: {
    minWidth: 120,
  },

  // Switching overlay
  switchingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  switchingText: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: "500",
  },
});

export default StationSwitcher;
