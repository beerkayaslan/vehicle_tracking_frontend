export interface VehicleLocation {
  id: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
}

export interface VehicleLocationResponse {
  results: VehicleLocation[];
}
