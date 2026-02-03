# ✅ .NET API Compatibility Checklist

## 🎯 Quick Reference - Những gì đã thay đổi

### 1️⃣ Response Structure Changes

| Old (Node.js)                | New (.NET)                                | Impact      |
| ---------------------------- | ----------------------------------------- | ----------- |
| `{ success, message, data }` | `{ success, message, data, statusCode }`  | ⚠️ Minor    |
| `data: [...]` (array)        | `data: { items: [...], totalCount, ... }` | 🔴 Breaking |
| `data.khachHang.maKhachHang` | `data.maKhachHang`                        | 🔴 Breaking |

### 2️⃣ Code Changes Required

```typescript
// ❌ OLD
const items = response.data; // Array direct
const maKH = response.data.khachHang.maKhachHang; // Nested

// ✅ NEW
const items = response.data.items; // Wrapped in pagination
const maKH = response.data.maKhachHang; // Flattened
const status = response.statusCode; // Optional field
```

---

## 📋 Implementation Checklist

### Phase 1: Types & Infrastructure ✅ COMPLETE

- [x] Update `ApiResponse<T>` interface
  - [x] Add `statusCode?: number` field
- [x] Add `PaginatedResponse<T>` interface
  - [x] Define `items`, `totalCount`, `page`, `pageSize`, etc.
- [x] Update Auth response types
  - [x] `TenantLoginResponse` - flatten khachHang
  - [x] `StationSelectionResponse` - add maTramCan, diaChi
  - [x] `SessionValidationResponse` - add statusCode
- [x] Add pagination support to API functions
  - [x] `productApi.getProducts()`
  - [x] `customerApi.getCustomers()`
  - [x] `vehicleApi.getVehicles()`
  - [x] `userApi.getUsers()`
  - [x] `weighingApi.getWeighings()`
  - [x] `permissionApi.getGroups()`

### Phase 2: Screens Migration 🚧 TODO

#### Management Screens

- [ ] **ProductListScreen.tsx**

  ```typescript
  // Change from:
  const response = await productApi.getAllProducts();
  setProducts(response.data);

  // To:
  const response = await productApi.getProducts({ page: 1, pageSize: 20 });
  pagination.setData(response.data);
  ```

- [ ] **CompanyListScreen.tsx**

  - [ ] Update API call to `getCustomers()`
  - [ ] Add pagination hook
  - [ ] Update render logic

- [ ] **VehicleListScreen.tsx**

  - [ ] Update API call to `getVehicles()`
  - [ ] Add pagination hook
  - [ ] Update render logic

- [ ] **UserListScreen.tsx**

  - [ ] Update API call to `getUsers()`
  - [ ] Add pagination hook
  - [ ] Update render logic

- [ ] **GroupPermissionListScreen.tsx**
  - [ ] Update API call to `getGroups()`
  - [ ] Add pagination hook
  - [ ] Update render logic

#### Weighing Screens

- [ ] **WeighingListScreen.tsx**

  - [ ] Update API call to `getWeighings()`
  - [ ] Implement infinite scroll or pagination
  - [ ] Test with large datasets

- [ ] **CompletedWeighingsScreen.tsx**

  - [ ] Update to use pagination
  - [ ] Add filters if needed

- [ ] **PendingWeighingsScreen.tsx**
  - [ ] Update to use pagination
  - [ ] Add filters if needed

#### Auth Screens

- [ ] **LoginScreen.tsx**

  - [ ] Verify tenant login response handling
  - [ ] Update to use flattened khachHang data
  - [ ] Test error scenarios

- [ ] **StationSelectionScreen.tsx**
  - [ ] Verify station selection response
  - [ ] Handle new dbConfig field
  - [ ] Test with multiple stations

### Phase 3: Context & Hooks 🚧 TODO

- [ ] **AuthContext.tsx**

  ```typescript
  // Update tenant info handling
  const tenantInfo = {
    maKhachHang: response.data.maKhachHang, // Flattened
    tenKhachHang: response.data.tenKhachHang, // Flattened
    khachHangId: response.data.khachHangId,
  };
  ```

