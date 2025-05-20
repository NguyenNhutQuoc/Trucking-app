// src/api/weighing.ts
import api from "./api";
import {
  ApiResponse,
  Phieucan,
  PhieucanCreate,
  PhieucanComplete,
  PhieucanCancel,
  PhieucanStatistics,
} from "@/types/api.types";

/**
 * Service quản lý phiếu cân
 */
export const weighingApi = {
  /**
   * Lấy danh sách tất cả phiếu cân
   */
  getAllWeighings: async (): Promise<ApiResponse<Phieucan[]>> => {
    try {
      const response = await api.get<ApiResponse<Phieucan[]>>("/phieucan");
      return response.data;
    } catch (error) {
      console.error("Get all weighings error:", error);
      throw error;
    }
  },

  /**
   * Tạo phiếu cân mới
   * @param weighingData Dữ liệu phiếu cân mới
   */
  createWeighing: async (
    weighingData: PhieucanCreate,
  ): Promise<ApiResponse<Phieucan>> => {
    try {
      const response = await api.post<ApiResponse<Phieucan>>(
        "/phieucan",
        weighingData,
      );
      return response.data;
    } catch (error) {
      console.error("Create weighing error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết phiếu cân theo ID
   * @param id ID của phiếu cân
   */
  getWeighingById: async (id: number): Promise<ApiResponse<Phieucan>> => {
    try {
      const response = await api.get<ApiResponse<Phieucan>>(`/phieucan/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get weighing ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin phiếu cân
   * @param id ID của phiếu cân
   * @param weighingData Dữ liệu cập nhật
   */
  updateWeighing: async (
    id: number,
    weighingData: Partial<PhieucanCreate>,
  ): Promise<ApiResponse<Phieucan>> => {
    try {
      const response = await api.put<ApiResponse<Phieucan>>(
        `/phieucan/${id}`,
        weighingData,
      );
      return response.data;
    } catch (error) {
      console.error(`Update weighing ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Xóa phiếu cân
   * @param id ID của phiếu cân
   */
  deleteWeighing: async (id: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/phieucan/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete weighing ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Hoàn thành cân (cập nhật trọng lượng cân ra)
   * @param id ID của phiếu cân
   * @param completeData Dữ liệu hoàn thành (tlcan2, ngaycan2)
   */
  completeWeighing: async (
    id: number,
    completeData: PhieucanComplete,
  ): Promise<ApiResponse<Phieucan>> => {
    try {
      const response = await api.post<ApiResponse<Phieucan>>(
        `/phieucan/${id}/complete`,
        completeData,
      );
      return response.data;
    } catch (error) {
      console.error(`Complete weighing ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Hủy phiếu cân
   * @param id ID của phiếu cân
   * @param cancelData Dữ liệu hủy phiếu (lý do)
   */
  cancelWeighing: async (
    id: number,
    cancelData: PhieucanCancel,
  ): Promise<ApiResponse<Phieucan>> => {
    try {
      const response = await api.post<ApiResponse<Phieucan>>(
        `/phieucan/${id}/cancel`,
        cancelData,
      );
      return response.data;
    } catch (error) {
      console.error(`Cancel weighing ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phiếu cân đã hoàn thành
   */
  getCompletedWeighings: async (): Promise<ApiResponse<Phieucan[]>> => {
    try {
      const response = await api.get<ApiResponse<Phieucan[]>>(
        "/phieucan/status/completed",
      );
      return response.data;
    } catch (error) {
      console.error("Get completed weighings error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phiếu cân đang chờ
   */
  getPendingWeighings: async (): Promise<ApiResponse<Phieucan[]>> => {
    try {
      const response = await api.get<ApiResponse<Phieucan[]>>(
        "/phieucan/status/pending",
      );
      return response.data;
    } catch (error) {
      console.error("Get pending weighings error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phiếu cân đã hủy
   */
  getCanceledWeighings: async (): Promise<ApiResponse<Phieucan[]>> => {
    try {
      const response = await api.get<ApiResponse<Phieucan[]>>(
        "/phieucan/status/canceled",
      );
      return response.data;
    } catch (error) {
      console.error("Get canceled weighings error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phiếu cân theo khoảng thời gian
   * @param startDate Ngày bắt đầu
   * @param endDate Ngày kết thúc
   */
  getWeighingsByDateRange: async (
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<Phieucan[]>> => {
    try {
      const response = await api.get<ApiResponse<Phieucan[]>>(
        "/phieucan/date-range/search",
        { params: { startDate, endDate } },
      );
      return response.data;
    } catch (error) {
      console.error("Get weighings by date range error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phiếu cân theo biển số xe
   * @param soxe Biển số xe
   */
  getWeighingsByVehicle: async (
    soxe: string,
  ): Promise<ApiResponse<Phieucan[]>> => {
    try {
      const response = await api.get<ApiResponse<Phieucan[]>>(
        `/phieucan/vehicle/${soxe}`,
      );
      return response.data;
    } catch (error) {
      console.error(`Get weighings for vehicle ${soxe} error:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phiếu cân theo mã hàng
   * @param mahang Mã hàng
   */
  getWeighingsByProduct: async (
    mahang: string,
  ): Promise<ApiResponse<Phieucan[]>> => {
    try {
      const response = await api.get<ApiResponse<Phieucan[]>>(
        `/phieucan/product/${mahang}`,
      );
      return response.data;
    } catch (error) {
      console.error(`Get weighings for product ${mahang} error:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phiếu cân theo mã khách hàng
   * @param makh Mã khách hàng
   */
  getWeighingsByCustomer: async (
    makh: string,
  ): Promise<ApiResponse<Phieucan[]>> => {
    try {
      const response = await api.get<ApiResponse<Phieucan[]>>(
        `/phieucan/customer/${makh}`,
      );
      return response.data;
    } catch (error) {
      console.error(`Get weighings for customer ${makh} error:`, error);
      throw error;
    }
  },

  /**
   * Lấy thống kê phiếu cân trong ngày
   */
  getTodayStatistics: async (): Promise<ApiResponse<PhieucanStatistics>> => {
    try {
      const response = await api.get<ApiResponse<PhieucanStatistics>>(
        "/phieucan/statistics/today",
      );

      console.log("Today statistics:", response.data.data.byProduct);
      return response.data;
    } catch (error) {
      console.error("Get today statistics error:", error);
      throw error;
    }
  },

  /**
   * Lấy thống kê trọng lượng theo khoảng thời gian
   * @param startDate Ngày bắt đầu
   * @param endDate Ngày kết thúc
   */
  getWeightStatistics: async (
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<PhieucanStatistics>> => {
    try {
      const response = await api.get<ApiResponse<PhieucanStatistics>>(
        "/phieucan/statistics/weight",
        { params: { startDate, endDate } },
      );
      return response.data;
    } catch (error) {
      console.error("Get weight statistics error:", error);
      throw error;
    }
  },
};
