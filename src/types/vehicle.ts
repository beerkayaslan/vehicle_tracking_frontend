export interface Vehicle {
  id: string;
  plateNumber: string;
  driverName: string;
  isActive: boolean;
  createdAt: string;
}

export interface VehicleCreate {
  plateNumber: string;
  driverName: string;
  isActive: boolean;
}

export interface VehicleResponse {
  results: Vehicle[];
  total: number;
  page: number;
  limit: number;
}

export interface VehicleViewQuery {
  page?: number;
  limit?: number;
}
