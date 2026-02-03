# 📱 PAGINATION IMPLEMENTATION SUMMARY

## ✅ Đã hoàn thành

### 1. **Core Types & Interfaces** ✅

**File**: `src/types/api.types.ts`

```typescript
// Thêm 3 interfaces mới:
-PaginatedResponse <
  T > // Response wrapper với pagination metadata
  -PaginationParams - // Request params (page, pageSize)
    ApiPaginatedResponse<T>; // API response wrapper
```

### 2. **API Services Updated** ✅

Tất cả 6 API services đã được cập nhật:

| File                    | Function Mới     | Deprecated          |
| ----------------------- | ---------------- | ------------------- |
| `src/api/product.ts`    | `getProducts()`  | `getAllProducts()`  |
| `src/api/customer.ts`   | `getCustomers()` | `getAllCustomers()` |
| `src/api/vehicle.ts`    | `getVehicles()`  | `getAllVehicles()`  |
| `src/api/user.ts`       | `getUsers()`     | `getAllUsers()`     |
| `src/api/weighing.ts`   | `getWeighings()` | `getAllWeighings()` |
| `src/api/permission.ts` | `getGroups()`    | `getAllGroups()`    |

> **Note**: Functions cũ vẫn hoạt động nhưng đã được mark `@deprecated`

### 3. **Custom Hooks** ✅

#### `src/hooks/usePagination.ts`

- Dùng cho: **Pagination với buttons** (Desktop-like)
- Features:
  - Page navigation (goToPage, nextPage, previousPage)
  - Page size management
  - Loading states (loading, refreshing)
  - Auto-calculate totalPages, hasNext, hasPrevious

#### `src/hooks/useInfiniteScroll.ts`

- Dùng cho: **Infinite scroll/Load more** (Mobile-first)
- Features:
  - Append data mechanism
  - Load more functionality
  - Auto-prevent duplicate calls
  - Refresh to reset

### 4. **UI Components** ✅

#### `src/components/common/Pagination.tsx`

- Pagination controls với page numbers
- Previous/Next buttons
- Smart ellipsis (...) cho nhiều pages
- Info text: "Hiển thị 1-10 của 150 mục"
- Responsive & themeable

#### `src/components/common/PageSizeSelector.tsx`

- Selector để chọn items per page
- Default options: [10, 20, 50, 100]
- Radio-style buttons
- Label: "Hiển thị: [10] [20] [50] [100] / trang"

#### `src/components/common/LoadMoreButton.tsx`

- Button "Tải thêm" cho infinite scroll
- Auto-show/hide based on hasMore
- Loading indicator
- End message khi hết data

### 5. **Example Screens** ✅

#### `src/screens/management/ProductListWithPagination.tsx`

- ✨ **Full implementation** của pagination với buttons
- Features:
  - Page navigation controls
  - Page size selector
  - Pull-to-refresh
  - Search functionality
  - CRUD operations
  - Empty state
  - Loading states

#### `src/screens/management/ProductListInfiniteScroll.tsx`

- ✨ **Full implementation** của infinite scroll
- Features:
  - Auto-load on scroll bottom
  - Load more button
  - Pull-to-refresh
  - Search functionality
  - CRUD operations
  - Empty state
  - Loading states

### 6. **Documentation** ✅

#### `docs/PAGINATION_GUIDE.md`

- Comprehensive documentation
- API reference
- Component props reference
- Hooks reference
- Best practices
- Troubleshooting guide
- Migration checklist

#### `docs/PAGINATION_QUICK_START.md`

- Quick start guide
- Copy-paste templates
- Common pitfalls
- Checklists
- Pattern selection guide

---

## 📊 Tổng quan Files

### Files mới tạo (10 files):

```
src/
├── hooks/
│   ├── usePagination.ts                    ✅ NEW
│   └── useInfiniteScroll.ts                ✅ NEW
├── components/common/
│   ├── Pagination.tsx                      ✅ NEW
│   ├── PageSizeSelector.tsx                ✅ NEW
│   └── LoadMoreButton.tsx                  ✅ NEW
└── screens/management/
    ├── ProductListWithPagination.tsx       ✅ NEW
    └── ProductListInfiniteScroll.tsx       ✅ NEW

docs/
├── PAGINATION_GUIDE.md                     ✅ NEW
└── PAGINATION_QUICK_START.md               ✅ NEW
```

