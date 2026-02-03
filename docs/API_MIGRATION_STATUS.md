# 🔄 API Migration: Node.js → .NET - Mobile App Updates

## 📋 Summary of Changes

Ứng dụng mobile đã được cập nhật để tương thích với .NET API backend mới.

### ✅ Đã cập nhật

#### 1. Types & Interfaces (api.types.ts)

**ApiResponse**

```typescript
// OLD (Node.js compatible)
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// NEW (.NET compatible) ✅
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode?: number; // ← ADDED
}
```

**PaginatedResponse**

```typescript
// ADDED - Cho .NET pagination
interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

interface ApiPaginatedResponse<T> {
  success: boolean;
  message: string;
  data: PaginatedResponse<T>; // ← Wrapped
  statusCode?: number; // ← ADDED
}
```

#### 2. Auth Types (auth.ts)

**TenantLoginResponse**

```typescript
// OLD
interface TenantLoginResponse {
  data: {
    sessionToken: string;
    khachHang: { id, ma, ten };
    tramCans: [...];
  }
}

// NEW ✅
interface TenantLoginResponse {
  data: {
    sessionToken: string;
    khachHangId: number;  // ← Flattened
    maKhachHang: string;  // ← Flattened
    tenKhachHang: string; // ← Flattened
    tramCans: [...];
  };
  statusCode?: number;  // ← ADDED
}
```

**StationSelectionResponse**

```typescript
// OLD
interface StationSelectionResponse {
  data: {
    sessionToken: string;
    selectedStation: { id, tenTramCan };
    khachHang: { ma, ten };
  }
}

// NEW ✅
interface StationSelectionResponse {
  data: {
    sessionToken: string;
    selectedStation: {
      id: number;
      maTramCan: string;   // ← ADDED
      tenTramCan: string;
      diaChi: string;      // ← ADDED
    };
    dbConfig?: {...};      // ← ADDED (optional)
  };
  statusCode?: number;     // ← ADDED
}
```

#### 3. API Functions

**Pagination Functions** (product.ts, customer.ts, etc.)

```typescript
// OLD - Deprecated
getAllProducts(): Promise<ApiResponse<Hanghoa[]>>

// NEW - Primary ✅
getProducts(params?: PaginationParams): Promise<ApiPaginatedResponse<Hanghoa>>
```

---

## 🎯 Breaking Changes

### 1. List Endpoints - Pagination Required

**Các endpoints bị ảnh hưởng:**

- `/api/v1/hanghoa` (GET)
- `/api/v1/khachhang` (GET)
- `/api/v1/soxe` (GET)
- `/api/v1/nhanvien` (GET)
- `/api/v1/phieucan` (GET)
- `/api/v1/nhomquyen` (GET)

**Code Changes:**

```typescript
// ❌ OLD (Node.js) - KHÔNG DÙNG NỮA
const response = await productApi.getAllProducts();
const items = response.data; // Array trực tiếp

// ✅ NEW (.NET) - DÙNG CÁI NÀY
const response = await productApi.getProducts({ page: 1, pageSize: 20 });
const items = response.data.items; // Nested trong object
const totalCount = response.data.totalCount;
const hasMore = response.data.hasNext;
```

### 2. Auth Response Structure

**Tenant Login:**

```typescript
// ❌ OLD
const response = await authApi.tenantLogin(credentials);
const khachHang = response.data.khachHang; // Nested object
const maKH = khachHang.maKhachHang;
const tenKH = khachHang.tenKhachHang;

// ✅ NEW
const response = await authApi.tenantLogin(credentials);
const maKH = response.data.maKhachHang; // Flattened
const tenKH = response.data.tenKhachHang; // Flattened
```

**Station Selection:**

```typescript
// ❌ OLD
const response = await authApi.selectStation(token, stationId);
const station = response.data.selectedStation;
const khachHang = response.data.khachHang;

// ✅ NEW
const response = await authApi.selectStation(token, stationId);
const station = response.data.selectedStation;
// khachHang info không còn trong response
// Có thể có dbConfig nếu cần
const dbConfig = response.data.dbConfig; // Optional
```

---

## 🔧 Migration Tasks

### ✅ Completed

- [x] Update `ApiResponse<T>` với `statusCode` field
- [x] Update `PaginatedResponse<T>` interface
- [x] Update `TenantLoginResponse` structure
- [x] Update `StationSelectionResponse` structure
- [x] Update `SessionValidationResponse` structure
- [x] Add pagination support cho 6 API services
- [x] Create pagination hooks (`usePagination`, `useInfiniteScroll`)
- [x] Create pagination UI components

### 🚧 TODO (Screens cần update)

**Priority HIGH - Các screens đang dùng list data:**

#### Management Screens

