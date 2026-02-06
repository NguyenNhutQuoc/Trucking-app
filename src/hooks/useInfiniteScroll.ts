// src/hooks/useInfiniteScroll.ts
import { useState, useCallback, useRef, useEffect } from "react";
import { PaginatedResponse } from "@/types/api.types";

/**
 * Fetch function type for useInfiniteScroll
 * Receives page number and pageSize, returns PaginatedResponse or null on error
 */
type FetchFunction<T> = (
  page: number,
  pageSize: number,
) => Promise<PaginatedResponse<T> | null>;

export interface UseInfiniteScrollOptions {
  pageSize?: number;
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
  isRefreshing: boolean;

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
 * const {
 *   items, loading, loadingMore, hasMore,
 *   loadMore, refresh, isRefreshing,
 * } = useInfiniteScroll<Product>(
 *   async (page, pageSize) => {
 *     const response = await api.getProducts({ page, pageSize });
 *     return response.success ? response.data : null;
 *   },
 *   { pageSize: 20 },
 * );
 *
 * <FlatList
 *   data={items}
 *   onEndReached={loadMore}
 *   onEndReachedThreshold={0.5}
 *   refreshing={isRefreshing}
 *   onRefresh={refresh}
 * />
 * ```
 */
export function useInfiniteScroll<T>(
  fetchFn: FetchFunction<T>,
  options?: UseInfiniteScrollOptions,
): UseInfiniteScrollReturn<T>;
export function useInfiniteScroll<T>(
  options?: UseInfiniteScrollOptions,
): UseInfiniteScrollReturn<T>;
export function useInfiniteScroll<T>(
  fetchFnOrOptions?: FetchFunction<T> | UseInfiniteScrollOptions,
  maybeOptions?: UseInfiniteScrollOptions,
): UseInfiniteScrollReturn<T> {
  // Determine if called with fetchFn or options-only
  const fetchFn =
    typeof fetchFnOrOptions === "function" ? fetchFnOrOptions : undefined;
  const options =
    typeof fetchFnOrOptions === "function"
      ? maybeOptions
      : fetchFnOrOptions || {};

  const resolvedPageSize = options?.pageSize || options?.initialPageSize || 20;

  const [allItems, setAllItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(resolvedPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Ref để tránh duplicate calls
  const loadingRef = useRef(false);
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

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

  // Auto-fetch function that handles loading states
  const doFetch = useCallback(
    async (page: number, isRefresh: boolean) => {
      if (!fetchFnRef.current) return;
      if (loadingRef.current) return;
      loadingRef.current = true;

      try {
        if (isRefresh) {
          // Don't set loading on refresh, refreshing state handles it
        } else if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const result = await fetchFnRef.current(page, pageSize);

        if (result) {
          if (page === 1 || isRefresh) {
            setData(result);
          } else {
            appendData(result);
          }
        }
      } catch (error) {
        console.error("useInfiniteScroll fetch error:", error);
        loadingRef.current = false;
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [pageSize, setData, appendData],
  );

  // Initial load (only when fetchFn is provided)
  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (fetchFn && !initialLoadDone.current) {
      initialLoadDone.current = true;
      doFetch(1, false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading || loadingRef.current) {
      return;
    }

    if (fetchFnRef.current) {
      doFetch(currentPage + 1, false);
    } else {
      loadingRef.current = true;
      options?.onLoadMore?.();
    }
  }, [hasMore, loadingMore, loading, currentPage, doFetch, options]);

  const refresh = useCallback(() => {
    setAllItems([]);
    setCurrentPage(1);
    setHasMore(true);
    setRefreshing(true);
    loadingRef.current = false;
    initialLoadDone.current = true;

    if (fetchFnRef.current) {
      doFetch(1, true);
    } else {
      options?.onLoadMore?.();
    }
  }, [doFetch, options]);

  const reset = useCallback(() => {
    setAllItems([]);
    setLoading(false);
    setLoadingMore(false);
    setRefreshing(false);
    setCurrentPage(1);
    setTotalCount(0);
    setHasMore(true);
    loadingRef.current = false;
    initialLoadDone.current = false;
  }, []);

  return {
    // Data
    items: allItems,
    allItems,

    // Loading
    loading,
    loadingMore,
    refreshing,
    isRefreshing: refreshing,

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
}
