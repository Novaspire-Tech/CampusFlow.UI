import React from "react";
import "boxicons/css/boxicons.min.css";
import { getPagesDataText } from "../../../../helpers/useTranslations";
import { useTranslation } from "react-i18next";

interface PickupPoint {
  name: string;
  fees: string;
  distance: string;
  pickupTime: string;
  dropOffTime: string;
  studentCount: number;
  pickupPointId: string; 
}

interface RouteWithPickupPoints {
  routeName: string;
  routeId: string; 
  pickupPoints: PickupPoint[];
  totalFees: number;
  totalPickupPoints: number;
  totalStudents: number;
  vehicleCount?: number;
}

interface RoutePickupPointsOverviewProps {
  routesWithPickups: RouteWithPickupPoints[];
  onRouteClick?: (routeId: string) => void;
  onPickupPointClick?: (routeId: string, pickupPointId: string) => void;
}

const RoutePickupPointsOverview: React.FC<RoutePickupPointsOverviewProps> = ({
  
  routesWithPickups,
  onRouteClick,
  onPickupPointClick,
}) => {

   const { t } = useTranslation()
    const Text = getPagesDataText(t)

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
      <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
      {Text.Route_Pickup_Points_Overview}
      </h3>

      {routesWithPickups.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routesWithPickups.map((route, index) => (
            <div
              key={index}
              className="border-2 border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-300"
            >
              {/* Route Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-100">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => onRouteClick?.(route.routeId)}
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <i className="bx bx-bus text-xl text-blue-600"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">
                      {route.routeName}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {route.totalPickupPoints} {Text.Pickup_Point}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {route.vehicleCount !== undefined && (
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">{Text.Vehicle}</div>
                      <div className="flex items-center gap-1 justify-center">
                        <i className="bx bx-car text-green-600 text-lg"></i>
                        <span className="text-xl font-bold text-green-600">
                          {route.vehicleCount}
                        </span>
                      </div>
                    </div>
                  )}

                  <div
                    className="text-center cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => onRouteClick?.(route.routeId)}
                  >
                    <div className="text-xs text-gray-500 mb-1">{Text.Total_Students}</div>
                    <div className="flex items-center gap-1 justify-center">
                      <i className="bx bx-group text-blue-600 text-lg"></i>
                      <span className="text-xl font-bold text-blue-600">
                        {route.totalStudents}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pickup Points List */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 mb-4">
                {route.pickupPoints.map((pickup, pIndex) => (
                  <div
                    key={pIndex}
                    className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPickupPointClick?.(route.routeId, pickup.pickupPointId);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <i className="bx bx-map-pin text-lg text-blue-600"></i>
                        <div className="flex-1">
                          <span className="font-semibold text-gray-800">
                            {pickup.name}
                          </span>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <i className="bx bx-user text-sm text-blue-500"></i>
                              <span className="font-semibold">{pickup.studentCount}</span>
                              <span>{Text.Student}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-green-700">
                          ₹{parseFloat(pickup.fees).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <i className="bx bx-trip text-gray-500"></i>
                        <span className="text-gray-600">{pickup.distance} km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <i className="bx bx-time-five text-gray-500"></i>
                        <span className="text-gray-600">{pickup.pickupTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <i className="bx bx-down-arrow-circle text-gray-500"></i>
                        <span className="text-gray-600">{pickup.dropOffTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <i className="bx bx-map text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No route pickup points configured</p>
        </div>
      )}
    </div>
  );
};

export default RoutePickupPointsOverview;