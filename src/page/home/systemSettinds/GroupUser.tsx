import { useState } from "react";
import Button from "../../../components/controlled/Button";
import IconField from "../../../components/controlled/IconField";
import TextField from "../../../components/controlled/TextField";
import { ControlledTable } from "../../../components/uncontrolled";
import AllSchoolDropdown from "../../../components/uncontrolled/AllSchoolDropdown";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Dropdown } from "../../../components/controlled";
import {
  useAddSchoolGroup,
  useDeleteSchoolGroup,
  useGroup,
  useUpdateSchoolGroup,
} from "../../../hooks/queries/systemSettinds/useSchoolGroup";
import { useGroupRoles } from "../../../hooks/queries/systemSettinds/useGroupRole"; 
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";

export interface GroupUserFormData {
  GroupUserId: number;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleId: number;
}

const SCHOOL_GROUP_CODE = localStorage.getItem("schoolGroupCode") || "";

export const GroupUser = () => {
  const [editId, setEditId] = useState<number | null>(null);

  const { data: groupUsers = [] } = useGroup(SCHOOL_GROUP_CODE);
  const addSchoolGroup = useAddSchoolGroup(SCHOOL_GROUP_CODE);
  const updateSchoolGroup = useUpdateSchoolGroup(SCHOOL_GROUP_CODE);
  const deleteSchoolGroup = useDeleteSchoolGroup(SCHOOL_GROUP_CODE);

  const { data: groupRoles = [], isLoading: rolesLoading } = useGroupRoles();

  const roleOptions = groupRoles.map((role) => ({
    label: role.name,
    value: Number(role.roleId),
  }));

  const { control, handleSubmit, reset, setValue } = useForm<GroupUserFormData>({
    defaultValues: {
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      roleId: 0,
    },
  });

  const { t } = useTranslation()
  const texts = getPagesDataText(t)

  const resetForm = () => {
    reset();
    setEditId(null);
  };

  const onSubmit: SubmitHandler<GroupUserFormData> = (data) => {
    if (editId) {
      updateSchoolGroup.mutate(
        { id: editId, data },
        {
          onSuccess: () => {
            toast.success("School Group User updated");
            resetForm();
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message ?? "Update failed");
          },
        }
      );
    } else {
      addSchoolGroup.mutate(data, {
        onSuccess: () => {
          toast.success("School Group User added");
          resetForm();
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message ?? "Failed to add school group user"
          );
        },
      });
    }
  };

  const handleEdit = (id: string | number) => {
    const numericId = Number(id);
    const selected = groupUsers.find((item) => item.GroupUserId === numericId);
    if (!selected) return;

    setValue("phoneNumber", selected.phoneNumber);
    setValue("email", selected.email);
    setValue("roleId", selected.roleId);
    setValue("password", "");
    setValue("confirmPassword", "");
    setEditId(numericId);
  };

  const handleDelete = (id: string | number) => {
    const numericId = Number(id);
    deleteSchoolGroup.mutate(numericId, {
      onSuccess: () => toast.success("User deleted successfully"),
      onError: (err: any) =>
        toast.error(err?.response?.data?.message ?? "Delete failed"),
    });
  };

  const columns = [
    { key: "phoneNumber", label: texts.Mobile_Number },
    { key: "email", label: texts.Email },
    { key: "roleName", label: texts.Role },
  ];

  const tableData = groupUsers.map((item) => ({
    ...item,
    id: item.GroupUserId,
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-2 w-full">

      {/* Form Panel */}
      <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-2xl p-5">
        <h1 className="text-xl font-bold mb-4">
          {editId ? texts.Edit_Group_User : texts.Add_Group_User}
        </h1>

        <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)}>
          <Dropdown
            label={texts.Role}
            name="roleId"
            control={control}
            options={roleOptions}
            required
            disabled={rolesLoading}
          />

          <TextField
            name="phoneNumber"
            label={texts.Mobile_Number}
            control={control}
            placeholder={texts.Mobile_Number}
            required
          />

          <TextField
            name="email"
            label={texts.Email}
            control={control}
            placeholder={texts.Email}
            required
          />

          {!editId && (
            <TextField
              name="password"
              label={texts.Password}
              control={control}
              placeholder={texts.Password}
              required
            />
          )}

          {!editId && (
            <TextField
              name="confirmPassword"
              label={texts.Confirm_Password}
              control={control}
              placeholder={texts.Confirm_Password}
              required
            />
          )}

          <div className="flex gap-4">
            <Button
              name={editId ? texts.Update : texts.Save}
              loading={addSchoolGroup.isPending || updateSchoolGroup.isPending}
              icon={<IconField name="FaSave" />}
              permissionScope="SETTINGS"
              permissionType={editId ? "UPDATE" : "CREATE"}
              enablePermissions={true}
            />

            {editId && (
              <Button
                name={texts.Cancel}
                loading={false}
                onClick={resetForm}
              />
            )}
          </div>
        </AllSchoolDropdown>
      </div>

      {/* Table Panel */}
      <div className="w-full lg:w-2/3 bg-white p-4 rounded-2xl shadow-xl">
        <ControlledTable
          title={texts.Group_Users}
          columns={columns}
          data={tableData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          enablePermissions={true}
          permissionScope="SETTINGS"
        />
      </div>
    </div>
  );
};