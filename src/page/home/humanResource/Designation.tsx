import React, { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import NameField from "../../../components/controlled/NameField";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";
import {
  useDesignations,
  useAddDesignation,
  useUpdateDesignation,
  useDeleteDesignation,
  useDeleteMultipleDesignations,
} from "../../../hooks/queries/humanResource/useDesignation";
import { confirmToast } from "../../../helpers/confirmToast";
import { toast } from "react-toastify";
import AllSchoolDropdown from "../../../components/uncontrolled/AllSchoolDropdown";

const Designation = () => {
  const [search, setSearch] = useState<string>("");
  const [editIndex, setEditIndex] = useState<string | null>(null);

  const { t } = useTranslation();
  const texts = getPagesDataText(t);

  const { data: designations = [], isLoading } = useDesignations();
  const { mutateAsync: addDesignation } = useAddDesignation();
  const { mutateAsync: updateDesignation } = useUpdateDesignation();
  const { mutateAsync: deleteDesignation } = useDeleteDesignation();
  const { mutateAsync: deleteMultipleDesignations } = useDeleteMultipleDesignations();

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: { name: "" },
  });

  const onSubmit = async (data: FieldValues): Promise<void> => {
    try {
      if (editIndex !== null) {
        const existing = (designations as any[]).find((item) => item.id === editIndex);
        if (existing) {
          await updateDesignation({
            id: editIndex,
            data: { ...existing, name: data.name },
          });
          toast.success("Designation updated successfully");
        }
        setEditIndex(null);
      } else {
        await addDesignation({ name: data.name, status: "Active" });
        toast.success("Designation added successfully");
      }
      reset();
    } catch (error: any) {
      toast.error(error.message || "Operation failed. Please try again.");
    }
  };

  const handleEdit = (id: string | number): void => {
    const designationId = id.toString();
    const item = (designations as any[]).find((h) => h.id === designationId);
    if (!item) return;
    setValue("name", item.name);
    setEditIndex(designationId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number | string): Promise<void> => {
    if (await confirmToast(
      texts.Do_you_want_to_delete_this_entry ||
      "Do you want to delete this designation?"
    )) {
      try {
        await deleteDesignation(id.toString());
        toast.success("Designation deleted successfully");
        if (editIndex === id.toString()) {
          setEditIndex(null);
          reset();
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to delete designation.");
      }
    }
  };

  const handleDeleteMultiple = async (ids: (number | string)[]): Promise<void> => {
    if (await confirmToast(
      texts.Delete_A ||
      "Do you want to delete selected designations?"
    )) {
      try {
        await deleteMultipleDesignations(ids.map((id) => id.toString()));
        toast.success(`${ids.length} designation(s) deleted successfully.`);
        if (editIndex !== null && ids.map(String).includes(editIndex)) {
          setEditIndex(null);
          reset();
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message ||
          error.message ||
          "Failed to delete designations."
        );
      }
    }
  };

  const handleCancel = (): void => {
    setEditIndex(null);
    reset();
  };

  const filteredData = (designations as any[])
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .map((item) => ({ id: item.id, name: item.name }));

  const columns = [
    { key: "name", label: texts.Designation_Name || "Designation Name" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading Designation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 w-full">
      <div className="w-full lg:w-1/3 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-3 border-b pb-2">
          {editIndex !== null ? texts.Edit : texts.Add}
        </h2>
        <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <NameField
            name="name"
            label={texts.Designation_Name}
            control={control}
            placeholder={texts.Designation_Name}
            required={true}
          />
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              name={editIndex !== null ? texts.Update : texts.Save}
              loading={false}
              permissionScope="HR"
              permissionType={editIndex !== null ? "UPDATE" : "CREATE"}
              enablePermissions={true}
              icon={<IconField name={editIndex !== null ? "FaEdit" : "FaSave"} />}
            />
            {editIndex !== null && (
              <Button
                name={texts.Cancel || "Cancel"}
                onClick={handleCancel}
                loading={false}
                icon={<IconField name="FaTimes" />}
              />
            )}
          </div>
        </AllSchoolDropdown>
      </div>

      <div className="w-full lg:w-2/3">
        <ControlledTable
          title={texts.Designation_List || "Designation List"}
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
          permissionScope="HR"
        />
      </div>
    </div>
  );
};

export default Designation;