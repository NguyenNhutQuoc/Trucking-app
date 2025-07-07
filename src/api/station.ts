// src/api/station.ts
import api from "./api";
import { ApiResponse } from "@/types/api.types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface TramCan {
  id: number;
  maTramCan: string;
  tenTramCan: string;
  diaChi: string;
  trangThai?: string;
  moTa?: string;
}

export interface MyStationsResponse {
  success: boolean;
  message: string;
  data: TramCan[];
}

export interface SwitchStationRequest {
  tramCanId: number;
}

export interface SwitchStationResponse {
  success: boolean;
  message: string;
  data: {
    sessionToken: string;
    selectedStation: {
      id: number;
      tenTramCan: string;
    };
    khachHang: {
      maKhachHang: string;
      tenKhachHang: string;
    };
  };
}

export interface StationDetailResponse {
  success: boolean;
  message: string;
  data: TramCan & {
    thongKe?: {
      soPhieuHomNay: number;
      tongKhoiLuongHomNay: number;
      soPhieuThangNay: number;
      tongKhoiLuongThangNay: number;
    };
  };
}

/**
 * Dịch vụ quản lý trạm cân
 */
export const stationApi = {
  /**
   * Lấy danh sách trạm cân của tôi
   */
  getMyStations: async (): Promise<MyStationsResponse> => {
    try {
      console.log("Getting my stations...");
      const response = await api.get<MyStationsResponse>(
        "/tramcan/my-stations",
      );

      console.log("My stations response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Get my stations error:", error);
      throw error;
    }
  },

  /**
   * Chuyển đổi trạm cân
   * @param tramCanId ID của trạm cân muốn chuyển đến
   */
  switchStation: async (tramCanId: number): Promise<SwitchStationResponse> => {
    try {
      console.log("Switching to station:", tramCanId);
      const response = await api.post<SwitchStationResponse>(
        "/tramcan/switch-station",
        { tramCanId },
      );

      // ✅ Cập nhật session token và tenant info sau khi switch
      if (response.data.success) {
        await AsyncStorage.setItem(
          "session_token",
          response.data.data.sessionToken,
        );
        await AsyncStorage.setItem(
          "tenant_info",
          JSON.stringify({
            khachHang: response.data.data.khachHang,
            selectedStation: response.data.data.selectedStation,
          }),
        );
      }

      console.log("Switch station successful:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Switch station error:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết trạm cân
   * @param tramCanId ID của trạm cân
   */
  getStationDetail: async (
    tramCanId: number,
  ): Promise<StationDetailResponse> => {
    try {
      console.log("Getting station detail:", tramCanId);
      const response = await api.get<StationDetailResponse>(
        `/tramcan/${tramCanId}`,
      );

      console.log("Station detail response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Get station detail error:", error);
      throw error;
    }
  },

  /**
   * Refresh danh sách trạm cân (để dùng trong pull-to-refresh)
   */
  refreshStations: async (): Promise<TramCan[]> => {
    try {
      const response = await stationApi.getMyStations();
      return response.success ? response.data : [];
    } catch (error) {
      console.error("Refresh stations error:", error);
      return [];
    }
  },

  /**
   * Kiểm tra trạm cân hiện tại có trong danh sách không
   */
  validateCurrentStation: async (): Promise<boolean> => {
    try {
      const tenantInfo = await AsyncStorage.getItem("tenant_info");
      if (!tenantInfo) return false;

      const { selectedStation } = JSON.parse(tenantInfo);
      const stationsResponse = await stationApi.getMyStations();

      if (!stationsResponse.success) return false;

      const currentStationExists = stationsResponse.data.some(
        (station) => station.id === selectedStation.id,
      );

      return currentStationExists;
    } catch (error) {
      console.error("Validate current station error:", error);
      return false;
    }
  },
};
