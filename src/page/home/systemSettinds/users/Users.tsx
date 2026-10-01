import React, { useState, useEffect } from "react";
import UsersParent from "./Parent";
import Teacher from "../users/Teacher";
import Librarian from "../users/Librarian";
import Transport from "../users/Tranport";
import Hostel from "../users/Hostel";
import Accountant from "../users/Accountant";
import Receptionist from "../users/Receptionist";
import { useTranslation } from "react-i18next";
import {
  getPagesDataText,
  getPagesNameText,
} from "../../../../helpers/useTranslations";
import { useLocation } from "react-router-dom";
import { useRoleTitles } from "../../../../hooks/queries/role/useCreateRole"; 

type ReportKey =
  | "PARENT"
  | "TEACHER"
  | "HOD"
  | "PRINCIPAL"
  | "LIBRARIAN"
  | "TRANSPORT"
  | "HOSTEL"
  | "HOSTEL_WARDEN"
  | "TRANSPORT_INCHARGE"
  | "ACCOUNTANT"
  | "RECEPTIONIST"
  | "ADMIN";


const TITLE_TO_KEY_MAP: Record<string, ReportKey> = {
  PARENT: "PARENT",
  TEACHER: "TEACHER",
  TRANSPORT: "TRANSPORT",
  HOSTEL: "HOSTEL",
  LIBRARIAN: "LIBRARIAN",
  ACCOUNTANT: "ACCOUNTANT",
  RECEPTIONIST: "RECEPTIONIST",
  ADMIN: "ADMIN",
};


const TITLE_DISPLAY_MAP: Record<string, string> = {
  ADMIN: "Admin",
  TEACHER: "Teacher",
  PARENT: "Parent",
  TRANSPORT: "Transport",
  HOSTEL: "Hostel",
  LIBRARIAN: "Librarian",
  ACCOUNTANT: "Accountant",
  RECEPTIONIST: "Receptionist",
};

const Users: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const Select_Text = getPagesDataText(t);
  const Users_Text = getPagesNameText(t);


  const { data: backendTitles = [], isLoading: titlesLoading } = useRoleTitles();

  const [selectedReport, setSelectedReport] = useState<ReportKey>(() => {
    const state = location.state as { selectedTab?: string } | null;
    const tab = state?.selectedTab?.toUpperCase();
    if (tab && TITLE_TO_KEY_MAP[tab]) return TITLE_TO_KEY_MAP[tab];
    return "PARENT";
  });

  
  useEffect(() => {
    if (backendTitles.length > 0) {
      const validKeys = backendTitles
        .map((t: string) => TITLE_TO_KEY_MAP[t])
        .filter(Boolean);
      if (!validKeys.includes(selectedReport)) {
        setSelectedReport(validKeys[0] ?? "PARENT");
      }
    }
  }, [backendTitles]);

  const renderSelectedReport = () => {
    switch (selectedReport) {
      case "PARENT":
        return <UsersParent />;
      case "TEACHER":
        return <Teacher role="TEACHER" />;
      case "HOD":
        return <Teacher role="HOD" />;
      case "PRINCIPAL":
        return <Teacher role="PRINCIPAL" />;
      case "LIBRARIAN":
        return <Librarian />;
      case "TRANSPORT":
      case "TRANSPORT_INCHARGE":
        return <Transport />;
      case "HOSTEL":
      case "HOSTEL_WARDEN":
        return <Hostel />;
      case "ACCOUNTANT":
        return <Accountant />;
      case "RECEPTIONIST":
        return <Receptionist />;
      default:
        return (
          <div className="text-gray-500 text-center py-10">
            {Select_Text.Please_select_a_report_to_view}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="w-full bg-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-4 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-bold text-gray-700 border-b sm:border-none pb-2 sm:pb-0">
          {Users_Text.Users}
        </h2>

        <div className="flex flex-wrap justify-center sm:justify-end gap-2">
          {titlesLoading ? (
            
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="px-4 py-2 rounded-md bg-gray-200 animate-pulse w-20 h-9"
              />
            ))
          ) : (
            backendTitles.map((title: string) => {
              const key = TITLE_TO_KEY_MAP[title];
              if (!key) return null; 

              const label = TITLE_DISPLAY_MAP[title] || title;
              const isActive = selectedReport === key;

              return (
                <button
                  key={title}
                  onClick={() => setSelectedReport(key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-orange-100 text-orange-600 font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {label}
                </button>
              );
            })
          )}
        </div>
      </div>
      <div className="flex-grow p-4 sm:p-6 bg-white shadow-inner overflow-x-auto">
        {renderSelectedReport()}
      </div>
    </div>
  );
};

export default Users;