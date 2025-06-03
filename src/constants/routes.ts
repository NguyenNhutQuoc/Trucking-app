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
