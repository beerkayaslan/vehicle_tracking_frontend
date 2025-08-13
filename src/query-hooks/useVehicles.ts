import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { VehicleCreate, VehicleViewQuery } from "../types/vehicle";
import {
  getLocationsByVehicleId,
  getVehicleById,
  getVehicles,
} from "../api/get";
import { postVehicle } from "../api/post";

export const useVehicles = ({
  filters,
  enabled = true,
}: {
  filters?: VehicleViewQuery;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["vehicles", filters],
    queryFn: () => getVehicles(filters),
    enabled: enabled,
  });
};

export const useVehicleById = ({
  id,
  enabled = true,
}: {
  id: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => getVehicleById(id),
    enabled: enabled,
  });
};

export const useVehicleLocationByVehicleId = ({
  vehicleId,
  enabled = true,
}: {
  vehicleId: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["vehicles", vehicleId],
    queryFn: () => getLocationsByVehicleId(vehicleId),
    enabled: enabled,
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: VehicleCreate }) => postVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
    },
  });
};
