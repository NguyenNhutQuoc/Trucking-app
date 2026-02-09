// src/constants/config.ts - Updated with dark mode support
// API configuration
export const API_URL = "http://192.168.1.49:5075/api/v1"; // Development server
// export const API_URL = 'https://api.example.com/api'; // Production server
console.log("API URL:", API_URL);
// App configuration
export const APP_NAME = "Quản Lý Cân Xe";
export const APP_VERSION = "1.0.0";
export const BUILD_NUMBER = "2025.05.01";

// ✅ FIXED: Enable dark mode feature flag
export const FEATURES = {
  OFFLINE_MODE: true,
  SYNC_BACKGROUND: true,
  PRINT_SUPPORT: true,
  CAMERA_SUPPORT: true,
  NOTIFICATIONS: true,
  DARK_MODE: true, // ✅ CHANGED: Enable dark mode
};

// Default settings
export const DEFAULT_SETTINGS = {
  autoSync: true,
  syncWifiOnly: false,
  notificationsEnabled: true,
  soundEnabled: true,
  fontSize: "medium", // 'small', 'medium', 'large'
  defaultPrinter: "Brother",
};

// Pagination
export const ITEMS_PER_PAGE = 20;

// Cache expiry (in milliseconds)
export const CACHE_EXPIRY = {
  WEIGHING_LIST: 5 * 60 * 1000, // 5 minutes
  CUSTOMER_LIST: 30 * 60 * 1000, // 30 minutes
  PRODUCT_LIST: 30 * 60 * 1000, // 30 minutes
  VEHICLE_LIST: 30 * 60 * 1000, // 30 minutes
};

// API timeout settings
export const API_TIMEOUT = 30000; // 30 seconds
// Retry settings
export const API_RETRY = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000, // 2 seconds
};
