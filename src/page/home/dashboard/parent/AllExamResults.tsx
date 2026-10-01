import React, { useState, useMemo } from "react";
import ControlledTable from "../../../../components/uncontrolled/ControlledTable";
import { useNavigate } from "react-router-dom";
import  kidsData from "../parent/Kids";

interface ExamResult {
  id: number;
  examName: string;
  grade: string;
  percent: string;
  date: string;
  [key: string]: unknown;
}

const initialData: ExamResult[] = [
  { id: 1, examName: "Mid Term", grade: "A", percent: "95%", date: "26/11/2015" },
  { id: 2, examName: "Final", grade: "B+", percent: "88%", date: "25/11/2015" },
];

const AllExamResults: React.FC = () => {
  const navigate = useNavigate();

  const [examSearch, setExamSearch] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [tableData, setTableData] = useState<ExamResult[]>(initialData);

  const columns = useMemo(
    () => [
      { key: "examName", label: "Exam Name" },
      { key: "date", label: "Date" },
      { key: "percent", label: "Percent" },
      { key: "grade", label: "Grade" },
    ],
    []
  );

  const handleSearchClick = () => {
    if (!selectedName) {
      alert("Please select a student name");
      return;
    }

    const filtered = initialData.filter((exam) =>
      exam.examName.toLowerCase().includes(examSearch.toLowerCase())
    );

    setTableData(filtered);
  };

  const handleView = (id: number | string) => {
    if (!selectedName) {
      alert("Please select a student first!");
      return;
    }

    const exam = tableData.find((e) => e.id === id);
    if (!exam) return;

    const kid = kidsData.apply((k: any) => k.name === selectedName);

    navigate(`/result/${id}`, { state: { exam, kid } });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full max-w-full">

      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
       All Exam Results
      </h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-5">

  {/* Student Name */}
  <select
    value={selectedName}
    onChange={(e) => setSelectedName(e.target.value)}
    className="py-2 px-3 border rounded w-full text-sm"
  >
    <option value="">Select Student Name</option>
    {kidsData.apply((kid : any) => (
      <option key={kid.name} value={kid.name}>
        {kid.name}
      </option>
    ))}
  </select>

  {/* Search Input */}
  <input
    value={examSearch}
    onChange={(e) => setExamSearch(e.target.value)}
    placeholder="Search by Exam"
    className="py-2 px-3 border rounded w-full text-sm"
  />

  {/* Search Button */}
  <button
    onClick={handleSearchClick}
    className="
      bg-blue-600 text-white rounded py-2 text-sm w-full 
      md:col-span-2 xl:col-span-1
    "
  >
    Search
  </button>
</div>


      {/* ---------- TABLE SECTION ---------- */}
      <div className="overflow-x-auto">
        <ControlledTable<ExamResult>
          columns={columns}
          data={tableData}
          fullData={initialData}
          onView={handleView}
          btn={false}
          header={false}
          showSearch={false}
          showExport={false}
          showSelectAll={false}
          actionColumn={true}
        />
      </div>
    </div>
  );
};

export default AllExamResults;
 