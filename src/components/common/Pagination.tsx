// src/components/common/Pagination.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import ThemedText from "./ThemedText";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasPrevious: boolean;
  hasNext: boolean;
  totalCount: number;
  pageSize: number;
  loading?: boolean;
}

/**
 * Pagination component với buttons để navigate giữa các trang
 * Hiển thị: Previous, Page numbers, Next
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  hasPrevious,
  hasNext,
  totalCount,
  pageSize,
  loading = false,
}) => {
  const { colors } = useAppTheme();

  // Tính toán range hiển thị
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers để hiển thị
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Hiển thị tất cả pages nếu ít hơn hoặc bằng maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logic phức tạp hơn cho nhiều pages
      if (currentPage <= 3) {
        // Đầu danh sách
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Cuối danh sách
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Giữa danh sách
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <View style={styles.container}>
      {/* Info text */}
      <ThemedText style={styles.infoText}>
        Hiển thị {startItem}-{endItem} của {totalCount} mục
      </ThemedText>

      {/* Pagination buttons */}
      <View style={styles.buttonsContainer}>
        {/* Previous button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            (!hasPrevious || loading) && styles.disabledButton,
          ]}
          onPress={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious || loading}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={!hasPrevious || loading ? colors.disabled : colors.primary}
          />
        </TouchableOpacity>

        {/* Page numbers */}
        <View style={styles.pageNumbersContainer}>
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <ThemedText key={`ellipsis-${index}`} style={styles.ellipsis}>
                  ...
                </ThemedText>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <TouchableOpacity
                key={pageNum}
                style={[
                  styles.pageButton,
                  {
                    backgroundColor: isActive ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                  loading && styles.disabledButton,
                ]}
                onPress={() => onPageChange(pageNum)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.pageButtonText,
                    { color: isActive ? "#FFFFFF" : colors.text },
                  ]}
                >
                  {pageNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Next button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            (!hasNext || loading) && styles.disabledButton,
          ]}
          onPress={() => onPageChange(currentPage + 1)}
          disabled={!hasNext || loading}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={!hasNext || loading ? colors.disabled : colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.7,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pageNumbersContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pageButton: {
    minWidth: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  ellipsis: {
    fontSize: 14,
    paddingHorizontal: 4,
  },
  disabledButton: {
    opacity: 0.4,
  },
});

export default Pagination;
