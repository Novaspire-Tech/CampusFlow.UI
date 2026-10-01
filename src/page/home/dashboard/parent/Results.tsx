import React, { useState, useEffect } from "react";
import { parentDashboardService } from "../../../../services/dashboard/parentDashboardServices";
import { useTranslation } from "react-i18next";
import { getPagesDataText, getParentDashboardText } from "../../../../helpers/useTranslations";
 
interface MarksDto {
  subjectId: number;
  subjectName: string;
  totalMarks: number;
  subjectType: string;
  totalObtainMarks: number;
}
 
interface ResultResponseParentDTO {
  marksManagementId: number;
  studentId: number;
  examGroupId: number;
  studentName: string;
  examGroupName: string;
  rollNumber: number;
  studentClass: string;
  studentSection: string;
  grade: string;
  percentage: number;
  marks: MarksDto[];
}
 
const Results: React.FC = () => {
  const [results, setResults] = useState<ResultResponseParentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());

    const { t } = useTranslation()
    const texts = getParentDashboardText(t)
    const T = getPagesDataText(t);
 
  useEffect(() => {
    fetchResults();
  }, []);
 
  const fetchResults = async () => {
    try {
      setLoading(true);
      const schoolCode = localStorage.getItem("schoolCode") || "";
     
      const response = await parentDashboardService.getResults(schoolCode);
      setResults(response);
      setError(null);
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Failed to load results. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
 
  const toggleResultExpansion = (marksManagementId: number) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(marksManagementId)) {
      newExpanded.delete(marksManagementId);
    } else {
      newExpanded.add(marksManagementId);
    }
    setExpandedResults(newExpanded);
  };
 
  const calculatePercentage = (obtained: number, total: number): number => {
    return total > 0 ? (obtained / total) * 100 : 0;
  };
 
  const calculateTotalMarks = (marks: MarksDto[]) => {
    const totalObtained = marks.reduce((sum, mark) => sum + mark.totalObtainMarks, 0);
    const totalMaximum = marks.reduce((sum, mark) => sum + mark.totalMarks, 0);
    return { totalObtained, totalMaximum };
  };
 
  const getPercentageColor = (percentage: number): string => {
    if (percentage >= 90) return "text-emerald-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 60) return "text-amber-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-red-600";
  };
 
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
 
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg
          className="mx-auto h-12 w-12 text-red-400 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-red-800 font-medium">{error}</p>
        <button
          onClick={fetchResults}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {texts.Retry}
        </button>
      </div>
    );
  }
 
  if (results.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <svg
          className="mx-auto h-16 w-16 text-gray-400 mb-3"
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{texts.No_Results_Available}</h3>
        <p className="text-gray-600">{texts.Results_havent_been_published_yet_for_your_children}</p>
      </div>
    );
  }
 
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{texts.Academic_Results}</h2>
        <button
          onClick={fetchResults}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>
 
      {results.map((result) => {
        const isExpanded = expandedResults.has(result.marksManagementId);
        const { totalObtained, totalMaximum } = calculateTotalMarks(result.marks);
        const overallPercentage = result.percentage;
 
        return (
          <div
            key={result.marksManagementId}
            className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg"
          >
            {/* Header */}
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 cursor-pointer"
              onClick={() => toggleResultExpansion(result.marksManagementId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1">
                    {result.studentName}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Class: {result.studentClass} | Section: {result.studentSection} | Roll No: {result.rollNumber}
                  </p>
                  <p className="text-blue-100 text-xs mt-1">
                    Exam: {result.examGroupName}
                  </p>
                </div>
               
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-blue-100 text-xs uppercase tracking-wide mb-1">{texts.Overall}</p>
                    <p className="text-white font-bold text-2xl">
                      {overallPercentage.toFixed(1)}%
                    </p>
                  </div>
                 
                  <svg
                    className={`w-6 h-6 text-white transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
 
            {/* Expandable Content */}
            {isExpanded && (
              <div className="p-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <p className="text-blue-700 text-sm font-medium mb-1">{T.Total_Marks}</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {totalObtained} / {totalMaximum}
                    </p>
                  </div>
                 
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                    <p className="text-emerald-700 text-sm font-medium mb-1">{T.Subject}</p>
                    <p className="text-2xl font-bold text-emerald-900">{result.marks.length}</p>
                  </div>
                 
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <p className="text-purple-700 text-sm font-medium mb-1">{T.Percentage}</p>
                    <p className="text-2xl font-bold text-purple-900">{overallPercentage.toFixed(2)}%</p>
                  </div>
                </div>
 
                {/* Marks Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {T.Subject}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {T.Type}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {T.Marks_Obtained}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {T.Total_Marks}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {T.Percentage}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.marks.map((mark, index) => {
                        const percentage = calculatePercentage(mark.totalObtainMarks, mark.totalMarks);
                        const percentageColor = getPercentageColor(percentage);
 
                        return (
                          <tr
                            key={mark.subjectId}
                            className={`hover:bg-gray-50 transition-colors ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-25"
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {mark.subjectName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {mark.subjectType || "Regular"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm font-semibold text-gray-900">
                                {mark.totalObtainMarks}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-700">{mark.totalMarks}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className={`text-sm font-bold ${percentageColor}`}>
                                {percentage.toFixed(1)}%
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td
                          colSpan={2}
                          className="px-6 py-4 text-sm font-bold text-gray-900 text-right"
                        >
                          {T.Total}:
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                          {totalObtained}
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                          {totalMaximum}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-sm font-bold ${getPercentageColor(overallPercentage)}`}>
                            {overallPercentage.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
 
export default Results;
 