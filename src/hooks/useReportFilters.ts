// src/hooks/useReportFilters.ts
// Hook to manage filter state and options for report screens

import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { customerApi } from "@/api/customer";
import { productApi } from "@/api/product";
import { vehicleApi } from "@/api/vehicle";
import { Khachhang, Hanghoa, Soxe } from "@/types/api.types";

export interface FilterOption {
  id: string;
  label: string;
  value: string | null;
  icon?: string;
}

export interface UseReportFiltersOptions {
  defaultDaysBack?: number;
  autoLoad?: boolean;
}

export interface UseReportFiltersReturn {
  // Date range
  startDate: Date;
  endDate: Date;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  handleDateRangeChange: (start: Date, end: Date) => void;

  // Filter options (data for dropdowns)
  companies: Khachhang[];
  products: Hanghoa[];
  vehicles: Soxe[];

  // Selected filters
  selectedCompany: string | null;
  selectedProduct: string | null;
  selectedVehicle: string | null;
  selectedType: string | null;

  // Handlers
  handleCompanyChange: (companyId: string | null) => void;
  handleProductChange: (productId: string | null) => void;
  handleVehicleChange: (vehicleId: string | null) => void;
  handleTypeChange: (type: string | null) => void;
  handleReset: () => void;

  // Loading state
  loading: boolean;
  loadFilterOptions: () => Promise<void>;

  // Helper functions
  getCompanyOptions: () => FilterOption[];
  getProductOptions: () => FilterOption[];
  getVehicleOptions: () => FilterOption[];
  getTypeOptions: () => FilterOption[];

  // Date formatting helpers
  getFormattedStartDate: () => string;
  getFormattedEndDate: () => string;
}

export const useReportFilters = (
  options: UseReportFiltersOptions = {}
): UseReportFiltersReturn => {
  const { defaultDaysBack = 30 } = options;

  // Date range state
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - defaultDaysBack))
  );
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Filter options (data for dropdowns)
  const [companies, setCompanies] = useState<Khachhang[]>([]);
  const [products, setProducts] = useState<Hanghoa[]>([]);
  const [vehicles, setVehicles] = useState<Soxe[]>([]);

  // Selected filters
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Load filter options
  const loadFilterOptions = useCallback(async () => {
    try {
      setLoading(true);

      const [companyResponse, productResponse, vehicleResponse] =
        await Promise.all([
          customerApi.getCustomers({ page: 1, pageSize: 100 }),
          productApi.getProducts({ page: 1, pageSize: 100 }),
          vehicleApi.getVehicles({ page: 1, pageSize: 100 }),
        ]);

      if (companyResponse.items) {
        setCompanies(companyResponse.items);
      }

      if (productResponse.items) {
        setProducts(productResponse.items);
      }

      if (vehicleResponse.items) {
        setVehicles(vehicleResponse.items);
      }
    } catch (error) {
      console.error("Load filter options error:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu bộ lọc. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handlers
  const handleDateRangeChange = useCallback((start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  const handleCompanyChange = useCallback((companyId: string | null) => {
    setSelectedCompany(companyId);
  }, []);

  const handleProductChange = useCallback((productId: string | null) => {
    setSelectedProduct(productId);
  }, []);

  const handleVehicleChange = useCallback((vehicleId: string | null) => {
    setSelectedVehicle(vehicleId);
  }, []);

  const handleTypeChange = useCallback((type: string | null) => {
    setSelectedType(type);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedCompany(null);
    setSelectedProduct(null);
    setSelectedVehicle(null);
    setSelectedType(null);
  }, []);

  // Helper functions for dropdown options
  const getCompanyOptions = useCallback((): FilterOption[] => {
    return [
      { id: "all", label: "Tất cả khách hàng", value: null, icon: "people" },
      ...companies.map((c) => ({
        id: c.id.toString(),
        label: c.ten,
        value: c.id.toString(),
        icon: "business",
      })),
    ];
  }, [companies]);

  const getProductOptions = useCallback((): FilterOption[] => {
    return [
      { id: "all", label: "Tất cả hàng hóa", value: null, icon: "cube" },
      ...products.map((p) => ({
        id: p.id.toString(),
        label: p.ten,
        value: p.id.toString(),
        icon: "cube-outline",
      })),
    ];
  }, [products]);

  const getVehicleOptions = useCallback((): FilterOption[] => {
    return [
      { id: "all", label: "Tất cả xe", value: null, icon: "car" },
      ...vehicles.map((v) => ({
        id: v.id.toString(),
        label: v.soXe,
        value: v.id.toString(),
        icon: "car-outline",
      })),
    ];
  }, [vehicles]);

  const getTypeOptions = useCallback((): FilterOption[] => {
    return [
      { id: "all", label: "Tất cả loại", value: null, icon: "apps" },
      { id: "nhap", label: "Nhập", value: "nhap", icon: "arrow-down" },
      { id: "xuat", label: "Xuất", value: "xuat", icon: "arrow-up" },
    ];
  }, []);

  // Date formatting helpers
  const getFormattedStartDate = useCallback(() => {
    return startDate.toISOString().split("T")[0];
  }, [startDate]);

  const getFormattedEndDate = useCallback(() => {
    return endDate.toISOString().split("T")[0] + "T23:59:59";
  }, [endDate]);

  return {
    // Date range
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleDateRangeChange,

    // Filter options
    companies,
    products,
    vehicles,

    // Selected filters
    selectedCompany,
    selectedProduct,
    selectedVehicle,
    selectedType,

    // Handlers
    handleCompanyChange,
    handleProductChange,
    handleVehicleChange,
    handleTypeChange,
    handleReset,

    // Loading
    loading,
    loadFilterOptions,

    // Helpers
    getCompanyOptions,
    getProductOptions,
    getVehicleOptions,
    getTypeOptions,
    getFormattedStartDate,
    getFormattedEndDate,
  };
};

export default useReportFilters;
