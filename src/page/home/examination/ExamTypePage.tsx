import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import TextField from "../../../components/controlled/TextField";
import TextareaField from "../../../components/controlled/TextareaField";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import { Button } from "../../../components/controlled";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";

import {
  useExamTypes,
  useCreateExamType,
  useUpdateExamType,
  useDeleteExamType,
} from "../../../hooks/queries/examination/useExamTypes";
import type { ExamTypeFormData } from "../../../types/examination/examType";

const ExamTypePage: React.FC = () => {
  const { handleSubmit, control, reset, setValue } = useForm<ExamTypeFormData>({
    defaultValues: { examType: "", description: "" },
  });

  const { data: examTypes = [] ,isLoading} = useExamTypes();
  const createMutation = useCreateExamType();
  const updateMutation = useUpdateExamType();
  const deleteMutation = useDeleteExamType();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { t } = useTranslation();
  const Texts = getPagesDataText(t);

  const onSubmit: SubmitHandler<ExamTypeFormData> = (data) => {
    if (!data.examType.trim()) return;

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            reset();
            setEditingId(null);
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => reset(),
      });
    }
  };

  const handleEdit = (id: string | number) => {
    const item = examTypes.find((d) => d.id === id.toString());
    if (!item) return;

    setValue("examType", item.examType);
    setValue("description", item.description);
    setEditingId(item.id);
  };

  const handleDelete = (id: string | number) => {
    if (!window.confirm(Texts.Do_you_want_to_delete_this_entry)) return;

    deleteMutation.mutate(id.toString());

    if (editingId === id.toString()) {
      reset();
      setEditingId(null);
    }
  };

  const handleDeleteAll = (ids: (string | number)[]) => {
    if (!window.confirm(Texts.Delete_A)) return;

    ids.forEach((id) => deleteMutation.mutate(id.toString()));

    if (editingId && ids.includes(editingId)) {
      reset();
      setEditingId(null);
    }
  };

  const filteredList = examTypes.filter((item) =>
    item.examType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tableColumns = [
    { key: "examType", label: Texts.Exam_Type },
    { key: "description", label: Texts.Description },
  ];

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
    <div className="flex flex-col lg:flex-row justify-between p-4 space-y-4 lg:space-y-0 w-full">
      <div className="w-full lg:w-1/3 p-4 bg-white rounded-md shadow-2xl mt-4">
        <h1 className="mb-4 text-black text-xl font-medium capitalize">
          {Texts.Create_Exam_Type}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextField
            name="examType"
            label={Texts.Exam_Type}
            required
            control={control}
            placeholder='Enter exam type'
          />

          <TextareaField
            name="description"
            label={Texts.Description}
            control={control}
            placeholder={Texts.Description_Plaseholder}
          />

          <div className="flex items-center justify-end">
            <Button
              name={editingId ? Texts.Update : Texts.Save}
              loading={createMutation.isPending || updateMutation.isPending}
              permissionScope="EXAMINATION"  permissionType={editingId ? "UPDATE" : "CREATE"}  enablePermissions={true}
              icon={<IconField name="FaSave" size={16} />}
            />
          </div>
        </form>
      </div>

      <div className="p-2 w-full lg:w-2/3">
        <ControlledTable
          columns={tableColumns}
          data={filteredList}
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteAll}
          title={Texts.Exam_Type_List}
          actionColumn
          showSelectAll
          enablePermissions={true}
           permissionScope="EXAMINATION"
        />
      </div>
    </div>
  );
};

export default ExamTypePage;
