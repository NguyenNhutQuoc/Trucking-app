// src/api/vehicle.ts
import api from "./api";
import {
  ApiResponse,
  ApiPaginatedResponse,
  PaginationParams,
  Soxe,
  SoxeCreate,
  SoxeUpdate,
} from "@/types/api.types";

/**
 * Service quản lý số xe
 */
export const vehicleApi = {
  /**
   * Lấy danh sách tất cả xe (DEPRECATED - use getVehicles instead)
   * @deprecated Sử dụng getVehicles với pagination
   */
  getAllVehicles: async (): Promise<Soxe[]> => {
    try {
      const response = await api.get<Soxe[]>("/soxe");
      return response.data;
    } catch (error) {
      console.error("Get all vehicles error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách xe với pagination (NEW)
   * @param params Pagination parameters (page, pageSize)
   */
  getVehicles: async (
    params?: PaginationParams,
  ): Promise<ApiPaginatedResponse<Soxe>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Soxe>>("/soxe", {
        params: {
          page: params?.page || 1,
          pageSize: params?.pageSize || 10,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get vehicles with pagination error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết xe theo ID
   * @param id ID của xe
   */
  getVehicleById: async (id: number): Promise<Soxe> => {
    try {
      const response = await api.get<Soxe>(`/soxe/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get vehicle ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết xe theo biển số
   * @param plateNumber Biển số xe
   */
  getVehicleByPlateNumber: async (plateNumber: string): Promise<Soxe> => {
    try {
      const response = await api.get<Soxe>(`/soxe/number/${plateNumber}`);
      return response.data;
    } catch (error) {
      console.error(`Get vehicle by plate number ${plateNumber} error:`, error);
      throw error;
    }
  },

  /**
   * Tạo xe mới
   * @param vehicleData Dữ liệu xe mới
   */
  createVehicle: async (vehicleData: SoxeCreate): Promise<Soxe> => {
    try {
      const response = await api.post<Soxe>("/soxe", vehicleData);
      return response.data;
    } catch (error) {
      console.error("Create vehicle error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin xe
   * @param id ID của xe
   * @param vehicleData Dữ liệu cập nhật
   */
  updateVehicle: async (id: number, vehicleData: SoxeUpdate): Promise<Soxe> => {
    try {
      const response = await api.put<Soxe>(`/soxe/${id}`, vehicleData);
      return response.data;
    } catch (error) {
      console.error(`Update vehicle ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Xóa xe
   * @param id ID của xe
   */
  deleteVehicle: async (id: number): Promise<void> => {
    try {
      await api.delete(`/soxe/${id}`);
    } catch (error) {
      console.error(`Delete vehicle ${id} error:`, error);
      throw error;
    }
  },
};
