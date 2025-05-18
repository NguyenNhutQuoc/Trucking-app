import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/config";

// Tạo một instance của axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    const token = await AsyncStorage.getItem("auth_token");

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Interceptor cho response
api.interceptors.response.use(
  (response) => {
    // Xử lý response thành công
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
    if (error.response?.status === 401 && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      try {
        // Có thể thực hiện refresh token tại đây nếu API hỗ trợ
        // Nếu không hỗ trợ, xóa token và chuyển hướng về trang đăng nhập
        await AsyncStorage.removeItem("auth_token");
        // Chuyển hướng sẽ được xử lý bởi component AuthContext

        return Promise.reject(error);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
