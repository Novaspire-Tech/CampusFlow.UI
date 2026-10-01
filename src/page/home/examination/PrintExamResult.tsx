import React, { useEffect, useState, useMemo, useRef } from "react";
import { useForm, type SubmitHandler, useWatch } from "react-hook-form";
import Dropdown from "../../../components/controlled/Dropdown";
import Button from "../../../components/controlled/Button";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import { IconField } from "../../../components";
import MarksheetPreview from "../../../templates/MarksheetPreview"; 
import { toast } from "react-toastify";

interface FormData {
  class: string;
  section: string;
  examResultTemplate: string;
}

interface StudentRow {
  id: number;
  studentName: string;
  motherName: string;
  rollNumber: string;
  dob: string;
}

const PrintExamResult: React.FC = () => {
  const { handleSubmit, control } = useForm<FormData>({
    defaultValues: { class: "", section: "", examResultTemplate: "" },
  });

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  // Load templates from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("exam_result_templates");
    if (stored) setTemplates(JSON.parse(stored));
  }, []);

  // Sync selected template object when dropdown changes
  const watchTemplateName = useWatch({ control, name: "examResultTemplate" });
  useEffect(() => {
    const found = templates.find((t) => t.templateName === watchTemplateName);
    setSelectedTemplate(found || null);
  }, [watchTemplateName, templates]);

  const onSubmit: SubmitHandler<FormData> = () => {
    // Simulated search result
    setStudents([
      { id: 1, studentName: "Rahul Sharma", motherName: "Suman", rollNumber: "101", dob: "2015-04-10" },
      { id: 2, studentName: "Priya Patel", motherName: "Meena", rollNumber: "102", dob: "2015-08-22" },
      { id: 3, studentName: "Amit Kumar", motherName: "Sunita", rollNumber: "103", dob: "2014-12-05" },
    ]);
    setSelectedIds([]);
  };

  const generateResult = () => {
    if (!selectedTemplate) return toast.error("Please select a template first");
    if (selectedIds.length === 0) return toast.error("Please select students");

    const reportData = students
      .filter((s) => selectedIds.includes(s.id))
      .map((s) => ({
        ...selectedTemplate,
        studentName: s.studentName,
        motherName: s.motherName,
        rollNo: s.rollNumber,
        dob: s.dob,
      }));

    setPreviewData(reportData);
    setShowPreview(true);
  };

  const columns = useMemo(() => [
    {
      key: "select",
      label: "Select",
      render: (_: any, row: StudentRow) => (
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={selectedIds.includes(row.id)}
          onChange={() =>
            setSelectedIds((prev) =>
              prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]
            )
          }
        />
      ),
      headerRender: () => (
        <input
          type="checkbox"
          ref={masterCheckboxRef}
          checked={students.length > 0 && selectedIds.length === students.length}
          onChange={() =>
            selectedIds.length === students.length
              ? setSelectedIds([])
              : setSelectedIds(students.map((s) => s.id))
          }
          className="h-4 w-4"
        />
      ),
    },
    { key: "studentName", label: "Student Name" },
    { key: "rollNumber", label: "Roll Number" },
    { key: "motherName", label: "Mother Name" },
    { key: "dob", label: "DOB" },
  ], [selectedIds, students]);

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Step 1: Selection */}
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="font-semibold mb-4 text-lg text-slate-700">Exam Result Printing</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dropdown label="Class" name="class" control={control} required options={["4", "5", "6"]} />
            <Dropdown label="Section" name="section" control={control} required options={["A", "B", "C"]} />
            <Dropdown
              label="Marksheet Template"
              name="examResultTemplate"
              control={control}
              required
              options={templates.map((t) => t.templateName)}
            />
            <div className="md:col-span-3 flex justify-end">
              <Button name="Search" icon={<IconField name="FaSearch" />} clr="bg-blue-600" loading={false} />
            </div>
          </form>
        </div>

        {/* Step 2: List and Action */}
        {students.length > 0 && (
          <>
            <div className="flex justify-end">
              <Button
                name="Generate Selection"
                isDisable={selectedIds.length === 0}
                onClick={generateResult}
                icon={<IconField name="FaFileAlt" />}
                loading={false}
              />
            </div>
            <div className="bg-white rounded-xl shadow-md border overflow-hidden">
              <ControlledTable
                title="Search Results"
                columns={columns}
                data={students}
                fullData={students}
                actionColumn={false}
                showSearch
                 enablePermissions={true}
            permissionScope="EXAM_RESULT"
              />
            </div>
          </>
        )}

        {/* Step 3: Print Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-slate-900/80 flex justify-center items-center z-50 p-6 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl relative flex flex-col max-h-[95vh]">
              <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                <div>
                  <h3 className="font-bold text-slate-700 text-lg">Batch Print Preview</h3>
                  <p className="text-sm text-slate-500">{previewData.length} records ready</p>
                </div>
                <div className="flex gap-3">
                  <Button name="Print" onClick={() => window.print()} icon={<IconField name="FaPrint" />} clr="bg-green-600" loading={false} />
                  <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-red-500 text-2xl px-2">
                    &times;
                  </button>
                </div>
              </div>
              <div className="p-8 overflow-y-auto bg-slate-100">
                <div className="print-area">
                  {previewData.map((d, i) => (
                    <div key={i} className="mb-10 print:mb-0 print:break-after-page">
                      {/* Calling the Template Component */}
                      <MarksheetPreview data={d} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintExamResult;