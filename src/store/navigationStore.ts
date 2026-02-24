// src/store/navigationStore.ts
// Zustand store for passing complex objects between routes (Expo Router uses URL params which are strings)
import { create } from "zustand";
import { Phieucan, Soxe, Khachhang, Hanghoa, Nhanvien, NhomQuyen, TramCan } from "@/types/api.types";

interface NavigationStore {
  // Weighing
  selectedWeighing: Phieucan | null;
  setSelectedWeighing: (weighing: Phieucan | null) => void;

  // Management
  selectedVehicle: Soxe | null;
  setSelectedVehicle: (vehicle: Soxe | null) => void;

  selectedCompany: Khachhang | null;
  setSelectedCompany: (company: Khachhang | null) => void;

  selectedProduct: Hanghoa | null;
  setSelectedProduct: (product: Hanghoa | null) => void;

  selectedUser: Nhanvien | null;
  setSelectedUser: (user: Nhanvien | null) => void;

  selectedPermissionGroup: NhomQuyen | null;
  setSelectedPermissionGroup: (group: NhomQuyen | null) => void;

  // Auth
  stationSelectionData: {
    sessionToken: string;
    khachHang: { maKhachHang: string; tenKhachHang: string };
    tramCans: TramCan[];
  } | null;
  setStationSelectionData: (data: NavigationStore["stationSelectionData"]) => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  selectedWeighing: null,
  setSelectedWeighing: (weighing) => set({ selectedWeighing: weighing }),

  selectedVehicle: null,
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),

  selectedCompany: null,
  setSelectedCompany: (company) => set({ selectedCompany: company }),

  selectedProduct: null,
  setSelectedProduct: (product) => set({ selectedProduct: product }),

  selectedUser: null,
  setSelectedUser: (user) => set({ selectedUser: user }),

  selectedPermissionGroup: null,
  setSelectedPermissionGroup: (group) => set({ selectedPermissionGroup: group }),

  stationSelectionData: null,
  setStationSelectionData: (data) => set({ stationSelectionData: data }),
}));
