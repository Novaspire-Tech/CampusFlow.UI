import React, { useEffect, useMemo, useState } from "react";
import ControlledTable from "../../../../components/uncontrolled/ControlledTable";

interface StudentTransportData {
  id: string;
  studentName: string;
  className: string;
  sectionName: string;
  admissionNo: string;
  routeName: string;
  pickupPoint: string;
  fees: string;
  gender?: string;
}

interface StudentTransportAllocationsProps {
  studentsWithTransport: StudentTransportData[];
  loading?: boolean;
  externalRouteFilter?: string;
  externalPickupPointFilter?: string;
  onFilterChange?: (route: string, pickupPoint: string) => void;
  hideRouteFilter?: boolean;
  hidePickupPointFilter?: boolean;
  hideGenderFilter?: boolean;
}

const StudentTransportAllocations: React.FC<
  StudentTransportAllocationsProps
> = ({
  studentsWithTransport,
  loading = false,
  externalRouteFilter = "",
  externalPickupPointFilter = "",
  onFilterChange,
  hideRouteFilter = false,
  hidePickupPointFilter = false,
  hideGenderFilter = false,
}) => {
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<string>("all");
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  // Update filters when external filters change (only if provided)
  useEffect(() => {
    if (externalRouteFilter) {
      setSelectedRoute(externalRouteFilter);
    }
    if (externalPickupPointFilter) {
      setSelectedPickupPoint(externalPickupPointFilter);
    }
  }, [externalRouteFilter, externalPickupPointFilter]);

  // Get unique values for filters
  const uniqueRoutes = useMemo(() => {
    const routeNames = new Set(
      studentsWithTransport.map((s) => s.routeName).filter((r) => r !== "N/A"),
    );
    return Array.from(routeNames).sort();
  }, [studentsWithTransport]);

  const uniquePickupPoints = useMemo(() => {
    const points = new Set(
      studentsWithTransport
        .map((s) => s.pickupPoint)
        .filter((p) => p !== "N/A"),
    );
    return Array.from(points).sort();
  }, [studentsWithTransport]);

  const uniqueClasses = useMemo(() => {
    const classes = new Set(
      studentsWithTransport.map((s) => s.className).filter((c) => c !== "N/A"),
    );
    return Array.from(classes).sort();
  }, [studentsWithTransport]);

  // Filter students with all criteria
  const filteredStudents = useMemo(() => {
    let filtered = studentsWithTransport;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.studentName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.pickupPoint
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.admissionNo
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.className.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Route filter
    if (selectedRoute !== "all") {
      filtered = filtered.filter(
        (student) => student.routeName === selectedRoute,
      );
    }

    // Pickup Point filter
    if (selectedPickupPoint !== "all") {
      filtered = filtered.filter(
        (student) => student.pickupPoint === selectedPickupPoint,
      );
    }

    // Gender filter
    if (selectedGender !== "all") {
      filtered = filtered.filter(
        (student) =>
          student.gender?.toLowerCase() === selectedGender.toLowerCase(),
      );
    }

    // Class filter
    if (selectedClass !== "all") {
      filtered = filtered.filter(
        (student) => student.className === selectedClass,
      );
    }

    return filtered;
  }, [
    studentsWithTransport,
    searchTerm,
    selectedRoute,
    selectedPickupPoint,
    selectedGender,
    selectedClass,
  ]);

  // Handle route change
  const handleRouteChange = (newRoute: string) => {
    setSelectedRoute(newRoute);
    setSelectedPickupPoint("all");
    onFilterChange?.(newRoute, "all");
  };

  // Handle pickup point change
  const handlePickupPointChange = (newPickupPoint: string) => {
    setSelectedPickupPoint(newPickupPoint);
    onFilterChange?.(selectedRoute, newPickupPoint);
  };

  // Define table columns for ControlledTable
  const tableColumns = [
    {
      key: "studentName",
      label: "Student Name",
      render: (value: string) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
        </div>
      ),
    },
    
    {
      key: "admissionNo",
      label: "Admission No",
    },
    {
      key: "className",
      label: "Class",
    },
    {
      key: "sectionName",
      label: "Section",
    },
    {
      key: "routeName",
      label: "Route",
    },
    {
      key: "pickupPoint",
      label: "Pickup Point",
    },
    {
      key: "gender",
      label: "Gender",
    },
  ];

  return (
    <div
      className="bg-white rounded-2xl shadow-xl p-6"
      id="student-transport-section"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Student Transport Details
        </h2>
        {studentsWithTransport.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {/* Show route if all students are from same route */}
            {(() => {
              const uniqueRoutes = new Set(
                studentsWithTransport.map((s) => s.routeName),
              );
              if (uniqueRoutes.size === 1 && !uniqueRoutes.has("N/A")) {
                const routeName = Array.from(uniqueRoutes)[0];
                return (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    <i className="bx bx-bus text-sm"></i>
                    Route: {routeName}
                  </span>
                );
              }
              return null;
            })()}
            {/* Show pickup point if all students are from same pickup point */}
            {(() => {
              const uniquePickups = new Set(
                studentsWithTransport.map((s) => s.pickupPoint),
              );
              if (uniquePickups.size === 1 && !uniquePickups.has("N/A")) {
                const pickupName = Array.from(uniquePickups)[0];
                return (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <i className="bx bx-map-pin text-sm"></i>
                    Pickup Point: {pickupName}
                  </span>
                );
              }
              return null;
            })()}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Route Filter */}
        {!hideRouteFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Route
            </label>
            <select
              value={selectedRoute}
              onChange={(e) => handleRouteChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Routes</option>
              {uniqueRoutes.map((route) => (
                <option key={route} value={route}>
                  {route}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pickup Point Filter */}
        {!hidePickupPointFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Point
            </label>
            <select
              value={selectedPickupPoint}
              onChange={(e) => handlePickupPointChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Points</option>
              {uniquePickupPoints.map((point) => (
                <option key={point} value={point}>
                  {point}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Gender Filter */}
        {!hideGenderFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        )}

        {/* Class Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Classes</option>
            {uniqueClasses.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing{" "}
        <span className="font-semibold text-gray-800">
          {filteredStudents.length}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-800">
          {studentsWithTransport.length}
        </span>{" "}
        students
      </div>

      {/* Table View */}
      <ControlledTable
        columns={tableColumns}
        data={filteredStudents}
        fullData={studentsWithTransport}
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        header={true}
        showSearch={true}
        showExport={true}
        actionColumn={false}
        showSelectAll={false}
        loading={loading}
        emptyMessage={
          studentsWithTransport.length === 0
            ? "No students have been allocated to transport yet"
            : "No students match the selected filters"
        }
        customClassName="relative bg-transparent rounded-xl shadow-none mt-0"
        exportFilename="student_transport_allocations"
        exportTitle="Student Transport Allocations Report"
      />
    </div>
  );
};

export default StudentTransportAllocations;
