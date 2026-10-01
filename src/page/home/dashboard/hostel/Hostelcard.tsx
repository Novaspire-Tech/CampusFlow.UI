import React from "react";
import IconField from "../../../../components/IconField";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../../helpers/useTranslations";

interface HostelCardProps {
  name: string;
  type: string;
  address: string;
  totalBeds: number;
  bookedBeds: number;
  roomCount: number;
}

const HostelCard: React.FC<HostelCardProps> = ({
  name,
  type,
  address,
  totalBeds,
  bookedBeds,
  roomCount,
}) => {

   const { t } = useTranslation();
  const Text = getPagesDataText(t);
  const occupancyPercent = totalBeds > 0 ? Math.round((bookedBeds / totalBeds) * 100) : 0;
  const availableBeds = totalBeds - bookedBeds;
  
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>
          <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-blue-100">
            {type}
          </span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
          <IconField name="FaBuilding" size={24} />
        </div>
      </div>
      
      {/* Details Section */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100/50">
          <IconField name="FaDoorOpen" size={14} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-600">{roomCount} {Text.Rooms ||"Rooms"}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100/50">
          <IconField name="FaBed" size={14} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-600">{totalBeds}{Text.Beds||" Beds"}</span>
        </div>
        <div className="col-span-2 flex items-center gap-2 text-xs text-slate-400 px-1">
          <IconField name="FaMapMarkerAlt" size={12} />
          <span className="truncate italic">{address || Text.Location_Not_Provided}</span>
        </div>
      </div>

      {/* Occupancy Section */}
      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{Text.Current_Status||"Current Status"}</p>
            <p className="text-sm font-black text-slate-700">{bookedBeds} / {totalBeds} {Text.Occupied||"Occupied"}</p>
          </div>
          <div className="text-right">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
              occupancyPercent > 80 ? 'text-rose-500 bg-rose-50' : 'text-emerald-500 bg-emerald-50'
            }`}>
              {occupancyPercent}%
            </span>
          </div>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 mb-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              occupancyPercent > 90 ? "bg-rose-500" : occupancyPercent > 70 ? "bg-amber-500" : "bg-blue-500"
            }`}
            style={{ width: `${occupancyPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">{Text.Available}</span>
          <span className="text-xs font-black text-emerald-600">
            {availableBeds} {Text.Beds_Left||"Beds Left"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HostelCard;