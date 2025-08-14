import { Button, Card, Spin, Tag } from "antd";
import { useNavigate, useParams } from "react-router";
import {
  useVehicleById,
  useVehicleLocationByVehicleId,
} from "../query-hooks/useVehicles";
import dayjs from "dayjs";
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { useVehicleLocationStream } from "../query-hooks/useLocations";
import { useEffect, useMemo, useState } from "react";
import type { VehicleLocation } from "../types/locations";
import Polyline from "../components/Polyline";
import { GOOGLE_MAPS_MAP_ID } from "../../config";

export function Component() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, error } = useVehicleById({
    id: id ?? "",
    enabled: !!id,
  });

  const { lastLocation, isConnected } = useVehicleLocationStream(id);

  const { data: locationsData } = useVehicleLocationByVehicleId(id);

  const [track, setTrack] = useState<VehicleLocation[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<VehicleLocation | null>(null);

  useEffect(() => {
    if (locationsData?.results && locationsData.results.length > 0) {
      setTrack([...locationsData.results].reverse());
    }
  }, [locationsData]);

  useEffect(() => {
    if (lastLocation) {
      setTrack((prev) => {
        if (prev.length > 0) {
          const last = prev[prev.length - 1];
          if (last.id === lastLocation.id) return prev;
        }
        return [...prev, lastLocation];
      });
    }
  }, [lastLocation]);

  const locationLastMemo = useMemo(() => {
    return track[track.length - 1];
  }, [track]);

  if (!id) {
    return (
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Vehicle Detail (SSE)</h1>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
        <div className="text-red-600">Invalid vehicle id</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Vehicle Detail (SSE)</h1>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
        <Spin />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Vehicle Detail (SSE)</h1>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
        <div className="text-red-600">
          {error instanceof Error ? error.message : "Error loading vehicle"}
        </div>
      </div>
    );
  }

  const vehicle = data?.result;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vehicle Detail (SSE)</h1>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>

      {!vehicle ? (
        <div>No vehicle found</div>
      ) : (
        <Card>
          <div className="space-y-3">
            <div>
              <span className="font-medium">Plate Number: </span>
              {vehicle.plateNumber}
            </div>
            <div>
              <span className="font-medium">Driver Name: </span>
              {vehicle.driverName}
            </div>
            <div>
              <span className="font-medium">Status: </span>
              <Tag color={vehicle.isActive ? "green" : "red"}>
                {vehicle.isActive ? "Active" : "Inactive"}
              </Tag>
            </div>
            <div>
              <span className="font-medium">Created: </span>
              {dayjs(vehicle.createdAt).format("DD.MM.YYYY HH:mm")}
            </div>
          </div>
        </Card>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Tag color={isConnected ? "green" : "red"}>
          {isConnected ? "Streaming" : "Disconnected"}
        </Tag>
      </div>

      <Map
        style={{ width: "100%", height: "700px", marginTop: 10 }}
        defaultCenter={{ lat: 39.925533, lng: 32.866287 }}
        defaultZoom={6}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        mapId={GOOGLE_MAPS_MAP_ID}
      >
        {track.length > 0 &&
          track.map((p, idx) => {
            const isLast = idx === track.length - 1;
            return (
              <AdvancedMarker
                key={p.id}
                position={{
                  lat: parseFloat(p.latitude),
                  lng: parseFloat(p.longitude),
                }}
                title={dayjs(p.timestamp).format("DD.MM.YYYY HH:mm:ss")}
                onClick={() => setSelectedLocation(p)}
              >
                {!isLast && (
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      background: "#1dbe80",
                      border: "2px solid #0e6443",
                      borderRadius: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                )}
              </AdvancedMarker>
            );
          })}

        {locationLastMemo ? (
          <AdvancedMarker
            key={locationLastMemo.id}
            position={{
              lat: parseFloat(locationLastMemo.latitude),
              lng: parseFloat(locationLastMemo.longitude),
            }}
            title={dayjs(locationLastMemo.timestamp).format(
              "DD.MM.YYYY HH:mm:ss"
            )}
            onClick={() => setSelectedLocation(locationLastMemo)}
          >
            <Pin />
          </AdvancedMarker>
        ) : null}

        {selectedLocation && (
          <InfoWindow
            position={{
              lat: parseFloat(selectedLocation.latitude),
              lng: parseFloat(selectedLocation.longitude),
            }}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <div style={{ minWidth: 140 }}>
              <div className="text-sm font-medium mb-1">Konum Bilgisi</div>
              <div className="text-xs flex justify-between">
                <span>Hız:</span>
                <span className="font-semibold">
                  {selectedLocation.speed?.toFixed(1)} km/h
                </span>
              </div>
              <div className="text-xs flex justify-between">
                <span>Tarih:</span>
                <span className="font-semibold">
                  {dayjs(selectedLocation.timestamp).format(
                    "DD.MM.YYYY HH:mm:ss"
                  )}
                </span>
              </div>
            </div>
          </InfoWindow>
        )}

        <Polyline
          path={track.map((p) => ({
            lat: parseFloat(p.latitude),
            lng: parseFloat(p.longitude),
          }))}
        />
      </Map>
    </div>
  );
}
