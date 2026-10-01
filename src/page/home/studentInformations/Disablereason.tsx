import React, { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import TextField from "../../../components/controlled/TextField";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";
import {
  useDisableReasons,
  useAddDisableReason,
  useUpdateDisableReason,
  useDeleteDisableReason,
  useDeleteMultipleDisableReasons,
} from "../../../hooks/queries/studentInformation/useDisableReasons";
import { toast } from "react-toastify";
import { confirmToast } from "../../../helpers/confirmToast";
import AllSchoolDropdown from "../../../components/uncontrolled/AllSchoolDropdown";

const DisableReason: React.FC = () => {
  const { t } = useTranslation();
  const text = getPagesDataText(t);

  const [search, setSearch] = useState<string>("");
  const [editIndex, setEditIndex] = useState<string | null>(null);

  const { data: disableReasons = [], isLoading } = useDisableReasons();
  const { mutateAsync: addDisableReason } = useAddDisableReason();
  const { mutateAsync: updateDisableReason } = useUpdateDisableReason();
  const { mutateAsync: deleteDisableReason } = useDeleteDisableReason();
  const { mutateAsync: deleteMultipleDisableReasons } = useDeleteMultipleDisableReasons();

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: { reason: "" },
  });

  const onSubmit = async (data: FieldValues) => {
    try {
      if (editIndex !== null) {
        const reasonToUpdate = disableReasons.find((item) => item.id === editIndex);
        if (reasonToUpdate) {
          await updateDisableReason({
            id: editIndex,
            data: { ...reasonToUpdate, reason: data.reason },
          });
          toast.success("Disable reason updated successfully!");
        }
        setEditIndex(null);
      } else {
        await addDisableReason({
          reason: data.reason, status: "Active",
          schoolCode: undefined
        });
        toast.success("Disable reason saved successfully!");
      }
      reset();
    } catch (error: any) {
      toast.error(error.message || "Operation failed. Please try again.");
    }
  };

  const handleEdit = (id: string | number) => {
    const reasonId = id.toString();
    const item = disableReasons.find((r: { id: string }) => r.id === reasonId);
    if (!item) return;
    setValue("reason", item.reason);
    setEditIndex(reasonId);
  };

  const handleDelete = async (id: number | string) => {
    if (await confirmToast(text.Do_you_want_to_delete_this_entry)) {
      try {
        await deleteDisableReason(id.toString());
        toast.success("Disable reason deleted successfully!");
        reset();
        setEditIndex(null);
      } catch (error: any) {
        toast.error(error.message || "Failed to delete disable reason.");
      }
    }
  };

  const handleDeleteMultiple = async (ids: (number | string)[]) => {
    if (await confirmToast(text.Delete_A)) {
      try {
        const stringIds = ids.map((id) => id.toString());
        await deleteMultipleDisableReasons(stringIds);
        toast.success(`${ids.length} disable reasons deleted successfully!`);
        reset();
        setEditIndex(null);
      } catch (error: any) {
        toast.error(error.message || "Failed to delete disable reasons.");
      }
    }
  };

  const handleCancel = () => {
    setEditIndex(null);
    reset();
  };

  const filteredData = disableReasons
    .filter((item: { reason: string }) =>
      item.reason.toLowerCase().includes(search.toLowerCase())
    )
    .map((item: { id: any; reason: any }) => ({
      id: item.id,
      reason: item.reason,
    }));

  const columns = [{ key: "reason", label: text.Disable_Reason }];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading disable reasons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 w-full">
      <div className="w-full lg:w-1/3 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-3 border-b pb-2">
          {editIndex !== null ? text.Edit_Disable_Reason : text.Add_Disable_Reason}
        </h2>
        <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)}>
          <TextField
            name="reason"
            label={text.Disable_Reason}
            control={control}
            placeholder="Enter disable reason"
            required={true}
          />
          <div className="flex gap-2 mt-4">
            <Button
              name={editIndex !== null ? text.Update : text.Save}
              loading={false}
              permissionScope="STUDENT"
              permissionType={editIndex !== null ? "UPDATE" : "CREATE"}
              enablePermissions={true}
              icon={<IconField name="FaSave" />}
            />
            {editIndex !== null && (
              <Button
                name={text.Cancel}
                loading={false}
                onClick={handleCancel}
                icon={<IconField name="FaTimes" />}
              />
            )}
          </div>
        </AllSchoolDropdown>
      </div>

      <div className="w-full lg:w-2/3">
        <ControlledTable
          title={text.Disable_Reason_List || "Disable Reason List"}
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

export default DisableReason;