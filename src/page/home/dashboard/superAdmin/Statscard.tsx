import React from "react";
import type { IconType } from "react-icons";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  colorScheme: "blue" | "purple" | "green" | "indigo" | "yellow" | "red";
  subtitle?: string;
  subtitleValue?: string | number;
  progress?: number;
  showFullProgress?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  colorScheme,
  subtitle,
  subtitleValue,
  progress,
  showFullProgress = false,
}) => {
  const colorClasses = {
    blue: {
      border: "border-blue-100",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      textColor: "text-blue-600",
      gradient: "from-blue-500 to-blue-600",
    },
    purple: {
      border: "border-purple-100",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      textColor: "text-purple-600",
      gradient: "from-purple-500 to-purple-600",
    },
    green: {
      border: "border-green-100",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      textColor: "text-green-600",
      gradient: "from-green-500 to-green-600",
    },
    indigo: {
      border: "border-indigo-100",
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      textColor: "text-indigo-600",
      gradient: "from-indigo-500 to-indigo-600",
    },
    yellow: {
      border: "border-yellow-100",
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-500",
      textColor: "text-yellow-600",
      gradient: "from-yellow-500 to-yellow-600",
    },
    red: {
      border: "border-red-100",
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      textColor: "text-red-600",
      gradient: "from-red-500 to-red-600",
    },
  };

  const colors = colorClasses[colorScheme];

  return (
    <div
      className={`bg-white border-2 ${colors.border} shadow-lg rounded-xl p-6 hover:shadow-xl hover:border-${colorScheme}-300 hover:-translate-y-1 transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-4 ${colors.iconBg} rounded-xl`}>
            <Icon className={`text-3xl ${colors.iconColor}`} />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          </div>
        </div>
        {subtitle && subtitleValue !== undefined && (
          <div className="text-right">
            <p className="text-sm text-gray-600">{subtitle}</p>
            <p className={`text-2xl font-bold ${colors.textColor}`}>
              {subtitleValue}
            </p>
          </div>
        )}
      </div>
      {(progress !== undefined || showFullProgress) && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div
              className={`bg-gradient-to-r ${colors.gradient} h-3 rounded-full transition-all duration-500 shadow-sm`}
              style={{
                width: showFullProgress ? "100%" : `${progress}%`,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;