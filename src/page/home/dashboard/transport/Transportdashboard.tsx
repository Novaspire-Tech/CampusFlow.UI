import React, { useState, useMemo, useEffect } from "react";
import TransportPieCharts from "../../../../page/home/dashboard/transport/Transportpiecharts";
import {
  FaBus,
  FaCar,
  FaMapMarkerAlt,
  FaRoute,
  FaUserGraduate,
  FaChartLine,
} from "react-icons/fa";

import { useRoutes } from "../../../../hooks/queries/transport/useRoutes";
import { useVehicles } from "../../../../hooks/queries/transport/useVehicles";
import { usePickupPoints } from "../../../../hooks/queries/transport/usePickupPoints";
import { useRoutePickupPoints } from "../../../../hooks/queries/transport/useRoutePickupPoints";
import { useAssignVehicles } from "../../../../hooks/queries/transport/useAssignVehicles";
import { useStudentTransportFees } from "../../../../hooks/queries/transport/useStudentTransportFees";
import RoutePickupPointsOverview from "../../../../page/home/dashboard/transport/RoutepickupPointsOverview";
import { getPagesDataText } from "../../../../helpers/useTranslations";
import { useTranslation } from "react-i18next";

interface TransportStats {
  totalRoutes: number;
  totalVehicles: number;
  totalPickupPoints: number;
  totalAssignedVehicles: number;
  activeRoutes: number;
  vehiclesNeedingMaintenance: number;
  totalStudentsUsingTransport: number;
}

interface RouteStats {
  routeName: string;
  vehicleCount: number;
  pickupPointCount: number;
  totalStudents: number;
}

interface RouteWithPickupPoints {
  routeName: string;
  routeId: string;
  pickupPoints: {
    name: string;
    fees: string;
    distance: string;
    pickupTime: string;
    dropOffTime: string;
    studentCount: number;
    pickupPointId: string; 
  }[];
  totalFees: number;
  totalPickupPoints: number;
  totalStudents: number;
  vehicleCount?: number;
}

