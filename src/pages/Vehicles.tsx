import { useMemo, useState } from "react";
import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Switch,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCreateVehicle, useVehicles } from "../query-hooks/useVehicles";
import type { Vehicle, VehicleCreate } from "../types/vehicle";
import { Link } from "react-router";
import dayjs from "dayjs";

export function Component() {
  // pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const { data, isLoading, isError, error, isFetching } = useVehicles({
    filters: { page, limit },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<VehicleCreate>();

  const { mutateAsync: createVehicle, isPending: isCreating } =
    useCreateVehicle();

  const columns: ColumnsType<Vehicle> = useMemo(
    () => [
      {
        title: "Plate Number",
        dataIndex: "plateNumber",
        key: "plateNumber",
        render: (text: string) => <>{text}</>,
      },
      {
        title: "Driver",
        dataIndex: "driverName",
        key: "driverName",
      },
      {
        title: "Status",
        dataIndex: "isActive",
        key: "isActive",
        render: (isActive: boolean) => (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Active" : "Inactive"}
          </Tag>
        ),
      },
      {
        title: "Created",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (text: string) => {
          return <span>{dayjs(text).format("DD.MM.YYYY HH:mm")}</span>;
        },
      },
      {
        title: "Plate Number (Websocket)",
        dataIndex: "id",
        key: "id",
        render: (_: string, record) => (
          <Flex gap={16}>
            <Link to={`/vehicle-detail-websocket/${record.id}`}>
              <Button type="primary">Websocket Detail</Button>
            </Link>
            <Link to={`/vehicle-detail-sse/${record.id}`}>
              <Button type="primary">SSE Detail</Button>
            </Link>
          </Flex>
        ),
      },
    ],
    []
  );

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await createVehicle({ data: values });
      message.success("Vehicle created");
      setIsModalOpen(false);
      form.resetFields();
    } catch (e: unknown) {
      // AntD validation error shape
      if (typeof e === "object" && e !== null && "errorFields" in e) return;
      const msg = e instanceof Error ? e.message : "Failed to create vehicle";
      message.error(msg);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vehicles</h1>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          New Vehicle
        </Button>
      </div>

      {isError ? (
        <div className="text-red-600">
          {(error as Error)?.message || "Error loading vehicles"}
        </div>
      ) : (
        <Table
          rowKey="id"
          loading={isLoading || isFetching}
          dataSource={data?.results || []}
          columns={columns}
          pagination={{
            current: data?.page ?? page,
            pageSize: data?.limit ?? limit,
            total: data?.total ?? 0,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p);
              setLimit(ps);
            },
          }}
        />
      )}

      <Modal
        title="Create Vehicle"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleCreate}
        okButtonProps={{ loading: isCreating }}
        afterOpenChange={(open) => {
          if (!open) {
            form.resetFields();
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isActive: true }}
          name="createVehicle"
        >
          <Form.Item
            name="plateNumber"
            label="Plate Number"
            rules={[{ required: true, message: "Please enter plate number" }]}
          >
            <Input placeholder="34 ABC 123" allowClear />
          </Form.Item>

          <Form.Item
            name="driverName"
            label="Driver Name"
            rules={[{ required: true, message: "Please enter driver name" }]}
          >
            <Input placeholder="John Doe" allowClear />
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
