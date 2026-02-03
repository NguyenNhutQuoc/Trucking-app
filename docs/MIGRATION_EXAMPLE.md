# 🔄 Migration Example: ProductListScreen

## Ví dụ chi tiết cách migrate screen từ non-pagination sang pagination

### 📋 File: `ProductListScreen.tsx`

---

## 🔴 BEFORE (Old Code - No Pagination)

```tsx
// src/screens/management/ProductListScreen.tsx
import React, { useState, useCallback } from "react";
import { FlatList, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { productApi } from "@/api/product";
import { Hanghoa } from "@/types/api.types";

const ProductListScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Hanghoa[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ❌ Load tất cả products cùng lúc (không pagination)
  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, []),
  );

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getAllProducts(); // ❌ Old API
      if (response.success) {
        setProducts(response.data.data); // ❌ Array direct
      }
    } catch (error) {
      console.error("Load products error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadProducts();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <FlatList
      data={products}
      onRefresh={handleRefresh}
      refreshing={refreshing}
      // No pagination controls
    />
  );
};
```

### ❌ Problems:

1. Load toàn bộ data cùng lúc (slow với nhiều items)
2. Không có pagination controls
3. Performance kém khi có 1000+ items
4. Không scale được

---

## 🟢 AFTER - Option 1: Pagination Buttons

```tsx
// src/screens/management/ProductListScreen.tsx
import React, { useState, useCallback } from "react";
import { FlatList, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { productApi } from "@/api/product";
import { Hanghoa } from "@/types/api.types";

// ✅ NEW: Import pagination hook và components
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/common/Pagination";
import PageSizeSelector from "@/components/common/PageSizeSelector";

const ProductListScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ NEW: Setup pagination hook
  const pagination = usePagination<Hanghoa>({
    initialPageSize: 10,
    onPageChange: (page) => loadProducts(page, pagination.pageSize),
    onPageSizeChange: (size) => loadProducts(1, size),
  });

  useFocusEffect(
    useCallback(() => {
      loadProducts(1, pagination.pageSize);
    }, []),
  );

  // ✅ NEW: Load với pagination params
  const loadProducts = async (page: number, pageSize: number) => {
    try {
      pagination.setLoading(true);

      // ✅ NEW: Call API với pagination
      const response = await productApi.getProducts({ page, pageSize });

      if (response.success) {
        // ✅ NEW: Set paginated data
        pagination.setData(response.data);
      }
    } catch (error) {
      console.error("Load products error:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách hàng hóa");
    } finally {
      pagination.setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      pagination.setRefreshing(true);
      await loadProducts(pagination.currentPage, pagination.pageSize);
    } finally {
      pagination.setRefreshing(false);
    }
  };

  return (
    <>
      {/* ✅ NEW: Page size selector */}
      <PageSizeSelector
        pageSize={pagination.pageSize}
        onPageSizeChange={pagination.changePageSize}
        loading={pagination.loading}
      />

      {/* ✅ UPDATED: Use pagination.items */}
      <FlatList
        data={pagination.items}
        onRefresh={handleRefresh}
        refreshing={pagination.refreshing}
      />

      {/* ✅ NEW: Pagination controls */}
      {pagination.totalCount > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.goToPage}
          hasPrevious={pagination.hasPrevious}
          hasNext={pagination.hasNext}
          totalCount={pagination.totalCount}
          pageSize={pagination.pageSize}
          loading={pagination.loading}
        />
      )}
    </>
  );
};
```

### ✅ Benefits:

1. ✅ Chỉ load 10-20 items mỗi lần
2. ✅ Performance tốt hơn rất nhiều
3. ✅ Scale được với 10000+ items
4. ✅ UX tốt với pagination controls
5. ✅ User biết đang ở trang nào / tổng bao nhiêu

---

## 🟢 AFTER - Option 2: Infinite Scroll

```tsx
// src/screens/management/ProductListScreen.tsx
import React, { useState, useCallback } from "react";
import { FlatList, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { productApi } from "@/api/product";
import { Hanghoa } from "@/types/api.types";

// ✅ NEW: Import infinite scroll hook và components
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import LoadMoreButton from "@/components/common/LoadMoreButton";

const ProductListScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ NEW: Setup infinite scroll hook
  const infiniteScroll = useInfiniteScroll<Hanghoa>({
    initialPageSize: 20,
    onLoadMore: handleLoadMore,
  });

  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, []),
  );

  // ✅ NEW: Load initial data
  const loadInitialData = async () => {
    try {
      infiniteScroll.setLoading(true);
      const response = await productApi.getProducts({
        page: 1,
        pageSize: infiniteScroll.pageSize,
      });

      if (response.success) {
        infiniteScroll.setData(response.data);
      }
    } catch (error) {
      console.error("Load initial data error:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách hàng hóa");
    } finally {
      infiniteScroll.setLoading(false);
    }
  };

  // ✅ NEW: Load more function
  const handleLoadMore = async () => {
    if (infiniteScroll.loadingMore || !infiniteScroll.hasMore) {
      return;
    }

    try {
      infiniteScroll.setLoadingMore(true);
      const response = await productApi.getProducts({
        page: infiniteScroll.currentPage + 1,
        pageSize: infiniteScroll.pageSize,
      });

      if (response.success) {
        infiniteScroll.appendData(response.data);
      }
    } catch (error) {
      console.error("Load more error:", error);
      Alert.alert("Lỗi", "Không thể tải thêm dữ liệu");
    } finally {
      infiniteScroll.setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    try {
      infiniteScroll.setRefreshing(true);
      const response = await productApi.getProducts({
        page: 1,
        pageSize: infiniteScroll.pageSize,
      });

      if (response.success) {
        infiniteScroll.setData(response.data);
      }
    } finally {
      infiniteScroll.setRefreshing(false);
    }
  };

  return (
    <FlatList
      // ✅ UPDATED: Use allItems for infinite scroll
      data={infiniteScroll.allItems}
      onRefresh={handleRefresh}
      refreshing={infiniteScroll.refreshing}
      // ✅ NEW: Infinite scroll handlers
      onEndReached={infiniteScroll.loadMore}
      onEndReachedThreshold={0.5}
      // ✅ NEW: Load more button footer
      ListFooterComponent={
        infiniteScroll.allItems.length > 0 ? (
          <LoadMoreButton
            onLoadMore={infiniteScroll.loadMore}
            loading={infiniteScroll.loadingMore}
            hasMore={infiniteScroll.hasMore}
            currentCount={infiniteScroll.allItems.length}
            totalCount={infiniteScroll.totalCount}
          />
        ) : null
      }
    />
  );
};
```

