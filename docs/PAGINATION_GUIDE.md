# 📦 Pagination Features - Trucking App

## 🎯 Tổng quan

Ứng dụng đã được cập nhật để hỗ trợ **pagination** (phân trang) cho tất cả các danh sách dữ liệu theo chuẩn API mới.

## 📂 Các file đã thêm/cập nhật

### 1. Types & Interfaces

- **`src/types/api.types.ts`**: Thêm `PaginatedResponse<T>`, `PaginationParams`, `ApiPaginatedResponse<T>`

### 2. API Services (Updated)

Tất cả các API services đã được cập nhật để hỗ trợ pagination:

- **`src/api/product.ts`**: `getProducts()` - Hàng hóa
- **`src/api/customer.ts`**: `getCustomers()` - Khách hàng
- **`src/api/vehicle.ts`**: `getVehicles()` - Xe
- **`src/api/user.ts`**: `getUsers()` - Nhân viên
- **`src/api/weighing.ts`**: `getWeighings()` - Phiếu cân
- **`src/api/permission.ts`**: `getGroups()` - Nhóm quyền

> **Note**: Các hàm `getAll*()` vẫn được giữ lại nhưng được đánh dấu **DEPRECATED**

### 3. Custom Hooks

- **`src/hooks/usePagination.ts`**: Hook cho pagination với buttons
- **`src/hooks/useInfiniteScroll.ts`**: Hook cho infinite scroll/load more

### 4. UI Components

- **`src/components/common/Pagination.tsx`**: Pagination controls với page numbers
- **`src/components/common/PageSizeSelector.tsx`**: Selector để chọn số items/trang
- **`src/components/common/LoadMoreButton.tsx`**: Button "Load More" cho infinite scroll

### 5. Example Screens

- **`src/screens/management/ProductListWithPagination.tsx`**: Ví dụ với pagination buttons
- **`src/screens/management/ProductListInfiniteScroll.tsx`**: Ví dụ với infinite scroll

---

## 🚀 Cách sử dụng

### Option 1: Pagination với Buttons (Desktop-like)

Phù hợp cho: **Desktop, Tablet, hoặc UI cần hiển thị cụ thể trang**

```tsx
import { usePagination } from "@/hooks/usePagination";
import { productApi } from "@/api/product";
import Pagination from "@/components/common/Pagination";
import PageSizeSelector from "@/components/common/PageSizeSelector";
import { Hanghoa } from "@/types/api.types";

const MyScreen = () => {
  const pagination = usePagination<Hanghoa>({
    initialPageSize: 10,
    onPageChange: (page) => loadData(page, pagination.pageSize),
    onPageSizeChange: (size) => loadData(1, size),
  });

  const loadData = async (page: number, pageSize: number) => {
    pagination.setLoading(true);
    try {
      const response = await productApi.getProducts({ page, pageSize });
      if (response.success) {
        pagination.setData(response.data);
      }
    } finally {
      pagination.setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1, pagination.pageSize);
  }, []);

  return (
    <View>
      {/* Page Size Selector */}
      <PageSizeSelector
        pageSize={pagination.pageSize}
        onPageSizeChange={pagination.changePageSize}
        loading={pagination.loading}
      />

      {/* Your List */}
      <FlatList
        data={pagination.items}
        onRefresh={handleRefresh}
        refreshing={pagination.refreshing}
        // ...
      />

      {/* Pagination Controls */}
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
    </View>
  );
};
```

### Option 2: Infinite Scroll / Load More (Mobile-first)

Phù hợp cho: **Mobile, hoặc UI cần trải nghiệm mượt mà**

```tsx
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { productApi } from "@/api/product";
import LoadMoreButton from "@/components/common/LoadMoreButton";
import { Hanghoa } from "@/types/api.types";

const MyScreen = () => {
  const infiniteScroll = useInfiniteScroll<Hanghoa>({
    initialPageSize: 20,
    onLoadMore: handleLoadMore,
  });

  const loadInitialData = async () => {
    infiniteScroll.setLoading(true);
    try {
      const response = await productApi.getProducts({
        page: 1,
        pageSize: infiniteScroll.pageSize,
      });
      if (response.success) {
        infiniteScroll.setData(response.data);
      }
    } finally {
      infiniteScroll.setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (infiniteScroll.loadingMore || !infiniteScroll.hasMore) return;

    infiniteScroll.setLoadingMore(true);
    try {
      const response = await productApi.getProducts({
        page: infiniteScroll.currentPage + 1,
        pageSize: infiniteScroll.pageSize,
      });
      if (response.success) {
        infiniteScroll.appendData(response.data);
      }
    } finally {
      infiniteScroll.setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    infiniteScroll.setRefreshing(true);
    try {
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

  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <FlatList
      data={infiniteScroll.allItems}
      onRefresh={handleRefresh}
      refreshing={infiniteScroll.refreshing}
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
    />
  );
};
```

---

## 📋 API Response Structure

### New Paginated Response

```typescript
interface PaginatedResponse<T> {
  items: T[]; // Array of data
  totalCount: number; // Total số items
  page: number; // Trang hiện tại
  pageSize: number; // Số items mỗi trang
  totalPages: number; // Tổng số trang
  hasPrevious: boolean; // Có trang trước không
  hasNext: boolean; // Có trang sau không
}
```

