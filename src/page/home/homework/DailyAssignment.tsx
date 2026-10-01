import React, { useState } from "react";
import { useForm, type FieldValues, type SubmitHandler } from "react-hook-form";
import DateField from "../../../components/controlled/DateField";
import {
  Button,
  Dropdown,
  FutureDateField,
  NumberField,
} from "../../../components/controlled";
import TextField from "../../../components/controlled/TextField";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText, getPagesNameText } from "../../../helpers/useTranslations";
import {
  useAcademicTasks,
  useCreateAcademicTask,
  useUpdateAcademicTask,
  useDeleteAcademicTask,
  useDeleteMultipleAcademicTasks,
} from "../../../hooks/queries/homework/useAcademic";
import type {
  AcademicTask,
  AcademicTaskFormData,
  AcademicTaskFilters,
} from "../../../types/homework/academicTask";
import { useSchoolClasses } from "../../../hooks/queries/academics/useClasses";
import { useSections } from "../../../hooks/queries/academics/useSections";
import { useSubjects } from "../../../hooks/queries/academics/useSubject";
import { useTeachers } from "../../../hooks/queries/academics/useTeachers";
import { openDocument } from "../../../hooks/useBlobImage";
import FileUploadField from "../../../components/controlled/FileUploadField";
import { toast } from "react-toastify";
import { confirmToast } from "../../../helpers/confirmToast";
import AllSchoolDropdown from "../../../components/uncontrolled/AllSchoolDropdown";

interface ExtendedFormData extends AcademicTaskFormData {
  formClassId?: string;
}

const toDateInputFormat = (dateStr: string): string => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const parts = dateStr.split("/");
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return dateStr;
};