- [ ] `ProductListScreen.tsx` - Update sang `getProducts()`
- [ ] `CompanyListScreen.tsx` - Update sang `getCustomers()`
- [ ] `VehicleListScreen.tsx` - Update sang `getVehicles()`
- [ ] `UserListScreen.tsx` - Update sang `getUsers()`
- [ ] `GroupPermissionListScreen.tsx` - Update sang `getGroups()`

#### Weighing Screens

- [ ] `WeighingListScreen.tsx` - Update sang `getWeighings()`
- [ ] `CompletedWeighingsScreen.tsx` - Update sang `getWeighings({ status: 'completed' })`
- [ ] `PendingWeighingsScreen.tsx` - Update sang `getWeighings({ status: 'pending' })`

#### Auth/Context

- [ ] `AuthContext.tsx` - Verify tenant login response handling
- [ ] `LoginScreen.tsx` - Verify response structure
- [ ] `StationSelectionScreen.tsx` - Verify response structure

### Priority MEDIUM - Error handling

- [ ] Update error handling để check `statusCode`
- [ ] Add logging cho `statusCode` field
- [ ] Test error scenarios với .NET API

---

## 📝 Code Templates

### Template 1: Migrate List Screen với usePagination

```typescript
// ❌ OLD
const [items, setItems] = useState<Product[]>([]);
const [loading, setLoading] = useState(false);

const loadItems = async () => {
  setLoading(true);
  const response = await productApi.getAllProducts();
  setItems(response.data);
  setLoading(false);
};

// ✅ NEW
import { usePagination } from "@/hooks/usePagination";

const pagination = usePagination<Product>({
  initialPageSize: 20,
  onPageChange: (page) => loadItems(page, pagination.pageSize),
});

const loadItems = async (page: number, pageSize: number) => {
  pagination.setLoading(true);
  try {
    const response = await productApi.getProducts({ page, pageSize });
    pagination.setData(response.data);
  } finally {
    pagination.setLoading(false);
  }
};

// In render:
<FlatList data={pagination.items} />
<Pagination {...pagination} />
```

### Template 2: Handle statusCode

```typescript
// Optional: Log statusCode nếu có
const response = await api.someEndpoint();
if (response.statusCode) {
  console.log("API Status:", response.statusCode);
}

// Hoặc handle errors based on statusCode
if (!response.success && response.statusCode === 404) {
  Alert.alert("Không tìm thấy", response.message);
} else if (!response.success && response.statusCode === 401) {
  // Handle unauthorized
  await logout();
}
```

### Template 3: Update Auth Context

```typescript
// Update tenant info storage
const tenantLogin = async (credentials) => {
  const response = await authApi.tenantLogin(credentials);

  if (response.success) {
    // ✅ NEW structure
    const tenantInfo = {
      maKhachHang: response.data.maKhachHang,
      tenKhachHang: response.data.tenKhachHang,
      khachHangId: response.data.khachHangId,
    };

    await AsyncStorage.setItem("tenant_info", JSON.stringify(tenantInfo));
    await AsyncStorage.setItem("session_token", response.data.sessionToken);
  }
};
```

---

## ⚠️ Important Notes

### 1. Backward Compatibility

- Old `getAllXXX()` functions vẫn hoạt động nhưng **DEPRECATED**
- Nên migrate sang `getXXX()` càng sớm càng tốt
- Trong thời gian chuyển đổi, cả 2 có thể dùng song song

### 2. Testing Strategy

```typescript
// Test cả 2 endpoints trong development
if (__DEV__) {
  // Test old endpoint
  const oldResponse = await productApi.getAllProducts();
  console.log("Old format:", oldResponse.data);

  // Test new endpoint
  const newResponse = await productApi.getProducts({ page: 1, pageSize: 10 });
  console.log("New format:", newResponse.data.items);
}
```

### 3. Error Handling

```typescript
try {
  const response = await api.getData();
  if (!response.success) {
    console.error("API Error:", {
      message: response.message,
      statusCode: response.statusCode,
    });
  }
} catch (error) {
  console.error("Network Error:", error);
}
```

---

## 📊 Status

| Category          | Status         | Progress |
| ----------------- | -------------- | -------- |
| **Types**         | ✅ Complete    | 100%     |
| **API Functions** | ✅ Complete    | 100%     |
| **Hooks**         | ✅ Complete    | 100%     |
| **Components**    | ✅ Complete    | 100%     |
| **Screens**       | 🚧 In Progress | ~30%     |
| **Testing**       | 🚧 In Progress | ~20%     |

---

## 🎯 Next Steps

### This Week

1. Migrate ProductListScreen sang pagination
2. Test với .NET API backend
3. Verify auth flows

### Next Week

1. Migrate các list screens còn lại
2. Update error handling
3. Performance testing

### Later

1. Remove deprecated functions
2. Add analytics cho statusCode
3. Optimize caching

---

**Last Updated:** 2026-02-03  
**Status:** ✅ Types Updated, 🚧 Screens Migration In Progress
