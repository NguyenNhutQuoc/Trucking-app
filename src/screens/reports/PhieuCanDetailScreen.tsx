// src/screens/reports/PhieucanDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Share,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Header from "@/components/common/Header";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import Card from "@/components/common/Card";
import Loading from "@/components/common/Loading";
import Button from "@/components/common/Button";
import { weighingApi } from "@/api/weighing";
import { Phieucan } from "@/types/api.types";
import { RootStackParamList } from "@/types/navigation.types";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  formatDate,
  formatTime,
  formatWeight,
  formatCurrency,
} from "@/utils/formatters";

type PhieucanDetailRouteProp = RouteProp<RootStackParamList, "PhieucanDetail">;

const PhieucanDetailScreen: React.FC = () => {
  const route = useRoute<PhieucanDetailRouteProp>();
  const navigation = useNavigation();
  const { colors } = useAppTheme();

  // Get weighing from route params (from CustomReportScreen navigation)
  const weighingFromParams = route.params?.weighing;

  const [weighing, setWeighing] = useState<Phieucan | null>(
    weighingFromParams || null,
  );
  const [loading, setLoading] = useState(!weighingFromParams);

  useEffect(() => {
    // If we don't have weighing data from params, try to fetch it
    if (!weighingFromParams && route.params?.weighing) {
      fetchWeighingDetails(route.params.phieucanSTT || 0);
    }
  }, []);

  const fetchWeighingDetails = async (weighingId: number) => {
    try {
      setLoading(true);
      const response = await weighingApi.getWeighingById(weighingId);
      if (response.success && response.data) {
        setWeighing(response.data);
      } else {
        Alert.alert("Lỗi", "Không thể tải thông tin phiếu cân");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Fetch weighing error:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải chi tiết");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const calculateNetWeight = (
    phieucan: Phieucan | null | undefined,
  ): number => {
    if (!phieucan || !phieucan.ngaycan2 || typeof phieucan.tlcan2 !== "number")
      return 0;
    return Math.abs(phieucan.tlcan2 - phieucan.tlcan1);
  };

  const handleShare = async () => {
    if (!weighing) return;

    const netWeight = calculateNetWeight(weighing);
    const shareText = `
Phiếu Cân #${weighing.sophieu}
Xe: ${weighing.soxe}
Khách hàng: ${weighing.khachhang}
Hàng hóa: ${weighing.loaihang}
Loại: ${weighing.xuatnhap}
Ngày cân vào: ${formatDate(weighing.ngaycan1)} ${formatTime(weighing.ngaycan1)}
${weighing.ngaycan2 ? `Ngày cân ra: ${formatDate(weighing.ngaycan2)} ${formatTime(weighing.ngaycan2)}` : ""}
Trọng lượng vào: ${formatWeight(weighing.tlcan1)}
${weighing.tlcan2 ? `Trọng lượng ra: ${formatWeight(weighing.tlcan2)}` : ""}
Trọng lượng hàng: ${formatWeight(netWeight)}
    `.trim();

    try {
      await Share.share({
        message: shareText,
        title: `Phiếu Cân #${weighing.sophieu}`,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handlePrint = () => {
    Alert.alert("In phiếu", "Chức năng in đang được phát triển");
  };

  if (loading) {
    return <Loading loading={true} fullscreen message="Đang tải chi tiết..." />;
  }

  if (!weighing) {
    return (
      <ThemedView useSafeArea>
        <Header title="Chi Tiết Phiếu Cân" showBack />
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={colors.error}
          />
          <ThemedText style={styles.errorTitle}>
            Không tìm thấy dữ liệu
          </ThemedText>
          <ThemedText style={styles.errorText}>
            Không thể tải thông tin phiếu cân
          </ThemedText>
          <Button
            title="Quay lại"
            variant="primary"
            onPress={() => navigation.goBack()}
            contentStyle={styles.backButton}
          />
        </View>
      </ThemedView>
    );
  }

  const netWeight = calculateNetWeight(weighing);
  const isCompleted = !!weighing.ngaycan2;
  const isCancelled = weighing.uploadStatus === 1;
  const revenue = netWeight > 0 ? (netWeight / 1000) * weighing.dongia : 0;

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

  return (
    <ThemedView useSafeArea>
      <Header
        title={`Phiếu #${weighing.sophieu}`}
        showBack
        rightComponent={
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header Card */}
        <Card style={styles.section}>
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
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
              <View
                style={[
                  styles.typeTag,
                  {
                    backgroundColor:
                      weighing.xuatnhap === "Xuất"
                        ? colors.success + "20"
                        : colors.primary + "20",
                  },
                ]}
              >
                <Ionicons
                  name={
                    weighing.xuatnhap === "Xuất" ? "arrow-up" : "arrow-down"
                  }
                  size={16}
                  color={
                    weighing.xuatnhap === "Xuất"
                      ? colors.success
                      : colors.primary
                  }
                />
                <ThemedText
                  style={styles.typeText}
                  color={
                    weighing.xuatnhap === "Xuất"
                      ? colors.success
                      : colors.primary
                  }
                >
                  {weighing.xuatnhap}
                </ThemedText>
              </View>
            </View>

            <View style={styles.vehicleSection}>
              <View
                style={[
                  styles.vehicleIcon,
                  { backgroundColor: colors.primary + "20" },
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

        {/* Basic Info */}
        <Card style={styles.section}>
          <ThemedText style={styles.cardTitle}>Thông tin cơ bản</ThemedText>
          <DetailRow
            icon="business"
            label="Khách hàng"
            value={`${weighing.khachhang} (${weighing.makh})`}
          />
          <DetailRow
            icon="cube"
            label="Hàng hóa"
            value={`${weighing.loaihang} (${weighing.mahang})`}
          />
          <DetailRow
            icon="person"
            label="Nhân viên"
            value={weighing.nhanvien}
          />
          {weighing.kho && (
            <DetailRow icon="storefront" label="Kho" value={weighing.kho} />
          )}
          {weighing.sochungtu && (
            <DetailRow
              icon="document-text"
              label="Số chứng từ"
              value={weighing.sochungtu}
            />
          )}
        </Card>

        {/* Weighing Info */}
        <Card style={styles.section}>
          <ThemedText style={styles.cardTitle}>Thông tin cân</ThemedText>

          {/* Weighing In */}
          <View style={styles.weighingSection}>
            <View style={styles.weighingHeader}>
              <View style={styles.weighingHeaderLeft}>
                <Ionicons
                  name="enter-outline"
                  size={20}
                  color={colors.primary}
                />
                <ThemedText style={styles.weighingTitle}>Cân vào</ThemedText>
              </View>
              <ThemedText style={styles.weighingDate}>
                {formatDate(weighing.ngaycan1)} {formatTime(weighing.ngaycan1)}
              </ThemedText>
            </View>
            <View style={styles.weighingValue}>
              <ThemedText style={styles.weightLabel}>Trọng lượng:</ThemedText>
              <ThemedText style={styles.weightValue} color={colors.primary}>
                {formatWeight(weighing.tlcan1)}
              </ThemedText>
            </View>
          </View>

          {/* Weighing Out */}
          {weighing.ngaycan2 && (
            <View style={styles.weighingSection}>
              <View style={styles.weighingHeader}>
                <View style={styles.weighingHeaderLeft}>
                  <Ionicons
                    name="exit-outline"
                    size={20}
                    color={colors.success}
                  />
                  <ThemedText style={styles.weighingTitle}>Cân ra</ThemedText>
                </View>
                <ThemedText style={styles.weighingDate}>
                  {formatDate(weighing.ngaycan2)}{" "}
                  {formatTime(weighing.ngaycan2)}
                </ThemedText>
              </View>
              <View style={styles.weighingValue}>
                <ThemedText style={styles.weightLabel}>Trọng lượng:</ThemedText>
                <ThemedText style={styles.weightValue} color={colors.success}>
                  {formatWeight(weighing.tlcan2 || 0)}
                </ThemedText>
              </View>
            </View>
          )}

          {/* Net Weight */}
          {isCompleted && netWeight > 0 && (
            <View
              style={[
                styles.netWeightSection,
                { backgroundColor: colors.gray50 },
              ]}
            >
              <View style={styles.netWeightHeader}>
                <Ionicons name="scale" size={24} color={colors.primary} />
                <ThemedText style={styles.netWeightTitle}>
                  Trọng lượng hàng
                </ThemedText>
              </View>
              <ThemedText style={styles.netWeightValue} color={colors.primary}>
                {formatWeight(netWeight)}
              </ThemedText>
            </View>
          )}
        </Card>

        {/* Financial Info */}
        {weighing.dongia > 0 && netWeight > 0 && (
          <Card style={styles.section}>
            <ThemedText style={styles.cardTitle}>
              Thông tin tài chính
            </ThemedText>
            <DetailRow
              icon="cash"
              label="Đơn giá"
              value={`${formatCurrency(weighing.dongia)}/kg`}
            />
            <DetailRow
              icon="calculator"
              label="Thành tiền"
              value={formatCurrency(revenue)}
              valueColor={colors.success}
              isHighlighted
            />
          </Card>
        )}

        {/* Notes */}
        {weighing.ghichu && (
          <Card style={styles.section}>
            <ThemedText style={styles.cardTitle}>Ghi chú</ThemedText>
            <View
              style={[
                styles.notesContainer,
                { backgroundColor: colors.gray50 },
              ]}
            >
              <ThemedText style={styles.notesText}>
                {weighing.ghichu}
              </ThemedText>
            </View>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="In phiếu"
            variant="outline"
            onPress={handlePrint}
            icon={
              <Ionicons name="print-outline" size={20} color={colors.primary} />
            }
            contentStyle={styles.actionButton}
          />
          <Button
            title="Chia sẻ"
            variant="primary"
            onPress={handleShare}
            icon={<Ionicons name="share-outline" size={20} color="white" />}
            contentStyle={styles.actionButton}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
};

// Detail Row Component
const DetailRow: React.FC<{
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
  isHighlighted?: boolean;
}> = ({ icon, label, value, valueColor, isHighlighted }) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.detailRow,
        isHighlighted && { backgroundColor: colors.gray50 },
      ]}
    >
      <View style={styles.detailLeft}>
        <Ionicons name={icon as any} size={18} color={colors.gray600} />
        <ThemedText style={styles.detailLabel}>{label}:</ThemedText>
      </View>
      <ThemedText
        style={[
          styles.detailValue,
          isHighlighted ? styles.highlightedValue : { fontWeight: "600" },
        ]}
        color={valueColor}
        numberOfLines={2}
      >
        {value}
      </ThemedText>
    </View>
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
  section: {
    marginBottom: 16,
  },
  headerButton: {
    padding: 4,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 32,
  },

  // Header Card
  headerCard: {
    gap: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  ticketInfo: {
    flex: 1,
  },
  ticketNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  typeTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  vehicleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  vehicleNumber: {
    fontSize: 20,
    fontWeight: "700",
  },

  // Card Titles
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },

  // Detail Rows
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  highlightedValue: {
    fontSize: 16,
    fontWeight: "700",
  },

  // Weighing Sections
  weighingSection: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  weighingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  weighingHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  weighingTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  weighingDate: {
    fontSize: 12,
    color: "#666",
  },
  weighingValue: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weightLabel: {
    fontSize: 14,
  },
  weightValue: {
    fontSize: 18,
    fontWeight: "700",
  },

  // Net Weight
  netWeightSection: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    alignItems: "center",
  },
  netWeightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  netWeightTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  netWeightValue: {
    fontSize: 24,
    fontWeight: "700",
  },

  // Notes
  notesContainer: {
    padding: 12,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Actions
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});

export default PhieucanDetailScreen;