export default function DailyAssignment() {
  const { t } = useTranslation();
  const texts = getPagesDataText(t) 
  const nameTexts = getPagesNameText(t) 

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [activeFilters, setActiveFilters] = useState<AcademicTaskFilters>({});

  const [editId, setEditId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [viewItem, setViewItem] = useState<AcademicTask | null>(null);
  const [editingTask, setEditingTask] = useState<AcademicTask | null>(null);

  const [filterClassId, setFilterClassId] = useState<number>(0);
  const [formClassId, setFormClassId] = useState<number>(0);

  const { data: classes } = useSchoolClasses();
  const { data: filterSections } = useSections(filterClassId);
  const { data: formSections } = useSections(formClassId);
  const { data: subjects } = useSubjects();
  const { data: teachers } = useTeachers(0, 100, "asc");

  const { data: tasksResponse, isLoading, isFetching } = useAcademicTasks(page, pageSize, activeFilters);

  const tasks: AcademicTask[] = React.useMemo(
    () => (tasksResponse?.tasks ?? []).filter((t) => t.taskType === "ASSIGNMENT"),
    [tasksResponse]
  );

  const totalItems = tasksResponse?.totalItems ?? 0;
  const totalPages = tasksResponse?.totalPages ?? 0;

  const createMutation = useCreateAcademicTask();
  const updateMutation = useUpdateAcademicTask();
  const deleteMutation = useDeleteAcademicTask();
  const deleteMultipleMutation = useDeleteMultipleAcademicTasks();

  const { control, handleSubmit, reset, setValue, watch: watchForm } = useForm<ExtendedFormData>({
    defaultValues: {
      title: "",
      description: "",
      taskType: "ASSIGNMENT",
      assignedDate: "",
      submissionDate: "",
      evaluationDate: "",
      maxMarks: 0,
      status: "ASSIGNED",
      sectionId: "",
      subjectId: "",
      teacherId: "",
      formClassId: "",
    },
  });

  React.useEffect(() => {
    const sub = watchForm((value, { name }) => {
      if (name === "formClassId" && value.formClassId) {
        setFormClassId(Number(value.formClassId));
        if (!editId) setValue("sectionId", "");
      }
    });
    return () => sub.unsubscribe();
  }, [watchForm, setValue, editId]);

  React.useEffect(() => {
    if (editId && formSections && formSections.length > 0) {
      const current = watchForm("sectionId");
      if (current) setValue("sectionId", current);
    }
  }, [formSections, editId, setValue]);

  const { control: filterControl, handleSubmit: handleFilterSubmit, reset: resetFilter, watch: watchFilter } =
    useForm<FieldValues>({
      defaultValues: {
        filterClassId: "",
        filterSectionId: "",
        filterSubjectId: "",
        filterTeacherId: "",
      },
    });

  React.useEffect(() => {
    const sub = watchFilter((value, { name }) => {
      if (name === "filterClassId") {
        setFilterClassId(Number(value.filterClassId) || 0);
      }
    });
    return () => sub.unsubscribe();
  }, [watchFilter]);

  const classOptions = React.useMemo(
    () =>
      (classes ?? []).map((c: any) => ({
        value: String(c.id ?? c.schoolClassId ?? ""),
        label: c.className ?? c.name ?? "",
      })),
    [classes]
  );

  const filterSectionOptions = React.useMemo(
    () =>
      (filterSections ?? []).map((s: any) => ({
        value: String(s.id ?? s.sectionId ?? ""),
        label: s.sectionName ?? s.name ?? "",
      })),
    [filterSections]
  );

  const formSectionOptions = React.useMemo(
    () =>
      (formSections ?? []).map((s: any) => ({
        value: String(s.id ?? s.sectionId ?? ""),
        label: s.sectionName ?? s.name ?? "",
      })),
    [formSections]
  );

  const subjectOptions = React.useMemo(
    () =>
      (subjects ?? []).map((s: any) => ({
        value: String(s.id ?? s.subjectId ?? ""),
        label: s.subjectName ?? s.name ?? "",
      })),
    [subjects]
  );

  const teacherOptions = React.useMemo(
    () =>
      (teachers ?? [])
        .filter((t) => t != null)
        .map((t: any) => ({
          value: String(t.teacherId ?? t.teachersId ?? t.id ?? ""),
          label: t.name ?? t.teacherName ?? "Unknown Teacher",
        }))
        .filter((opt) => opt.value !== "" && opt.value !== "undefined"),
    [teachers]
  );

  const resetFormModal = () => {
    reset({
      title: "",
      description: "",
      taskType: "ASSIGNMENT",
      assignedDate: "",
      submissionDate: "",
      evaluationDate: "",
      maxMarks: 0,
      status: "ASSIGNED",
      sectionId: "",
      subjectId: "",
      teacherId: "",
      formClassId: "",
    });
    setEditId(null);
    setEditingTask(null);
    setFormClassId(0);
  };

  const onSubmit: SubmitHandler<ExtendedFormData> = async (data) => {
    try {
      const { ...rest } = data;
      const payload: AcademicTaskFormData = { ...rest, taskType: "ASSIGNMENT" };

      if (editId) {
        await updateMutation.mutateAsync({ id: editId, data: payload });
        toast.success("Assignment updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Assignment created successfully");
      }
      resetFormModal();
      setShowFormModal(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save assignment. Please try again.");
    }
  };

  const handleView = (id: string | number) => {
    const task = tasks.find((t) => t.id === id.toString());
    if (task) setViewItem(task);
  };

  const handleEdit = (id: string | number) => {
    const task = tasks.find((t) => t.id === id.toString());
    if (!task) return;

    setValue("title", task.title);
    setValue("description", task.description);
    setValue("taskType", "ASSIGNMENT");
    setValue("assignedDate", toDateInputFormat(task.assignedDate));
    setValue("submissionDate", toDateInputFormat(task.submissionDate));
    setValue("evaluationDate", toDateInputFormat(task.evaluationDate ?? ""));
    setValue("maxMarks", task.maxMarks);
    setValue("status", task.status);
    setValue("subjectId", task.subjectId ?? "");
    setValue("teacherId", task.teacherId ?? "");

    if (task.classId && task.sectionId) {
      setFormClassId(Number(task.classId));
      setValue("formClassId", task.classId);
      setValue("sectionId", task.sectionId);
    }

    setEditId(task.id);
    setEditingTask(task);
    setShowFormModal(true);
  };

  const handleDelete = async (id: string | number) => {
    const confirmed = await confirmToast(
      texts.Do_you_want_to_delete_this_entry ?? "Do you want to delete this assignment?"
    );
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(id.toString());
      toast.success("Assignment deleted successfully");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete assignment.");
    }
  };

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const confirmed = await confirmToast(
      texts.Delete_A ?? `Do you want to delete ${ids.length} selected assignment(s)?`
    );
    if (!confirmed) return;
    try {
      await deleteMultipleMutation.mutateAsync(ids.map((id) => id.toString()));
      toast.success("Assignments deleted successfully");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete assignments.");
    }
  };

  const handleApplyFilters: SubmitHandler<FieldValues> = (data) => {
    const filters: AcademicTaskFilters = {};
    if (data.filterSectionId) filters.sectionId = data.filterSectionId;
    if (data.filterSubjectId) filters.subjectId = data.filterSubjectId;
    if (data.filterTeacherId) filters.teacherId = data.filterTeacherId;
    setActiveFilters(filters);
    setPage(0);
  };

  const handleClearFilters = () => {
    resetFilter({
      filterClassId: "",
      filterSectionId: "",
      filterSubjectId: "",
      filterTeacherId: "",
    });
    setFilterClassId(0);
    setActiveFilters({});
    setPage(0);
  };

  const columns = [
    { label: texts.Title ?? "Title", key: "title" },
    { label: texts.Subject ?? "Subject", key: "subjectName" },
    { label: texts.Teacher ?? "Teacher", key: "teacherName" },
    { label: texts.Assigned_Date ?? "Assigned Date", key: "assignedDate" },
    { label: texts.Submission_Date ?? "Submission Date", key: "submissionDate" },
    { label: texts.Evaluation_Date ?? "Evaluation Date", key: "evaluationDate" },
    { label: texts.Max_Marks ?? "Max Marks", key: "maxMarks" },
    { label: texts.Status ?? "Status", key: "status" },
  ];

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="w-full px-4 py-4">

      {/* Add / Edit Modal */}
      {showFormModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-xl relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 cursor-pointer z-10"
                onClick={() => { setShowFormModal(false); resetFormModal(); }}
              >
                <IconField name="FaTimes" size={20} />
              </button>

              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                <IconField name={editId ? "FaEdit" : "FaPlus"} className="inline mr-2" />
                {editId
                  ? (texts.Edit_Assignment ?? "Edit Assignment")
                  : (texts.Add_Assignment ?? "Add Assignment")}
              </h2>

                   <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)}  queryKeys={['sections','schoolClasses','subjects']} className="space-y-4 mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    control={control}
                    name="title"
                    label={texts.Title ?? "Title"}
                    required
                    disabled={!!editId}
                    placeholder={texts.Enter_Title}
                  />
                  <TextField
                    control={control}
                    name="description"
                    label={texts.Description ?? "Description"}
                    required
                    placeholder={texts.Enter_Description}
                  />

                  <Dropdown
                    label={texts.Class ?? "Class"}
                    name="formClassId"
                    control={control}
                    options={classOptions}
                    required
                    disabled={!!editId}
                    key={`form-class-${editId ?? "new"}`}
                  />
                  <Dropdown
                    control={control}
                    name="sectionId"
                    label={nameTexts.Section ?? "Section"}
                    options={formSectionOptions}
                    disabled={!!editId}
                    required
                    key={`form-section-${editId ?? "new"}-${formClassId}`}
                  />

                  <Dropdown
                    control={control}
                    name="subjectId"
                    label={texts.Subject ?? "Subject"}
                    options={subjectOptions}
                    required
                  />
                  <Dropdown
                    control={control}
                    name="status"
                    label={texts.Status ?? "Status"}
                    options={[
                      { value: "DRAFT", label: "DRAFT" },
                      { value: "ASSIGNED", label: "ASSIGNED" },
                      { value: "IN_REVIEW", label: "IN_REVIEW" },
                      { value: "COMPLETED", label: "COMPLETED" },
                    ]}
                    required
                  />

                  <DateField
                    control={control}
                    name="assignedDate"
                    label={texts.Assigned_Date ?? "Assigned Date"}
                    required
                  />
                  <FutureDateField
                    control={control}
                    name="submissionDate"
                    label={texts.Submission_Date ?? "Submission Date"}
                    required
                  />
                  <FutureDateField
                    control={control}
                    name="evaluationDate"
                    label={texts.Evaluation_Date ?? "Evaluation Date"}
                  />

                  <Dropdown
                    control={control}
                    name="teacherId"
                    label={texts.Teacher ?? "Teacher"}
                    options={teacherOptions}
                    required
                  />
                  <NumberField
                    control={control}
                    name="maxMarks"
                    label={texts.Max_Marks ?? "Max Marks"}
                    required
                  />
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <FileUploadField
                    label={texts.Attachment ?? "Attachment"}
                    name="attachment"
                    control={control}
                    required={true}
                    existingFileUrl={editingTask?.attachmentPath}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    name={texts.Cancel ?? "Cancel"}
                    loading={false}
                    onClick={() => { setShowFormModal(false); resetFormModal(); }}
                  />
                  <Button
                    type="submit"
                    name={editId ? (texts.Update ?? "Update") : (texts.Save ?? "Save")}
                    loading={isSubmitting}
                    icon={<IconField name="FaSave" />}
                  />
                </div>
              </AllSchoolDropdown>
            </div>
          </div>
        </>
      )}

      {/* View Modal */}
      {viewItem && (
        <>
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white p-6 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setViewItem(null)}
                className="absolute top-3 right-3 font-bold text-gray-700 hover:text-gray-900 text-2xl"
              >
                <IconField name="FaTimes" />
              </button>

              <h2 className="text-2xl font-bold mb-6 border-b pb-3">
                {texts.Assignment_Details ?? "Assignment Details"}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    [texts.Title ?? "Title", viewItem.title],
                    [nameTexts.Section ?? "Section", viewItem.sectionName],
                    [texts.Subject ?? "Subject", viewItem.subjectName],
                    [texts.Teacher ?? "Teacher", viewItem.teacherName],
                    [texts.Assigned_Date ?? "Assigned Date", viewItem.assignedDate],
                    [texts.Submission_Date ?? "Submission Date", viewItem.submissionDate],
                    [texts.Max_Marks ?? "Max Marks", viewItem.maxMarks],
                    [texts.Status ?? "Status", viewItem.status],
                  ].map(([label, value]) => (
                    <div key={String(label)}>
                      <p className="text-sm text-gray-600">{label}</p>
                      <p className="font-semibold">{value}</p>
                    </div>
                  ))}

                  {viewItem.evaluationDate && (
                    <div>
                      <p className="text-sm text-gray-600">{texts.Evaluation_Date ?? "Evaluation Date"}</p>
                      <p className="font-semibold">{viewItem.evaluationDate}</p>
                    </div>
                  )}
                </div>

                {viewItem.description && (
                  <div>
                    <p className="text-sm text-gray-600">{texts.Description ?? "Description"}</p>
                    <p className="mt-1">{viewItem.description}</p>
                  </div>
                )}

                {viewItem.attachmentPath && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{texts.Attachment ?? "Attachment"}</p>
                    <button
                      onClick={() => openDocument(viewItem.attachmentPath!)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <IconField name="FaDownload" className="mr-2" />
                     {texts.Download_Attachment}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <Button
                  name={texts.Close ?? "Close"}
                  loading={false}
                  onClick={() => setViewItem(null)}
                  icon={<IconField name="FaTimes" />}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="w-full bg-white shadow-md rounded p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {texts.Daily_Assignment_List ?? "Daily Assignment List"}
          </h1>
        </div>

        <form onSubmit={handleFilterSubmit(handleApplyFilters)}>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Dropdown
              label={texts.Class ?? "Class"}
              name="filterClassId"
              control={filterControl}
              options={classOptions}
              required={true}
            />
            <Dropdown
              label={nameTexts.Section ?? "Section"}
              name="filterSectionId"
              control={filterControl}
              options={filterSectionOptions}
              required={true}
              key={`filter-section-${filterClassId}`}
            />
            <Dropdown
              label={texts.Subject ?? "Subject"}
              name="filterSubjectId"
              control={filterControl}
              options={subjectOptions}
              required={false}
            />
            <Dropdown
              label={texts.Teacher ?? "Teacher"}
              name="filterTeacherId"
              control={filterControl}
              options={teacherOptions}
              required={false}
            />
          </section>

          <div className="flex justify-end gap-2 mb-4">
            <Button
              onClick={handleClearFilters}
              name={texts.Cancel ?? "Clear"}
              loading={false}
              icon={<IconField name="FaTimes" />}
              showAlways={true}
            />
            <Button
              name={texts.Search ?? "Search"}
              loading={isFetching && !isLoading}
              icon={<IconField name="FaSearch" />}
              showAlways={true}
            />
          </div>
        </form>

        <hr className="border-gray-300 mb-4" />

        <div className="relative">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500 animate-pulse">Updating…</span>
            </div>
          )}

          <ControlledTable
            title={texts.Daily_Assignment_List ?? "Daily Assignment List"}
            columns={columns}
            data={isLoading ? [] : tasks}
            fullData={tasks}
            showSearch={false}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeleteMultiple={handleDeleteMultiple}
            showForm={() => setShowFormModal(true)}
            btn={true}
            btnName={texts.Add_Assignment ?? "Add Assignment"}
            showSelectAll
            enablePermissions={true}
            permissionScope="HOMEWORK"
            emptyMessage="No assignments found matching your criteria."
            serverPage={page}
            serverTotalPages={totalPages}
            serverTotalItems={totalItems}
            serverPageSize={pageSize}
            onServerPageChange={setPage}
            onServerPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(0);
            }}
          />
        </div>
      </div>
    </div>
  );
}