import React, { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import TextField from "../../../components/controlled/TextField";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";
import {
  useStudentCategories,
  useAddStudentCategory,
  useUpdateStudentCategory,
  useDeleteStudentCategory,
  useDeleteMultipleStudentCategories,
} from "../../../hooks/queries/studentInformation/useStudentCategories";
import { toast } from "react-toastify";
import { confirmToast } from "../../../helpers/confirmToast";
import AllSchoolDropdown from "../../../components/uncontrolled/AllSchoolDropdown";

const StudentCategories = () => {
 
  const { t } = useTranslation();
  const texts = getPagesDataText(t);

  const [search, setSearch] = useState<string>("");
  const [editIndex, setEditIndex] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useStudentCategories();
  const { mutateAsync: addCategory } = useAddStudentCategory();
  const { mutateAsync: updateCategory } = useUpdateStudentCategory();
  const { mutateAsync: deleteCategory } = useDeleteStudentCategory();
  const { mutateAsync: deleteMultipleCategories } = useDeleteMultipleStudentCategories();

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: { name: "" },
  });

  const onSubmit = async (data: FieldValues) => {
    try {
      const trimmedName = data.name.trim();

      const isDuplicate = categories.some(
        (cat: { name: string; id: string }) =>
          cat.name.toLowerCase() === trimmedName.toLowerCase() &&
          (!editIndex || cat.id !== editIndex)
      );

      if (isDuplicate) {
        toast.error("Category name already exists.");
        return;
      }

      if (editIndex !== null) {
        const categoryToUpdate = categories.find(
          (item: { id: string }) => item.id === editIndex
        );
        if (categoryToUpdate) {
          await updateCategory({
            id: editIndex,
            data: { ...categoryToUpdate, name: trimmedName },
          });
          toast.success("Category updated successfully!");
        }
        setEditIndex(null);
      } else {
        await addCategory({ name: trimmedName, status: "Active" });
        toast.success("Category saved successfully!");
      }
      reset();
    } catch (error: any) {
      toast.error(error.message || "Operation failed. Please try again.");
    }
  };

  const handleEdit = (id: string | number) => {
    const categoryId = id.toString();
    const item = categories.find((c: { id: string }) => c.id === categoryId);
    if (!item) return;
    setValue("name", item.name);
    setEditIndex(categoryId);
  };

  const handleDelete = async (id: number | string) => {
    if (await confirmToast(texts.Do_you_want_to_delete_this_entry)) {
      try {
        await deleteCategory(id.toString());
        toast.success("Category deleted successfully!");
        reset();
        setEditIndex(null);
      } catch (error: any) {
        toast.error(error.message || "Failed to delete student category.");
      }
    }
  };

  const handleDeleteMultiple = async (ids: (number | string)[]) => {
    if (await confirmToast(texts.Delete_A)) {
      try {
        const stringIds = ids.map((id) => id.toString());
        await deleteMultipleCategories(stringIds);
        toast.success(`${ids.length} categories deleted successfully!`);
        reset();
        setEditIndex(null);
      } catch (error: any) {
        toast.error(error.message || "Failed to delete student categories.");
      }
    }
  };

  const handleCancel = () => {
    setEditIndex(null);
    reset();
  };

  
  const filteredData = categories
    .filter((item: { name: string; id: string }) =>
      item.id &&
      item.id.trim() !== "" &&
      item.name.toLowerCase().includes(search.toLowerCase())
    )
    .map((item: { id: string; name: string }) => ({
      id: item.id,
      name: item.name,
    }));

  const columns = [{ key: "name", label: texts.Category_Name }];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading student categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen w-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 border-b pb-3">
        {texts.Student_CategoriesTitle}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-4 sm:gap-6">
        {/* Form Section */}
        <div className="bg-white p-4 sm:p-6 rounded-md shadow-md">
          <h3 className="text-lg font-semibold mb-3">
            {editIndex !== null ? texts.Edit_Category : texts.Add_Category}
          </h3>
          <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)}>
            <TextField
              name="name"
              label={texts.Category_Name}
              control={control}
              placeholder="Enter category name"
              required
            />
            <div className="flex gap-2 mt-4">
              <Button
                name={editIndex !== null ? texts.Update : texts.Submit}
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
                />
              )}
            </div>
          </AllSchoolDropdown>
        </div>

        {/* Table Section */}
        <div className="bg-white p-4 sm:p-6 rounded-md shadow-md">
          <ControlledTable
            columns={columns}
            data={filteredData}
            title={texts.Student_CategoriesTitle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeleteMultiple={handleDeleteMultiple}
            btn={false}
            searchTerm={search}
            enablePermissions={true}
            permissionScope="STUDENT"
            onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            showSelectAll={true}
          />
          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No categories found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCategories;