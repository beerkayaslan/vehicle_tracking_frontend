import { Button, Card, Spin, Tag } from "antd";
import { useNavigate, useParams } from "react-router";
import { useVehicleById } from "../query-hooks/useVehicles";
import dayjs from "dayjs";
import { Map } from "@vis.gl/react-google-maps";

export function Component() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, error } = useVehicleById({
    id: id ?? "",
    enabled: !!id,
  });

  if (!id) {
    return (
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Vehicle Detail</h1>
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
          <h1 className="text-2xl font-semibold">Vehicle Detail</h1>
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
          <h1 className="text-2xl font-semibold">Vehicle Detail</h1>
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
        <h1 className="text-2xl font-semibold">Vehicle Detail</h1>
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

      <Map
        style={{ width: "100%", height: "700px", marginTop: 10 }}
        defaultCenter={{ lat: 22.54992, lng: 0 }}
        defaultZoom={3}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
      />
    </div>
  );
}
