export interface DashboardStats {
  totalUsers: number;
  totalVehicles: number;
  vehiclesAvailable: number;
  vehiclesSold: number;
  vehiclesReserved: number;
  totalMessages: number;
  totalBrands: number;
  serverTime: { date: string };
  recentActivity: Array<{
    type: string;
    text: string;
    date: string;
  }>;
}
