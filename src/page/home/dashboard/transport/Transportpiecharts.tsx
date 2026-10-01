import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { useRoutes } from "../../../../hooks/queries/transport/useRoutes";
import { useVehicles } from "../../../../hooks/queries/transport/useVehicles";
import { useRoutePickupPoints } from "../../../../hooks/queries/transport/useRoutePickupPoints";
import { useAssignVehicles } from "../../../../hooks/queries/transport/useAssignVehicles";
import { getPagesDataText } from "../../../../helpers/useTranslations";

interface RouteData {
  routeName: string;
  totalFees: number;
  color?: string;
}

interface VehicleTypeData {
  vehicleType: string;
  count: number;
  color?: string;
}

const TransportPieCharts: React.FC = () => {

  const { t } = useTranslation()
     const Text = getPagesDataText(t)

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeRevenueData, setRouteRevenueData] = useState<RouteData[]>([]);
  const [vehicleDistributionData, setVehicleDistributionData] = useState<
    VehicleTypeData[]
  >([]);
  const [, setCurrentMonth] = useState<string>("");

  // Fetch transport data
  const { data: routes = [], isLoading: routesLoading } = useRoutes();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const { data: routePickupPointsData, isLoading: routePickupLoading } =
    useRoutePickupPoints(0, 10000);
  const { data: assignedVehicles = [], isLoading: assignedVehiclesLoading } =
    useAssignVehicles();

  const routePickupPoints = routePickupPointsData?.routePickupPoints || [];

  const routeColors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#6366F1",
  ];

  const vehicleColors = [
    "#14B8A6",
    "#8B5CF6",
    "#F97316",
    "#EC4899",
    "#10B981",
    "#3B82F6",
    "#F59E0B",
    "#EF4444",
    "#6366F1",
    "#84CC16",
  ];

  const getCurrentMonthName = (): string => {
    const now = new Date();
    return now.toLocaleString("default", { month: "long" });
  };

  useEffect(() => {
    const processData = () => {
      try {
        setLoading(true);
        setError(null);

        const monthName = getCurrentMonthName();
        setCurrentMonth(monthName);

        // Process route revenue data
        const routeRevenueMap = new Map<string, number>();

        // Calculate total fees per route from routePickupPoints
        routePickupPoints.forEach((rpp: any) => {
          const routeName = rpp.routeName || "Unknown Route";
          const totalFees = parseFloat(rpp.totalFees) || 0;

          if (routeRevenueMap.has(routeName)) {
            routeRevenueMap.set(
              routeName,
              routeRevenueMap.get(routeName)! + totalFees,
            );
          } else {
            routeRevenueMap.set(routeName, totalFees);
          }
        });

        // Convert to array and sort
        const routeRevenueArray = Array.from(
          routeRevenueMap,
          ([routeName, totalFees]) => ({
            routeName,
            totalFees,
          }),
        ).sort((a, b) => b.totalFees - a.totalFees);

        // Add colors
        const routeDataWithColors = routeRevenueArray.map((item, index) => ({
          ...item,
          color: routeColors[index % routeColors.length],
        }));

        setRouteRevenueData(routeDataWithColors);

        // Process vehicle distribution data
        const vehicleTypeMap = new Map<string, number>();

        vehicles.forEach((vehicle: any) => {
          const vehicleType = vehicle.vehicleModel || "Unknown Type";

          if (vehicleTypeMap.has(vehicleType)) {
            vehicleTypeMap.set(
              vehicleType,
              vehicleTypeMap.get(vehicleType)! + 1,
            );
          } else {
            vehicleTypeMap.set(vehicleType, 1);
          }
        });

        // Convert to array and sort
        const vehicleTypeArray = Array.from(
          vehicleTypeMap,
          ([vehicleType, count]) => ({
            vehicleType,
            count,
          }),
        ).sort((a, b) => b.count - a.count);

        // Add colors
        const vehicleDataWithColors = vehicleTypeArray.map((item, index) => ({
          ...item,
          color: vehicleColors[index % vehicleColors.length],
        }));

        setVehicleDistributionData(vehicleDataWithColors);

        console.log("Route revenue data:", routeDataWithColors);
        console.log("Vehicle distribution data:", vehicleDataWithColors);
      } catch (err: any) {
        console.error("Error processing transport data for pie charts:", err);
        setError(
          "Failed to process transport data: " +
            (err.message || "Unknown error"),
        );
      } finally {
        setLoading(false);
      }
    };

    if (
      !routesLoading &&
      !vehiclesLoading &&
      !routePickupLoading &&
      !assignedVehiclesLoading
    ) {
      processData();
    }
  }, [
    routes,
    vehicles,
    routePickupPoints,
    assignedVehicles,
    routesLoading,
    vehiclesLoading,
    routePickupLoading,
    assignedVehiclesLoading,
  ]);

  // Prepare route revenue chart data
  const routeRevenueChart = {
    series: routeRevenueData.map((item) => item.totalFees),
    options: {
      chart: {
        type: "donut",
        animations: {
          enabled: true,
          speed: 800,
        },
      },
      labels: routeRevenueData.map((item) => item.routeName),
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          offsetY: 0,
          donut: {
            size: "65%",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "14px",
                fontWeight: 600,
                color: "#333",
              },
              value: {
                show: true,
                fontSize: "22px",
                fontWeight: 700,
                color: "#333",
                formatter: function (val: string) {
                  return "₹" + parseFloat(val).toFixed(0);
                },
              },
              total: {
                show: true,
                showAlways: true,
                label: Text.Total_Revenue,
                fontSize: "14px",
                fontWeight: 600,
                color: "#333",
                formatter: function (w: any) {
                  const total = w.globals.seriesTotals.reduce(
                    (a: number, b: number) => a + b,
                    0,
                  );
                  return "₹" + total.toFixed(0);
                },
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: "bottom",
        fontSize: "12px",
        fontWeight: 600,
        formatter: function (seriesName: string, opts: any) {
          const value = opts.w.globals.series[opts.seriesIndex];
          return seriesName + ": ₹" + value.toFixed(0);
        },
      },
      colors: routeRevenueData.map((item) => item.color || "#3B82F6"),
      tooltip: {
        y: {
          formatter: function (val: number) {
            return "₹" + val.toFixed(2);
          },
        },
      },
      responsive: [
        {
          breakpoint: 1024,
          options: {
            chart: { width: 300 },
            legend: { position: "bottom" },
          },
        },
        {
          breakpoint: 640,
          options: {
            chart: { width: 250 },
            legend: {
              position: "bottom",
              fontSize: "10px",
            },
          },
        },
      ],
    } as ApexCharts.ApexOptions,
  };

  // Prepare vehicle distribution chart data
  const vehicleDistributionChart = {
    series: vehicleDistributionData.map((item) => item.count),
    options: {
      chart: {
        type: "donut",
        animations: {
          enabled: true,
          speed: 800,
        },
      },
      labels: vehicleDistributionData.map((item) => item.vehicleType),
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          offsetY: 0,
          donut: {
            size: "65%",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "14px",
                fontWeight: 600,
                color: "#333",
              },
              value: {
                show: true,
                fontSize: "22px",
                fontWeight: 700,
                color: "#333",
                formatter: function (val: string) {
                  return val;
                },
              },
              total: {
                show: true,
                showAlways: true,
                label: Text.Total_Vehicles,
                fontSize: "14px",
                fontWeight: 600,
                color: "#333",
                formatter: function (w: any) {
                  const total = w.globals.seriesTotals.reduce(
                    (a: number, b: number) => a + b,
                    0,
                  );
                  return total.toString();
                },
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: "bottom",
        fontSize: "12px",
        fontWeight: 600,
        formatter: function (seriesName: string, opts: any) {
          const value = opts.w.globals.series[opts.seriesIndex];
          return seriesName + ": " + value;
        },
      },
      colors: vehicleDistributionData.map((item) => item.color || "#14B8A6"),
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val + " vehicles";
          },
        },
      },
      responsive: [
        {
          breakpoint: 1024,
          options: {
            chart: { width: 300 },
            legend: { position: "bottom" },
          },
        },
        {
          breakpoint: 640,
          options: {
            chart: { width: 250 },
            legend: {
              position: "bottom",
              fontSize: "10px",
            },
          },
        },
      ],
    } as ApexCharts.ApexOptions,
  };

  if (loading || routesLoading || vehiclesLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 text-center">
          <p className="text-red-500 font-semibold mb-2">Error Loading Data</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If no data found
  if (routeRevenueData.length === 0 && vehicleDistributionData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 flex flex-col items-center justify-center">
          <h3 className="text-base md:text-lg font-semibold text-center mb-4">
            Route Revenue Distribution
          </h3>
          <p className="text-gray-500 text-center">
            No route revenue data available
          </p>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 flex flex-col items-center justify-center">
          <h3 className="text-base md:text-lg font-semibold text-center mb-4">
            Vehicle Type Distribution
          </h3>
          <p className="text-gray-500 text-center">No vehicle data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Route Revenue Pie Chart */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <h3 className="text-base md:text-lg font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
        { Text.Route_Revenue}
        </h3>
        <div className="flex justify-center">
          <Chart
            options={routeRevenueChart.options}
            series={routeRevenueChart.series}
            type="donut"
            height={350}
          />
        </div>
      </div>

      {/* Vehicle Distribution Pie Chart */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <h3 className="text-base md:text-lg font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
          <i className="bx bx-car text-teal-500 text-xl"></i>
          {Text.Vehicle_Type_Distribution}
        </h3>
        <div className="flex justify-center">
          <Chart
            options={vehicleDistributionChart.options}
            series={vehicleDistributionChart.series}
            type="donut"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default TransportPieCharts;
