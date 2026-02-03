# 🚀 Quick Start: Pagination trong Trucking App

## Tóm tắt nhanh cho developers

### 📦 Đã có sẵn

✅ **Types & Interfaces** - `PaginatedResponse<T>`, `PaginationParams`  
✅ **API Functions** - Tất cả endpoints đã có `.getXXX()` với pagination  
✅ **Hooks** - `usePagination`, `useInfiniteScroll`  
✅ **UI Components** - `Pagination`, `PageSizeSelector`, `LoadMoreButton`  
✅ **Example Screens** - 2 screens ví dụ cho cả 2 patterns

---

## 🎯 Chọn Pattern phù hợp

| Pattern                | Khi nào dùng                     | Page Size đề xuất |
| ---------------------- | -------------------------------- | ----------------- |
| **Pagination Buttons** | Desktop, Table view, Admin panel | 10-20 items       |
| **Infinite Scroll**    | Mobile, Feed, Social media style | 20-30 items       |

---

## ⚡ Quick Implementation

### Pattern 1: Pagination Buttons (5 bước)

```tsx
// 1. Import
import { usePagination } from "@/hooks/usePagination";
import { productApi } from "@/api/product";
import Pagination from "@/components/common/Pagination";

// 2. Setup hook
const pagination = usePagination<Hanghoa>({
  initialPageSize: 10,
  onPageChange: (page) => loadData(page, pagination.pageSize),
});

// 3. Load function
const loadData = async (page: number, pageSize: number) => {
  pagination.setLoading(true);
  const response = await productApi.getProducts({ page, pageSize });
  pagination.setData(response.data);
  pagination.setLoading(false);
};

// 4. Call on mount
useEffect(() => {
  loadData(1, pagination.pageSize);
}, []);

// 5. Render
<FlatList data={pagination.items} {...props} />
<Pagination
  currentPage={pagination.currentPage}
  totalPages={pagination.totalPages}
  onPageChange={pagination.goToPage}
  hasPrevious={pagination.hasPrevious}
  hasNext={pagination.hasNext}
  totalCount={pagination.totalCount}
  pageSize={pagination.pageSize}
/>
```

### Pattern 2: Infinite Scroll (6 bước)

```tsx
// 1. Import
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { productApi } from "@/api/product";
import LoadMoreButton from "@/components/common/LoadMoreButton";

// 2. Setup hook
const infiniteScroll = useInfiniteScroll<Hanghoa>({
  initialPageSize: 20,
  onLoadMore: handleLoadMore,
});

// 3. Initial load
const loadInitialData = async () => {
  infiniteScroll.setLoading(true);
  const response = await productApi.getProducts({ page: 1, pageSize: 20 });
  infiniteScroll.setData(response.data);
  infiniteScroll.setLoading(false);
};

// 4. Load more function
const handleLoadMore = async () => {
  if (!infiniteScroll.hasMore || infiniteScroll.loadingMore) return;

  infiniteScroll.setLoadingMore(true);
  const response = await productApi.getProducts({
    page: infiniteScroll.currentPage + 1,
    pageSize: infiniteScroll.pageSize,
  });
  infiniteScroll.appendData(response.data);
  infiniteScroll.setLoadingMore(false);
};

// 5. Call on mount
useEffect(() => {
  loadInitialData();
}, []);

// 6. Render
<FlatList
  data={infiniteScroll.allItems}
  onEndReached={infiniteScroll.loadMore}
  onEndReachedThreshold={0.5}
  ListFooterComponent={
    <LoadMoreButton
      onLoadMore={infiniteScroll.loadMore}
      loading={infiniteScroll.loadingMore}
      hasMore={infiniteScroll.hasMore}
      currentCount={infiniteScroll.allItems.length}
      totalCount={infiniteScroll.totalCount}
    />
  }
/>;
```

---

## 📋 Checklist Migration 1 Screen

```
Step 1: Preparation
[ ] Đọc code screen hiện tại
[ ] Quyết định dùng Pagination hay Infinite Scroll
[ ] Check API đã có function mới chưa

Step 2: Implementation
[ ] Import hook phù hợp
[ ] Replace getAllXXX() với getXXX({ page, pageSize })
[ ] Setup hook với initial config
[ ] Viết load function
[ ] Call load function trong useEffect/useFocusEffect

Step 3: UI Updates
[ ] Thêm Pagination hoặc LoadMoreButton component
[ ] (Optional) Thêm PageSizeSelector
[ ] Test pull-to-refresh
[ ] Handle empty state

Step 4: Testing
[ ] Test load trang đầu
[ ] Test navigation (next/previous hoặc load more)
[ ] Test refresh
[ ] Test với different page sizes
[ ] Test empty state
[ ] Test error scenarios
```

---

## 🎨 Copy-Paste Templates

### Template: Load Data Function

```tsx
const loadData = async (page: number, pageSize: number) => {
  try {
    pagination.setLoading(true);
    const response = await productApi.getProducts({ page, pageSize });

    if (response.success) {
      pagination.setData(response.data);
    }
  } catch (error) {
    console.error("Load data error:", error);
    Alert.alert("Lỗi", "Không thể tải dữ liệu");
  } finally {
    pagination.setLoading(false);
  }
};
```

### Template: Refresh Function

```tsx
const handleRefresh = async () => {
  try {
    pagination.setRefreshing(true);
    await loadData(pagination.currentPage, pagination.pageSize);
  } catch (error) {
    console.error("Refresh error:", error);
  } finally {
    pagination.setRefreshing(false);
  }
};
```

---

## 🔥 Common Pitfalls & Solutions

### ❌ Mistake 1: Không check hasMore

```tsx
// BAD
const loadMore = () => {
  api.getProducts({ page: currentPage + 1 });
};

// GOOD
const loadMore = () => {
  if (!infiniteScroll.hasMore || infiniteScroll.loadingMore) return;
  // Load more logic
};
```

### ❌ Mistake 2: Quên reset page khi search

```tsx
// BAD
const handleSearch = (query) => {
  setSearchQuery(query);
  loadData(currentPage, pageSize); // Wrong!
};

// GOOD
const handleSearch = (query) => {
  setSearchQuery(query);
  loadData(1, pageSize); // Always start from page 1
};
```

### ❌ Mistake 3: Duplicate API calls

```tsx
// BAD
useEffect(() => {
  loadData(1, 10);
}, []);

useFocusEffect(() => {
  loadData(1, 10); // Duplicate!
});

// GOOD - Pick one
useFocusEffect(
  useCallback(() => {
    loadData(1, 10);
  }, []),
);
```

---

## 🎯 Recommended pageSize

```tsx
// Mobile (Infinite Scroll)
initialPageSize: 20; // Sweet spot cho mobile

// Desktop (Pagination)
initialPageSize: 10; // Dễ navigate với buttons

// Heavy data (images, complex items)
initialPageSize: 10; // Giảm load time

// Light data (text only)
initialPageSize: 30; // Có thể cao hơn
```

---

## 📚 Example Screens Location

Xem 2 example screens đầy đủ tại:

1. **Pagination Buttons**:  
   `src/screens/management/ProductListWithPagination.tsx`

2. **Infinite Scroll**:  
   `src/screens/management/ProductListInfiniteScroll.tsx`

---

## 🆘 Need Help?

- 📖 [Full Documentation](./PAGINATION_GUIDE.md)
- 🔧 [API Reference](./PAGINATION_GUIDE.md#hooks-reference)
- 💡 [Best Practices](./PAGINATION_GUIDE.md#best-practices)

---

**Ready to start? Copy một trong 2 example screens và customize!** 🚀
