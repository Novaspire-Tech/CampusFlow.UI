import React, { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import TextAreaField from "../../../components/controlled/TextareaField";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";
import {
  useContentTypes,
  useAddContentType,
  useUpdateContentType,
  useDeleteContentType,
  useDeleteMultipleContentTypes,
} from "../../../hooks/queries/downloadCenter/useContentType";
import { TextField } from "../../../components/controlled";
import { toast } from "react-toastify";
import { confirmToast } from "../../../helpers/confirmToast";
import AllSchoolDropdown from "../../../components/uncontrolled/AllSchoolDropdown";

const ContentType = () => {
  const [search, setSearch] = useState<string>("");
  const [editId, setEditId] = useState<string | null>(null);

  const { data: contentTypes = [], isLoading } = useContentTypes();
  const { mutateAsync: addContentType } = useAddContentType();
  const { mutateAsync: updateContentType } = useUpdateContentType();
  const { mutateAsync: deleteContentType } = useDeleteContentType();
  const { mutateAsync: deleteMultipleContentTypes } = useDeleteMultipleContentTypes();

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: { name: "", description: "" },
  });

  const { t } = useTranslation();
  const Text = getPagesDataText(t);
  const DoYouWantToDeleteText = getPagesDataText(t);
  const DeleteAllText = getPagesDataText(t);

  const onSubmit = async (data: FieldValues) => {
    try {
      if (editId !== null) {
        const itemToUpdate = contentTypes.find(
          (item) => item.contentTypeId === editId
        );
        if (itemToUpdate) {
          await updateContentType({
            id: editId,
            data: {
              ...itemToUpdate,
              name: data.name,
              description: data.description || "",
            },
          });
          toast.success("Content type updated successfully!");
        }
        setEditId(null);
      } else {
        await addContentType({
          name: data.name,
          description: data.description || "",
          status: "Active",
        });
        toast.success("Content type added successfully!");
      }
      reset();
    } catch (error: any) {
      toast.error(error.message || "Operation failed. Please try again.");
    }
  };

  const handleEdit = (id: string | number) => {
    const contentTypeId = id.toString();
    const item = contentTypes.find((c) => c.contentTypeId === contentTypeId);
    if (!item) return;
    setValue("name", item.name);
    setValue("description", item.description || "");
    setEditId(contentTypeId);
  };

  const handleDelete = async (id: number | string) => {
    if (await confirmToast(DoYouWantToDeleteText.Do_you_want_to_delete_this_entry)) {
      try {
        await deleteContentType(id.toString());
        toast.success("Content type deleted successfully!");
        reset();
        setEditId(null);
      } catch (error: any) {
        toast.error(error.message || "Failed to delete content type.");
      }
    }
  };

  const handleDeleteMultiple = async (ids: (number | string)[]) => {
    if (await confirmToast(DeleteAllText.Delete_A)) {
      try {
        const stringIds = ids.map((id) => id.toString());
        await deleteMultipleContentTypes(stringIds);
        toast.success("Selected content types deleted successfully!");
        reset();
        setEditId(null);
      } catch (error: any) {
        toast.error(error.message || "Failed to delete content types.");
      }
    }
  };

  const filteredData = contentTypes
    .filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(search.toLowerCase())
    )
    .map((item) => ({
      id: item.contentTypeId,
      name: item.name,
      description: item.description || "",
    }));

  const columns = [
    { key: "name", label: Text.Name },
    { key: "description", label: Text.Description },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 w-full">
      <div className="w-full lg:w-1/3 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-3 border-b pb-2">
          {editId !== null ? Text.Edit_Content_Type : Text.Add_Content_Type}
        </h2>

        <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label={Text.Name}
            name="name"
            control={control}
            placeholder={Text.Enter_Content_Name}
            required
          />
          <TextAreaField
            name="description"
            label={Text.Description}
            control={control}
            placeholder={Text.Enter_Content_Description}
            required={false}
          />
          <Button
            name={editId !== null ? Text.Update : Text.Save}
            loading={false}
            icon={<IconField name="FaSave" />}
            permissionScope="DOWNLOAD_CENTRE"
            permissionType={editId ? "UPDATE" : "CREATE"}
            enablePermissions={true}
          />
        </AllSchoolDropdown>
      </div>

      <div className="w-full lg:w-2/3">
        <ControlledTable
          title={Text.Content_Type_List}
          columns={columns}
          data={filteredData}
          searchTerm={search}
          enablePermissions={true}
          permissionScope="DOWNLOAD_CENTRE"
          onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteMultiple}
          showSelectAll={true}
        />
      </div>
    </div>
  );
};

export default ContentType;