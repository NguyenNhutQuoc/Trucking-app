// src/types/api.types.ts
// Các interface dựa trên OpenAPI spec từ file được cung cấp

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      nvId: string;
      tenNV: string;
      type: number;
      nhomId: number;
    };
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Phiếu cân
export interface Phieucan {
  stt: number;
  sophieu: number;
  soxe: string;
  makh: string;
  khachhang: string;
  mahang: string;
  loaihang: string;
  ngaycan1: string;
  ngaycan2: string;
  tlcan1: number;
  tlcan2?: number;
  xuatnhap: string;
  ghichu?: string;
  nhanvien: string;
  kho?: string;
  sochungtu?: string;
  uploadStatus: number;
  dongia: number;
}

export interface PhieucanCreate {
  sophieu?: number;
  soxe: string;
  makh?: string;
  khachhang?: string;
  mahang?: string;
  loaihang?: string;
  tlcan1: number;
  xuatnhap: string;
  ghichu?: string;
  kho?: string;
  sochungtu?: string;
}

export interface PhieucanComplete {
  tlcan2: number;
  ngaycan2?: string;
}

export interface PhieucanCancel {
  reason: string;
}

export interface PhieucanStatistics {
  totalVehicles: number;
  totalWeight: number;
  byCompany: {
    companyName: string;
    weighCount: number;
    totalWeight: number;
  }[];
  byProduct: {
    productName: string;
    weighCount: number;
    totalWeight: number;
    totalPrice: number;
  }[];
  byVehicle: {
    vehicleNumber: string;
    weighCount: number;
    totalWeight: number;
    averageWeight: number;
  }[];
  byDay: {
    date: string;
    weighCount: number;
    totalWeight: number;
  }[];
}

// Hàng hóa
export interface Hanghoa {
  id: number;
  ma: string;
  ten: string;
  dongia: number;
}

export interface HanghoaCreate {
  ma: string;
  ten: string;
  dongia: number;
}

export interface HanghoaUpdate {
  ma?: string;
  ten?: string;
  dongia?: number;
}

// Khách hàng
export interface Khachhang {
  id: number;
  ma: string;
  ten: string;
  diachi?: string;
  dienthoai?: string;
}

export interface KhachhangCreate {
  ma: string;
  ten: string;
  diachi?: string;
  dienthoai?: string;
}

export interface KhachhangUpdate {
  ma?: string;
  ten?: string;
  diachi?: string;
  dienthoai?: string;
}

// Số xe
export interface Soxe {
  id: number;
  soxe: string;
  trongluong: number;
}

export interface SoxeCreate {
  soxe: string;
  trongluong: number;
}

export interface SoxeUpdate {
  soxe?: string;
  trongluong?: number;
}

// Nhân viên
export interface Nhanvien {
  nvId: string;
  tenNV: string;
  matkhau: string;
  trangthai: number;
  type: number;
  nhomId: number;
}

export interface NhanvienCreate {
  nvId: string;
  tenNV: string;
  matkhau: string;
  trangthai: number;
  type: number;
  nhomId: number;
}

export interface NhanvienUpdate {
  tenNV?: string;
  matkhau?: string;
  trangthai?: number;
  type?: number;
  nhomId?: number;
}

export interface NhanvienWithPermissions extends Nhanvien {
  nhomQuyen: NhomQuyen;
  permissions: Quyen[];
}

// Nhóm quyền
export interface NhomQuyen {
  nhomId: number;
  ma: string;
  ten: string;
}

export interface NhomQuyenCreate {
  ma: string;
  ten: string;
}

export interface NhomQuyenUpdate {
  ma?: string;
  ten?: string;
}

export interface NhomQuyenWithPermissions extends NhomQuyen {
  permissions: Quyen[];
}

// Quyền
export interface Quyen {
  quyenId: number;
  nhomId: number;
  formId: number;
  form?: Form;
}

export interface QuyenCreate {
  nhomId: number;
  formId: number;
}

// Form
export interface Form {
  formId: number;
  ten: string;
  form: string;
  menuname: string;
  vitri: string;
}

// Giao tiếp
export interface Giaotiep {
  id: number;
  tencty: string;
  diachi: string;
  dienthoai: string;
  nguoican: string;
  chieucaogiay: number;
  sotrangin: number;
  kieuin: string;
  cachtrai: number;
  cachtren: number;
  khogiay: number;
  sophieuin: number;
}

// Kết nối
export interface Ketnoi {
  id: number;
  ten: string;
  congcom: string;
  tocdo: string;
  databit: string;
  parity: string;
  stopbit: string;
  kytubatdau: string;
  sokytutrongchuoi: number;
  chuoinguoc: number;
  sokytuboqua: number;
}

// Kiểm định
export interface Kiemdinh {
  id: number;
  ngayhethan: string;
  songaybaotruoc: number;
  ngaybaotri: string;
  songaybaotribaotruoc: number;
  noidungbaotri: string;
  noidungkhuyenmai: string;
  temp: number;
}

// src/types/api.types.ts

import { NavigatorScreenParams } from "@react-navigation/native";

// ✅ THAY ĐỔI: Thêm types cho multi-tenant
export interface TenantLoginRequest {
  maKhachHang: string;
  password: string;
}

export interface TramCan {
  id: number;
  maTramCan: string;
  tenTramCan: string;
  diaChi: string;
}

export interface KhachHang {
  maKhachHang: string;
  tenKhachHang: string;
}

export interface TenantLoginResponse {
  success: boolean;
  message: string;
  data: {
    sessionToken: string;
    khachHang: KhachHang;
    tramCans: TramCan[];
  };
}

export interface StationSelectionRequest {
  sessionToken: string;
  tramCanId: number;
}

export interface SelectedStation {
  id: number;
  tenTramCan: string;
}

export interface StationSelectionResponse {
  success: boolean;
  message: string;
  data: {
    sessionToken: string;
    selectedStation: SelectedStation;
    khachHang: KhachHang;
  };
}

export interface SessionValidationRequest {
  sessionToken: string;
}

export interface SessionValidationResponse {
  success: boolean;
  message: string;
  data?: {
    khachHang: KhachHang;
    tramCan: SelectedStation;
  };
}

export interface TenantInfo {
  khachHang: KhachHang;
  selectedStation: SelectedStation;
}

// ✅ GIỮ NGUYÊN: Existing types for backward compatibility
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// Duplicate LoginResponse removed to resolve type conflict

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Nhanvien {
  id: number;
  username: string;
  email?: string;
  hoTen?: string;
  vaiTro?: string;
  trangThai?: string;
  ngayTao?: string;
  ngayCapNhat?: string;
}

// ✅ THAY ĐỔI: Cập nhật AuthState để support multi-tenant
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionToken: string | null;
  tenantInfo: TenantInfo | null;
  // Keep for backward compatibility
  userInfo: Nhanvien | null;
}

// ✅ THAY ĐỔI: Navigation params
export interface AuthStackParamList {
  Login: undefined;
  StationSelection: {
    sessionToken: string;
    khachHang: KhachHang;
    tramCans: TramCan[];
  };
}

export interface RootStackParamList {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: undefined;
}

// ✅ THAY ĐỔI: Error types
export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export interface SessionExpiredError extends AuthError {
  code: "SESSION_EXPIRED";
  message: "Phiên làm việc đã hết hạn";
}

export interface TenantConnectionError extends AuthError {
  code: "TENANT_CONNECTION_FAILED";
  message: "Không thể kết nối tới database trạm cân";
}
