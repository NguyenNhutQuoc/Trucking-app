// src/api/weighing.ts
import api from "./api";
import {
  ApiResponse,
  ApiPaginatedResponse,
  PaginationParams,
  Phieucan,
  PhieucanCreate,
  PhieucanComplete,
  PhieucanCancel,
  PhieucanStatistics,
  DailyCountStat,
} from "@/types/api.types";

/**
 * Service quản lý phiếu cân
 */
export const weighingApi = {
  /**
   * Lấy danh sách tất cả phiếu cân (DEPRECATED - use getWeighings instead)
   * @deprecated Sử dụng getWeighings với pagination
   */
  getAllWeighings: async (
    params?: PaginationParams,
  ): Promise<ApiPaginatedResponse<Phieucan>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Phieucan>>(
        "/phieucan",
        {
          params: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 100,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Get all weighings error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phiếu cân với pagination (NEW)
   * @param params Pagination parameters (page, pageSize)
   */
  getWeighings: async (
    params?: PaginationParams,
  ): Promise<ApiPaginatedResponse<Phieucan>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Phieucan>>(
        "/phieucan",
        {
          params: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Get weighings with pagination error:", error);
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
   * @param params Pagination parameters (page, pageSize)
   */
  getCompletedWeighings: async (
    params?: PaginationParams,
  ): Promise<ApiPaginatedResponse<Phieucan>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Phieucan>>(
        "/phieucan/status/completed",
        {
          params: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Get completed weighings error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phiếu cân đang chờ
   * @param params Pagination parameters (page, pageSize)
   */
  getPendingWeighings: async (
    params?: PaginationParams,
  ): Promise<ApiPaginatedResponse<Phieucan>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Phieucan>>(
        "/phieucan/status/pending",
        {
          params: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Get pending weighings error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phiếu cân đã hủy
   * @param params Pagination parameters (page, pageSize)
   */
  getCanceledWeighings: async (
    params?: PaginationParams,
  ): Promise<ApiPaginatedResponse<Phieucan>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Phieucan>>(
        "/phieucan/status/canceled",
        {
          params: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
          },
        },
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
   * @param params Pagination parameters (page, pageSize)
   */
  getWeighingsByDateRange: async (
    startDate: string,
    endDate: string,
    params?: PaginationParams,
  ): Promise<ApiPaginatedResponse<Phieucan>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Phieucan>>(
        "/phieucan/date-range/search",
        {
          params: {
            startDate,
            endDate,
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
          },
        },
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
   * @param params Pagination parameters (page, pageSize)
   */
  getWeighingsByVehicle: async (
    soxe: string,
    params?: PaginationParams,
  ): Promise<ApiPaginatedResponse<Phieucan>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Phieucan>>(
        `/phieucan/vehicle/${soxe}`,
        {
          params: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
          },
        },
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
   * @param params Pagination parameters (page, pageSize)
   */
  getWeighingsByProduct: async (
    mahang: string,
    params?: PaginationParams,
  ): Promise<ApiPaginatedResponse<Phieucan>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Phieucan>>(
        `/phieucan/product/${mahang}`,
        {
          params: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
          },
        },
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
   * @param params Pagination parameters (page, pageSize)
   */
  getWeighingsByCustomer: async (
    makh: string,
    params?: PaginationParams,
  ): Promise<ApiPaginatedResponse<Phieucan>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Phieucan>>(
        `/phieucan/customer/${makh}`,
        {
          params: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
          },
        },
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

      console.log("Today statistics:", response.data);
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

  /**
   * Lấy thống kê số lượng phiếu cân theo ngày (lightweight cho chart)
   * @param startDate Ngày bắt đầu
   * @param endDate Ngày kết thúc
   */
  getDailyCountStatistics: async (
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<DailyCountStat[]>> => {
    try {
      const response = await api.get<ApiResponse<DailyCountStat[]>>(
        "/phieucan/statistics/daily-counts",
        { params: { startDate, endDate } },
      );
      return response.data;
    } catch (error) {
      console.error("Get daily count statistics error:", error);
      throw error;
    }
  },

  /**
   * Tìm kiếm phiếu cân với nhiều bộ lọc kết hợp
   * @param filters Các bộ lọc tùy chọn (startDate, endDate, soXe, maHang, makh, xuatNhap)
   * @param params Pagination parameters (page, pageSize)
   */
  searchWeighings: async (
    filters: {
      startDate?: string;
      endDate?: string;
      soXe?: string;
      maHang?: string;
      makh?: string;
      xuatNhap?: string;
    },
    params?: PaginationParams,
  ): Promise<ApiPaginatedResponse<Phieucan>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Phieucan>>(
        "/phieucan/search",
        {
          params: {
            ...filters,
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Search weighings error:", error);
      throw error;
    }
  },
};
