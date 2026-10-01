import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import TextField from "../../../components/controlled/TextField";
import { Button } from "../../../components/controlled";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";
import {
  useRoomTypes,
  useAddRoomType,
  useUpdateRoomType,
  useDeleteRoomType,
  useDeleteMultipleRoomTypes,
} from "../../../hooks/queries/hostel/useRoomType";
import { confirmToast } from "../../../helpers/confirmToast";
import { toast } from "react-toastify";
import AllSchoolDropdown from "../../../components/uncontrolled/AllSchoolDropdown";


interface RoomTypeFormData {
  roomType: string;
  description: string;
}

const RoomTypeManager: React.FC = () => {
 
  const { control, handleSubmit, reset, setValue } = useForm<RoomTypeFormData>({
    defaultValues: {
      roomType: "",
      description: "",
    },
  });

  
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");


  const { data: roomTypes = [] } = useRoomTypes();
  const addRoomType = useAddRoomType();
  const updateRoomType = useUpdateRoomType();
  const deleteRoomType = useDeleteRoomType();
  const deleteMultipleRoomTypes = useDeleteMultipleRoomTypes();

  
  const resetForm = () => {
    reset({
      roomType: "",
      description: "",
    });
    setEditId(null);
  };

  const toNumber = (id: string | number) => Number(id);

  
  const onSubmit: SubmitHandler<RoomTypeFormData> = (data) => {
    if (editId) {
      updateRoomType.mutate(
        { id: editId, data },
        {
          onSuccess: () => {
            toast.success("Room Type updated");
            resetForm();
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message ?? "Update failed");
          },
        },
      );
    } else {
      addRoomType.mutate(data, {
        onSuccess: () => {
          toast.success("Room Type added");
          resetForm();
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message ?? "Room Type already exists",
          );
        },
      });
    }
  };

  
  const handleEdit = (id: string | number) => {
    const numericId = toNumber(id);
    const selected = roomTypes.find((item) => item.roomTypeId === numericId);
    if (!selected) return;

    setValue("roomType", selected.roomType);
    setValue("description", selected.description);
    setEditId(numericId);
  };

 
  const handleDelete = async (id: string | number) => {
    const numericId = toNumber(id);
    const confirm = await confirmToast(
      Text.Do_you_want_to_delete_this_entry,
    );

    if (confirm) {
      try {
        await deleteRoomType.mutateAsync(numericId);
        toast.success("Room Type deleted successfully!");
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to delete Room Type.",
        );
      }
    }
  };

 
  const handleMultipleDelete = async (ids: (string | number)[]) => {
    const numericIds = ids.map(toNumber);
    const confirm = await confirmToast(Text.Delete_A);

    if (confirm) {
      try {
        await deleteMultipleRoomTypes.mutateAsync(numericIds);
        toast.success("Selected Room Types deleted successfully!");
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to delete Room Types.",
        );
      }
    }
  };

 
  const filteredData = roomTypes.filter((item) =>
    item.roomType.toLowerCase().includes(searchTerm.toLowerCase()),
  );

 
  const tableData = filteredData.map((item) => ({
    ...item,
    id: item.roomTypeId, 
  }));

  const { t } = useTranslation();
  const Text = getPagesDataText(t);
  

 
  const columns = [
    { key: "roomType", label: Text.Room_Type },
    { key: "description", label: Text.Description },
  ];

  
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-2 w-full">
     
      <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-2xl p-5">
        <h1 className="text-xl font-bold mb-4">
          {editId
            ? Text.Edit_Room_Type
            : Text.Add_Room_Type}
        </h1>

        <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)}>
          <TextField
            name="roomType"
            label={Text.Room_Type}
            control={control}
            placeholder={Text.Room_Type}
            required
          />

          <TextField
            name="description"
            label={Text.Description}
            control={control}
            placeholder={Text.Enter_Description}
          />

          <div className="flex gap-4">
            <Button
              name={editId ? Text.Update : Text.Save}
              loading={addRoomType.isPending || updateRoomType.isPending}
              icon={<IconField name="FaSave" />}
              permissionScope="HOSTEL"
              permissionType={editId ? "UPDATE" : "CREATE"}
              enablePermissions={true}
            />

            {editId && (
              <Button
                name={Text.Cancel}
                loading={false}
                onClick={resetForm}
              />
            )}
          </div>
        </AllSchoolDropdown>
      </div>

     
      <div className="w-full lg:w-2/3 bg-white p-4 rounded-2xl shadow-xl">
        <ControlledTable
          title={Text.Room_Type_List}
          columns={columns}
          data={tableData}
          searchTerm={searchTerm}
          onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleMultipleDelete}
          enablePermissions={true}
          permissionScope="HOSTEL"
        />
      </div>
    </div>
  );
};

export default RoomTypeManager;