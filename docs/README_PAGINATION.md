# 📄 Pagination Feature - README

## 🎉 Tổng quan

Ứng dụng Trucking đã được tích hợp **đầy đủ** tính năng **Pagination** (phân trang) cho tất cả các danh sách dữ liệu, hỗ trợ 2 patterns chính:

1. ✅ **Pagination với Buttons** - Phù hợp Desktop/Tablet
2. ✅ **Infinite Scroll** - Phù hợp Mobile

---

## 📦 Các thành phần đã implement

### 🔧 Core Infrastructure

- [x] Types & Interfaces (`PaginatedResponse`, `PaginationParams`)
- [x] API Functions mới cho 6 endpoints (products, customers, vehicles, users, weighings, permissions)
- [x] 2 Custom Hooks (`usePagination`, `useInfiniteScroll`)
- [x] 3 UI Components (`Pagination`, `PageSizeSelector`, `LoadMoreButton`)

### 📱 Example Screens

- [x] ProductListWithPagination (Desktop-like pattern)
- [x] ProductListInfiniteScroll (Mobile-first pattern)

### 📚 Documentation

- [x] Full Guide (PAGINATION_GUIDE.md)
- [x] Quick Start (PAGINATION_QUICK_START.md)
- [x] Implementation Summary (PAGINATION_IMPLEMENTATION.md)

---

## 🚀 Bắt đầu nhanh

### Bước 1: Chọn Pattern

```
Pagination Buttons (Desktop)          Infinite Scroll (Mobile)
┌────────────────────────┐           ┌────────────────────────┐
│ [<] 1 2 3 ... 10 [>]  │           │  ▼ Scroll to load...   │
└────────────────────────┘           │  [Load More Button]    │
                                     └────────────────────────┘
```

### Bước 2: Copy Example

**Pagination Buttons:**

```bash
# Copy từ
src/screens/management/ProductListWithPagination.tsx
```

**Infinite Scroll:**

```bash
# Copy từ
src/screens/management/ProductListInfiniteScroll.tsx
```

### Bước 3: Customize

1. Replace `productApi` với API service bạn cần
2. Update type `<Hanghoa>` với type của bạn
3. Customize UI theo design
4. Done! 🎉

---

## 📖 Documentation

| Document                                             | Mô tả                       | Đọc khi nào     |
| ---------------------------------------------------- | --------------------------- | --------------- |
| [**Quick Start**](./PAGINATION_QUICK_START.md)       | Bắt đầu nhanh với templates | ⭐ Đọc đầu tiên |
| [**Full Guide**](./PAGINATION_GUIDE.md)              | Documentation đầy đủ        | Cần hiểu sâu    |
| [**Implementation**](./PAGINATION_IMPLEMENTATION.md) | Tổng quan implementation    | Để reference    |

---

## 🎯 Pattern Selection Guide

| Tiêu chí       | Pagination Buttons      | Infinite Scroll     |
| -------------- | ----------------------- | ------------------- |
| **Platform**   | Desktop, Tablet         | Mobile              |
| **UX Style**   | Traditional, Controlled | Modern, Seamless    |
| **Use Case**   | Admin panels, Tables    | Feeds, Social media |
| **Page Size**  | 10-20 items             | 20-30 items         |
| **Complexity** | Medium                  | Low                 |

---

## 💻 Code Examples

### Pagination Buttons (3 steps)

```tsx
// 1. Setup
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/common/Pagination";

const pagination = usePagination<Product>({
  initialPageSize: 10,
  onPageChange: (page) => loadData(page, pagination.pageSize),
});

// 2. Load data
const loadData = async (page: number, pageSize: number) => {
  pagination.setLoading(true);
  const response = await api.getProducts({ page, pageSize });
  pagination.setData(response.data);
  pagination.setLoading(false);
};

// 3. Render
<FlatList data={pagination.items} />
<Pagination {...pagination} />
```

### Infinite Scroll (3 steps)

```tsx
// 1. Setup
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import LoadMoreButton from "@/components/common/LoadMoreButton";

const scroll = useInfiniteScroll<Product>({
  initialPageSize: 20,
  onLoadMore: handleLoadMore,
});

// 2. Load more
const handleLoadMore = async () => {
  scroll.setLoadingMore(true);
  const response = await api.getProducts({
    page: scroll.currentPage + 1,
    pageSize: scroll.pageSize,
  });
  scroll.appendData(response.data);
  scroll.setLoadingMore(false);
};

// 3. Render
<FlatList
  data={scroll.allItems}
  onEndReached={scroll.loadMore}
  ListFooterComponent={<LoadMoreButton {...props} />}
/>;
```

---

## 🔧 API Functions

Tất cả các API services đã có function mới:

```typescript
// OLD (Deprecated)
productApi.getAllProducts(); // ❌ Deprecated

// NEW (With Pagination)
productApi.getProducts({
  page: 1,
  pageSize: 10,
}); // ✅ Use this
```

**Available APIs:**

- `productApi.getProducts()` - Hàng hóa
- `customerApi.getCustomers()` - Khách hàng
- `vehicleApi.getVehicles()` - Xe
- `userApi.getUsers()` - Nhân viên
- `weighingApi.getWeighings()` - Phiếu cân
- `permissionApi.getGroups()` - Nhóm quyền

---

## 🎨 UI Components

### 1. Pagination

```tsx
<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={(page) => loadPage(page)}
  hasPrevious={false}
  hasNext={true}
  totalCount={100}
  pageSize={10}
/>
```

**Output**: `Hiển thị 1-10 của 100 mục` + `[<] 1 2 3 ... 10 [>]`

### 2. PageSizeSelector

