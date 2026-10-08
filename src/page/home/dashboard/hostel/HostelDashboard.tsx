import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../../helpers/useTranslations";
import IconField from "../../../../components/IconField";
import { useHostels } from "../../../../hooks/queries/hostel/useHostel";
import { useRoomTypes } from "../../../../hooks/queries/hostel/useRoomType";
import { useHostelRooms } from "../../../../hooks/queries/hostel/useHostelRoom";
import { studentHostelFeesService } from "../../../../services/hostel/Studenthostelfeesservice";
import { studentService } from "../../../../services/studentInformation/studentService";
import StatCard from "../../../../page/home/dashboard/hostel/Statcard";
import OccupancyChart from "../../../../page/home/dashboard/hostel/Occupancychart";
import QuickActions from "../../../../page/home/dashboard/hostel/Quickactions";
import HostelCard from "../../../../page/home/dashboard/hostel/Hostelcard";
import GenderDistributionChart from "../../../../page/home/dashboard/hostel/Genderdistributionchart";

interface StudentHostelData {
  id: string;
  studentName: string;
  hostelName: string;
  roomNo: string;
  roomType: string;
  className: string;
  sectionName: string;
  admissionNo: string;
  gender?: string;
}

const HostelDashboard: React.FC = () => {
  const { t } = useTranslation();
  const Text = getPagesDataText(t);

  const { data: hostels = [] } = useHostels();
  const { data: roomTypes = [] } = useRoomTypes();
  const { data: hostelRoomsData } = useHostelRooms(0, 1000);
  const hostelRooms = hostelRoomsData?.hostelRoom || [];

  const [studentsWithHostel, setStudentsWithHostel] = useState<StudentHostelData[]>([]);

  useEffect(() => {
    const fetchStudentsWithHostel = async () => {
      try {
        // Step 1: Get all hostel fee allocations (has hostelName, roomName, admissionNo)
        const feeResponse = await studentHostelFeesService.getAllPages();
        const allocations = feeResponse?.content ?? [];

        if (allocations.length === 0) {
          setStudentsWithHostel([]);
          return;
        }

        // Step 2: Get all students to enrich with gender field
        // studentHostelFeesService does not return gender, so we cross-reference here
        const studentResponse = await studentService.getAllPages("asc");
        const allStudents: any[] = studentResponse?.students ?? [];

        // Build a map of admissionNo -> gender for quick lookup
        const genderMap = new Map<string, string>();
        allStudents.forEach((s: any) => {
          const admNo = s.admissionNo || s.uid || "";
          const gender = s.gender || "";
          if (admNo) genderMap.set(admNo, gender);
        });

        // Step 3: Map fee records and attach gender from student map
        const mapped: StudentHostelData[] = allocations.map((allocation: any) => {
          const admissionNo = allocation.admissionNo ?? "N/A";
          const gender = genderMap.get(admissionNo) || allocation.gender || "";

          return {
            id: String(allocation.studentHostelFeeId ?? allocation.id ?? ""),
            studentName:
              `${allocation.firstName ?? ""} ${allocation.lastName ?? ""}`.trim() || "N/A",
            hostelName: allocation.hostelName ?? "N/A",
            roomNo: allocation.roomName ?? "N/A",
            roomType: "N/A",
            className: allocation.studentClass ?? allocation.className ?? "N/A",
            sectionName: allocation.section ?? allocation.sectionName ?? "N/A",
            admissionNo,
            gender,
          };
        });

        setStudentsWithHostel(mapped);
      } catch (error) {
        console.error("Error fetching hostel students:", error);
        setStudentsWithHostel([]);
      }
    };

    fetchStudentsWithHostel();
  }, []);

  const statistics = useMemo(() => {
    const totalHostels = hostels.length;
    const totalRoomTypes = roomTypes.length;
    const totalRooms = hostelRooms.length;

    const totalBeds = hostelRooms.reduce(
      (sum: number, room: any) => sum + parseInt(room.noOfBeds || "0"),
      0,
    );

    const bookedBeds = studentsWithHostel.length;
    const availableBeds = totalBeds - bookedBeds;

    const avgCostPerBed =
      hostelRooms.length > 0
        ? Math.round(
            hostelRooms.reduce(
              (sum: number, room: any) =>
                sum + parseFloat(room.costPerBed || "0"),
              0,
            ) / hostelRooms.length,
          )
        : 0;

    const roomTypeDistribution = roomTypes
      .map((rt: any) => {
        const rtId = String(rt.roomTypeId || rt.id);
        const count = hostelRooms.filter(
          (room: any) => String(room.roomTypeId) === rtId,
        ).length;
        return {
          roomTypeId: rtId,
          roomType: rt.roomType || rt.name || "Unknown",
          count,
        };
      })
      .filter((rt) => rt.count > 0);

    return {
      totalHostels,
      totalRoomTypes,
      totalRooms,
      totalBeds,
      bookedBeds,
      availableBeds,
      avgCostPerBed,
      roomTypeDistribution,
    };
  }, [hostels, roomTypes, hostelRooms, studentsWithHostel]);

  const hostelOccupancyData = useMemo(() => {
    return hostels.map((hostel: any) => {
      const hostelId = String(hostel.hostelId || hostel.id);
      const hostelName = hostel.hostelName || hostel.name || "Unknown";

      const hostelRoomsForThisHostel = hostelRooms.filter(
        (room: any) => String(room.hostelId) === hostelId,
      );

      const totalBedsInHostel = hostelRoomsForThisHostel.reduce(
        (sum: number, room: any) => sum + parseInt(room.noOfBeds || "0"),
        0,
      );

      const bookedBedsInHostel = studentsWithHostel.filter(
        (student) => student.hostelName === hostelName,
      ).length;

      const occupancyPercent =
        totalBedsInHostel > 0
          ? Math.round((bookedBedsInHostel / totalBedsInHostel) * 100)
          : 0;

      return {
        hostelId,
        name: hostelName,
        type: hostel.hostelType || "General",
        address: hostel.address || "",
        roomCount: hostelRoomsForThisHostel.length,
        totalBeds: totalBedsInHostel,
        bookedBeds: bookedBedsInHostel,
        occupancyPercent,
      };
    });
  }, [hostels, hostelRooms, studentsWithHostel]);

  const handleHostelClick = (hostelName: string) => {
    window.location.href = `/hostel-student-allocation?hostel=${encodeURIComponent(hostelName)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="mb-8" style={{ animation: "slideUp 0.5s ease-out" }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
             {Text.Hostel_Dashboard||" Hostel Dashboard"}
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full p-4">
        <StatCard
          type="simple"
          title={Text.Total_Hostel ||'Total Hostel'}
          value={statistics.totalHostels}
          icon="FaBuilding"
          iconColor="from-blue-500 to-blue-600"
          delay={0.1}
        />
        <StatCard
          type="simple"
          title={Text.Total_Rooms||"Total Rooms"}
          value={statistics.totalRooms}
          icon="FaDoorOpen"
          iconColor="from-purple-500 to-purple-600"
          delay={0.2}
        />
        <StatCard
          type="simple"
          title={Text.Total_Beds||"Total Beds"}
          value={statistics.totalBeds}
          icon="FaBed"
          iconColor="from-emerald-500 to-emerald-600"
          delay={0.3}
        />
        <StatCard
          type="roomTypes"
          title={Text.Room_Types||"Room Types"}
          icon="FaTh"
          iconColor="text-purple"
          roomTypes={statistics.roomTypeDistribution}
          totalRoomTypes={statistics.totalRoomTypes}
          delay={0.5}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <OccupancyChart hostels={hostelOccupancyData} delay={0.7} />
        <GenderDistributionChart students={studentsWithHostel} delay={0.8} />
      </div>

      <QuickActions delay={0.9} />

      <div style={{ animation: "slideUp 0.6s ease-out 1s both" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{Text.Hostels_Overview}</h2>
        </div>

        {hostels.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <IconField
              name="FaBuilding"
              size={64}
              className="text-gray-300 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Hostels Found
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by adding your first hostel
            </p>
            <button
              onClick={() => (window.location.href = "/hostel")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md font-medium"
            >
              Add Hostel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostelOccupancyData.slice(0, 6).map((hostel) => (
              <div
                key={hostel.hostelId}
                onClick={() => handleHostelClick(hostel.name)}
                className="cursor-pointer"
              >
                <HostelCard
                  name={hostel.name}
                  type={hostel.type}
                  address={hostel.address}
                  totalBeds={hostel.totalBeds}
                  bookedBeds={hostel.bookedBeds}
                  roomCount={hostel.roomCount}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelDashboard;