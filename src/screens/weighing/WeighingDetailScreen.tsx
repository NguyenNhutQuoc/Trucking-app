// src/screens/weighing/WeighingDetailScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import { weighingApi } from "@/api/weighing";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import colors from "@/constants/colors";
import { formatDate, formatTime, formatWeight } from "@/utils/formatters";
import { RootStackParamList } from "@/types/navigation.types";

type WeighingDetailRouteProp = RouteProp<RootStackParamList, "WeighingDetail">;

const WeighingDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<WeighingDetailRouteProp>();
  const { weighing } = route.params;

  const [loading, setLoading] = useState(false);

  const isCompleted = !!weighing.ngaycan2;
  const isCancelled = weighing.uploadStatus === 1;

  // Calculate net weight if completed
  const netWeight = isCompleted
    ? Math.abs((weighing.tlcan2 || 0) - weighing.tlcan1)
    : null;

  const getStatusColor = () => {
    if (isCancelled) return colors.error;
    if (isCompleted) return colors.success;
    return colors.warning;
  };

  const getStatusText = () => {
    if (isCancelled) return "Đã hủy";
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
            Alert.alert("Thành công", "Đã hủy phiếu cân");
            navigation.goBack();
          } catch (error) {
            console.error("Cancel weighing error:", error);
            Alert.alert(
              "Lỗi",
              "Không thể hủy phiếu cân. Vui lòng thử lại sau.",
            );
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handlePrintReceipt = () => {
    Alert.alert("In phiếu", "Chức năng đang được phát triển");
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
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
              <Text style={styles.ticketNumber}>Phiếu #{weighing.sophieu}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor() },
                ]}
              >
                <Text style={styles.statusText}>{getStatusText()}</Text>
              </View>
            </View>

            <View style={styles.vehicleInfo}>
              <View style={styles.vehicleIconContainer}>
                <Ionicons name="car" size={24} color={colors.primary} />
              </View>
              <Text style={styles.vehicleNumber}>{weighing.soxe}</Text>
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
          <Card title="Kết quả" style={styles.resultCard}>
            <View style={styles.resultContent}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Trọng lượng hàng:</Text>
                <Text style={styles.resultValue}>
                  {formatWeight(netWeight)}
                </Text>
              </View>

              {weighing.dongia && (
                <>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Đơn giá:</Text>
                    <Text style={styles.resultValue}>
                      {weighing.dongia.toLocaleString()} VND/tấn
                    </Text>
                  </View>

                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Thành tiền:</Text>
                    <Text style={styles.resultTotal}>
                      {((netWeight / 1000) * weighing.dongia).toLocaleString()}{" "}
                      VND
                    </Text>
                  </View>
                </>
              )}
            </View>
          </Card>
        )}

        {weighing.ghichu && (
          <Card title="Ghi chú" style={styles.infoCard}>
            <Text style={styles.notes}>{weighing.ghichu}</Text>
          </Card>
        )}

        <View style={styles.actionsContainer}>
          {!isCompleted && !isCancelled && (
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

          {!isCancelled && (
            <Button
              title="Sửa phiếu"
              variant="primary"
              onPress={handleEditWeighing}
              icon={<Ionicons name="create-outline" size={20} color="white" />}
              contentStyle={styles.actionButton}
              fullWidth
            />
          )}

          {isCompleted && !isCancelled && (
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

          {!isCancelled && (
            <Button
              title="Hủy phiếu"
              variant="error"
              onPress={handleCancelWeighing}
              icon={<Ionicons name="trash-outline" size={20} color="white" />}
              contentStyle={styles.actionButton}
              fullWidth
            />
          )}
        </View>
      </ScrollView>

      <Loading loading={loading} overlay message="Đang xử lý..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
    color: colors.text,
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
    backgroundColor: colors.gray100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  vehicleNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
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
    color: colors.gray600,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    flex: 2,
    textAlign: "right",
  },
  resultCard: {
    marginBottom: 16,
    backgroundColor: colors.primary + "10",
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
    color: colors.gray700,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  resultTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.success,
  },
  notes: {
    fontSize: 14,
    color: colors.text,
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