```tsx
<PageSizeSelector
  pageSize={10}
  onPageSizeChange={(size) => changeSize(size)}
  options={[10, 20, 50, 100]}
/>
```

**Output**: `Hiển thị: [10] [20] [50] [100] / trang`

### 3. LoadMoreButton

```tsx
<LoadMoreButton
  onLoadMore={loadMore}
  loading={false}
  hasMore={true}
  currentCount={20}
  totalCount={100}
/>
```

**Output**: `[↓] Tải thêm (20/100)` hoặc `[✓] Đã hiển thị tất cả 100 mục`

---

## 📊 Response Format

```typescript
interface PaginatedResponse<T> {
  items: T[]; // Data items
  totalCount: number; // Total items in database
  page: number; // Current page (1-based)
  pageSize: number; // Items per page
  totalPages: number; // Total pages
  hasPrevious: boolean; // Can go to previous page
  hasNext: boolean; // Can go to next page
}
```

**Example:**

```json
{
  "success": true,
  "data": {
    "items": [...],
    "totalCount": 150,
    "page": 2,
    "pageSize": 10,
    "totalPages": 15,
    "hasPrevious": true,
    "hasNext": true
  }
}
```

---

## ✅ Migration Checklist

Migrate screen cũ sang pagination:

```
Preparation:
[ ] Đọc Quick Start Guide
[ ] Quyết định pattern (Pagination vs Infinite Scroll)
[ ] Backup code cũ

Implementation:
[ ] Import hook + components
[ ] Replace getAllXXX() → getXXX({ page, pageSize })
[ ] Setup hook với config
[ ] Update load function
[ ] Add UI components

Testing:
[ ] Test load first page
[ ] Test navigation/load more
[ ] Test pull-to-refresh
[ ] Test empty state
[ ] Test errors
[ ] Test search (if any)

Cleanup:
[ ] Remove old code
[ ] Update imports
[ ] Test toàn bộ flow
```

---

## 🐛 Common Issues & Solutions

### Issue: Duplicate API calls

```tsx
// ❌ BAD
useEffect(() => loadData(), []);
useFocusEffect(() => loadData()); // Duplicate!

// ✅ GOOD
useFocusEffect(useCallback(() => loadData(), []));
```

### Issue: onEndReached fires multiple times

```tsx
// ✅ Solution
<FlatList
  onEndReached={() => {
    if (scroll.hasMore && !scroll.loadingMore) {
      scroll.loadMore();
    }
  }}
  onEndReachedThreshold={0.5}
/>
```

### Issue: Reset page on search

```tsx
// ✅ Always reset to page 1 when searching
const handleSearch = (query: string) => {
  setSearchQuery(query);
  loadData(1, pageSize); // ← page 1
};
```

---

## 🎯 Best Practices

### ✅ DO

- Use `pageSize: 20` for infinite scroll
- Use `pageSize: 10` for pagination buttons
- Always handle loading states
- Always handle empty states
- Check `hasMore` before loading
- Reset to page 1 on search
- Use pull-to-refresh

### ❌ DON'T

- Don't use `pageSize > 100`
- Don't load more when already loading
- Don't forget error handling
- Don't skip loading indicators
- Don't duplicate API calls

---

## 📂 File Structure

```
src/
├── types/
│   └── api.types.ts                    (Updated)
├── api/
│   ├── product.ts                      (Updated)
│   ├── customer.ts                     (Updated)
│   ├── vehicle.ts                      (Updated)
│   ├── user.ts                         (Updated)
│   ├── weighing.ts                     (Updated)
│   └── permission.ts                   (Updated)
├── hooks/
│   ├── usePagination.ts                (New)
│   └── useInfiniteScroll.ts            (New)
├── components/common/
│   ├── Pagination.tsx                  (New)
│   ├── PageSizeSelector.tsx            (New)
│   └── LoadMoreButton.tsx              (New)
└── screens/management/
    ├── ProductListWithPagination.tsx   (New - Example)
    └── ProductListInfiniteScroll.tsx   (New - Example)

docs/
├── PAGINATION_GUIDE.md                 (New)
├── PAGINATION_QUICK_START.md           (New)
├── PAGINATION_IMPLEMENTATION.md        (New)
└── README.md                           (This file)
```

---

## 🚀 Quick Links

- 📖 [Quick Start Guide](./PAGINATION_QUICK_START.md) - Bắt đầu nhanh
- 📚 [Full Documentation](./PAGINATION_GUIDE.md) - Tài liệu đầy đủ
- 🔍 [Implementation Details](./PAGINATION_IMPLEMENTATION.md) - Chi tiết kỹ thuật
- 💻 [Example: Pagination](../src/screens/management/ProductListWithPagination.tsx)
- 💻 [Example: Infinite Scroll](../src/screens/management/ProductListInfiniteScroll.tsx)

---

## 📞 Support

Nếu cần hỗ trợ:

1. Đọc [Quick Start](./PAGINATION_QUICK_START.md) trước
2. Xem [Example Screens](../src/screens/management/)
3. Check [Common Issues](#-common-issues--solutions)
4. Đọc [Full Guide](./PAGINATION_GUIDE.md)

---

## ✨ Features

- [x] ✅ TypeScript support đầy đủ
- [x] ✅ Type-safe với generics
- [x] ✅ Themeable components
- [x] ✅ Loading states
- [x] ✅ Error handling
- [x] ✅ Empty states
- [x] ✅ Pull-to-refresh
- [x] ✅ Search integration ready
- [x] ✅ Performance optimized
- [x] ✅ Mobile responsive
- [x] ✅ Accessibility ready

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2026-02-03

**Happy Coding!** 🎉
