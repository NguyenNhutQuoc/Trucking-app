// src/api/product.ts
import api from "./api";
import {
  ApiResponse,
  Hanghoa,
  HanghoaCreate,
  HanghoaUpdate,
} from "@/types/api.types";

/**
 * Service quản lý hàng hóa
 */
export const productApi = {
  /**
   * Lấy danh sách tất cả hàng hóa
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
   * Tìm kiếm hàng hóa theo tên
   * @param name Tên hàng hóa cần tìm
   */
  searchProductsByName: async (
    name?: string,
  ): Promise<ApiResponse<Hanghoa[]>> => {
    try {
      const response = await api.get<ApiResponse<Hanghoa[]>>(
        "/hanghoa/search",
        {
          params: { name },
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
