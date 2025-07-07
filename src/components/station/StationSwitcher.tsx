// src/components/station/StationSwitcher.tsx
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { stationApi, TramCan } from "@/api/station";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";

interface StationSwitcherProps {
  showStationName?: boolean;
  iconOnly?: boolean;
}

const StationSwitcher: React.FC<StationSwitcherProps> = ({
  showStationName = true,
  iconOnly = false,
}) => {
  const { tenantInfo, sessionToken } = useAuth();
  const { colors } = useAppTheme();

  const [showModal, setShowModal] = useState(false);
  const [stations, setStations] = useState<TramCan[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Load stations when modal opens
  useEffect(() => {
    if (showModal) {
      loadStations();
    }
  }, [showModal]);

  const loadStations = async () => {
    try {
      setLoading(true);
      const response = await stationApi.getMyStations();

      if (response.success) {
        setStations(response.data);
      } else {
        Alert.alert("Lỗi", "Không thể tải danh sách trạm cân");
      }
    } catch (error) {
      console.error("Load stations error:", error);
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
    // Nếu chọn trạm hiện tại thì không làm gì
    if (station.id === tenantInfo?.selectedStation?.id) {
      setShowModal(false);
      return;
    }

    try {
      setSwitching(true);
      const response = await stationApi.switchStation(station.id);

      if (response.success) {
        setShowModal(false);
        Alert.alert("Thành công", `Đã chuyển đến ${station.tenTramCan}`, [
          {
            text: "OK",
            onPress: () => {
              // Reload app hoặc refresh data
              // Có thể emit event để các component khác biết
            },
          },
        ]);
      } else {
        Alert.alert("Lỗi", "Không thể chuyển trạm cân");
      }
    } catch (error) {
      console.error("Switch station error:", error);
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
          },
        ]}
        onPress={() => handleSwitchStation(item)}
        disabled={switching}
      >
        <View style={styles.stationItemContent}>
          <View style={styles.stationInfo}>
            <Text style={[styles.stationName, { color: colors.text }]}>
              {item.tenTramCan}
            </Text>
            <Text style={[styles.stationCode, { color: colors.textSecondary }]}>
              {item.maTramCan} • {item.diaChi}
            </Text>
          </View>

          {isCurrentStation && (
            <View style={styles.currentBadge}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.currentText, { color: colors.primary }]}>
                Hiện tại
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (iconOnly) {
    return (
      <>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
        </TouchableOpacity>
        {renderModal()}
      </>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.switcher, { backgroundColor: colors.surface }]}
        onPress={() => setShowModal(true)}
      >
        <View style={styles.switcherContent}>
          <Ionicons name="business" size={16} color={colors.primary} />
          {showStationName && (
            <Text
              style={[styles.switcherText, { color: colors.text }]}
              numberOfLines={1}
            >
              {tenantInfo?.selectedStation?.tenTramCan || "Chọn trạm cân"}
            </Text>
          )}
          <Ionicons
            name="chevron-down"
            size={16}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>
      {renderModal()}
    </>
  );

  function renderModal() {
    return (
      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Header */}
          <View
            style={[styles.modalHeader, { backgroundColor: colors.surface }]}
          >
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Chọn trạm cân
            </Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={styles.refreshButton}
              disabled={loading || refreshing}
            >
              <Ionicons name="refresh" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.modalContent}>
            {loading ? (
              <Loading loading={true} />
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
                  />
                }
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* Footer info */}
          <View
            style={[styles.modalFooter, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {tenantInfo?.khachHang?.tenKhachHang}
            </Text>
          </View>
        </View>

        {switching && <Loading loading={true} />}
      </Modal>
    );
  }
};

const styles = StyleSheet.create({
  switcher: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  switcherContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  switcherText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  iconButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  refreshButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  stationsList: {
    flexGrow: 1,
  },
  stationItem: {
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    overflow: "hidden",
  },
  stationItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
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
    fontSize: 13,
    lineHeight: 18,
  },
  currentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  currentText: {
    fontSize: 12,
    fontWeight: "500",
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  footerText: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default StationSwitcher;