### Example Response

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": 1,
        "ma": "HH001",
        "ten": "Xi măng",
        "dongia": 1500000
      }
    ],
    "totalCount": 150,
    "page": 1,
    "pageSize": 10,
    "totalPages": 15,
    "hasPrevious": false,
    "hasNext": true
  }
}
```

---

## 🎨 UI Components Reference

### 1. Pagination Component

**Props:**

- `currentPage: number` - Trang hiện tại
- `totalPages: number` - Tổng số trang
- `onPageChange: (page: number) => void` - Callback khi đổi trang
- `hasPrevious: boolean` - Có thể về trang trước
- `hasNext: boolean` - Có thể sang trang sau
- `totalCount: number` - Tổng số items
- `pageSize: number` - Số items mỗi trang
- `loading?: boolean` - Đang loading

**Features:**

- Hiển thị page numbers với smart ellipsis (...)
- Previous/Next buttons
- Info text: "Hiển thị 1-10 của 150 mục"
- Auto-disable khi loading

### 2. PageSizeSelector Component

**Props:**

- `pageSize: number` - Page size hiện tại
- `onPageSizeChange: (size: number) => void` - Callback khi đổi size
- `options?: number[]` - Array các options (default: [10, 20, 50, 100])
- `loading?: boolean` - Đang loading

**Features:**

- Radio-style buttons
- Label: "Hiển thị: [10] [20] [50] [100] / trang"

### 3. LoadMoreButton Component

**Props:**

- `onLoadMore: () => void` - Callback để load thêm
- `loading?: boolean` - Đang loading
- `hasMore: boolean` - Còn data để load
- `currentCount: number` - Số items hiện tại
- `totalCount: number` - Tổng số items

**Features:**

- Hiển thị "Tải thêm (20/150)" khi còn data
- Hiển thị "Đã hiển thị tất cả 150 mục" khi hết data
- Loading indicator khi đang tải

---

## 🔧 Hooks Reference

### usePagination Hook

**Parameters:**

```typescript
{
  initialPage?: number;        // Default: 1
  initialPageSize?: number;    // Default: 10
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}
```

**Returns:**

```typescript
{
  // Data
  items: T[];
  paginationInfo: PaginationInfo | null;

  // Loading states
  loading: boolean;
  refreshing: boolean;

  // Pagination info
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
```

### useInfiniteScroll Hook

**Parameters:**

```typescript
{
  initialPageSize?: number;    // Default: 20
  onLoadMore?: () => void;
}
```

**Returns:**

```typescript
{
  // Data
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
```

---

## ⚠️ Migration Checklist

Khi migrate screen hiện có sang pagination:

- [ ] Import `usePagination` hoặc `useInfiniteScroll`
- [ ] Import API function mới (vd: `getProducts` thay vì `getAllProducts`)
- [ ] Thay đổi API call để truyền `PaginationParams`
- [ ] Update state management với hook's actions
- [ ] Thêm Pagination/LoadMoreButton component vào UI
- [ ] (Optional) Thêm PageSizeSelector
- [ ] Test pull-to-refresh
- [ ] Test load more / page navigation
- [ ] Test empty state
- [ ] Test error handling

---

## 🎯 Best Practices

### 1. **Page Size Guidelines**

- **Mobile (Infinite Scroll)**: 20-30 items
- **Desktop (Pagination)**: 10-20 items
- **Performance**: Không dùng > 100 items

### 2. **Loading States**

- Hiển thị loading indicator khi `loading = true`
- Hiển thị shimmer/skeleton cho better UX
- Pull-to-refresh cho refresh functionality

### 3. **Error Handling**

```tsx
try {
  const response = await api.getProducts({ page, pageSize });
  pagination.setData(response.data);
} catch (error) {
  Alert.alert("Lỗi", "Không thể tải dữ liệu");
} finally {
  pagination.setLoading(false);
}
```

### 4. **Search với Pagination**

- Reset về page 1 khi search
- Debounce search input (300-500ms)
- Clear search để quay về data đầy đủ

---

## 🐛 Troubleshooting

### Problem: Duplicate API calls

**Solution**: Use `useRef` để track loading state

```tsx
const loadingRef = useRef(false);

const loadData = async () => {
  if (loadingRef.current) return;
  loadingRef.current = true;

  try {
    // API call
  } finally {
    loadingRef.current = false;
  }
};
```

### Problem: onEndReached bị gọi nhiều lần

**Solution**: Set `onEndReachedThreshold` phù hợp (0.5) và check `hasMore`

```tsx
<FlatList
  onEndReached={() => {
    if (infiniteScroll.hasMore && !infiniteScroll.loadingMore) {
      infiniteScroll.loadMore();
    }
  }}
  onEndReachedThreshold={0.5}
/>
```

---

## 📚 References

- [API Migration Guide](./MIGRATION_GUIDE.md)
- [Pagination Components](../src/components/common/)
- [Example Screens](../src/screens/management/)
- [Custom Hooks](../src/hooks/)

---

**Last Updated**: 2026-02-03  
**Version**: 1.0.0  
**Author**: Development Team