### Files đã cập nhật (7 files):

```
src/
├── types/
│   └── api.types.ts                        ✅ UPDATED
└── api/
    ├── product.ts                          ✅ UPDATED
    ├── customer.ts                         ✅ UPDATED
    ├── vehicle.ts                          ✅ UPDATED
    ├── user.ts                             ✅ UPDATED
    ├── weighing.ts                         ✅ UPDATED
    └── permission.ts                       ✅ UPDATED
```

---

## 🚀 Cách sử dụng

### Option 1: Pagination Buttons (Desktop-like)

```tsx
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/common/Pagination";

const pagination = usePagination<Hanghoa>({
  initialPageSize: 10,
  onPageChange: (page) => loadData(page),
});

// Render
<Pagination {...pagination} />;
```

### Option 2: Infinite Scroll (Mobile-first)

```tsx
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import LoadMoreButton from "@/components/common/LoadMoreButton";

const infiniteScroll = useInfiniteScroll<Hanghoa>({
  initialPageSize: 20,
  onLoadMore: handleLoadMore,
});

// Render
<FlatList
  data={infiniteScroll.allItems}
  onEndReached={infiniteScroll.loadMore}
  ListFooterComponent={<LoadMoreButton {...props} />}
/>;
```

---

## 📋 Next Steps

### Để migrate các screens hiện có:

1. **Chọn pattern** (Pagination buttons hoặc Infinite scroll)
2. **Copy từ example screen** phù hợp
3. **Update API calls** từ `getAllXXX()` sang `getXXX({ page, pageSize })`
4. **Replace state management** với hook tương ứng
5. **Thêm UI components** (Pagination hoặc LoadMoreButton)
6. **Test thoroughly**

### Screens cần migrate:

- [ ] `ProductListScreen.tsx` (có sẵn rồi, cần replace)
- [ ] `CompanyListScreen.tsx`
- [ ] `VehicleListScreen.tsx`
- [ ] `UserListScreen.tsx`
- [ ] Các list screens khác trong `src/screens/`

---

## 🎯 Recommended Pattern

| Screen Type   | Pattern         | PageSize |
| ------------- | --------------- | -------- |
| Product List  | Infinite Scroll | 20       |
| Customer List | Infinite Scroll | 20       |
| Vehicle List  | Pagination      | 10       |
| User List     | Pagination      | 10       |
| Weighing List | Infinite Scroll | 30       |
| Reports       | Pagination      | 10       |

---

## 🔧 API Response Format

**Before (Old)**:

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Product 1" },
    { "id": 2, "name": "Product 2" }
  ]
}
```

**After (New)**:

```json
{
  "success": true,
  "data": {
    "items": [
      { "id": 1, "name": "Product 1" },
      { "id": 2, "name": "Product 2" }
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

## 💡 Tips

### Performance:

- ✅ Dùng `pageSize: 20` cho infinite scroll
- ✅ Dùng `pageSize: 10` cho pagination buttons
- ❌ Tránh dùng `pageSize > 100`

### UX:

- ✅ Luôn có pull-to-refresh
- ✅ Hiển thị loading state rõ ràng
- ✅ Handle empty state tốt
- ✅ Show total count để user biết có bao nhiêu items

### Code:

- ✅ Dùng `useFocusEffect` cho screens cần refresh khi focus
- ✅ Check `hasMore` trước khi load more
- ✅ Handle errors gracefully
- ✅ Use TypeScript generics cho type safety

---

## 📚 Resources

- **Full Guide**: [docs/PAGINATION_GUIDE.md](./PAGINATION_GUIDE.md)
- **Quick Start**: [docs/PAGINATION_QUICK_START.md](./PAGINATION_QUICK_START.md)
- **Example 1**: [ProductListWithPagination.tsx](../src/screens/management/ProductListWithPagination.tsx)
- **Example 2**: [ProductListInfiniteScroll.tsx](../src/screens/management/ProductListInfiniteScroll.tsx)

---

## ✅ Status: **READY FOR USE**

Tất cả components, hooks, và examples đã sẵn sàng để sử dụng!

**Để bắt đầu**:

1. Đọc [Quick Start Guide](./PAGINATION_QUICK_START.md)
2. Copy từ example screen phù hợp
3. Customize theo nhu cầu của bạn

---

**Version**: 1.0.0  
**Date**: 2026-02-03  
**Status**: ✅ Complete & Production Ready
