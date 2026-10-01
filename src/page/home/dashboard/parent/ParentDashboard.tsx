import React, { useState, useEffect } from "react";
import StatsCards from "./Card";
import Kids from "./Kids";
import Transactions from "../parent/Transactions";
import Results from "./Results";
import Tasks from "./Tasks";
import Timetable from "./Timetable";
import Events from "./Events";
import UploadContent from "./UploadContent";
import { useTranslation } from "react-i18next";
import { getPagesDataText, getParentDashboardText } from "../../../../helpers/useTranslations";
import Attendance from "./Attendance";

const ParentDashboard: React.FC = () => {
  const [parentName, setParentName] = useState<string>("Parent");
  const [activeTab, setActiveTab] = useState<
    "overview" | "results" | "tasks" | "timetable" | "uploadContent" | "events" | "Attendance"
  >("overview");
  const { t } = useTranslation()
  const texts = getParentDashboardText(t)
  const T = getPagesDataText(t)
  useEffect(() => {
    const getLoggedInParent = async () => {
      try {
        const userName = localStorage.getItem("userName") || "";
        const userGender = localStorage.getItem("userGender") || "";

        if (userName) {
          let title = "Mr.";
          if (userGender === "Female") {
            title = "Ms.";
          }
          setParentName(`${title} ${userName}`);
        } else {
          setParentName("Parent");
        }
      } catch (error) {
        console.error("Error fetching parent data:", error);
        setParentName("Parent");
      }
    };

    getLoggedInParent();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">
          Welcome {parentName}
        </h1>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav
            className="-mb-px flex space-x-8 overflow-x-auto"
            aria-label="Tabs"
          >
            <button
              onClick={() => setActiveTab("overview")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                {texts.Dashboard_Overview}
              </div>
            </button>

            <button
              onClick={() => setActiveTab("results")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "results"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {texts.Academic_Results}
              </div>
            </button>

            <button
              onClick={() => setActiveTab("tasks")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "tasks"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"
                  />
                </svg>
                {texts.Tasks}
              </div>
            </button>

            <button
              onClick={() => setActiveTab("uploadContent")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "uploadContent"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {texts.Uploaded_Content}
              </div>
            </button>

            <button
              onClick={() => setActiveTab("events")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "events"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {texts.Events}
              </div>
            </button>

            <button
              onClick={() => setActiveTab("timetable")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "timetable"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {texts.Class_Timetable}
              </div>
            </button>
            <button
              onClick={() => setActiveTab("Attendance")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "Attendance"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {T.Attendance}
              </div>
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "overview" ? (
        <>
          <StatsCards />
          <div className="mb-8">
            <Kids />
          </div>
          <Transactions />
        </>
      ) : activeTab === "results" ? (
        <Results />
      ) : activeTab === "tasks" ? (
        <Tasks />
      ) : activeTab === "uploadContent" ? (
        <UploadContent />
      ) : activeTab === "events" ? (
        <Events />
      ) : activeTab === "Attendance" ? (
        <Attendance />
      ) : (
        <Timetable />
      )}
    </div>
  );
};

export default ParentDashboard;
 