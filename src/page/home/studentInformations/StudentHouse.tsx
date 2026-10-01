import React, { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import TextField from "../../../components/controlled/TextField";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import TextAreaField from "../../../components/controlled/TextareaField";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";
import {
  useStudentHouses,
  useAddStudentHouse,
  useUpdateStudentHouse,
  useDeleteStudentHouse,
  useDeleteMultipleStudentHouses,
} from "../../../hooks/queries/studentInformation/useStudentHouses";
import { toast } from "react-toastify";
import { confirmToast } from "../../../helpers/confirmToast";
import AllSchoolDropdown from "../../../components/uncontrolled/AllSchoolDropdown";

const StudentHouses = () => {
  const [search, setSearch] = useState<string>("");
  const [editIndex, setEditIndex] = useState<string | null>(null);

  const { t } = useTranslation();
  const texts = getPagesDataText(t);

  const { data: studentHouses = [], isLoading } = useStudentHouses();
  const { mutateAsync: addStudentHouse } = useAddStudentHouse();
  const { mutateAsync: updateStudentHouse } = useUpdateStudentHouse();
  const { mutateAsync: deleteStudentHouse } = useDeleteStudentHouse();
  const { mutateAsync: deleteMultipleStudentHouses } = useDeleteMultipleStudentHouses();

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: { houseName: "", description: "" },
  });

  const onSubmit = async (data: FieldValues) => {
    try {
      if (editIndex !== null) {
        const houseToUpdate = studentHouses.find((item) => item.id === editIndex);
        if (houseToUpdate) {
          await updateStudentHouse({
            id: editIndex,
            data: {
              ...houseToUpdate,
              name: data.houseName,
              description: data.description || "",
            },
          });
          toast.success("Student house updated successfully!");
        }
        setEditIndex(null);
      } else {
        await addStudentHouse({
          name: data.houseName,
          description: data.description || "",
          status: "Active",
        });
        toast.success("Student house saved successfully!");
      }
      reset();
    } catch (error: any) {
      toast.error(error.message || "Operation failed. Please try again.");
    }
  };

  const handleEdit = (id: string | number) => {
    const houseId = id.toString();
    const item = studentHouses.find((h: { id: string }) => h.id === houseId);
    if (!item) return;
    setValue("houseName", item.name);
    setValue("description", item.description || "");
    setEditIndex(houseId);
  };

  const handleDelete = async (id: number | string) => {
    if (await confirmToast(texts.Do_you_want_to_delete_this_entry)) {
      try {
        await deleteStudentHouse(id.toString());
        toast.success("Student house deleted successfully!");
        reset();
        setEditIndex(null);
      } catch (error: any) {
        toast.error(error.message || "Failed to delete student house.");
      }
    }
  };

  const handleDeleteMultiple = async (ids: (number | string)[]) => {
    if (await confirmToast(texts.Delete_A)) {
      try {
        const stringIds = ids.map((id) => id.toString());
        await deleteMultipleStudentHouses(stringIds);
        toast.success(`${ids.length} student houses deleted successfully!`);
        reset();
        setEditIndex(null);
      } catch (error: any) {
        toast.error(error.message || "Failed to delete student houses.");
      }
    }
  };

  const handleCancel = () => {
    setEditIndex(null);
    reset();
  };

  const filteredData = studentHouses
    .filter(
      (item: { name: string; description: any }) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(search.toLowerCase())
    )
    .map((item: { id: any; name: any; description: any }) => ({
      id: item.id,
      name: item.name,
      description: item.description || "",
    }));

  const columns = [
    { key: "name", label: texts.House_Name },
    { key: "description", label: texts.Description },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"/>
          <p className="text-gray-600">Loading student houses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 w-full">
      <div className="w-full lg:w-1/3 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-3 border-b pb-2">
          {editIndex !== null ? texts.Edit_House : texts.Add_House}
        </h2>
        <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)}>
          <TextField
            name="houseName"
            label={texts.House_Name}
            control={control}
            placeholder={texts.House_Name}
            required={true}
          />
          <TextAreaField
            name="description"
            label={texts.Description}
            control={control}
            placeholder={texts.Description_Plaseholder}
            required={false}
          />
          <div className="flex gap-2 mt-4">
            <Button
              name={editIndex !== null ? texts.Update : texts.Save}
              loading={false}
              permissionScope="STUDENT"
              permissionType={editIndex !== null ? "UPDATE" : "CREATE"}
              enablePermissions={true}
              icon={<IconField name="FaSave" />}
            />
            {editIndex !== null && (
              <Button
                name={texts.Cancel}
                loading={false}
                onClick={handleCancel}
                icon ={<IconField name="FaTimes" />}
              />
            )}
          </div>
        </AllSchoolDropdown>
      </div>

      <div className="w-full lg:w-2/3">
        <ControlledTable
          title={texts.Student_HousesTitle}
          columns={columns}
          data={filteredData}
          searchTerm={search}
          onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteMultiple}
          showSelectAll={true}
          enablePermissions={true}
          permissionScope="STUDENT"
        />
      </div>
    </div>
  );
};

export default StudentHouses;