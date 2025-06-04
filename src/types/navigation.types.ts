// src/types/navigation.types.ts
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Phieucan,
  Khachhang,
  Hanghoa,
  Soxe,
  NhanvienWithPermissions,
  Nhanvien,
} from "./api.types";

// Auth Navigator
export type AuthStackParamList = {
  Login: undefined;
};

// Tab Navigation
export type MainTabParamList = {
  Home: undefined;
  WeighingList: undefined;
  Reports: undefined;
  Settings: undefined;
  Management: undefined;
};

export type ManagementStackParamList = {
  ManagementHome: undefined;
  VehicleList: undefined;
  CompanyList: undefined;
  ProductList: undefined;
  UserList: undefined;
  PermissionList: undefined;

  AddVehicle: { vehicle?: Soxe };
  AddCompany: { company?: Khachhang };
  AddProduct: { product?: Hanghoa | undefined };
  AddUser: { user?: Nhanvien };
  AddPermissionGroup: { group?: any };

  UserPermissions: { user: NhanvienWithPermissions };
  GroupPermissions: { group: any };
};

// Weighing Navigator
export type WeighingStackParamList = {
  WeighingListScreen: undefined;
  WeighingDetail: { weighingId: number };
  NewWeighing: undefined;
  CompleteWeighing: { weighingId: number };
};

// Settings Navigator
export type SettingsStackParamList = {
  SettingsHome: undefined;
  AccountSettings: undefined;
  DeviceSettings: undefined;
  SyncSettings: undefined;
  PrintSettings: undefined;
  UISettings: undefined;
  Notifications: undefined;
};

// Reports Navigator
export type ReportsStackParamList = {
  ReportsHome: undefined;
  CompanyReports: undefined;
  ProductReports: undefined;
  VehicleReports: undefined;
  DateRangeReports: undefined;
  CustomReport: undefined;
  PhieucanDetail: { phieucanSTT: number }; // Added for CustomReport navigation
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  AddEditWeighing: { weighing?: Phieucan };
  WeighingDetail: {
    weighing: Phieucan;
    weighingId: number;
  }; // Updated to support both params
  AddEditVehicle: { vehicle?: Soxe };
  AddEditDriver: { driver?: any };
  AddEditCompany: { company?: Khachhang };
  AddEditProduct: { product?: Hanghoa };
  Management: NavigatorScreenParams<ManagementStackParamList>;
  Weighing: NavigatorScreenParams<WeighingStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
  Reports: NavigatorScreenParams<ReportsStackParamList>;
  PhieucanDetail: {
    phieucanSTT?: number;
    weighing?: Phieucan;
  }; // Added as root route for flexible navigation
};

// Helper Screen Props
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type ManagementStackScreenProps<
  T extends keyof ManagementStackParamList,
> = CompositeScreenProps<
  NativeStackScreenProps<ManagementStackParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type WeighingStackScreenProps<T extends keyof WeighingStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<WeighingStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<SettingsStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type ReportsStackScreenProps<T extends keyof ReportsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ReportsStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// Declare global type augmentation for navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
