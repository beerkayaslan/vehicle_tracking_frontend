import { API_URL } from "../../config";
import type { VehicleLocationResponse } from "../types/locations";
import type {
  VehiclePagedResponse,
  VehicleResponse,
  VehicleViewQuery,
} from "../types/vehicle";
import { buildQueryParams } from "../utils";

export async function getVehicles(
  filters?: VehicleViewQuery
): Promise<VehiclePagedResponse> {
  const params = buildQueryParams(filters);

  const response = await fetch(`${API_URL}/vehicles${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch vehicles");
  }

  return response.json();
}

export async function getVehicleById(id: string): Promise<VehicleResponse> {
  const response = await fetch(`${API_URL}/vehicles/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch vehicles");
  }

  return response.json();
}

export async function getLocationsByVehicleId(
  id: string | undefined
): Promise<VehicleLocationResponse> {
  const response = await fetch(`${API_URL}/vehicles/${id}/locations`);

  if (!response.ok) {
    throw new Error("Failed to fetch vehicle locations");
  }

  return response.json();
}
