// src/components/reports/DateRangeSelector.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import colors from "@/constants/colors";
import { formatDate } from "@/utils/formatters";

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (start: Date, end: Date) => void;
  style?: ViewStyle;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
  style,
}) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);

  // Quick filter options
  const quickFilters = [
    { label: "Hôm nay", days: 0 },
    { label: "7 ngày", days: 7 },
    { label: "30 ngày", days: 30 },
    { label: "3 tháng", days: 90 },
  ];

  const showDatePicker = (start: boolean) => {
    if (start) {
      setShowStartPicker(true);
      setShowEndPicker(false);
    } else {
      setShowEndPicker(true);
      setShowStartPicker(false);
    }
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date | undefined,
    isStart = true,
  ) => {
    if (Platform.OS === "android") {
      // On Android, hide the picker on change
      setShowStartPicker(false);
      setShowEndPicker(false);
    }

    if (selectedDate) {
      // Make sure the end date is not before the start date
      if (isStart) {
        const newStartDate = new Date(selectedDate);
        // If the new start date is after the current end date,
        // use the new start date as the end date as well
        if (newStartDate > endDate) {
          setTempEndDate(newStartDate);
          onDateRangeChange(newStartDate, newStartDate);
        } else {
          setTempStartDate(newStartDate);
          onDateRangeChange(newStartDate, endDate);
        }
      } else {
        const newEndDate = new Date(selectedDate);
        // If the new end date is before the current start date,
        // use the new end date as the start date as well
        if (newEndDate < startDate) {
          setTempStartDate(newEndDate);
          onDateRangeChange(newEndDate, newEndDate);
        } else {
          setTempEndDate(newEndDate);
          onDateRangeChange(startDate, newEndDate);
        }
      }
    }
  };

  const handleQuickFilter = (days: number) => {
    const end = new Date();
    const start = new Date();

    if (days > 0) {
      start.setDate(end.getDate() - days);
    }

    setTempStartDate(start);
    setTempEndDate(end);
    onDateRangeChange(start, end);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Quick filters */}
      <View style={styles.quickFilters}>
        {quickFilters.map((filter) => (
          <TouchableOpacity
            key={filter.label}
            style={styles.quickFilterButton}
            onPress={() => handleQuickFilter(filter.days)}
          >
            <Text style={styles.quickFilterText}>{filter.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date range selectors */}
      <View style={styles.dateRangeContainer}>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => showDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.gray600} />
          <Text style={styles.dateText}>
            {formatDate(startDate.toISOString())}
          </Text>
        </TouchableOpacity>

        <Text style={styles.dateRangeSeparator}>-</Text>

        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => showDatePicker(false)}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.gray600} />
          <Text style={styles.dateText}>
            {formatDate(endDate.toISOString())}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      {(showStartPicker || showEndPicker) && Platform.OS === "android" && (
        <DateTimePicker
          value={showStartPicker ? tempStartDate : tempEndDate}
          mode="date"
          display="default"
          onChange={(event, date) =>
            handleDateChange(event, date, showStartPicker)
          }
          maximumDate={new Date()}
        />
      )}

      {/* iOS modal date pickers */}
      {Platform.OS === "ios" && (
        <>
          <Modal
            animationType="slide"
            transparent={true}
            visible={showStartPicker}
            onRequestClose={() => setShowStartPicker(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chọn ngày bắt đầu</Text>
                  <TouchableOpacity onPress={() => setShowStartPicker(false)}>
                    <Ionicons name="close" size={24} color={colors.gray700} />
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempStartDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => date && setTempStartDate(date)}
                  maximumDate={new Date()}
                />
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    onDateRangeChange(tempStartDate, endDate);
                    setShowStartPicker(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={showEndPicker}
            onRequestClose={() => setShowEndPicker(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chọn ngày kết thúc</Text>
                  <TouchableOpacity onPress={() => setShowEndPicker(false)}>
                    <Ionicons name="close" size={24} color={colors.gray700} />
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempEndDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => date && setTempEndDate(date)}
                  maximumDate={new Date()}
                />
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    onDateRangeChange(startDate, tempEndDate);
                    setShowEndPicker(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  quickFilters: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  quickFilterButton: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickFilterText: {
    fontSize: 12,
    color: colors.gray700,
  },
  dateRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  dateRangeSeparator: {
    fontSize: 18,
    color: colors.gray600,
    marginHorizontal: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  modalButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DateRangeSelector;
