import { useEffect, useState } from "react";
import { parentDashboardService } from "../../../../services/dashboard/parentDashboardServices";
import { openDocument } from "../../../../hooks/useBlobImage";
import { useTranslation } from "react-i18next";
import { getParentDashboardText, getPagesDataText } from "../../../../helpers/useTranslations";
 
interface TaskResponse {
  tasks: TaskResponseParentDTO[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
 
interface TaskResponseParentDTO {
  taskId: number;
  title: string;
  description: string;
  taskType: string;
  assignedDate: string;
  submissionDate: string;
  evaluationDate: string;
  maxMarks: number;
  attachmentPath: string;
  status: string;
  classId: number;
  className: string;
  sectionId: number;
  sectionName: string;
  studentId: number;
  studentName: string;
  teacherId: number;
  teacherName: string;
  subjectId: number;
  subjectName: string;
}
 
interface Child {
  studentId: number;
  admissionNo: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  dob: string;
  religion?: string;
  castName?: string;
  phoneNumber?: string;
  email?: string;
  photo?: string;
  admissionDate: string;
  className: string;
  section: string;
  rollNo: string;
}
 
const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<TaskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedResults, setExpandedResults] = useState<Set<number>>(
    new Set(),
  );
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [page, setPage] = useState<number>(0);

  const { t } = useTranslation()
      const texts = getParentDashboardText(t)
      const T = getPagesDataText(t);

  const size = 10;
 
  useEffect(() => {
    fetchChildren();
  }, []);
 
  useEffect(() => {
    fetchTasks();
  }, [selectedStudentId, page]);
 
  const fetchChildren = async () => {
    try {
      const schoolCode = localStorage.getItem("schoolCode") || "";
      if (!schoolCode) {
        console.error("School code not found in localStorage");
        return;
      }
 
      const childrenData = await parentDashboardService.getChildren(schoolCode);
      if (Array.isArray(childrenData)) {
        setChildren(childrenData);
      } else {
        console.error("Invalid children data format:", childrenData);
        setChildren([]);
      }
    } catch (error: any) {
      console.error("Error fetching children:", error);
      setChildren([]);
    }
  };
 
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const schoolCode = localStorage.getItem("schoolCode") || "";
 
      const response = await parentDashboardService.getTasks(
        schoolCode,
        selectedStudentId,
        page,
        size,
      );
 
      setTasks(response);
      setError(null);
    } catch {
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };
 
  const toggleResultExpansion = (taskId: number) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedResults(newExpanded);
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
        <p className="text-red-800 font-medium">{error}</p>
        <button
          onClick={fetchTasks}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          {texts.Retry}
        </button>
      </div>
    );
  }
 
  if (tasks?.tasks.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {texts.No_Tasks_Available}
        </h3>
        <p className="text-gray-600">
          {texts.Tasks_haven_been_assigned_yet_for_your_children}
        </p>
      </div>
    );
  }
 
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{texts.Tasks}</h2>
 
        <div className="flex items-center gap-3">
          {/* Student Dropdown */}
          <select
            value={selectedStudentId}
            onChange={(e) => {
              setPage(0);
              setSelectedStudentId(Number(e.target.value));
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          >
            <option value={0}>All Students</option>
            {children.map((child) => (
              <option key={child.studentId} value={child.studentId}>
                {child.firstName} {child.lastName} - {child.className} {child.section}
              </option>
            ))}
          </select>
 
          {/* Refresh Button */}
          <button
            onClick={fetchTasks}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {texts.Refresh}
          </button>
        </div>
      </div>
 
      {tasks?.tasks.map((task) => {
        const isExpanded = expandedResults.has(task.taskId);
        return (
          <div
            key={task.taskId}
            className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 cursor-pointer"
              onClick={() => toggleResultExpansion(task.taskId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1">
                    {task.studentName}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Class: {task.className} | Section: {task.sectionName}
                  </p>
                </div>
 
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-blue-100 text-xs uppercase mb-1">
                      Subject
                    </p>
                    <p className="text-white font-bold text-2xl">
                      {task.subjectName}
                    </p>
                  </div>
 
                  <span className="text-white text-xl">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>
              </div>
            </div>
 
            {/* Expandable Content */}
            {isExpanded && (
              <div className="p-6">
                {/* Task Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-blue-700 text-sm font-medium mb-1">{T.Title}</p>
                    <p className="text-xl font-bold text-blue-900">{task.title}</p>
                  </div>
 
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-purple-700 text-sm font-medium mb-1">{T.Type}</p>
                    <p className="text-xl font-bold text-purple-900">{task.taskType}</p>
                  </div>
 
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-green-700 text-sm font-medium mb-1">{T.Description}</p>
                    <p className="text-lg font-semibold text-green-900">{task.description}</p>
                  </div>
 
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <p className="text-orange-700 text-sm font-medium mb-1">{T.Assigned_Date}</p>
                    <p className="text-xl font-bold text-orange-900">{task.assignedDate}</p>
                  </div>
 
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-red-700 text-sm font-medium mb-1">{T.Submission_Date}</p>
                    <p className="text-xl font-bold text-red-900">{task.submissionDate}</p>
                  </div>
 
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <p className="text-indigo-700 text-sm font-medium mb-1">{T.Evaluation_Date}</p>
                    <p className="text-xl font-bold text-indigo-900">{task.evaluationDate || "N/A"}</p>
                  </div>
 
                  <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                    <p className="text-teal-700 text-sm font-medium mb-1">{T.Max_Marks}</p>
                    <p className="text-xl font-bold text-teal-900">{task.maxMarks || "N/A"}</p>
                  </div>
 
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 text-sm font-medium mb-1">{T.Status}</p>
                    <span className={`inline-block px-3 py-1.5 text-sm font-semibold rounded-full ${
                      task.status === 'COMPLETED' 
                        ? 'bg-green-200 text-green-800' 
                        : task.status === 'ASSIGNED'
                        ? 'bg-blue-200 text-blue-800'
                        : task.status === 'IN_REVIEW'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
 
                  <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                    <p className="text-pink-700 text-sm font-medium mb-1">{T.Teacher}</p>
                    <p className="text-xl font-bold text-pink-900">{task.teacherName}</p>
                  </div>
                </div>

                {/* Download Attachment Section - Using openDocument hook like homework component */}
                {task.attachmentPath && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            {T.Attach_Document}
                          </p>
                          <p className="text-xs text-gray-500">
                            {task.attachmentPath.split('/').pop() || 'Document'}
                          </p>
                        </div>
                        <button
                          onClick={() => openDocument(task.attachmentPath)}
                          className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {T.Download_Attachment}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
 
      {/* Pagination */}
      {tasks && tasks.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {texts.Previous}
          </button>
 
          <span className="text-sm font-medium">
            {texts.Page} {page + 1} {T.of} {tasks.totalPages}
          </span>
 
          <button
            disabled={page + 1 >= tasks.totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {T.Next}
          </button>
        </div>
      )}
    </div>
  );
};
 
export default Tasks;