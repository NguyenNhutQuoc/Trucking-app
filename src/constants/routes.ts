// Define available routes from your navigation structure
export const AVAILABLE_ROUTES = {
  // Main tab routes
  Home: true,
  WeighingList: true,
  Reports: true,
  Management: true,
  Settings: true,

  // Stack routes
  AddEditWeighing: false,
  WeighingDetail: true,
  AddEditVehicle: true,
  AddEditCompany: true,
  AddEditProduct: true,

  // Nested routes
  WeighingListScreen: true,
  CompleteWeighing: true,
  ManagementHome: true,
  VehicleList: true,
  CompanyList: true,
  ProductList: true,
  UserList: true,
  SettingsHome: true,
  ReportsHome: true,
} as const;

// Define the type for available routes

// Map legacy route names to expo-router paths
export const ROUTE_PATH_MAP: Record<string, string | false> = {
  // Tab routes
  Home: "/(main)",
  WeighingList: "/(main)/(weighing)",
  WeighingListScreen: "/(main)/(weighing)",
  Reports: "/(main)/(reports)",
  Management: "/(main)/(management)",
  Settings: "/(main)/(settings)",

  // Weighing stack
  WeighingDetail: "/(main)/(weighing)/detail",
  CompleteWeighing: "/(main)/(weighing)/complete",
  NewWeighing: false,
  AddEditWeighing: false,

  // Management stack
  ManagementHome: "/(main)/(management)",
  VehicleList: "/(main)/(management)/vehicles",
  CompanyList: "/(main)/(management)/companies",
  ProductList: "/(main)/(management)/products",
  UserList: "/(main)/(management)/users",
  AddVehicle: "/(main)/(management)/vehicles/new",
  AddCompany: "/(main)/(management)/companies/new",
  AddProduct: "/(main)/(management)/products/new",
  AddUser: "/(main)/(management)/users/new",
  AddPermissionGroup: "/(main)/(management)/permissions/new",
  UserPermissions: "/(main)/(management)/permissions/user",
  GroupPermissions: "/(main)/(management)/permissions/new",

  // Reports stack
  ReportsHome: "/(main)/(reports)",
  CompanyReports: "/(main)/(reports)/company",
  ProductReports: "/(main)/(reports)/product",
  VehicleReports: "/(main)/(reports)/vehicle",
  DateRangeReports: "/(main)/(reports)/date-range",
  CustomReport: "/(main)/(reports)/custom",
  PhieucanDetail: "/(main)/(reports)/detail",

  // Settings stack
  SettingsHome: "/(main)/(settings)",

  // Unavailable routes
  Statistics: false,
  Notifications: false,
  AccountSettings: false,
  DeviceSettings: false,
  SyncSettings: false,
  PrintSettings: false,
  UISettings: false,
};

