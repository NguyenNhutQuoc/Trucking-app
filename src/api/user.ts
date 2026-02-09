// src/api/user.ts
import api from "./api";
import {
  ApiResponse,
  ApiPaginatedResponse,
  PaginationParams,
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
   * Lấy danh sách tất cả người dùng (DEPRECATED - use getUsers instead)
   * @deprecated Sử dụng getUsers với pagination
   */
  getAllUsers: async (): Promise<Nhanvien[]> => {
    try {
      const response = await api.get<Nhanvien[]>("/nhanvien");
      return response.data;
    } catch (error) {
      console.error("Get all users error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách người dùng với pagination (NEW)
   * @param params Pagination parameters (page, pageSize)
   */
  getUsers: async (
    params?: PaginationParams,
  ): Promise<ApiPaginatedResponse<Nhanvien>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Nhanvien>>(
        "/nhanvien",
        {
          params: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Get users with pagination error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết người dùng theo ID
   * @param id ID của người dùng
   */
  getUserById: async (id: string): Promise<Nhanvien> => {
    try {
      const response = await api.get<Nhanvien>(`/nhanvien/${id}`);
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
  getUserPermissions: async (id: string): Promise<NhanvienWithPermissions> => {
    try {
      const response = await api.get<NhanvienWithPermissions>(
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
  createUser: async (userData: NhanvienCreate): Promise<Nhanvien> => {
    try {
      const response = await api.post<Nhanvien>("/nhanvien", userData);
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
  ): Promise<Nhanvien> => {
    try {
      console.log("userData", userData);
      const response = await api.put<Nhanvien>(`/nhanvien/${id}`, userData);
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
  deleteUser: async (id: string): Promise<void> => {
    try {
      await api.delete(`/nhanvien/${id}`);
    } catch (error) {
      console.error(`Delete user ${id} error:`, error);
      throw error;
    }
  },
};
