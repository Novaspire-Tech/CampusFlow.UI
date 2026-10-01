import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  useForm,
  FormProvider,
  type SubmitHandler,
  useWatch,
  useFieldArray,
} from "react-hook-form";

// TanStack Query Hooks
import { useSchoolClasses } from "../../../hooks/queries/academics/useClasses";
import { useSessions } from "../../../hooks/queries/systemSettinds/useSessionSetting";

// Components
import TextField from "../../../components/controlled/TextField";
import FileUploadField from "../../../components/controlled/FileUploadField";
import Button from "../../../components/controlled/Button";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import { IconField } from "../../../components";
import { Dropdown } from "../../../components/controlled";
import MarksheetPreview from "../../../templates/MarksheetPreview";
import { useSections } from "../../../hooks/queries/academics/useSections";
import { toast } from "react-toastify";
import { confirmToast } from "../../../helpers/confirmToast";

interface StudentRow {
  id: number;
  studentName: string;
  motherName: string;
  rollNumber: string;
  dob: string;
}

type MarksheetColumn = { label?: string };
type MarksheetSubject = { name?: string };

type MarksheetTemplateData = {
  templateName: string;
  schoolName: string;
  examName: string;
  address: string;
  session: string;
  classLevel: string;
  schoolClassId: string;
  searchSession: string;
  examResultTemplate: string; 
  studentName: string;
  rollNo: string;
  motherName: string;
  dob: string;
  leftLogo: File | string | null;
  teacherSign: File | string | null;
  principalSign: File | string | null;
  managerSign: File | string | null;
  columns: MarksheetColumn[];
  subjects: MarksheetSubject[];
};

