import React from "react";
import IconField from "../../../../components/IconField";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../../helpers/useTranslations";

interface QuickActionProps {
  title: string;
  icon: string;
  color: string;
  onClick: () => void;
}

const QuickActionButton: React.FC<QuickActionProps> = ({
  title,
  icon,
  color,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full`}
    >
      <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
        <IconField name={icon} size={24} />
      </div>
      <span className="font-semibold text-lg">{title}</span>
      <IconField name="FaChevronRight" size={16} className="ml-auto" />
    </button>
  );
};

interface QuickActionsProps {
  delay: number;
}

const QuickActions: React.FC<QuickActionsProps> = ({ delay }) => {
 const { t } = useTranslation();
  const Text = getPagesDataText(t);

  return (
    <div
      className="mb-8"
      style={{ animation: `slideUp 0.6s ease-out ${delay}s both` }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{Text.Quick_Actions}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionButton
          title={Text.Add_Hostel}
          icon="FaPlus"
          color="from-blue-500 to-blue-600"
          onClick={() => (window.location.href = "/hostel")}
        />
        <QuickActionButton
          title={Text.Manage_Rooms||"Manage Rooms"}
          icon="FaDoorOpen"
          color="from-purple-500 to-purple-600"
          onClick={() => (window.location.href = "/hostel-rooms")}
        />
        <QuickActionButton
          title={Text.Room_Types||"Room Types"}
          icon="FaTh"
          color="from-emerald-500 to-emerald-600"
          onClick={() => (window.location.href = "/room-type")}
        />
        <QuickActionButton
          title={Text.Hostel_Allocations||"Hostel Allocations"}
          icon="FaUserCheck"
          color="from-orange-500 to-orange-600"
          onClick={() => (window.location.href = "/hostel-student-allocation")}
        />
      </div>
    </div>
  );
};

export default QuickActions;