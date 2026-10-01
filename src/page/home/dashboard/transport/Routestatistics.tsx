import React from "react";
import ControlledTable from "../../../../components/uncontrolled/ControlledTable"; // Update with your actual path

interface RouteStats {
  id: string | number; // Required by ControlledTable
  routeName: string;
  vehicleCount: number;
  pickupPointCount: number;
  totalStudents: number;
}

interface RouteStatisticsProps {
  routeStats: RouteStats[];
  loading?: boolean;
}

const RouteStatistics: React.FC<RouteStatisticsProps> = ({
  routeStats,
  loading = false,
}) => {
  // Define columns for the table
  const columns = [
    {
      key: "routeName",
      label: "Route Name",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: "vehicleCount",
      label: "Vehicles",
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{value}</span>
        </div>
      ),
    },
    {
      key: "pickupPointCount",
      label: "Pickup Points",
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{value}</span>
        </div>
      ),
    },
    {
      key: "totalStudents",
      label: "Students",
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{value}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
          Routes Information
        </h3>

        <ControlledTable
          columns={columns}
          data={routeStats}
          title=""
          loading={loading}
          customClassName="relative bg-white"
          emptyMessage="No route statistics available"
          actionColumn={false}
          showSearch={false}
          showExport={true}
          showSelectAll={false}
          header={true}
          btn={false}
          exportFilename="route_statistics"
          exportTitle="Route Statistics Report"
          showPaginationFooter={routeStats.length > 10}
        />
      </div>
    </div>
  );
};

export default RouteStatistics;
