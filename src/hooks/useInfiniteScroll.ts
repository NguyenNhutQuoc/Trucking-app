// src/hooks/useInfiniteScroll.ts
import { useState, useCallback, useRef } from "react";
import { PaginatedResponse } from "@/types/api.types";

export interface UseInfiniteScrollOptions {
  initialPageSize?: number;
  onLoadMore?: () => void;
}

export interface UseInfiniteScrollReturn<T> {
  // Data state
  items: T[];
  allItems: T[];

  // Loading states
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;

  // Pagination info
  currentPage: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;

  // Actions
  appendData: (response: PaginatedResponse<T>) => void;
  setData: (response: PaginatedResponse<T>) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  loadMore: () => void;
  refresh: () => void;
  reset: () => void;
}

/**
 * Hook quản lý infinite scroll/load more functionality
 * Sử dụng cho list screens với load more button hoặc scroll to bottom
 *
 * @example
 * ```tsx
 * const infiniteScroll = useInfiniteScroll<Product>({
 *   initialPageSize: 20,
 *   onLoadMore: () => loadMoreData()
 * });
 *
 * const loadMoreData = async () => {
 *   if (!infiniteScroll.hasMore || infiniteScroll.loadingMore) return;
 *
 *   infiniteScroll.setLoadingMore(true);
 *   const response = await api.getProducts({
 *     page: infiniteScroll.currentPage + 1,
 *     pageSize: infiniteScroll.pageSize
 *   });
 *   infiniteScroll.appendData(response.data);
 *   infiniteScroll.setLoadingMore(false);
 * };
 *
 * // Trong FlatList
 * <FlatList
 *   data={infiniteScroll.allItems}
 *   onEndReached={infiniteScroll.loadMore}
 *   onEndReachedThreshold={0.5}
 *   onRefresh={infiniteScroll.refresh}
 *   refreshing={infiniteScroll.refreshing}
 * />
 * ```
 */
export const useInfiniteScroll = <T>({
  initialPageSize = 20,
  onLoadMore,
}: UseInfiniteScrollOptions = {}): UseInfiniteScrollReturn<T> => {
  const [allItems, setAllItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Ref để tránh duplicate calls
  const loadingRef = useRef(false);

  const appendData = useCallback((response: PaginatedResponse<T>) => {
    setAllItems((prev) => [...prev, ...response.items]);
    setCurrentPage(response.page);
    setTotalCount(response.totalCount);
    setHasMore(response.hasNext);
    loadingRef.current = false;
  }, []);

  const setData = useCallback((response: PaginatedResponse<T>) => {
    setAllItems(response.items);
    setCurrentPage(response.page);
    setTotalCount(response.totalCount);
    setHasMore(response.hasNext);
    loadingRef.current = false;
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading || loadingRef.current) {
      return;
    }
    loadingRef.current = true;
    onLoadMore?.();
  }, [hasMore, loadingMore, loading, onLoadMore]);

  const refresh = useCallback(() => {
    setAllItems([]);
    setCurrentPage(1);
    setHasMore(true);
    setRefreshing(true);
    loadingRef.current = false;
    onLoadMore?.();
  }, [onLoadMore]);

  const reset = useCallback(() => {
    setAllItems([]);
    setLoading(false);
    setLoadingMore(false);
    setRefreshing(false);
    setCurrentPage(1);
    setTotalCount(0);
    setHasMore(true);
    loadingRef.current = false;
  }, []);

  return {
    // Data
    items: allItems,
    allItems,

    // Loading
    loading,
    loadingMore,
    refreshing,

    // Pagination info
    currentPage,
    pageSize,
    totalCount,
    hasMore,

    // Actions
    appendData,
    setData,
    setLoading,
    setLoadingMore,
    setRefreshing,
    loadMore,
    refresh,
    reset,
  };
};