- [ ] **API Interceptors**
  - [ ] Log statusCode if present
  - [ ] Handle errors based on statusCode
  - [ ] Add retry logic for specific codes

### Phase 4: Testing 🚧 TODO

- [ ] **Unit Tests**

  - [ ] Test pagination hooks
  - [ ] Test API response parsing
  - [ ] Test error handling

- [ ] **Integration Tests**

  - [ ] Test list screens with real data
  - [ ] Test auth flow end-to-end
  - [ ] Test pagination edge cases

- [ ] **Manual Testing**
  - [ ] Test each migrated screen
  - [ ] Test with empty data
  - [ ] Test with large datasets
  - [ ] Test error scenarios

---

## 🔍 Testing Checklist

### Per Screen Testing

For each screen you migrate, test:

- [ ] Initial load works
- [ ] Pagination/infinite scroll works
- [ ] Pull-to-refresh works
- [ ] Search works (if applicable)
- [ ] Empty state shows correctly
- [ ] Error state shows correctly
- [ ] Loading state shows correctly
- [ ] Create/Edit/Delete operations work

### Auth Flow Testing

- [ ] Tenant login successful
- [ ] Tenant login with wrong credentials
- [ ] Station selection successful
- [ ] Session validation works
- [ ] Logout works
- [ ] Token refresh works

---

## 📊 Progress Tracking

| Component              | Status  | Assignee | ETA |
| ---------------------- | ------- | -------- | --- |
| **Types**              | ✅ Done | -        | -   |
| **API Functions**      | ✅ Done | -        | -   |
| **Hooks**              | ✅ Done | -        | -   |
| **Components**         | ✅ Done | -        | -   |
| ProductListScreen      | 🔲 Todo | -        | -   |
| CompanyListScreen      | 🔲 Todo | -        | -   |
| VehicleListScreen      | 🔲 Todo | -        | -   |
| UserListScreen         | 🔲 Todo | -        | -   |
| WeighingListScreen     | 🔲 Todo | -        | -   |
| LoginScreen            | 🔲 Todo | -        | -   |
| StationSelectionScreen | 🔲 Todo | -        | -   |
| AuthContext            | 🔲 Todo | -        | -   |
| Testing                | 🔲 Todo | -        | -   |

**Legend:**

- ✅ Done
- 🚧 In Progress
- 🔲 Todo
- ⏸️ Blocked

---

## 🚨 Known Issues

### Issue 1: Double nested data structure

**Problem:** Một số nơi đang dùng `response.data.data`  
**Solution:** Cần kiểm tra và fix thành `response.data`  
**Locations:**

- `src/api/api.ts` line 64
- `src/api/auth.ts` lines 187, 189, 220, 225, 226
- `src/api/weighing.ts` line 295

### Issue 2: Array type annotations

**Problem:** `ApiResponse<T[]>` instead of `ApiPaginatedResponse<T>`  
**Solution:** Update function signatures  
**Locations:**

- All `getAll*()` functions in API files (already marked deprecated)

---

## 💡 Quick Tips

### 1. Use the new pagination hooks

```typescript
import { usePagination } from "@/hooks/usePagination";
// or
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
```

### 2. Copy from examples

Check these working examples:

- `src/screens/management/ProductListWithPagination.tsx`
- `src/screens/management/ProductListInfiniteScroll.tsx`

### 3. Test incrementally

- Migrate 1 screen at a time
- Test thoroughly before moving to next
- Keep old code commented out initially

### 4. Handle statusCode gracefully

```typescript
if (response.statusCode && __DEV__) {
  console.log("API Status:", response.statusCode);
}
```

---

## 📞 Support

**Documentation:**

- [Full Migration Guide](./API_MIGRATION_STATUS.md)
- [Pagination Guide](./PAGINATION_GUIDE.md)
- [Quick Start](./PAGINATION_QUICK_START.md)

**Questions?**

- Check example screens first
- Review migration guide
- Test with .NET API

---

**Last Updated:** 2026-02-03  
**Next Review:** After Phase 2 completion
