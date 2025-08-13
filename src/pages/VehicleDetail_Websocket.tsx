import { Button, Card, Spin, Tag } from "antd";
import { useNavigate, useParams } from "react-router";
import {
  useVehicleById,
  useVehicleLocationByVehicleId,
} from "../query-hooks/useVehicles";
import dayjs from "dayjs";
import { Map as GoogleMap, Marker } from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { WS_URL } from "../../config";
import type { VehicleLocation } from "../types/locations";
import Polyline from "../components/Polyline";

export function Component() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, error } = useVehicleById({
    id: id ?? "",
    enabled: !!id,
  });
  const { data: locationsData } = useVehicleLocationByVehicleId(id);
  const [isConnected, setIsConnected] = useState(false);

  const [track, setTrack] = useState<VehicleLocation[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (locationsData?.results && locationsData.results.length > 0) {
      setTrack([...locationsData.results].reverse());
    }
  }, [locationsData]);

  // Helper to merge incoming locations (single or array) into track in a sorted, de-duplicated way
  const mergeLocations = (
    prev: VehicleLocation[],
    incoming: VehicleLocation | VehicleLocation[]
  ): VehicleLocation[] => {
    const list = Array.isArray(incoming) ? incoming : [incoming];
    const byId = new Map<string, VehicleLocation>();
    // Put previous first so newer incoming with same id overwrite
    prev.forEach((p) => byId.set(p.id, p));
    list.forEach((p) => byId.set(p.id, p));
    return Array.from(byId.values()).sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  // Websocket connection & live updates
  useEffect(() => {
    if (!id) return;

    // Connect with query param to auto join room
    const socket = io(WS_URL, {
      query: { vehicleId: id },
      transports: ["websocket"], // force websocket for lower latency
    });
    socketRef.current = socket;

    // Fallback: manual join if server expects explicit event
    socket.emit("join-vehicle", { vehicleId: id });

    socket.on("connect", () => {
      // console.log('Socket connected', socket.id);
      setIsConnected(true);
    });

    socket.on(
      "location-update",
      (data: VehicleLocation | VehicleLocation[]) => {
        setTrack((prev) => mergeLocations(prev, data));
      }
    );

    socket.on("disconnect", () => {
      // console.log('Socket disconnected');
      setIsConnected(false);
    });

    return () => {
      socket.off("location-update");
      socket.disconnect();
    };
  }, [id]);

  if (!id) {
    return (
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Vehicle Detail (Websocket)</h1>
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
          <h1 className="text-2xl font-semibold">Vehicle Detail (Websocket)</h1>
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
          <h1 className="text-2xl font-semibold">Vehicle Detail (Websocket)</h1>
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
        <h1 className="text-2xl font-semibold">Vehicle Detail (Websocket)</h1>
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

      <GoogleMap
        style={{ width: "100%", height: "700px", marginTop: 10 }}
        defaultCenter={{ lat: 39.925533, lng: 32.866287 }}
        defaultZoom={6}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
      >
        {/* {track.length > 1 &&
          track.slice(0, -1).map((p) => (
            <Marker
              key={p.id}
              position={{
                lat: parseFloat(p.latitude),
                lng: parseFloat(p.longitude),
              }}
              title={dayjs(p.timestamp).format("DD.MM.YYYY HH:mm:ss")}
            />
          ))} */}

        {track.length > 0 && (
          <>
            <Marker
              position={{
                lat: parseFloat(track[track.length - 1].latitude),
                lng: parseFloat(track[track.length - 1].longitude),
              }}
              title={`Vehicle ${id}`}
            />
            <Polyline
              path={track?.map((p) => ({
                lat: parseFloat(p.latitude),
                lng: parseFloat(p.longitude),
              }))}
            />
          </>
        )}
      </GoogleMap>
    </div>
  );
}
