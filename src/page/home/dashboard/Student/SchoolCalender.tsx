import React, { useState } from "react";
import { IconField } from "../../../../components";
import { useTranslation } from "react-i18next";
import { getDashboardText } from "../../../../helpers/useTranslations";



const monthMap: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

const getDayName = (dateStr: string): string => {
  const [day, month] = dateStr.split(" ");
  const date = new Date(`2025-${monthMap[month]}-${day}`);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

interface Week {
  week: number;
  dates: string[];
}

interface SchoolCalendarProps {
  weeks: Week[];
  currentWeek: number;
  setCurrentWeek: React.Dispatch<React.SetStateAction<number>>;
}

const SchoolCalendar: React.FC<SchoolCalendarProps> = ({ weeks, currentWeek, setCurrentWeek }) => {
  const [events, setEvents] = useState<Record<string, Record<string, string>>>({});

  const handlePrevWeek = () => {
    if (currentWeek > 0) setCurrentWeek(currentWeek - 1);
  };

  const handleNextWeek = () => {
    if (currentWeek < weeks.length - 1) setCurrentWeek(currentWeek + 1);
  };

  const handleCellClick = (date: string, time: string) => {
    const newEvent = prompt(`Add event for ${date} at ${time}:`);
    if (!newEvent) return;

    setEvents(prev => ({
      ...prev,
      [date]: {
        ...(prev[date] || {}),
        [time]: newEvent,
      },
    }));
  };

 const {t} = useTranslation();
 const schoolCalendarYear = getDashboardText(t)
 const timeText = getDashboardText(t).Time;
 const scheduleTimes = getDashboardText(t).scheduleTimes;
//  const days = getDashboardText(t).days;

  return (
    <div className="w-full max-w-7xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-md overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevWeek}
          className={`p-2 rounded ${currentWeek === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
          disabled={currentWeek === 0}
        >
           <IconField name="FaArrowLeft" />
        </button>

        <h2 className="text-lg sm:text-xl font-semibold text-center flex items-center gap-2">
          <IconField name="FaCalendar" className="text-blue-600" />
          <span className="text-blue-700">{schoolCalendarYear.School_Calendar_Year}</span>
        </h2>

        <button
          onClick={handleNextWeek}
          className={`p-2 rounded ${currentWeek === weeks.length - 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
          disabled={currentWeek === weeks.length - 1}
        >
          <IconField name="FaArrowRight" />
        </button>
      </div>

      <div
        className="grid text-sm"
        style={{ gridTemplateColumns: `repeat(${1 + weeks[currentWeek].dates.length}, minmax(100px, 1fr))` }}
      >
        <div className="p-3 font-bold text-center border bg-gradient-to-br from-indigo-300 to-indigo-500 text-white">{timeText}</div>
        {weeks[currentWeek].dates.map((date, idx) => (
          <div
            key={idx}
            className="p-3 font-bold text-center border bg-gradient-to-br from-blue-200 to-blue-400 text-gray-800"
          >
            <div className="text-xs">{getDayName(date)}</div>
            <div>{date}</div>
          </div>
        ))}

        {scheduleTimes.map((time, idx) => (
          <React.Fragment key={idx}>
            <div className="p-3 text-center font-semibold bg-yellow-100 border">{time}</div>
            {weeks[currentWeek].dates.map((date, i) => {
              const eventText = events[date]?.[time] || "";
              return (
                <div
                  key={i}
                  className={`p-2 border h-16 text-center cursor-pointer transition duration-200 ease-in-out 
                    ${eventText
                      ? "bg-green-100 hover:bg-green-200 text-green-900 font-medium"
                      : "hover:bg-gray-100"}`}
                  onClick={() => handleCellClick(date, time)}
                >
                  {eventText}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default SchoolCalendar;
