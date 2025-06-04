// src/components/common/Table.tsx
import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "./ThemedText";
import { useAppTheme } from "@/hooks/useAppTheme";

export interface TableColumn {
  key: string;
  title: string;
  width?: number;
  flex?: number;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (value: any, item: any, index: number) => React.ReactNode;
}

export interface TableProps {
  columns: TableColumn[];
  data: any[];
  onRowPress?: (item: any, index: number) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (column: string) => void;
  keyExtractor?: (item: any, index: number) => string;
  emptyText?: string;
  showIndex?: boolean;
  indexTitle?: string;
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  onRowPress,
  sortBy,
  sortOrder,
  onSort,
  keyExtractor,
  emptyText = "Không có dữ liệu",
  showIndex = false,
  indexTitle = "STT",
}) => {
  const { colors } = useAppTheme();

  const renderHeaderCell = (column: TableColumn, index: number) => {
    const isActive = sortBy === column.key;
    const canSort = column.sortable && onSort;

    return (
      <TouchableOpacity
        key={column.key}
        style={[
          styles.headerCell,
          {
            backgroundColor: colors.gray50,
            borderRightColor: colors.gray200,
            borderBottomColor: colors.gray200,
            width: column.width,
            flex: column.flex,
          },
          index === columns.length - 1 && styles.lastHeaderCell,
        ]}
        onPress={() => canSort && onSort(column.key)}
        disabled={!canSort}
      >
        <ThemedText
          style={[
            styles.headerText,
            { textAlign: column.align || "left" },
            isActive ? { color: colors.primary } : { color: colors.text },
          ]}
          numberOfLines={2}
        >
          {column.title}
        </ThemedText>
        {canSort && (
          <View style={styles.sortIcon}>
            {isActive && (
              <Ionicons
                name={sortOrder === "asc" ? "chevron-up" : "chevron-down"}
                size={14}
                color={colors.primary}
              />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderIndexHeader = () => {
    if (!showIndex) return null;

    return (
      <View
        style={[
          styles.headerCell,
          styles.indexCell,
          {
            backgroundColor: colors.gray50,
            borderRightColor: colors.gray200,
            borderBottomColor: colors.gray200,
          },
        ]}
      >
        <ThemedText style={[styles.headerText, { textAlign: "center" }]}>
          {indexTitle}
        </ThemedText>
      </View>
    );
  };

  const renderDataCell = (
    column: TableColumn,
    item: any,
    rowIndex: number,
    cellIndex: number,
  ) => {
    const value = item[column.key];
    const isLastCell = cellIndex === columns.length - 1;

    return (
      <View
        key={`${column.key}-${rowIndex}`}
        style={[
          styles.dataCell,
          {
            borderRightColor: colors.gray100,
            borderBottomColor: colors.gray100,
            width: column.width,
            flex: column.flex,
          },
          isLastCell && styles.lastDataCell,
        ]}
      >
        {column.render ? (
          column.render(value, item, rowIndex)
        ) : (
          <ThemedText
            style={[styles.cellText, { textAlign: column.align || "left" }]}
            numberOfLines={2}
          >
            {value?.toString() || ""}
          </ThemedText>
        )}
      </View>
    );
  };

  const renderIndexCell = (index: number) => {
    if (!showIndex) return null;

    return (
      <View
        style={[
          styles.dataCell,
          styles.indexCell,
          {
            borderRightColor: colors.gray100,
            borderBottomColor: colors.gray100,
            backgroundColor: colors.gray50,
          },
        ]}
      >
        <ThemedText style={[styles.cellText, { textAlign: "center" }]}>
          {index + 1}
        </ThemedText>
      </View>
    );
  };

  const renderRow = (item: any, index: number) => {
    const key = keyExtractor ? keyExtractor(item, index) : index.toString();

    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.row,
          index % 2 === 1 && { backgroundColor: colors.gray50 },
        ]}
        onPress={() => onRowPress?.(item, index)}
        disabled={!onRowPress}
      >
        {renderIndexCell(index)}
        {columns.map((column, cellIndex) =>
          renderDataCell(column, item, index, cellIndex),
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-outline" size={48} color={colors.gray400} />
      <ThemedText style={[styles.emptyText, { color: colors.gray600 }]}>
        {emptyText}
      </ThemedText>
    </View>
  );

  if (data.length === 0) {
    return renderEmptyState();
  }

  return (
    <View style={[styles.container, { borderColor: colors.gray200 }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.header}>
            {renderIndexHeader()}
            {columns.map((column, index) => renderHeaderCell(column, index))}
          </View>

          {/* Data Rows */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {data.map((item, index) => renderRow(item, index))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  table: {
    minWidth: "100%",
  },
  header: {
    flexDirection: "row",
  },
  headerCell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderBottomWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  lastHeaderCell: {
    borderRightWidth: 0,
  },
  headerText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  sortIcon: {
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
  },
  dataCell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    justifyContent: "center",
    minHeight: 40,
  },
  lastDataCell: {
    borderRightWidth: 0,
  },
  cellText: {
    fontSize: 13,
  },
  indexCell: {
    width: 50,
    flex: 0,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
});

export default Table;
