import { ConfigProvider } from "antd";
import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <ConfigProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider
          router={createBrowserRouter([
            {
              path: "/",
              lazy: () => import("./pages/Vehicles"),
            },
            {
              path: "/vehicle-detail/:id",
              lazy: () => import("./pages/VehicleDetail"),
            },
          ])}
        />
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default App;
