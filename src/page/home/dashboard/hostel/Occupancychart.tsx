import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getPagesDataText } from '../../../../helpers/useTranslations';
import { useTranslation } from 'react-i18next';

ChartJS.register(ArcElement, Tooltip, Legend);

interface HostelOccupancyData {
  hostelId: string;
  name: string;
  totalBeds: number;
  bookedBeds: number;
  occupancyPercent: number;
}

interface OccupancyChartProps {
  hostels: HostelOccupancyData[];
  delay: number;
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
];

const OccupancyChart: React.FC<OccupancyChartProps> = ({ hostels, delay }) => {
 const { t } = useTranslation();
  const Text = getPagesDataText(t);

  const stats = useMemo(() => {
    const totalBooked = hostels.reduce((sum, h) => sum + h.bookedBeds, 0);
    const totalCapacity = hostels.reduce((sum, h) => sum + h.totalBeds, 0);
    const totalAvailable = totalCapacity - totalBooked;

    return {
      totalBooked,
      totalCapacity,
      totalAvailable,
    };
  }, [hostels]);

  const chartData = {
    labels: hostels.map(h => h.name),
    datasets: [
      {
        data: hostels.map(h => h.bookedBeds),
        backgroundColor: hostels.map((_, i) => COLORS[i % COLORS.length]),
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = stats.totalBooked > 0 
              ? ((value / stats.totalBooked) * 100).toFixed(1) + '%'
              : '0%';
            return `${label}: ${value} Beds (${percentage})`;
          }
        }
      },
    },
  };

  return (
    <div
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      style={{ animation: `slideUp 0.6s ease-out ${delay}s both` }}
    >
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{Text.Hostel_Status||"Hostel Status"}</h3>
          <p className="text-sm text-gray-500 mt-1">{Text.Bed_Distribution_Across_All_Hostels||"Bed distribution across all hostels"}</p>
        </div>
      </div>

      {hostels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{Text.No_Occupancy_Data_Available||"No occupancy data available"}</p>
        </div>
      ) : (
        <>
          <div className="w-full h-64 flex items-center justify-center relative">
            {/* Chart */}
            <div className="w-56 h-56">
              <Doughnut data={chartData} options={options} />
            </div>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-gray-400 text-xs uppercase font-bold">{Text.Total_Booked||"Total Booked"}</span>
              <span className="text-2xl font-black text-gray-800">{stats.totalBooked}</span>
              <span className="text-[10px] text-gray-400">/ {stats.totalCapacity} {Text.Beds|| "Beds"}</span>
            </div>
          </div>
          
          {/* Bottom Stats - Gender Chart Style */}
          <div className="mt-8 w-full flex justify-around border-t border-gray-100 pt-4">
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{Text.Total_Capacity||"Total Capacity"}</span>
              <span className="font-bold text-xl text-gray-800">
                {stats.totalCapacity.toLocaleString()}
              </span>
            </div>
            
            <div className="w-px bg-gray-200 mx-2 h-10"></div>
            
            <div className="flex flex-col items-center">
              <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider">{Text.Booked ||"Booked"}</span>
              <span className="font-bold text-xl text-emerald-600">
                {stats.totalBooked.toLocaleString()}
              </span>
            </div>

            <div className="w-px bg-gray-200 mx-2 h-10"></div>
            
            <div className="flex flex-col items-center">
              <span className="text-blue-500 text-[10px] font-bold uppercase tracking-wider">{Text.Available||"Available"}</span>
              <span className="font-bold text-xl text-blue-600">
                {stats.totalAvailable.toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OccupancyChart;