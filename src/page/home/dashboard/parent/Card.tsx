import React, { useState, useEffect } from "react";
import { IconField } from "../../../../components";
import { parentDashboardService } from "../../../../services/dashboard/parentDashboardServices";
import { useTranslation } from "react-i18next";
import { getParentDashboardText } from "../../../../helpers/useTranslations";

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  bgColor: string;
  textColor: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  bgColor,
  textColor,
  loading = false,
}) => (
  <div
    className={`flex items-center p-6 rounded-xl shadow-lg ${bgColor} transition-all duration-300 hover:shadow-xl`}
  >
    <div
      className={`p-4 rounded-full ${bgColor} bg-opacity-75 mr-5 flex items-center justify-center`}
    >
      <div className={`text-3xl ${textColor}`}>{icon}</div>
    </div>

    <div className="flex-1">
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div
            className={`h-9 w-32 rounded-lg ${bgColor} bg-opacity-50`}
          ></div>
          <div
            className={`h-5 w-24 rounded-lg ${bgColor} bg-opacity-50`}
          ></div>
        </div>
      ) : (
        <>
          <div className={`text-3xl font-bold ${textColor} mb-1`}>{value}</div>
          <div className={`text-base font-medium ${textColor} opacity-90`}>
            {label}
          </div>
        </>
      )}
    </div>
  </div>
);

const StatsCards: React.FC = () => {
  const [stats, setStats] = useState({
    dueFees: 0,
    totalResults: 0,
    totalExpenses: 0,
  });

  const [loading, setLoading] = useState({
    analytics: true,
  });

  const [error, setError] = useState<string | null>(null);

  const { t } = useTranslation()
      const texts = getParentDashboardText(t)

  const fetchAnalytics = async () => {
    try {
      setLoading({ analytics: true });
      setError(null);

      const schoolCode = localStorage.getItem("schoolCode") || "";
      const analyticsData = await parentDashboardService.getAnalytics(
        schoolCode
      );

      setStats({
        dueFees: analyticsData.dueFees || 0,
        totalResults: analyticsData.totalResults || 0,
        totalExpenses: analyticsData.totalExpenses || 0,
      });
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      setError("Failed to load dashboard data");
      setStats({
        dueFees: 0,
        totalResults: 0,
        totalExpenses: 0,
      });
    } finally {
      setLoading({ analytics: false });
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Refresh every 5 minutes
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (error && loading.analytics) {
    return (
      <div className="p-6 mb-6 bg-red-50 border border-red-200 rounded-xl shadow">
        <div className="flex items-center text-red-700">
          <IconField name="FaExclamationTriangle" className="mr-3 text-xl" />
          <span className="text-lg font-medium">{error}</span>
        </div>
        <button
          onClick={fetchAnalytics}
          className="mt-3 px-4 py-2 text-base bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition font-medium"
        >
          {texts.Retry}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
      {/* Due Fees Card */}
      <div className="transform transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]">
        <StatCard
          icon={<IconField name="FaRupeeSign" size={34} />}
          value={`₹${stats.dueFees.toLocaleString("en-IN")}`}
          label={texts.Due_Fees}
          bgColor="bg-gradient-to-r from-red-100 to-red-50 border border-red-200"
          textColor="text-red-700"
          loading={loading.analytics}
        />
      </div>

      {/* Result Card */}
      <div className="transform transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]">
        <StatCard
          icon={<IconField name="FaGraduationCap" size={34} />}
          value={stats.totalResults.toLocaleString("en-IN")}
          label={texts.Total_Results}
          bgColor="bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-200"
          textColor="text-yellow-700"
          loading={loading.analytics}
        />
      </div>

      {/* Expenses Card */}
      <div className="transform transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]">
        <StatCard
          icon={<IconField name="FaRupeeSign" size={34} />}
          value={`₹${stats.totalExpenses.toLocaleString("en-IN")}`}
          label={texts.Total_Expenses}
          bgColor="bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200"
          textColor="text-blue-700"
          loading={loading.analytics}
        />
      </div>
    </div>
  );
};

export default StatsCards;