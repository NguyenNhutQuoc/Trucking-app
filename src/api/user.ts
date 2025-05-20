// src/api/user.ts
import api from "./api";
import {
  ApiResponse,
  Nhanvien,
  NhanvienCreate,
  NhanvienUpdate,
  NhanvienWithPermissions,
} from "@/types/api.types";

/**
 * Service quản lý người dùng
 */
export const userApi = {
  /**
   * Lấy danh sách tất cả người dùng
   */
  getAllUsers: async (): Promise<ApiResponse<Nhanvien[]>> => {
    try {
      const response = await api.get<ApiResponse<Nhanvien[]>>("/nhanvien");
      return response.data;
    } catch (error) {
      console.error("Get all users error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết người dùng theo ID
   * @param id ID của người dùng
   */
  getUserById: async (id: string): Promise<ApiResponse<Nhanvien>> => {
    try {
      const response = await api.get<ApiResponse<Nhanvien>>(`/nhanvien/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get user ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết người dùng cùng với quyền
   * @param id ID của người dùng
   */
  getUserPermissions: async (
    id: string,
  ): Promise<ApiResponse<NhanvienWithPermissions>> => {
    try {
      const response = await api.get<ApiResponse<NhanvienWithPermissions>>(
        `/nhanvien/${id}/permissions`,
      );
      return response.data;
    } catch (error) {
      console.error(`Get user permissions ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Tạo người dùng mới
   * @param userData Dữ liệu người dùng mới
   */
  createUser: async (
    userData: NhanvienCreate,
  ): Promise<ApiResponse<Nhanvien>> => {
    try {
      const response = await api.post<ApiResponse<Nhanvien>>(
        "/nhanvien",
        userData,
      );
      return response.data;
    } catch (error) {
      console.error("Create user error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin người dùng
   * @param id ID của người dùng
   * @param userData Dữ liệu cập nhật
   */
  updateUser: async (
    id: string,
    userData: NhanvienUpdate,
  ): Promise<ApiResponse<Nhanvien>> => {
    try {
      const response = await api.put<ApiResponse<Nhanvien>>(
        `/nhanvien/${id}`,
        userData,
      );
      return response.data;
    } catch (error) {
      console.error(`Update user ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Xóa người dùng
   * @param id ID của người dùng
   */
  deleteUser: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/nhanvien/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete user ${id} error:`, error);
      throw error;
    }
  },
};
