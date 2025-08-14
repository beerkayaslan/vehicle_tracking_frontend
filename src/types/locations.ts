export interface VehicleLocation {
  id: string;
  vehicleId: string;
  latitude: string;
  longitude: string;
  speed: number;
  timestamp: string;
}

export interface VehicleLocationResponse {
  results: VehicleLocation[];
}

export interface VehicleLocationCreate {
  vehicleId: string;
  latitude: string;
  longitude: string;
  speed: number;
}