### ✅ Benefits:

1. ✅ Seamless UX (không có page jumps)
2. ✅ Phù hợp mobile
3. ✅ Auto-load khi scroll đến cuối
4. ✅ Optional Load More button
5. ✅ Giữ được scroll position

---

## 📊 Comparison

| Feature          | Old (No Pagination) | Pagination Buttons | Infinite Scroll |
| ---------------- | ------------------- | ------------------ | --------------- |
| **Initial Load** | 1000+ items         | 10-20 items        | 20-30 items     |
| **Performance**  | ❌ Slow             | ✅ Fast            | ✅ Fast         |
| **Memory**       | ❌ High             | ✅ Low             | 🟡 Medium       |
| **UX**           | ❌ Bad              | ✅ Good            | ✅ Great        |
| **Mobile**       | ❌ Not suitable     | 🟡 OK              | ✅ Perfect      |
| **Desktop**      | ❌ Not suitable     | ✅ Perfect         | 🟡 OK           |

---

## 🔧 Step-by-Step Migration

### Step 1: Choose Pattern

```
Screen Type: Product List
Platform: Mobile ✅
Decision: Use Infinite Scroll
```

### Step 2: Update Imports

```tsx
// Remove (if exists):
// import { useState } from "react"; // Keep if needed for other states

// Add:
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import LoadMoreButton from "@/components/common/LoadMoreButton";
```

### Step 3: Replace State Management

```tsx
// ❌ Remove:
const [loading, setLoading] = useState(true);
const [products, setProducts] = useState<Hanghoa[]>([]);

// ✅ Add:
const infiniteScroll = useInfiniteScroll<Hanghoa>({
  initialPageSize: 20,
  onLoadMore: handleLoadMore,
});
```

### Step 4: Update API Calls

```tsx
// ❌ Old:
const response = await productApi.getAllProducts();
setProducts(response.data.data);

// ✅ New:
const response = await productApi.getProducts({ page: 1, pageSize: 20 });
infiniteScroll.setData(response.data);
```

### Step 5: Update Render

```tsx
// ❌ Old:
<FlatList data={products} />

// ✅ New:
<FlatList
  data={infiniteScroll.allItems}
  onEndReached={infiniteScroll.loadMore}
  ListFooterComponent={<LoadMoreButton {...props} />}
/>
```

### Step 6: Test

- [ ] Test load first page
- [ ] Test scroll to load more
- [ ] Test pull-to-refresh
- [ ] Test empty state
- [ ] Test error handling

---

## 💡 Tips

### 1. Search Integration

```tsx
const handleSearch = (query: string) => {
  setSearchQuery(query);
  // ✅ Always reset to page 1 when searching
  if (usePagination) {
    loadProducts(1, pageSize);
  } else {
    loadInitialData(); // For infinite scroll
  }
};
```

### 2. Delete Item

```tsx
const handleDelete = async (id: number) => {
  await api.deleteProduct(id);

  // ✅ Reload current page (Pagination)
  loadProducts(pagination.currentPage, pagination.pageSize);

  // OR

  // ✅ Refresh from start (Infinite Scroll)
  handleRefresh();
};
```

### 3. Loading States

```tsx
// ✅ Initial load
if (pagination.loading && pagination.currentPage === 1) {
  return <Loading />;
}

// ✅ Page change load
if (pagination.loading) {
  // Show loading overlay
}

// ✅ Load more
if (infiniteScroll.loadingMore) {
  // Show footer loading
}
```

---

## 🎯 Kết luận

### Nên chọn gì?

**Pagination Buttons** nếu:

- ✅ Desktop/Tablet app
- ✅ Admin panel
- ✅ Cần hiển thị số trang cụ thể
- ✅ Table view

**Infinite Scroll** nếu:

- ✅ Mobile app
- ✅ Social feed style
- ✅ Cần UX mượt mà
- ✅ List view

### Migration Time

- Small screen: **15-30 minutes**
- Medium screen: **30-60 minutes**
- Large screen: **1-2 hours**

### Effort Level

- 🟢 Easy: 80% của screens
- 🟡 Medium: 15% (có custom logic phức tạp)
- 🔴 Hard: 5% (tích hợp với nhiều features khác)

---

**Happy Migrating!** 🚀
