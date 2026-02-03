// src/api/customer.ts
import api from "./api";
import {
  ApiResponse,
  ApiPaginatedResponse,
  PaginationParams,
  Khachhang,
  KhachhangCreate,
  KhachhangUpdate,
} from "@/types/api.types";

/**
 * Service quản lý khách hàng
 */
export const customerApi = {
  /**
   * Lấy danh sách tất cả khách hàng (DEPRECATED - use getCustomers instead)
   * @deprecated Sử dụng getCustomers với pagination
   */
  getAllCustomers: async (): Promise<ApiResponse<Khachhang[]>> => {
    try {
      const response = await api.get<ApiResponse<Khachhang[]>>("/khachhang");
      return response.data;
    } catch (error) {
      console.error("Get all customers error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách khách hàng với pagination (NEW)
   * @param params Pagination parameters (page, pageSize)
   */
  getCustomers: async (
    params?: PaginationParams,
  ): Promise<ApiPaginatedResponse<Khachhang>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Khachhang>>(
        "/khachhang",
        {
          params: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Get customers with pagination error:", error);
      throw error;
    }
  },

  /**
   * Tìm kiếm khách hàng theo tên
   * @param name Tên khách hàng cần tìm
   */
  searchCustomersByName: async (
    name?: string,
  ): Promise<ApiResponse<Khachhang[]>> => {
    try {
      const response = await api.get<ApiResponse<Khachhang[]>>(
        "/khachhang/search",
        {
          params: { name },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Search customers error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết khách hàng theo ID
   * @param id ID của khách hàng
   */
  getCustomerById: async (id: number): Promise<ApiResponse<Khachhang>> => {
    try {
      const response = await api.get<ApiResponse<Khachhang>>(
        `/khachhang/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error(`Get customer ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết khách hàng theo mã
   * @param code Mã khách hàng
   */
  getCustomerByCode: async (code: string): Promise<ApiResponse<Khachhang>> => {
    try {
      const response = await api.get<ApiResponse<Khachhang>>(
        `/khachhang/code/${code}`,
      );
      return response.data;
    } catch (error) {
      console.error(`Get customer by code ${code} error:`, error);
      throw error;
    }
  },

  /**
   * Tạo khách hàng mới
   * @param customerData Dữ liệu khách hàng mới
   */
  createCustomer: async (
    customerData: KhachhangCreate,
  ): Promise<ApiResponse<Khachhang>> => {
    try {
      const response = await api.post<ApiResponse<Khachhang>>(
        "/khachhang",
        customerData,
      );
      return response.data;
    } catch (error) {
      console.error("Create customer error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin khách hàng
   * @param id ID của khách hàng
   * @param customerData Dữ liệu cập nhật
   */
  updateCustomer: async (
    id: number,
    customerData: KhachhangUpdate,
  ): Promise<ApiResponse<Khachhang>> => {
    try {
      const response = await api.put<ApiResponse<Khachhang>>(
        `/khachhang/${id}`,
        customerData,
      );
      return response.data;
    } catch (error) {
      console.error(`Update customer ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Xóa khách hàng
   * @param id ID của khách hàng
   */
  deleteCustomer: async (id: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/khachhang/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete customer ${id} error:`, error);
      throw error;
    }
  },
};
