// src/screens/weighing/WeighingDetailScreen.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import { weighingApi } from "@/api/weighing";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import ResultModal, { ResultModalType } from "@/components/common/ResultModal";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatDate, formatTime, formatWeight } from "@/utils/formatters";
import { RootStackParamList } from "@/types/navigation.types";

type WeighingDetailRouteProp = RouteProp<RootStackParamList, "WeighingDetail">;

const WeighingDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<WeighingDetailRouteProp>();
  const { colors } = useAppTheme();
  const { weighing } = route.params;

  const [loading, setLoading] = useState(false);

  // ✅ NEW: Result Modal state
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultModalMessage, setResultModalMessage] = useState("");
  const [resultModalType, setResultModalType] =
    useState<ResultModalType>("success");
  const [resultModalTitle, setResultModalTitle] = useState("");
  const [resultModalCallback, setResultModalCallback] = useState<
    (() => void) | null
  >(null);

  const showResultModal = (
    title: string,
    message: string,
    type: ResultModalType,
    callback?: () => void,
  ) => {
    setResultModalTitle(title);
    setResultModalMessage(message);
    setResultModalType(type);
    setResultModalCallback(() => callback || null);
    setResultModalVisible(true);
  };

  const handleResultModalClose = () => {
    setResultModalVisible(false);
    if (resultModalCallback) {
      resultModalCallback();
    }
  };

  const isCompleted = !!weighing.ngaycan2;

  // Calculate net weight if completed
  const netWeight = isCompleted
    ? Math.abs((weighing.tlcan2 || 0) - weighing.tlcan1)
    : null;

  const getStatusColor = () => {
    if (isCompleted) return colors.success;
    return colors.warning;
  };

  const getStatusText = () => {
    if (isCompleted) return "Hoàn thành";
    return "Đang chờ";
  };

  const handleCompleteWeighing = () => {
    if (isCompleted) {
      return;
    }

    // @ts-ignore
    navigation.navigate("Weighing", {
      screen: "CompleteWeighing",
      params: { weighingId: weighing.stt },
    });
  };

  const handleEditWeighing = () => {
    // @ts-ignore
    navigation.navigate("AddEditWeighing", { weighing });
  };

  const handleCancelWeighing = () => {
    Alert.alert("Hủy phiếu cân", "Bạn có chắc chắn muốn hủy phiếu cân này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Có, hủy phiếu",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const reason = "Hủy bởi người dùng";
            await weighingApi.cancelWeighing(weighing.stt, { reason });
            showResultModal("Thành công", "Đã hủy phiếu cân", "success", () =>
              navigation.goBack(),
            );
          } catch (error) {
            console.error("Cancel weighing error:", error);
            showResultModal(
              "Lỗi",
              "Không thể hủy phiếu cân. Vui lòng thử lại sau.",
              "error",
            );
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handlePrintReceipt = () => {
    showResultModal(
      "Thông báo",
      "Chức năng in phiếu đang được phát triển",
      "info",
    );
  };

  const handleShareWeighing = async () => {
    try {
      const message = `
        Phiếu cân #${weighing.sophieu}
        Xe: ${weighing.soxe}
        Khách hàng: ${weighing.khachhang}
        Hàng hóa: ${weighing.loaihang}
        Thời gian vào: ${formatDate(weighing.ngaycan1)} ${formatTime(weighing.ngaycan1)}
        Trọng lượng vào: ${formatWeight(weighing.tlcan1)}
        ${isCompleted ? `Thời gian ra: ${formatDate(weighing.ngaycan2 || "")} ${formatTime(weighing.ngaycan2 || "")}` : ""}
        ${isCompleted ? `Trọng lượng ra: ${formatWeight(weighing.tlcan2 || 0)}` : ""}
        ${netWeight ? `Trọng lượng hàng: ${formatWeight(netWeight)}` : ""}
      `;

      await Share.share({
        message,
        title: `Phiếu cân #${weighing.sophieu}`,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const renderInfoItem = (label: string, value: string | number | null) => {
    if (value === null || value === undefined) return null;

    return (
      <View style={styles.infoItem}>
        <ThemedText type="subtitle" style={styles.infoLabel}>
          {label}
        </ThemedText>
        <ThemedText style={styles.infoValue}>{value}</ThemedText>
      </View>
    );
  };

  return (
    <ThemedView useSafeArea>
      <Header
        title="Chi Tiết Phiếu Cân"
        showBack
        rightComponent={
          <TouchableOpacity onPress={handleShareWeighing}>
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.ticketInfo}>
              <ThemedText style={styles.ticketNumber}>
                Phiếu #{weighing.sophieu}
              </ThemedText>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor() },
                ]}
              >
                <ThemedText style={styles.statusText}>
                  {getStatusText()}
                </ThemedText>
              </View>
            </View>

            <View style={styles.vehicleInfo}>
              <View
                style={[
                  styles.vehicleIconContainer,
                  { backgroundColor: colors.gray100 },
                ]}
              >
                <Ionicons name="car" size={24} color={colors.primary} />
              </View>
              <ThemedText style={styles.vehicleNumber}>
                {weighing.soxe}
              </ThemedText>
            </View>
          </View>
        </Card>

        <Card title="Thông tin khách hàng" style={styles.infoCard}>
          <View style={styles.infoGrid}>
            {renderInfoItem("Khách hàng:", weighing.khachhang)}
            {renderInfoItem("Loại hàng:", weighing.loaihang)}
            {renderInfoItem("Xuất/Nhập:", weighing.xuatnhap)}
            {renderInfoItem("Kho:", weighing.kho || "")}
            {weighing.sochungtu &&
              renderInfoItem("Số chứng từ:", weighing.sochungtu)}
          </View>
        </Card>

        <Card title="Thông tin cân vào" style={styles.infoCard}>
          <View style={styles.infoGrid}>
            {renderInfoItem(
              "Thời gian:",
              `${formatDate(weighing.ngaycan1)} ${formatTime(weighing.ngaycan1)}`,
            )}
            {renderInfoItem("Trọng lượng:", `${formatWeight(weighing.tlcan1)}`)}
            {renderInfoItem("Nhân viên:", weighing.nhanvien)}
          </View>
        </Card>

        {isCompleted && (
          <Card title="Thông tin cân ra" style={styles.infoCard}>
            <View style={styles.infoGrid}>
              {renderInfoItem(
                "Thời gian:",
                `${formatDate(weighing.ngaycan2 || "")} ${formatTime(weighing.ngaycan2 || "")}`,
              )}
              {renderInfoItem(
                "Trọng lượng:",
                `${formatWeight(weighing.tlcan2 || 0)}`,
              )}
              {renderInfoItem("Nhân viên:", weighing.nhanvien)}
            </View>
          </Card>
        )}

        {netWeight && (
          <Card
            title="Kết quả"
            style={{
              ...styles.resultCard,
              backgroundColor: colors.primary + "10",
            }}
          >
            <View style={styles.resultContent}>
              <View style={styles.resultItem}>
                <ThemedText style={styles.resultLabel}>
                  Trọng lượng hàng:
                </ThemedText>
                <ThemedText style={styles.resultValue}>
                  {formatWeight(netWeight)}
                </ThemedText>
              </View>

              {weighing.dongia && (
                <>
                  <View style={styles.resultItem}>
                    <ThemedText style={styles.resultLabel}>Đơn giá:</ThemedText>
                    <ThemedText style={styles.resultValue}>
                      {weighing.dongia.toLocaleString()} VND/kg
                    </ThemedText>
                  </View>

                  <View style={styles.resultItem}>
                    <ThemedText style={styles.resultLabel}>
                      Thành tiền:
                    </ThemedText>
                    <ThemedText
                      style={[styles.resultTotal, { color: colors.success }]}
                    >
                      {(netWeight * weighing.dongia).toLocaleString()} VND
                    </ThemedText>
                  </View>
                </>
              )}
            </View>
          </Card>
        )}

        {weighing.ghichu && (
          <Card title="Ghi chú" style={styles.infoCard}>
            <ThemedText style={styles.notes}>{weighing.ghichu}</ThemedText>
          </Card>
        )}

        <View style={styles.actionsContainer}>
          {!isCompleted && (
            <Button
              title="Hoàn tất cân"
              variant="success"
              onPress={handleCompleteWeighing}
              icon={
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="white"
                />
              }
              contentStyle={styles.actionButton}
              fullWidth
            />
          )}

          <Button
            title="Sửa phiếu"
            variant="primary"
            onPress={handleEditWeighing}
            icon={<Ionicons name="create-outline" size={20} color="white" />}
            contentStyle={styles.actionButton}
            fullWidth
          />

          {isCompleted && (
            <Button
              title="In phiếu"
              variant="secondary"
              onPress={handlePrintReceipt}
              icon={
                <Ionicons name="print-outline" size={20} color={colors.text} />
              }
              contentStyle={styles.actionButton}
              fullWidth
            />
          )}

          <Button
            title="Hủy phiếu"
            variant="error"
            onPress={handleCancelWeighing}
            icon={<Ionicons name="trash-outline" size={20} color="white" />}
            contentStyle={styles.actionButton}
            fullWidth
          />
        </View>
      </ScrollView>

      <Loading loading={loading} overlay message="Đang xử lý..." />

      {/* ✅ NEW: Result Modal */}
      <ResultModal
        visible={resultModalVisible}
        onClose={handleResultModalClose}
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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerContent: {
    padding: 0,
  },
  ticketInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  ticketNumber: {
    fontSize: 18,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  vehicleInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  vehicleNumber: {
    fontSize: 20,
    fontWeight: "700",
  },
  infoCard: {
    marginBottom: 16,
  },
  infoGrid: {
    padding: 0,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  resultCard: {
    marginBottom: 16,
  },
  resultContent: {
    padding: 0,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  resultValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  resultTotal: {
    fontSize: 18,
    fontWeight: "700",
  },
  notes: {
    fontSize: 14,
    padding: 0,
  },
  actionsContainer: {
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
});

export default WeighingDetailScreen;
