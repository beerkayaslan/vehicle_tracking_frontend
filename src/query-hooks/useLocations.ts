import { useEffect, useMemo, useRef, useState } from "react";
import { API_URL } from "../../config";
import type { VehicleLocation } from "../types/locations";

export const useVehicleLocationStream = (vehicleId?: string) => {
  const [lastLocation, setLastLocation] = useState<VehicleLocation | undefined>(
    undefined
  );
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const esRef = useRef<EventSource | null>(null);

  const url = useMemo(() => {
    if (!vehicleId) return undefined;
    return `${API_URL}/locations/vehicle/${vehicleId}/stream`;
  }, [vehicleId]);

  useEffect(() => {
    if (!url) {
      setIsConnected(false);
      setLastLocation(undefined);
      return;
    }

    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      setError(undefined);
    };

    es.onmessage = (evt) => {
      const data = JSON.parse(evt.data) as VehicleLocation;
      // Basic validation
      if (
        typeof data?.latitude === "number" &&
        typeof data?.longitude === "number"
      ) {
        setLastLocation(data);
      }
    };

    es.onerror = () => {
      setIsConnected(false);
      setError("SSE connection error");
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [url]);

  return { lastLocation, isConnected, error } as const;
};
