// src/hooks/usePagination.ts
import { useState, useCallback } from "react";
import { PaginatedResponse, PaginationParams } from "@/types/api.types";

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export interface UsePaginationReturn<T> {
  // Data state
  items: T[];
  paginationInfo: Omit<PaginatedResponse<T>, "items"> | null;

  // Loading states
  loading: boolean;
  refreshing: boolean;

  // Pagination controls
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;

  // Actions
  setData: (response: PaginatedResponse<T>) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  changePageSize: (size: number) => void;
  reset: () => void;
}

/**
 * Hook quản lý pagination state và actions
 * Sử dụng cho list screens với pagination buttons
 *
 * @example
 * ```tsx
 * const pagination = usePagination<Product>({
 *   initialPageSize: 20,
 *   onPageChange: (page) => loadData(page)
 * });
 *
 * // Trong useEffect
 * const loadData = async (page: number) => {
 *   pagination.setLoading(true);
 *   const response = await api.getProducts({ page, pageSize: pagination.pageSize });
 *   pagination.setData(response.data);
 *   pagination.setLoading(false);
 * };
 * ```
 */
export const usePagination = <T>({
  initialPage = 1,
  initialPageSize = 10,
  onPageChange,
  onPageSizeChange,
}: UsePaginationOptions = {}): UsePaginationReturn<T> => {
  const [items, setItems] = useState<T[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<Omit<
    PaginatedResponse<T>,
    "items"
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const setData = useCallback((response: PaginatedResponse<T>) => {
    setItems(response.items);
    setPaginationInfo({
      totalCount: response.totalCount,
      page: response.page,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasPrevious: response.hasPrevious,
      hasNext: response.hasNext,
    });
    setCurrentPage(response.page);
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || (paginationInfo && page > paginationInfo.totalPages)) {
        return;
      }
      setCurrentPage(page);
      onPageChange?.(page);
    },
    [paginationInfo, onPageChange],
  );

  const nextPage = useCallback(() => {
    if (paginationInfo?.hasNext) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, paginationInfo, goToPage]);

  const previousPage = useCallback(() => {
    if (paginationInfo?.hasPrevious) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, paginationInfo, goToPage]);

  const changePageSize = useCallback(
    (size: number) => {
      setPageSize(size);
      setCurrentPage(1);
      onPageSizeChange?.(size);
      onPageChange?.(1);
    },
    [onPageChange, onPageSizeChange],
  );

  const reset = useCallback(() => {
    setItems([]);
    setPaginationInfo(null);
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
    setLoading(false);
    setRefreshing(false);
  }, [initialPage, initialPageSize]);

  return {
    // Data
    items,
    paginationInfo,

    // Loading
    loading,
    refreshing,

    // Pagination info
    currentPage,
    pageSize,
    totalPages: paginationInfo?.totalPages || 0,
    totalCount: paginationInfo?.totalCount || 0,
    hasNext: paginationInfo?.hasNext || false,
    hasPrevious: paginationInfo?.hasPrevious || false,

    // Actions
    setData,
    setLoading,
    setRefreshing,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    reset,
  };
};
