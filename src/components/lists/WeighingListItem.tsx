// src/components/lists/WeighingListItem.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Card from "@/components/common/Card";
import colors from "@/constants/colors";
import { Phieucan } from "@/types/api.types";
import { formatDate, formatTime, formatWeight } from "@/utils/formatters";

interface WeighingListItemProps {
  weighing: Phieucan;
  onPress: (weighing: Phieucan) => void;
  onCompletePress?: (weighingId: number) => void;
}

const WeighingListItem: React.FC<WeighingListItemProps> = ({
  weighing,
  onPress,
  onCompletePress,
}) => {
  const isCompleted = !!weighing.ngaycan2;
  const isCancelled = weighing.uploadStatus === 1;

  const getStatusColor = () => {
    if (isCancelled) return colors.error;
    if (isCompleted) return colors.success;
    return colors.warning;
  };

  const getStatusText = () => {
    if (isCancelled) return "Hủy";
    if (isCompleted) return "Hoàn thành";
    return "Đang chờ";
  };

  // Calculate net weight if both weights exist
  const netWeight = isCompleted
    ? Math.abs((weighing.tlcan2 ?? 0) - weighing.tlcan1)
    : null;

  return (
    <Card
      onPress={() => onPress(weighing)}
      style={styles.card}
      rightContent={
        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
        >
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      }
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.vehicleNumber}>{weighing.soxe}</Text>
          <Text style={styles.ticketNumber}>#{weighing.sophieu}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Vào:</Text>
            <Text style={styles.detailValue}>
              {formatTime(weighing.ngaycan1)}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Trọng lượng vào:</Text>
            <Text style={styles.detailValue}>
              {formatWeight(weighing.tlcan1)}
            </Text>
          </View>
        </View>

        {isCompleted && (
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Ra:</Text>
              <Text style={styles.detailValue}>
                {formatTime(weighing.ngaycan2 || "")}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Trọng lượng ra:</Text>
              <Text style={styles.detailValue}>
                {formatWeight(weighing.tlcan2 || 0)}
              </Text>
            </View>
          </View>
        )}

        {netWeight && (
          <View style={styles.netWeightContainer}>
            <Text style={styles.detailLabel}>Trọng lượng hàng:</Text>
            <Text style={styles.netWeightValue}>{formatWeight(netWeight)}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.productName}>{weighing.loaihang}</Text>
        <Text style={styles.customerName}>{weighing.khachhang}</Text>
      </View>

      {!isCompleted && !isCancelled && onCompletePress && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => onCompletePress(weighing.stt)}
        >
          <Ionicons name="checkmark-circle" size={22} color={colors.success} />
          <Text style={styles.completeButtonText}>Hoàn thành</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginRight: 8,
  },
  ticketNumber: {
    fontSize: 14,
    color: colors.gray600,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 80,
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  details: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: "row",
    marginRight: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.gray600,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  netWeightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  netWeightValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  productName: {
    fontSize: 14,
    color: colors.gray700,
  },
  customerName: {
    fontSize: 14,
    color: colors.gray700,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: colors.success + "10",
    borderRadius: 4,
    marginTop: 8,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.success,
    marginLeft: 4,
  },
});

export default WeighingListItem;
