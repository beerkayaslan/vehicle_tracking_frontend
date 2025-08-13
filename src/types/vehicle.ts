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

export interface VehiclePagedResponse {
  results: Vehicle[];
  total: number;
  page: number;
  limit: number;
}

export interface VehicleResponse {
  result: Vehicle;
}

export interface VehicleViewQuery {
  page?: number;
  limit?: number;
}
