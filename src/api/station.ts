// src/api/station.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export interface TramCan {
  id: number;
  maTramCan: string;
  tenTramCan: string;
  diaChi?: string;
  moTa?: string;
}

export interface MyStationsResponse {
  success: boolean;
  message: string;
  data: {
    tramCans: TramCan[];
  };
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
 * ✅ UPDATED: Dịch vụ quản lý trạm cân với x-session-token support
 */
export const stationApi = {
  /**
   * Lấy danh sách trạm cân của tôi (cần x-session-token header)
   */
  getMyStations: async (): Promise<MyStationsResponse> => {
    try {
      console.log("🏭 Getting my stations...");

      // ✅ Session token sẽ được tự động thêm vào header bởi interceptor
      const response = await api.get<MyStationsResponse>(
        "/tramcan/my-stations",
      );

      console.log("✅ My stations response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Get my stations error:", error);
      throw error;
    }
  },

  /**
   * Chuyển đổi trạm cân (cần x-session-token header)
   * @param tramCanId ID của trạm cân muốn chuyển đến
   */
  switchStation: async (
    tramCanId: number,
    isActivated: boolean = false, // ✅ NEW: Thêm tham số isActivated để xác định trạng thái trạm cân
  ): Promise<SwitchStationResponse> => {
    try {
      console.log("🔄 Switching to station:", tramCanId);

      // ✅ Session token sẽ được tự động thêm vào header bởi interceptor
      const response = await api.post<SwitchStationResponse>(
        "/tramcan/switch-station",
        { tramCanId, isActivated },
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

      console.log("✅ Switch station successful:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Switch station error:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết trạm cân (cần x-session-token header)
   * @param tramCanId ID của trạm cân
   */
  getStationDetail: async (
    tramCanId: number,
  ): Promise<StationDetailResponse> => {
    try {
      console.log("🔍 Getting station detail:", tramCanId);

      // ✅ Session token sẽ được tự động thêm vào header bởi interceptor
      const response = await api.get<StationDetailResponse>(
        `/tramcan/${tramCanId}`,
      );

      console.log("✅ Station detail response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Get station detail error:", error);
      throw error;
    }
  },

  /**
   * Refresh danh sách trạm cân (để dùng trong pull-to-refresh)
   */
  refreshStations: async (): Promise<TramCan[]> => {
    try {
      console.log("🔄 Refreshing stations...");

      const response = await stationApi.getMyStations();
      return response.success ? response.data.tramCans : [];
    } catch (error) {
      console.error("❌ Refresh stations error:", error);
      return [];
    }
  },

  /**
   * ✅ NEW: Kiểm tra trạng thái kết nối trạm cân
   */
  checkStationStatus: async (tramCanId: number): Promise<boolean> => {
    try {
      console.log("🔍 Checking station status:", tramCanId);

      const response = await api.get(`/tramcan/${tramCanId}/status`);
      return response.data.success && response.data.data.isOnline;
    } catch (error) {
      console.error("❌ Check station status error:", error);
      return false;
    }
  },

  /**
   * ✅ NEW: Lấy thống kê tổng quan của trạm cân hiện tại
   */
  getCurrentStationStats: async (): Promise<any> => {
    try {
      console.log("📊 Getting current station stats...");

      const response = await api.get("/tramcan/current/stats");
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error("❌ Get station stats error:", error);
      return null;
    }
  },
};

/**
 * ✅ NEW: Hook để sử dụng trong React components
 */
export const useStationApi = () => {
  const loadMyStations = async () => {
    try {
      const response = await stationApi.getMyStations();
      return response.data;
    } catch (error) {
      console.error("❌ useStationApi - loadMyStations error:", error);
      return [];
    }
  };

  const switchToStation = async (tramCanId: number) => {
    try {
      const response = await stationApi.switchStation(tramCanId);
      return response.success;
    } catch (error) {
      console.error("❌ useStationApi - switchToStation error:", error);
      return false;
    }
  };

  return {
    loadMyStations,
    switchToStation,
    getStationDetail: stationApi.getStationDetail,
    refreshStations: stationApi.refreshStations,
    checkStationStatus: stationApi.checkStationStatus,
    getCurrentStationStats: stationApi.getCurrentStationStats,
  };
};