type TemplateRow = MarksheetTemplateData & { id: number };

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const ExamResult: React.FC = () => {
  // --- Designer State & Queries ---
  const { data: classesData } = useSchoolClasses();
  const { data: sessions } = useSessions();
  const { data: sectionsData } = useSections(Number(classesData) || 0);
  const [templates, setTemplates] = useState<TemplateRow[]>(() => {
    const saved = localStorage.getItem("exam_result_templates");
    return saved ? JSON.parse(saved) : [];
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);

  // --- Print/Selection State ---
  const [viewMode, setViewMode] = useState<"DESIGNER" | "PRINT_SELECTION">("DESIGNER");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("exam_result_templates", JSON.stringify(templates));
  }, [templates]);

  const methods = useForm<MarksheetTemplateData>({
    defaultValues: {
      templateName: "",
      schoolName: "New English School",
      examName: "Academic Report",
      session: "",
      classLevel: "",
      schoolClassId: "",
      searchSession: "",
      examResultTemplate: "",
      address: "Enter School Address Here",
      studentName: "",
      rollNo: "",
      motherName: "",
      dob: "",
      leftLogo: null,
      teacherSign: null,
      principalSign: null,
      managerSign: null,
      columns: [{ label: "Term I" }, { label: "Term II" }],
      subjects: [
        { name: "English" },
        { name: "Maths" },
        { name: "Science" },
        { name: "Social Studies" },
      ],
    },
  });

  const { control, handleSubmit, reset, setValue, getValues } = methods;
  const formDataPreview = useWatch({ control }) as Partial<MarksheetTemplateData>;
  const selectedClassId = useWatch({ control, name: "schoolClassId" });
  const selectedSession = useWatch({ control, name: "searchSession" });
  

  useEffect(() => {
    if (selectedClassId && classesData) {
      const selectedClass = classesData.find((c: any) => String(c.id) === selectedClassId);
      if (selectedClass) setValue("classLevel", selectedClass.className);
    }
  }, [selectedClassId, classesData, setValue]);

  useEffect(() => {
    if (selectedSession) setValue("session", selectedSession);
  }, [selectedSession, setValue]);

  const { fields: columnFields, append: addCol, remove: remCol } = useFieldArray({ control, name: "columns" });
  const { fields: subjectFields, append: addSub, remove: remSub } = useFieldArray({ control, name: "subjects" });

  // --- Designer Handlers ---
  const onSaveTemplate: SubmitHandler<MarksheetTemplateData> = async (data) => {
    try {
      const processedData = { ...data };
      const processFileField = async (field: any): Promise<string | null> => {
        if (!field) return null;
        if (typeof field === "string" && field.startsWith("data:image")) return field;
        if (field instanceof File) return await fileToBase64(field);
        return null;
      };

      processedData.leftLogo = await processFileField(data.leftLogo);
      processedData.teacherSign = await processFileField(data.teacherSign);
      processedData.principalSign = await processFileField(data.principalSign);
      processedData.managerSign = await processFileField(data.managerSign);

      if (editId !== null) {
        setTemplates((prev) => prev.map((item) => (item.id === editId ? { ...processedData, id: editId } : item)));
        toast.success("Template Updated Successfully!");
      } else {
        const newEntry: TemplateRow = { ...processedData, id: Date.now() };
        setTemplates((prev) => [...prev, newEntry]);
        toast.success("Template Saved Successfully!");
      }
      reset();
      setEditId(null);
    } catch (error) {
      toast.error("Error saving template.");
    }
  };

  const handleEdit = (id: string | number) => {
    const target = templates.find((t) => t.id === Number(id));
    if (target) {
      setEditId(Number(id));
      reset(target);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (id: string | number) => {
    if (await confirmToast("Are you sure you want to delete this template?")) {
      setTemplates((prev) => prev.filter((t) => t.id !== Number(id)));
    }
  };


  const onSearchStudents = () => {
    setStudents([
      { id: 1, studentName: "Rahul Sharma", motherName: "Suman", rollNumber: "101", dob: "2015-04-10" },
      { id: 2, studentName: "Priya Patel", motherName: "Meena", rollNumber: "102", dob: "2015-08-22" },
      { id: 3, studentName: "Amit Kumar", motherName: "Sunita", rollNumber: "103", dob: "2014-12-05" },
    ]);
    setSelectedIds([]);
  };

  const generateResult = () => {
    const selectedTemplateName = getValues("examResultTemplate");
    const foundTemplate = templates.find((t) => t.templateName === selectedTemplateName);

    if (!foundTemplate) return alert("Please select a template from the dropdown first");
    if (selectedIds.length === 0) return alert("Please select students from the list");

    const reportData = students
      .filter((s) => selectedIds.includes(s.id))
      .map((s) => ({
        ...foundTemplate,
        studentName: s.studentName,
        motherName: s.motherName,
        rollNo: s.rollNumber,
        dob: s.dob,
      }));

    setPreviewData(reportData);
    setShowPreviewModal(true);
  };

  const studentColumns = useMemo(() => [
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
          className="h-4 w-4"
          checked={students.length > 0 && selectedIds.length === students.length}
          onChange={() =>
            selectedIds.length === students.length
              ? setSelectedIds([])
              : setSelectedIds(students.map((s) => s.id))
          }
        />
      ),
    },
    { key: "studentName", label: "Student Name" },
    { key: "rollNumber", label: "Roll Number" },
    { key: "motherName", label: "Mother Name" },
    { key: "dob", label: "DOB" },
  ], [selectedIds, students]);


  if (viewMode === "PRINT_SELECTION") {
    return (
      <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-700">Print Examination Results</h2>
            <Button name="Back to Designer" onClick={() => setViewMode("DESIGNER")} clr="bg-gray-600" loading={false} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <Dropdown label="Class" name="schoolClassId" control={control} options={classesData?.map((c: any) => ({ label: c.className, value: String(c.id) })) || []} />
              <Dropdown label="Section" name="section" control={control} options={sectionsData?.map((s: any) => ({ value: s.section, label: s.section })) || []} />
              <Dropdown 
                label="Marksheet Template *" 
                name="examResultTemplate" 
                control={control} 
                options={templates.map((t) => t.templateName)} 
              />
              <Button name="Search Students" icon={<IconField name="FaSearch" />} onClick={onSearchStudents} clr="bg-blue-600" loading={false} />
            </div>
          </div>

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
                <ControlledTable title="Student List" columns={studentColumns} data={students} actionColumn={false} />
              </div>
            </>
          )}

          {showPreviewModal && (
            <div className="fixed inset-0 bg-slate-900/80 flex justify-center items-center z-50 p-6 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl relative flex flex-col max-h-[95vh]">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                  <div>
                    <h3 className="font-bold text-slate-700">Batch Print Preview</h3>
                    <p className="text-xs text-slate-500">{previewData.length} Students Selected</p>
                  </div>
                  <div className="flex gap-2">
                    <Button name="Print" onClick={() => window.print()} icon={<IconField name="FaPrint" />} clr="bg-green-600" loading={false} />
                    <button onClick={() => setShowPreviewModal(false)} className="text-2xl px-2 text-slate-400 hover:text-red-500">&times;</button>
                  </div>
                </div>
                <div className="p-8 overflow-y-auto bg-slate-100 print:bg-white print:p-0">
                  <div className="print-area space-y-8">
                    {previewData.map((d, i) => (
                      <div key={i} className="print:break-after-page shadow-sm bg-white p-4 rounded-lg print:shadow-none">
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
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="flex flex-col lg:flex-row gap-6 max-w-400 mx-auto">
        <div className="w-full lg:w-100 bg-white p-5 rounded-xl shadow-md border h-fit sticky top-6 max-h-[92vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-slate-700 flex items-center gap-2">
            <IconField name="FaEdit" /> Exam Result Designer
          </h2>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSaveTemplate)} className="space-y-4">
              <TextField name="templateName" label="Template Name" control={control} required />
              <div className="grid grid-cols-2 gap-2">
                <TextField name="schoolName" label="School Name" control={control} />
                <Dropdown
                  name="schoolClassId"
                  label="Class"
                  control={control}
                  required
                  options={classesData?.map((c: any) => ({ label: c.className, value: String(c.id) })) || []}
                />
              </div>
              <TextField name="address" label="School Address" control={control} />
              <TextField name="examName" label="Exam Title" control={control} />
              <Dropdown
                name="searchSession"
                label="Session"
                control={control}
                required
                options={sessions?.map((s: any) => ({ value: s.session, label: s.session })) || []}
              />
              <FileUploadField name="leftLogo" label="School Logo" control={control} />
              <div className="space-y-2">
                <FileUploadField name="teacherSign" label="Teacher's Signature" control={control} />
                <FileUploadField name="principalSign" label="Principal's Signature" control={control} />
              </div>

              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-orange-700">COLUMNS</span>
                  <button type="button" onClick={() => addCol({ label: "" })} className="text-xs text-blue-600 font-bold">+ Add</button>
                </div>
                {columnFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mb-2 items-center">
                    <TextField name={`columns.${index}.label`} placeholder="Term I" control={control} />
                    <button type="button" onClick={() => remCol(index)} className="text-red-500 font-bold px-2">×</button>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500">SUBJECTS</span>
                  <button type="button" onClick={() => addSub({ name: "" })} className="text-xs text-blue-600 font-bold">+ Add</button>
                </div>
                {subjectFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mb-2 items-center">
                    <TextField name={`subjects.${index}.name`} placeholder="Subject Name" control={control} />
                    <button type="button" onClick={() => remSub(index)} className="text-red-500 font-bold px-2">×</button>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex gap-2">
                <Button name={editId ? "Update Template" : "Save Template"} clr="bg-slate-800" icon={<IconField name="FaSave" />} loading={false} />
                {editId && <Button name="Cancel" clr="bg-gray-400" onClick={() => { reset(); setEditId(null); }} loading={false} />}
              </div>
            </form>
          </FormProvider>
        </div>

        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-700">Live Preview</h3>
            <Button 
                name="Generate Exam Result" 
                clr="bg-blue-600" 
                icon={<IconField name="FaFileAlt" />} 
                onClick={() => setViewMode("PRINT_SELECTION")} 
                loading={false}
            />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border overflow-x-auto">
            <MarksheetPreview data={formDataPreview} />
          </div>
          <div className="bg-white rounded-xl shadow-md border overflow-hidden">
            <ControlledTable
              title="Saved Templates"
              columns={[
                { key: "templateName", label: "Template Name" },
                { key: "schoolName", label: "School" },
                { key: "classLevel", label: "Class" },
                { key: "session", label: "Session" },
              ]}
              data={templates}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={(id) => setViewId(Number(id))}
              actionColumn
              enablePermissions={true}
            permissionScope="EXAM_RESULT"

            />
          </div>
        </div>
      </div>

      {viewId && (
        <div className="fixed inset-0 bg-slate-900/80 flex justify-center items-center z-50 p-6 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative flex flex-col max-h-[95vh]">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold">Template View</h3>
              <button onClick={() => setViewId(null)} className="text-gray-500 text-2xl">&times;</button>
            </div>
            <div className="p-8 overflow-y-auto">
              <MarksheetPreview data={templates.find((t) => t.id === viewId) || {}} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamResult;