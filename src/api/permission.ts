// src/api/permission.ts
import api from "./api";
import {
  ApiResponse,
  ApiPaginatedResponse,
  PaginationParams,
  NhomQuyen,
  NhomQuyenCreate,
  NhomQuyenUpdate,
  NhomQuyenWithPermissions,
  Quyen,
  QuyenCreate,
  Form,
} from "@/types/api.types";

/**
 * Service quản lý nhóm quyền và quyền
 */
export const permissionApi = {
  /**
   * Lấy danh sách tất cả nhóm quyền (DEPRECATED - use getGroups instead)
   * @deprecated Sử dụng getGroups với pagination
   */
  getAllGroups: async (): Promise<NhomQuyen[]> => {
    try {
      const response = await api.get<NhomQuyen[]>("/nhomquyen");
      return response.data;
    } catch (error) {
      console.error("Get all permission groups error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách nhóm quyền với pagination (NEW)
   * @param params Pagination parameters (page, pageSize)
   */
  getGroups: async (
    params?: PaginationParams,
  ): Promise<ApiPaginatedResponse<NhomQuyen>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<NhomQuyen>>(
        "/nhomquyen",
        {
          params: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Get groups with pagination error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết nhóm quyền theo ID
   * @param id ID của nhóm quyền
   */
  getGroupById: async (id: number): Promise<NhomQuyen> => {
    try {
      const response = await api.get<NhomQuyen>(`/nhomquyen/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get permission group ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết nhóm quyền bao gồm danh sách quyền
   * @param id ID của nhóm quyền
   */
  getGroupPermissions: async (
    id: number,
  ): Promise<NhomQuyenWithPermissions> => {
    try {
      const response = await api.get<NhomQuyenWithPermissions>(
        `/nhomquyen/${id}/permissions`,
      );
      return response.data;
    } catch (error) {
      console.error(`Get group permissions ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Tạo nhóm quyền mới
   * @param groupData Dữ liệu nhóm quyền mới
   */
  createGroup: async (groupData: NhomQuyenCreate): Promise<NhomQuyen> => {
    try {
      const response = await api.post<NhomQuyen>("/nhomquyen", groupData);
      return response.data;
    } catch (error) {
      console.error("Create permission group error:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin nhóm quyền
   * @param id ID của nhóm quyền
   * @param groupData Dữ liệu cập nhật
   */
  updateGroup: async (
    id: number,
    groupData: NhomQuyenUpdate,
  ): Promise<NhomQuyen> => {
    try {
      const response = await api.put<NhomQuyen>(`/nhomquyen/${id}`, groupData);
      return response.data;
    } catch (error) {
      console.error(`Update permission group ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Xóa nhóm quyền
   * @param id ID của nhóm quyền
   */
  deleteGroup: async (id: number): Promise<void> => {
    try {
      await api.delete(`/nhomquyen/${id}`);
    } catch (error) {
      console.error(`Delete permission group ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Thêm quyền vào nhóm quyền
   * @param nhomId ID của nhóm quyền
   * @param formId ID của form (quyền)
   */
  addPermissionToGroup: async (
    nhomId: number,
    formId: number,
  ): Promise<Quyen> => {
    try {
      const response = await api.post<Quyen>(
        `/nhomquyen/${nhomId}/permissions/${formId}`,
      );
      return response.data;
    } catch (error) {
      console.error(`Add permission to group error:`, error);
      throw error;
    }
  },

  /**
   * Xóa quyền khỏi nhóm quyền
   * @param nhomId ID của nhóm quyền
   * @param formId ID của form (quyền)
   */
  removePermissionFromGroup: async (
    nhomId: number,
    formId: number,
  ): Promise<void> => {
    try {
      await api.delete(`/nhomquyen/${nhomId}/permissions/${formId}`);
    } catch (error) {
      console.error(`Remove permission from group error:`, error);
      throw error;
    }
  },

  /**
   * Cập nhật danh sách quyền của nhóm
   * @param nhomId ID của nhóm quyền
   * @param formIds Danh sách ID của các form (quyền)
   */
  updateGroupPermissions: async (
    nhomId: number,
    formIds: number[],
  ): Promise<void> => {
    try {
      await api.put(`/nhomquyen/${nhomId}/permissions`, { formIds });
    } catch (error) {
      console.error(`Update group permissions error:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tất cả form (quyền)
   */
  getAllForms: async (): Promise<Form[]> => {
    try {
      const response = await api.get<Form[]>("/forms");
      return response.data;
    } catch (error) {
      console.error("Get all forms error:", error);
      throw error;
    }
  },
};
