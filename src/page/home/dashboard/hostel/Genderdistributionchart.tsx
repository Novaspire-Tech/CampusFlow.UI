import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTranslation } from 'react-i18next';
import { getPagesDataText } from '../../../../helpers/useTranslations';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StudentHostelData {
  id: string;
  gender?: string;
  [key: string]: any;
}

interface GenderDistributionChartProps {
  students: StudentHostelData[];
  delay: number;
}

const GenderDistributionChart: React.FC<GenderDistributionChartProps> = ({ students, delay }) => {
   const { t } = useTranslation();
  const Text = getPagesDataText(t);
  const genderStats = useMemo(() => {
    const maleCount = students.filter(s => 
      s.gender && s.gender.toLowerCase() === 'male'
    ).length;
    
    const femaleCount = students.filter(s => 
      s.gender && s.gender.toLowerCase() === 'female'
    ).length;
    
    const total = maleCount + femaleCount;
    
    return {
      maleCount,
      femaleCount,
      total,
    };
  }, [students]);

  const BLUE = '#3B82F6';
  const PINK = '#EC4899';

  const chartData = {
    labels: ['Male Students', 'Female Students'],
    datasets: [
      {
        data: [genderStats.maleCount, genderStats.femaleCount],
        backgroundColor: [BLUE, PINK],
        hoverBackgroundColor: [BLUE, PINK],
        borderWidth: 0,
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        bodyFont: {
          size: 14,
          weight: 'bold' as 'bold',
        },
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = genderStats.total > 0 
              ? ((value / genderStats.total) * 100).toFixed(1) + '%'
              : '0%';
            return `${label}: ${value.toLocaleString()} (${percentage})`;
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
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800">{Text.Gender_Distribution||"Gender Distribution"}</h3>
        <p className="text-sm text-gray-500 mt-1">{Text.Students_In_Hostels_By_Gender||"Students in hostels by gender"}</p>
      </div>

      {genderStats.total === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{Text.No_Student_Data_Available||"No student data available"}</p>
        </div>
      ) : (
        <>
          <div className="w-full h-64 flex items-center justify-center">
            <div className="w-56 h-56">
              <Doughnut data={chartData} options={options} />
            </div>
          </div>
          
          <div className="mt-8 w-full flex justify-around border-t border-gray-200 pt-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-1 mb-2" style={{ backgroundColor: BLUE }}></div>
              <span className="text-gray-600 text-sm">{Text.Male_Students||"Male Students"}</span>
              <span className="font-bold text-xl text-gray-800">
                {genderStats.maleCount.toLocaleString()}
              </span>
            </div>
            
            <div className="w-px bg-gray-300 mx-4 h-full"></div>
            
            <div className="flex flex-col items-center">
              <div className="w-10 h-1 mb-2" style={{ backgroundColor: PINK }}></div>
              <span className="text-gray-600 text-sm">{Text.Female_Students}</span>
              <span className="font-bold text-xl text-gray-800">
                {genderStats.femaleCount.toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GenderDistributionChart;