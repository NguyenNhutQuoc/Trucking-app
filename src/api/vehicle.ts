// src/api/vehicle.ts
import api from "./api";
import { ApiResponse, Soxe, SoxeCreate, SoxeUpdate } from "@/types/api.types";

/**
 * Service quản lý số xe
 */
export const vehicleApi = {
  /**
   * Lấy danh sách tất cả xe
   */
  getAllVehicles: async (): Promise<ApiResponse<Soxe[]>> => {
    try {
      const response = await api.get<ApiResponse<Soxe[]>>("/soxe");
      return response.data;
    } catch (error) {
      console.error("Get all vehicles error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết xe theo ID
   * @param id ID của xe
   */
  getVehicleById: async (id: number): Promise<ApiResponse<Soxe>> => {
    try {
      const response = await api.get<ApiResponse<Soxe>>(`/soxe/${id}`);
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
  getVehicleByPlateNumber: async (
    plateNumber: string,
  ): Promise<ApiResponse<Soxe>> => {
    try {
      const response = await api.get<ApiResponse<Soxe>>(
        `/soxe/number/${plateNumber}`,
      );
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
  createVehicle: async (
    vehicleData: SoxeCreate,
  ): Promise<ApiResponse<Soxe>> => {
    try {
      const response = await api.post<ApiResponse<Soxe>>("/soxe", vehicleData);
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
  updateVehicle: async (
    id: number,
    vehicleData: SoxeUpdate,
  ): Promise<ApiResponse<Soxe>> => {
    try {
      const response = await api.put<ApiResponse<Soxe>>(
        `/soxe/${id}`,
        vehicleData,
      );
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
  deleteVehicle: async (id: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/soxe/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete vehicle ${id} error:`, error);
      throw error;
    }
  },
};