const TransportDashboard: React.FC = () => {

 const { t } = useTranslation()
    const Text = getPagesDataText(t)


  const { data: routes = [], isLoading: routesLoading } = useRoutes();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const { data: pickupPoints = [], isLoading: pickupPointsLoading } = usePickupPoints();
  const { data: routePickupPointsData, isLoading: routePickupLoading } = useRoutePickupPoints(0, 10000);
  const { data: assignedVehicles = [], isLoading: assignedVehiclesLoading } = useAssignVehicles();
  const { data: studentTransportFeesData, isLoading: studentFeesLoading } =
    useStudentTransportFees(0, 100000, "studentTransportFeesId", "asc", true);

  const routePickupPoints = routePickupPointsData?.routePickupPoints || [];

  const studentFeeRecords = useMemo(
    () => studentTransportFeesData?.data ?? [],
    [studentTransportFeesData],
  );

  const totalStudentsUsingTransport = useMemo(
    () => studentTransportFeesData?.totalItems ?? studentFeeRecords.length,
    [studentTransportFeesData, studentFeeRecords],
  );

  const [transportStats, setTransportStats] = useState<TransportStats>({
    totalRoutes: 0,
    totalVehicles: 0,
    totalPickupPoints: 0,
    totalAssignedVehicles: 0,
    activeRoutes: 0,
    vehiclesNeedingMaintenance: 0,
    totalStudentsUsingTransport: 0,
  });

  const [, setRouteStats] = useState<RouteStats[]>([]);
  const [routesWithPickups, setRoutesWithPickups] = useState<RouteWithPickupPoints[]>([]);
  const [, setTotalFees] = useState<number>(0);

  useEffect(() => {
    if (
      !routesLoading && !vehiclesLoading && !pickupPointsLoading &&
      !assignedVehiclesLoading && !routePickupLoading && !studentFeesLoading
    ) {
      setTransportStats({
        totalRoutes: routes.length,
        totalVehicles: vehicles.length,
        totalPickupPoints: pickupPoints.length,
        totalAssignedVehicles: assignedVehicles.length,
        activeRoutes: assignedVehicles.length,
        vehiclesNeedingMaintenance: 0,
        totalStudentsUsingTransport,
      });

      const studentCountByRoute = new Map<string, number>();
      const studentCountByPickup = new Map<string, number>();

      studentFeeRecords.forEach((fee: any) => {
        const routeId = String(fee.routeId ?? "");
        const pickupId = String(fee.pickUpPointId ?? "");
        if (routeId) {
          studentCountByRoute.set(routeId, (studentCountByRoute.get(routeId) ?? 0) + 1);
        }
        if (routeId && pickupId) {
          const key = `${routeId}_${pickupId}`;
          studentCountByPickup.set(key, (studentCountByPickup.get(key) ?? 0) + 1);
        }
      });

      const routeStatsMap = new Map<string, RouteStats>();
      routes.forEach((route: any) => {
        const routeId = String(route.id || route.routeId);
        const routeName = route.routeTitle || route.name || route.routeName || "Unknown Route";
        routeStatsMap.set(routeId, {
          routeName,
          vehicleCount: assignedVehicles.filter((av: any) => String(av.routeId) === routeId).length,
          pickupPointCount: routePickupPoints.filter((rpp: any) => String(rpp.routeId) === routeId).length,
          totalStudents: studentCountByRoute.get(routeId) ?? 0,
        });
      });
      setRouteStats(Array.from(routeStatsMap.values()));

      const routeMap = new Map<string, RouteWithPickupPoints>();
      routePickupPoints.forEach((rpp: any) => {
        const routeName = rpp.routeName || "Unknown Route";
        const routeId = String(rpp.routeId);
        const pickupPointId = String(rpp.pickupPointId ?? "");
        const pickupPointName = rpp.pickUpPoint || "Unknown Point";

        if (!routeMap.has(routeId)) {
          routeMap.set(routeId, {
            routeName,
            routeId,
            pickupPoints: [],
            totalFees: 0,
            totalPickupPoints: 0,
            totalStudents: 0,
            vehicleCount: assignedVehicles.filter((av: any) => String(av.routeId) === routeId).length,
          });
        }

        const route = routeMap.get(routeId)!;
        const key = `${routeId}_${pickupPointId}`;
        const studentCount = studentCountByPickup.get(key) ?? 0;

        route.pickupPoints.push({
          name: pickupPointName,
          fees: rpp.totalFees || "0",
          distance: rpp.distance || "0",
          pickupTime: rpp.pickupTime || "N/A",
          dropOffTime: rpp.dropOffTime || "N/A",
          studentCount,
          pickupPointId, 
        });
        route.totalFees += parseFloat(rpp.totalFees || "0");
        route.totalPickupPoints += 1;
        route.totalStudents += studentCount;
      });

      setRoutesWithPickups(Array.from(routeMap.values()));
      setTotalFees(routePickupPoints.reduce((sum: number, rpp: any) => sum + (parseFloat(rpp.totalFees) || 0), 0));
    }
  }, [
    routes, vehicles, pickupPoints, assignedVehicles, routePickupPoints,
    studentFeeRecords, totalStudentsUsingTransport,
    routesLoading, vehiclesLoading, pickupPointsLoading,
    assignedVehiclesLoading, routePickupLoading, studentFeesLoading,
  ]);

  const handleRouteClick = (routeId: string) => {
    window.location.href = `/student-transport-details?routeId=${encodeURIComponent(routeId)}`;
  };

  const handlePickupPointClick = (routeId: string, pickupPointId: string) => {
    window.location.href = `/student-transport-details?routeId=${encodeURIComponent(routeId)}&pickUpPointId=${encodeURIComponent(pickupPointId)}`;
  };

  const isLoading =
    routesLoading || vehiclesLoading || pickupPointsLoading ||
    assignedVehiclesLoading || routePickupLoading || studentFeesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transport dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
            {Text.Transport_Management_Dashboard}
          </h2>
        </div>

        {/* Top metric cards */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8">
          <div className="bg-white border-2 border-blue-100 shadow-lg rounded-xl p-6 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-50 rounded-xl"><FaBus className="text-3xl text-blue-600" /></div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">{Text.Active_Routes}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">
                    {transportStats.activeRoutes}
                    <span className="text-lg text-gray-500">/{transportStats.totalRoutes}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{Text.Coverage}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {transportStats.totalRoutes > 0
                    ? Math.round((transportStats.activeRoutes / transportStats.totalRoutes) * 100) : 0}%
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: transportStats.totalRoutes > 0 ? `${(transportStats.activeRoutes / transportStats.totalRoutes) * 100}%` : "0%" }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-green-100 shadow-lg rounded-xl p-6 hover:shadow-xl hover:border-green-300 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-50 rounded-xl"><FaCar className="text-3xl text-green-600" /></div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">{Text.Vehicles_Assigned}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">
                    {transportStats.totalAssignedVehicles}
                    <span className="text-lg text-gray-500">/{transportStats.totalVehicles}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{Text.Utilization}</p>
                <p className="text-2xl font-bold text-green-600">
                  {transportStats.totalVehicles > 0
                    ? Math.round((transportStats.totalAssignedVehicles / transportStats.totalVehicles) * 100) : 0}%
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: transportStats.totalVehicles > 0 ? `${(transportStats.totalAssignedVehicles / transportStats.totalVehicles) * 100}%` : "0%" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8"><TransportPieCharts /></div>

        {/* Distribution cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg"><FaChartLine className="text-2xl text-blue-600" /></div>
              <h3 className="text-xl font-bold text-gray-800">{Text.Route_Distribution}</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: Text.Total_Routes, value: transportStats.totalRoutes, color: "bg-blue-500" },
                { label: Text.Active_Routes, value: transportStats.activeRoutes, color: "bg-green-500" },
                { label: Text.Inactive_Routes, value: transportStats.totalRoutes - transportStats.activeRoutes, color: "bg-gray-300" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="text-lg font-bold text-gray-900">{value}</span>
                  </div>
                  <div className={`h-2 w-full rounded-full ${color}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-50 rounded-lg"><FaCar className="text-2xl text-green-600" /></div>
              <h3 className="text-xl font-bold text-gray-800">{Text.Vehicle_Status}</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: Text.Total_Vehicles, value: transportStats.totalVehicles, color: "bg-blue-500" },
                { label: Text.Assigned, value: transportStats.totalAssignedVehicles, color: "bg-green-500" },
                { label: Text.Available, value: transportStats.totalVehicles - transportStats.totalAssignedVehicles, color: "bg-yellow-500" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="text-lg font-bold text-gray-900">{value}</span>
                  </div>
                  <div className={`h-2 w-full rounded-full ${color}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div onClick={() => { window.location.href = "/pickup-points"; }}
            className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl hover:-translate-y-1 hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">{Text.Total_Pickup_Points}</p>
                <p className="text-3xl font-bold text-gray-800">{transportStats.totalPickupPoints}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl"><FaMapMarkerAlt className="text-4xl text-blue-500" /></div>
            </div>
          </div>

          <div onClick={() => { window.location.href = "/route-pickup-point"; }}
            className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl hover:-translate-y-1 hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">{Text.Routes_With_Pickups}</p>
                <p className="text-3xl font-bold text-gray-800">{routesWithPickups.length}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl"><FaRoute className="text-4xl text-purple-500" /></div>
            </div>
          </div>

          <div onClick={() => { window.location.href = "/student-transport-details"; }}
            className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl hover:-translate-y-1 hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">{Text.Students_Using_Transport}</p>
                <p className="text-3xl font-bold text-gray-800">{transportStats.totalStudentsUsingTransport}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl"><FaUserGraduate className="text-4xl text-indigo-500" /></div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <RoutePickupPointsOverview
            routesWithPickups={routesWithPickups}
            onRouteClick={handleRouteClick}
            onPickupPointClick={handlePickupPointClick}
          />
        </div>
      </div>
    </div>
  );
};

export default TransportDashboard;