import React, { useState, type ChangeEvent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import Dropdown from "../../../components/controlled/Dropdown";
import TextField from "../../../components/controlled/TextField";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";
import {
  useMarksGrades,
  useCreateMarksGrade,
  useUpdateMarksGrade,
  useDeleteMarksGrade,
  useDeleteMultipleMarksGrades,
} from "../../../hooks/queries/examination/useMarksGrade";
import { useExamGroups } from "../../../hooks/queries/examination/useExamGroup";
import { useMarkDivisions } from "../../../hooks/queries/examination/useMarkDivision";
import type { MarksGradeFormData } from "../../../types/examination/MarksGrades";
import { toast } from "react-toastify";
import { confirmToast } from "../../../helpers/confirmToast";

interface GradeFormData {
  examGroupId: string;
  markDivisionId: string;
  gradeName: string;
  gradePoint: string;
}

const MarksGrade: React.FC = () => {
  const { t } = useTranslation();
  const Texts = getPagesDataText(t);

  const { control, handleSubmit, reset, setValue } = useForm<GradeFormData>({
    defaultValues: {
      examGroupId: "",
      markDivisionId: "",
      gradePoint: "",
      gradeName: "",
    },
  });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: gradesData ,isLoading} = useMarksGrades();
  const { data: examGroupsData } = useExamGroups();
  const { data: markDivisionsData } = useMarkDivisions();

  const createMutation = useCreateMarksGrade();
  const updateMutation = useUpdateMarksGrade();
  const deleteMutation = useDeleteMarksGrade();
  const deleteMultipleMutation = useDeleteMultipleMarksGrades();

  const grades = gradesData || [];
  const examGroups = examGroupsData || [];
  const markDivisions = markDivisionsData?.markDivisions || [];

  const examGroupOptions = examGroups.map((group: any) => ({
    label: group.name || "",
    value: (group.examGroupId || "").toString(),
  }));

  const markDivisionOptions = markDivisions.map((division: any) => ({
    label: division.divisionName || "",
    value: (division.markDivisionId || "").toString(),
  }));

  const clearForm = () => {
    reset({
      examGroupId: "",
      markDivisionId: "",
      gradePoint: "",
      gradeName: "",
    });
    setEditingId(null);
  };

  const onSubmit: SubmitHandler<GradeFormData> = async (formData) => {
    try {
      const payload: MarksGradeFormData = {
        examGroupId: formData.examGroupId,
        markDivisionId: formData.markDivisionId,
        gradePoint: parseFloat(formData.gradePoint).toFixed(2),
        gradeName: formData.gradeName || "",
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      clearForm();
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleEdit = (id: string | number) => {
    const stringId = typeof id === "number" ? id.toString() : id;
    const grade = grades.find((g) => g.id === stringId);
    if (!grade) return;

    setValue("examGroupId", (grade.examGroupId || "").toString());
    setValue("markDivisionId", (grade.markDivisionId || "").toString());
    setValue("gradePoint", grade.gradePoint);
    setValue("gradeName", grade.gradeName || "");
    setEditingId(stringId);
  };

  const handleDelete = async (id: string | number) => {
    const stringId = typeof id === "number" ? id.toString() : id;
    if (!await confirmToast(Texts.Do_you_want_to_delete_this_entry)) return;

    try {
      await deleteMutation.mutateAsync(stringId);
      if (editingId === stringId) clearForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete marks grade");
    }
  };

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (!ids.length) return;
    if (!await confirmToast(Texts.Delete_A)) return;

    try {
      const stringIds = ids.map((id) =>
        typeof id === "number" ? id.toString() : id
      );
      await deleteMultipleMutation.mutateAsync(stringIds);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete marks grades");
    }
  };

  const filteredGrades = grades.filter((grade) => {
    const examGroupName = (grade.examGroup?.name || "").toLowerCase();
    const gradeName = (grade.gradeName || "").toLowerCase();
    const divisionName = (grade.markDivision?.divisionName || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    return (
      examGroupName.includes(search) ||
      gradeName.includes(search) ||
      divisionName.includes(search)
    );
  });

  const tableData = filteredGrades.map((grade) => ({
    id: grade.id,
    examGroupName: grade.examGroup?.name || "-",
    markDivisionName: grade.markDivision?.divisionName || "-",
    gradeName: grade.gradeName || "",
    gradePoint: grade.gradePoint,
  }));

  const columns = [
    { key: "examGroupName", label: Texts.Exam_Type },
    { key: "markDivisionName", label: Texts.Division },
    { key: "gradeName", label: Texts.Grade_Name },
    { key: "gradePoint", label: Texts.Grade_Point },
  ];

  const isSaving = createMutation.isPending || updateMutation.isPending;
 if (isLoading ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Add student library data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 w-full mx-auto">
      <div className="w-full lg:w-1/3 rounded p-4 shadow-sm bg-white">
        <h2 className="text-lg font-semibold mb-4">
          {editingId !== null
            ? Texts.Edit_Mark_Grade
            : Texts.Add_Mark_Grade}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Dropdown
            label={Texts.Exam_Type}
            name="examGroupId"
            control={control}
            options={examGroupOptions}
            required
          />

          <Dropdown
            label={Texts.Division}
            name="markDivisionId"
            control={control}
            options={markDivisionOptions}
            required
          />

          <TextField
            name="gradePoint"
            label={Texts.Grade_Point}
            control={control}
            required
            placeholder="Enter Grade Point"
          />

          <TextField
            name="gradeName"
            label={Texts.Grade_Name}
            control={control}
            placeholder="Enter Grade Name"
          />

          <div className="flex flex-col sm:flex-row justify-start sm:space-x-4 space-y-2 sm:space-y-0 pt-2">
            <Button
              name={editingId !== null ? Texts.Update : Texts.Save}
              loading={isSaving}
              clr="bg-slate-700"
              permissionScope="EXAMINATION"  permissionType={editingId !== null ? "UPDATE" : "CREATE"}  enablePermissions={true}
              icon={<IconField name="FaSave" />}
            />

            {editingId !== null && (
              <Button
                name={Texts.Cancel}
                loading={false}
                clr="bg-slate-700"
                onClick={clearForm}
              />
            )}
          </div>
        </form>
      </div>

      <div className="flex-1 bg-white rounded p-4 shadow overflow-x-auto">
        <ControlledTable
          columns={columns}
          data={tableData}
          searchTerm={searchTerm}
          onSearchChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteMultiple}
          title={Texts.Grade_Table}
          enablePermissions={true}
           permissionScope="EXAMINATION"
        />
      </div>
    </div>
  );
};

export default MarksGrade;
