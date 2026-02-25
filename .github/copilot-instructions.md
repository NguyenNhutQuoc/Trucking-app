# GitHub Copilot Instructions — Trucking App (DTS)

## Project Overview

This is a **React Native / Expo** mobile application for truck-weighing station management ("Quản Lý Cân Xe"). It uses **Expo Router (file-based routing)** and targets iOS & Android. The backend is a **.NET REST API** at `http://canxetaiapi.dulieucan.com/api/v1`.

---

## Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Framework      | React Native 0.81 + Expo ~54                        |
| Routing        | expo-router ~6 (file-based, app/ directory)         |
| Language       | TypeScript 5.9 (strict)                             |
| State (global) | Zustand 5                                           |
| State (server) | Custom hooks + axios                                |
| HTTP client    | Axios 1.9 with interceptors                         |
| Local storage  | AsyncStorage                                        |
| Navigation     | @react-navigation v7 (stack, bottom-tabs, top-tabs) |
| Styling        | StyleSheet (no Tailwind/NativeWind)                 |
| Charts         | react-native-chart-kit + react-native-svg           |
| Date utils     | date-fns 4                                          |
| Icons          | @expo/vector-icons                                  |

---

## Project Structure

```
app/              ← Expo Router pages (file-based routes)
  (auth)/         ← Unauthenticated screens
  (main)/         ← Authenticated screens
    (management)/ ← CRUD management screens
    (reports)/    ← Report screens
    (weighing)/   ← Weighing operation screens
src/
  api/            ← Axios API modules (one file per domain)
  components/     ← Reusable UI components
    common/       ← Generic UI (Button, Card, Input, Table, Pagination…)
    charts/       ← Chart components
    forms/        ← Form components
    lists/        ← List/FlatList components
  constants/      ← colors.ts, config.ts, routes.ts, typography.ts
  contexts/       ← AuthContext, ThemeContext
  hooks/          ← Custom hooks
  screens/        ← Screen-level logic components
  store/          ← Zustand stores
  styles/         ← Shared StyleSheet objects
  types/          ← TypeScript interfaces (api.types.ts, navigation.types.ts)
  utils/          ← date.ts, formatters.ts, validators.ts
```

---

## Core Conventions

### TypeScript

- Always use TypeScript. No `any` unless unavoidable; prefer `unknown` + type guard.
- Define all API shapes in `src/types/api.types.ts`.
- Use `interface` for object shapes, `type` for unions/aliases.
- All React components must be typed with `React.FC<Props>` or explicit return type.

### API Layer (`src/api/`)

- One file per domain: `auth.ts`, `weighing.ts`, `vehicle.ts`, etc.
- All responses follow `ApiResponse<T>` or `ApiPaginatedResponse<T>` from `api.types.ts`.
- Authentication uses `x-session-token` / `X-Session-Token` / `Authorization: Bearer` headers — all set automatically by the axios interceptor in `src/api/api.ts`.
- Never call `axios` directly in a screen; always go through a function in `src/api/`.
- Handle errors with `try/catch`; extract the `message` from `error.response?.data?.message`.

```typescript
// Correct pattern
const response = await weighingApi.getList({ page: 1, pageSize: 20 });
if (response.data.success) {
  /* use response.data.data */
}
```

### Authentication (`src/contexts/AuthContext.tsx`)

The app has a 3-level auth flow:

1. **Tenant login** → gets `sessionToken` + list of stations (`TramCan[]`)
2. **Station selection** → `selectStation(sessionToken, tramCanId)`
3. **Station user login** → `stationUserLogin(nvId, password)`

`AuthLevel` = `"none" | "tenant" | "station" | "full"`

Always consume auth via the `useAuth()` hook; never read AsyncStorage directly for auth data.

### Theming (`src/contexts/ThemeContext.tsx`)

- Support light/dark mode. Use `useAppTheme()` hook to get `colors` and `isDarkMode`.
- Never hardcode color values in components; always reference `colors.*` from the theme.
- Use `ThemedText` and `ThemedView` from `src/components/common/` for themed text/containers.

### Pagination

Use the `usePagination<T>()` hook from `src/hooks/usePagination.ts` for all list screens.

- `PaginationParams`: `{ page, pageSize }` — pass to every GET list API call.
- `PaginatedResponse<T>`: `{ items, totalCount, page, pageSize, totalPages, hasPrevious, hasNext }`.
- Render `<Pagination />` and `<PageSizeSelector />` from `src/components/common/` for navigation controls.

### Navigation

- **Expo Router** is the source of truth. Use `useRouter()` / `<Link>` from `expo-router`.
- Authenticated vs. unauthenticated routing is handled inside `app/_layout.tsx` and `app/(auth)/_layout.tsx`.
- Type route params with the types in `src/types/navigation.types.ts`.

### Components

- Keep components in `src/components/`. Screen-level logic lives in `src/screens/`.
- Reuse common components: `Button`, `Card`, `Input`, `Table`, `Loading`, `EmptyState`, `Skeleton`, `Toast`, `ResultModal`, `Pagination`.
- Use `StyleSheet.create()` at the bottom of every component file.
- Follow existing naming: `PascalCase` for components, `camelCase` for hooks (prefix `use`).

### Custom Hooks

Prefer custom hooks for data-fetching and business logic:

- `useAuth()` — auth state
- `useAppTheme()` — current theme + colors
- `usePagination<T>()` — list pagination state
- `useInfiniteScroll` — infinite-scroll lists
- `useReportFilters` — report filter state
- `useTokenExpired` — expired session handling

---

## Naming Conventions

| Item                      | Convention              | Example                 |
| ------------------------- | ----------------------- | ----------------------- |
| Component file            | PascalCase              | `VehicleCard.tsx`       |
| Screen file (Expo Router) | kebab-case              | `station-selection.tsx` |
| Hook                      | camelCase, `use` prefix | `useVehicleList.ts`     |
| API function              | camelCase               | `vehicleApi.getList()`  |
| Type / Interface          | PascalCase              | `VehicleResponse`       |
| Constant                  | SCREAMING_SNAKE_CASE    | `API_TIMEOUT`           |
| Style variable            | camelCase               | `styles.container`      |

---

## Vietnamese Domain Terms (do not translate)

| Term                    | Meaning              |
| ----------------------- | -------------------- |
| `TramCan`               | Weighing station     |
| `KhachHang`             | Customer / Tenant    |
| `NhanVien` / `Nhanvien` | Employee / Staff     |
| `XeVao` / `XeRa`        | Vehicle entry / exit |
| `PhieuCan`              | Weighing ticket      |
| `SanPham`               | Product              |
| `XeHang`                | Cargo truck          |
| `NhomQuyen`             | Permission group     |
| `MaKhachHang`           | Customer/Tenant code |

---

## Do / Don't

**Do:**

- Use `@/` path alias (mapped to `src/`) — e.g., `import { colors } from "@/constants/colors"`.
- Wrap async calls in `try/catch` and show user-friendly errors with `Toast` or `Alert`.
- Always handle loading + empty + error states in list screens.
- Use `date-fns` for all date formatting/parsing (not `moment`).
- Use `StyleSheet.create()`, not inline style objects.

**Don't:**

- Don't use `React.memo` / `useCallback` prematurely — only when profiling proves it necessary.
- Don't import from `react-navigation` directly — use the wrappers in `src/navigation/` or Expo Router.
- Don't store sensitive data in component state — use `AsyncStorage` for persistence and `AuthContext` for runtime.
- Don't add new dependencies without checking if an existing utility already covers the need.
- Don't use `console.log` in production paths — use them only with a clear debug comment.
