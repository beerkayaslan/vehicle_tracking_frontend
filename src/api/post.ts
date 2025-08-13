import { API_URL } from "../../config";
import type { VehicleCreate } from "../types/vehicle";

export async function postVehicle(data: VehicleCreate) {
  const response = await fetch(`${API_URL}/vehicles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create vehicle");
  }

  return response.json();
}
