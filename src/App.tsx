import { ConfigProvider } from "antd";
import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { APIProvider } from "@vis.gl/react-google-maps";
import { GOOGLE_MAPS_API_KEY } from "../config";

const queryClient = new QueryClient();

function App() {
  return (
    <ConfigProvider>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider
            router={createBrowserRouter([
              {
                path: "/",
                lazy: () => import("./pages/Vehicles"),
              },
              {
                path: "/vehicle-detail-websocket/:id",
                lazy: () => import("./pages/VehicleDetail_Websocket"),
              },
              {
                path: "/vehicle-detail-sse/:id",
                lazy: () => import("./pages/VehicleDetail_Sse"),
              },
            ])}
          />
        </QueryClientProvider>
      </APIProvider>
    </ConfigProvider>
  );
}

export default App;
