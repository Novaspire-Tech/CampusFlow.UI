import React from "react";
import IconField from "../../../../components/IconField";

interface StatCardProps {
  type: "simple" | "roomTypes";
  title: string;
  icon: string;
  iconColor: string;
  delay: number;
  value?: string | number;
  totalRoomTypes?: number;
  roomTypes?: { roomTypeId: string; roomType: any; count: number; }[];
  [key: string]: any;
}

const StatCard: React.FC<StatCardProps> = ({
  type,
  title,
  icon,
  iconColor,
  delay,
  value,
  totalRoomTypes = 0,
}) => {

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  const selectedColor = colorMap[iconColor] || colorMap.blue;

  return (
    <div
      className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 w-full"
      style={{
        animation: `slideUp 0.5s ease-out ${delay}s both`,
        minHeight: "180px",
      }}
    >
      <div className="flex flex-col items-center justify-center text-center w-full">

        <div className={`p-3 rounded-xl ${selectedColor} mb-3 shadow-sm`}>
          <IconField name={icon} size={24} />
        </div>


        <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">
          {title}
        </h3>


        <p className="text-3xl font-black text-slate-800 tracking-tight">
          {type === "simple" ? value : totalRoomTypes}
        </p>
      </div>
    </div>
  );
};

export default StatCard;