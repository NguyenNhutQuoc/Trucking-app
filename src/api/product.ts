// src/api/product.ts
import api from "./api";
import {
  ApiResponse,
  ApiPaginatedResponse,
  PaginationParams,
  Hanghoa,
  HanghoaCreate,
  HanghoaUpdate,
} from "@/types/api.types";

/**
 * Service quản lý hàng hóa
 */
export const productApi = {
  /**
   * Lấy danh sách tất cả hàng hóa (DEPRECATED - use getProducts instead)
   * @deprecated Sử dụng getProducts với pagination
   */
  getAllProducts: async (): Promise<ApiResponse<Hanghoa[]>> => {
    try {
      const response = await api.get<ApiResponse<Hanghoa[]>>("/hanghoa");
      return response.data;
    } catch (error) {
      console.error("Get all products error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách hàng hóa với pagination (NEW)
   * @param params Pagination parameters (page, pageSize)
   */
  getProducts: async (
    params?: PaginationParams,
  ): Promise<ApiPaginatedResponse<Hanghoa>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Hanghoa>>(
        "/hanghoa",
        {
          params: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Get products with pagination error:", error);
      throw error;
    }
  },

  /**
   * Tìm kiếm hàng hóa theo tên
   * @param q Từ khóa tìm kiếm
   * @param params Pagination parameters (page, pageSize)
   */
  searchProductsByName: async (
    q?: string,
    params?: PaginationParams,
  ): Promise<ApiPaginatedResponse<Hanghoa>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Hanghoa>>(
        "/hanghoa/search",
        {
          params: {
            q,
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Search products error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết hàng hóa theo ID
   * @param id ID của hàng hóa
   */
  getProductById: async (id: number): Promise<ApiResponse<Hanghoa>> => {
    try {
      const response = await api.get<ApiResponse<Hanghoa>>(`/hanghoa/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get product ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết hàng hóa theo mã
   * @param code Mã hàng hóa
   */
  getProductByCode: async (code: string): Promise<ApiResponse<Hanghoa>> => {
    try {
      const response = await api.get<ApiResponse<Hanghoa>>(
        `/hanghoa/code/${code}`,
      );
      return response.data;
    } catch (error) {
      console.error(`Get product by code ${code} error:`, error);
      throw error;
    }
  },

  /**
   * Tạo hàng hóa mới
   * @param productData Dữ liệu hàng hóa mới
   */
  createProduct: async (
    productData: HanghoaCreate,
  ): Promise<ApiResponse<Hanghoa>> => {
    try {
      const response = await api.post<ApiResponse<Hanghoa>>(
        "/hanghoa",
        productData,
      );
      return response.data;
    } catch (error) {
      console.error("Create product error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin hàng hóa
   * @param id ID của hàng hóa
   * @param productData Dữ liệu cập nhật
   */
  updateProduct: async (
    id: number,
    productData: HanghoaUpdate,
  ): Promise<ApiResponse<Hanghoa>> => {
    try {
      const response = await api.put<ApiResponse<Hanghoa>>(
        `/hanghoa/${id}`,
        productData,
      );
      return response.data;
    } catch (error) {
      console.error(`Update product ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Xóa hàng hóa
   * @param id ID của hàng hóa
   */
  deleteProduct: async (id: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/hanghoa/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete product ${id} error:`, error);
      throw error;
    }
  },
};
