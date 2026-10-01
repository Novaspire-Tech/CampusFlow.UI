import React, { useState, useEffect } from "react";
import { parentDashboardService } from "../../../../services/dashboard/parentDashboardServices";
import BoysStudent from "../../../../assets/Image/BoysStudent (1) - Copy.jpeg";
import GirlsStudent from "../../../../assets/Image/Girl Student Image.png";
import { useTranslation } from "react-i18next";
import { getParentDashboardText } from "../../../../helpers/useTranslations";

interface Child {
  studentId: number;
  admissionNo: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  dob: string;
  religion?: string;
  castName?: string;
  phoneNumber?: string;
  email?: string;
  photo?: string;
  admissionDate: string;
  className: string;
  section: string;
  rollNo: string;
}

export default function Kids() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    const { t } = useTranslation()
    const texts = getParentDashboardText(t)

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);

      const schoolCode = localStorage.getItem("schoolCode") || "";
      const childrenData = await parentDashboardService.getChildren(schoolCode);

      setChildren(childrenData);
    } catch (error: any) {
      console.error("Error fetching children:", error);
      setError("Failed to load children data");
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const getDefaultImage = (gender: string) => {
    return gender?.toLowerCase() === "female" ? GirlsStudent : BoysStudent;
  };

  const getFullName = (child: Child) => {
    const parts = [child.firstName, child.middleName, child.lastName].filter(
      Boolean
    );
    return parts.join(" ");
  };

  if (loading) {
    return (
      <div className="bg-white p-6 md:p-8 shadow-sm rounded-lg">
        <h2 className="text-xl font-semibold mb-6">{texts.My_Kids}</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 md:p-8 shadow-sm rounded-lg">
        <h2 className="text-xl font-semibold mb-6">{texts.My_Kids}</h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
          <div className="flex items-center text-red-700">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
          </div>
          <button
            onClick={fetchChildren}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
          >
            {texts.Retry}
          </button>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="bg-white p-6 md:p-8 shadow-sm rounded-lg">
        <h2 className="text-xl font-semibold mb-6">{texts.My_Kids}</h2>
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">{texts.No_Children_found}</div>
          <div className="text-gray-400">
            {texts.No_students_are_associated_with_your_account}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 shadow-sm rounded-lg">
      <h2 className="text-xl font-semibold mb-6">{texts.My_Kids}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
        {children.map((child) => (
          <div
            key={child.studentId}
            className="bg-gray-50 p-6 rounded-lg shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6"
          >
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-md flex-shrink-0 bg-cyan-200">
              <img
                src={child.photo || getDefaultImage(child.gender)}
                alt={getFullName(child)}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getDefaultImage(
                    child.gender
                  );
                }}
              />
            </div>

            {/* Kid Details */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm w-full">
              {(
                [
                  ["Name", getFullName(child)],
                  ["Gender", child.gender],
                  ["Class", child.className],
                  ["Roll", child.rollNo],
                  ["Section", child.section],
                  ["Admission No", child.admissionNo],
                  ["Admission Date", child.admissionDate || "N/A"],
                ] as [string, string][]
              ).map(([label, value]) => (
                <React.Fragment key={label}>
                  <p className="text-gray-700 font-medium">{label}:</p>
                  <p className="text-gray-700">{value}</p>
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}