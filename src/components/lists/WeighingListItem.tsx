// src/components/lists/WeighingListItem.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "@/hooks/useAppTheme";
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
  const { colors, isDarkMode } = useAppTheme();

  const isCancelled = weighing.uploadStatus === 1;
  const isCompleted = !!weighing.ngaycan2 && !isCancelled;

  const statusColor = isCancelled
    ? colors.error
    : isCompleted
      ? colors.success
      : colors.warning;

  const statusText = isCancelled
    ? "Đã huỷ"
    : isCompleted
      ? "Hoàn thành"
      : "Đang chờ";

  const statusIcon = isCancelled
    ? "close-circle"
    : isCompleted
      ? "checkmark-circle"
      : "time";

  const netWeight =
    isCompleted ? Math.abs((weighing.tlcan2 ?? 0) - weighing.tlcan1) : null;

  // Tinted chip background: 18% opacity tint of the status colour
  const statusBg = statusColor + "2E";

  // Detail chip background for subtle grouping
  const chipBg = isDarkMode
    ? colors.gray200 + "22"
    : colors.gray200 + "88";

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress(weighing)}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: isDarkMode ? "#000" : "#94A3B8",
        },
      ]}
    >
      {/* Left accent bar */}
      <View
        style={[styles.accentBar, { backgroundColor: statusColor }]}
      />

      <View style={styles.inner}>
        {/* ── Header ─────────────────────────────────── */}
        <View style={styles.header}>
          {/* Truck icon + vehicle number */}
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.truckIconWrap,
                { backgroundColor: colors.primary + "18" },
              ]}
            >
              <Ionicons name="car" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.vehicleNumber, { color: colors.text }]}>
                {weighing.soxe}
              </Text>
              <Text style={[styles.ticketNumber, { color: colors.textSecondary }]}>
                Phiếu #{weighing.sophieu}
              </Text>
            </View>
          </View>

          {/* Status pill badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Ionicons name={statusIcon as any} size={12} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
        </View>

        {/* ── Weight details ──────────────────────────── */}
        <View style={styles.detailsGrid}>
          {/* Entry weigh */}
          <View style={[styles.detailChip, { backgroundColor: chipBg }]}>
            <Ionicons
              name="arrow-down-circle-outline"
              size={14}
              color={colors.primary}
              style={styles.chipIcon}
            />
            <View>
              <Text style={[styles.chipLabel, { color: colors.textSecondary }]}>
                Vào · {formatTime(weighing.ngaycan1)}
              </Text>
              <Text style={[styles.chipValue, { color: colors.text }]}>
                {formatWeight(weighing.tlcan1)}
              </Text>
            </View>
          </View>

          {/* Exit weigh */}
          {isCompleted ? (
            <View style={[styles.detailChip, { backgroundColor: chipBg }]}>
              <Ionicons
                name="arrow-up-circle-outline"
                size={14}
                color={colors.success}
                style={styles.chipIcon}
              />
              <View>
                <Text style={[styles.chipLabel, { color: colors.textSecondary }]}>
                  Ra · {formatTime(weighing.ngaycan2 || "")}
                </Text>
                <Text style={[styles.chipValue, { color: colors.text }]}>
                  {formatWeight(weighing.tlcan2 || 0)}
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.detailChip,
                styles.pendingChip,
                { backgroundColor: colors.warning + "12", borderColor: colors.warning + "40" },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.warning}
                style={styles.chipIcon}
              />
              <Text style={[styles.chipLabel, { color: colors.warning }]}>
                Chờ cân ra
              </Text>
            </View>
          )}
        </View>

        {/* Net weight highlight row */}
        {netWeight != null && (
          <View
            style={[
              styles.netWeightRow,
              { backgroundColor: colors.success + "14", borderColor: colors.success + "30" },
            ]}
          >
            <Ionicons name="scale-outline" size={15} color={colors.success} />
            <Text style={[styles.netWeightLabel, { color: colors.textSecondary }]}>
              Trọng lượng hàng
            </Text>
            <Text style={[styles.netWeightValue, { color: colors.success }]}>
              {formatWeight(netWeight)}
            </Text>
          </View>
        )}

        {/* ── Footer ─────────────────────────────────── */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <View style={styles.footerItem}>
            <Ionicons
              name="cube-outline"
              size={13}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.footerText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {weighing.loaihang}
            </Text>
          </View>

          <View style={[styles.footerDot, { backgroundColor: colors.border }]} />

          <View style={styles.footerItem}>
            <Ionicons
              name="person-outline"
              size={13}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.footerText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {weighing.khachhang}
            </Text>
          </View>

          <View style={styles.footerSpacer} />

          <Text style={[styles.footerDate, { color: colors.textSecondary }]}>
            {formatDate(weighing.ngaycan1)}
          </Text>
        </View>

        {/* ── Complete button ─────────────────────────── */}
        {!isCompleted && !isCancelled && onCompletePress && (
          <TouchableOpacity
            style={[
              styles.completeButton,
              {
                backgroundColor: colors.success,
                shadowColor: colors.success,
              },
            ]}
            activeOpacity={0.82}
            onPress={() => onCompletePress(weighing.stt)}
          >
            <Ionicons name="checkmark-circle" size={18} color={colors.onPrimary ?? "#fff"} />
            <Text style={[styles.completeButtonText, { color: colors.onPrimary ?? "#fff" }]}>Hoàn thành cân ra</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
    // elevation for Android
    elevation: 3,
    // shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  accentBar: {
    width: 4,
    // stretches full height automatically
  },
  inner: {
    flex: 1,
    padding: 14,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  truckIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  ticketNumber: {
    fontSize: 12,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  // Detail chips
  detailsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  detailChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  pendingChip: {
    borderWidth: 1,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  chipValue: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Net weight
  netWeightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  netWeightLabel: {
    flex: 1,
    fontSize: 13,
  },
  netWeightValue: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 5,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    maxWidth: 110,
  },
  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 2,
  },
  footerSpacer: {
    flex: 1,
  },
  footerDate: {
    fontSize: 11,
  },

  // Complete button
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});

export default WeighingListItem;
