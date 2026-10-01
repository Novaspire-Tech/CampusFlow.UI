import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaEnvelope,
  FaPhoneAlt,
  FaExclamationTriangle,
  FaBoxOpen,
  FaInbox,
} from "react-icons/fa";
import type { IconType } from "react-icons";

type ColorScheme = "blue" | "green" | "purple" | "yellow" | "indigo" | "teal";

const colorMap: Record<
  ColorScheme,
  {
    border: string;
    iconBg: string;
    iconColor: string;
    textColor: string;
    gradient: string;
  }
> = {
  blue: {
    border: "border-blue-100",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    textColor: "text-blue-600",
    gradient: "from-blue-500 to-blue-600",
  },
  green: {
    border: "border-green-100",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    textColor: "text-green-600",
    gradient: "from-green-500 to-green-600",
  },
  purple: {
    border: "border-purple-100",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    textColor: "text-purple-600",
    gradient: "from-purple-500 to-purple-600",
  },
  yellow: {
    border: "border-yellow-100",
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-500",
    textColor: "text-yellow-600",
    gradient: "from-yellow-500 to-yellow-600",
  },
  indigo: {
    border: "border-indigo-100",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    textColor: "text-indigo-600",
    gradient: "from-indigo-500 to-indigo-600",
  },
  teal: {
    border: "border-teal-100",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    textColor: "text-teal-600",
    gradient: "from-teal-500 to-teal-600",
  },
};


interface StatsCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  colorScheme: ColorScheme;
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  colorScheme,
  onClick,
}) => {
  const c = colorMap[colorScheme];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white border-2 ${c.border} shadow-lg rounded-xl p-6
                  hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-4 ${c.iconBg} rounded-xl`}>
          <Icon className={`text-3xl ${c.iconColor}`} />
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
      </div>
    </button>
  );
};
interface StatsGridProps {
  totalVisitors: number;
  totalEnquiries: number;
  totalCalls: number;
  totalComplaints: number;
  totalDispatches: number;
  totalReceives: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  totalVisitors,
  totalEnquiries,
  totalCalls,
  totalComplaints,
  totalDispatches,
  totalReceives,
}) => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Total Visitors",
      value: totalVisitors,
      icon: FaUsers,
      colorScheme: "blue" as ColorScheme,
      route: "/visitor-book",
    },
    {
      title: "Enquiries",
      value: totalEnquiries,
      icon: FaEnvelope,
      colorScheme: "green" as ColorScheme,
      route: "/admission-enquiry",
    },
    {
      title: "Phone Calls",
      value: totalCalls,
      icon: FaPhoneAlt,
      colorScheme: "purple" as ColorScheme,
      route: "/phone-call-log",
    },
    {
      title: "Complaints",
      value: totalComplaints,
      icon: FaExclamationTriangle,
      colorScheme: "yellow" as ColorScheme,
      route: "/complain",
    },
    {
      title: "Dispatches",
      value: totalDispatches,
      icon: FaBoxOpen,
      colorScheme: "indigo" as ColorScheme,
      route: "/postal-dispatch",
    },
    {
      title: "Receives",
      value: totalReceives,
      icon: FaInbox,
      colorScheme: "teal" as ColorScheme,
      route: "/postal-receive",
    },
  ];

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-3 mb-8">
      {cards.map((card) => (
        <StatsCard
          key={card.title}
          title={card.title}
          value={card.value || 0}
          icon={card.icon}
          colorScheme={card.colorScheme}
          onClick={() => navigate(card.route)}
        />
      ))}
    </div>
  );
};