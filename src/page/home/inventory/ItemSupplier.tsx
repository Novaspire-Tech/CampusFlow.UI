import { useState } from "react";
import { useForm } from "react-hook-form";
import TextField from "../../../components/controlled/TextField";
import TextAreaField from "../../../components/controlled/TextareaField";
import MobileField from "../../../components/controlled/MobileField";
import EmailField from "../../../components/controlled/EmailField";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";
import {
  useItemSuppliers,
  useAddItemSupplier,
  useUpdateItemSupplier,
  useDeleteItemSupplier,
  useDeleteMultipleItemSuppliers,
} from "../../../hooks/queries/inventory/useItemSupplier";
import type { ItemSupplierFormData } from "../../../types/inventory/ItemSupplier";
import { toast } from "react-toastify";
import { confirmToast } from "../../../helpers/confirmToast";
import AllSchoolDropdown from "../../../components/uncontrolled/AllSchoolDropdown";

const ItemSupplierPage = () => {
  const [search, setSearch] = useState<string>("");
  const [editId, setEditId] = useState<number | null>(null);

  const { data: suppliers = [], isLoading } = useItemSuppliers();
  const { mutateAsync: addSupplier } = useAddItemSupplier();
  const { mutateAsync: updateSupplier } = useUpdateItemSupplier();
  const { mutateAsync: deleteSupplier } = useDeleteItemSupplier();
  const { mutateAsync: deleteMultipleSuppliers } = useDeleteMultipleItemSuppliers();

  const { control, handleSubmit, reset, setValue } = useForm<ItemSupplierFormData>({
    defaultValues: {
      name: "",
      phoneNumber: "",
      email: "",
      address: "",
      description: "",
    },
  });

  const { t } = useTranslation();
  const Text = getPagesDataText(t);

  const onSubmit = async (data: ItemSupplierFormData) => {
    try {
      if (editId !== null) {
        const supplierToUpdate = suppliers.find((s) => s.itemSupplierId === editId);
        if (supplierToUpdate) {
          await updateSupplier({
            id: editId.toString(),
            data: { ...supplierToUpdate, ...data, supplierName: supplierToUpdate.supplierName },
          });
          toast.success("Supplier updated successfully!");
        }
        setEditId(null);
      } else {
        await addSupplier(data);
        toast.success("Supplier added successfully!");
      }
      reset();
    } catch (error: any) {
      toast.error(error.message || "Operation failed. Please try again.");
    }
  };

  const handleEdit = (id: number | string) => {
    const numericId = Number(id);
    const item = suppliers.find((s) => s.itemSupplierId === numericId);
    if (!item) return;
    Object.entries(item).forEach(([key, value]) => {
      if (key !== "itemSupplierId") setValue(key as keyof ItemSupplierFormData, value);
    });
    setEditId(numericId);
  };

  const handleDelete = async (id: number | string) => {
    if (await confirmToast("Do you want to delete this supplier?")) {
      try {
        await deleteSupplier(id.toString());
        toast.success("Supplier deleted successfully!");
        reset();
        setEditId(null);
      } catch (error: any) {
        toast.error(error.message || "Failed to delete supplier.");
      }
    }
  };

  const handleDeleteMultiple = async (ids: (number | string)[]) => {
    if (await confirmToast("Do you want to delete selected suppliers?")) {
      try {
        const stringIds = ids.map((id) => id.toString());
        await deleteMultipleSuppliers(stringIds);
        toast.success("Selected suppliers deleted successfully!");
        reset();
        setEditId(null);
      } catch (error: any) {
        toast.error(error.message || "Failed to delete suppliers.");
      }
    }
  };

  const filteredData = suppliers
    .filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description || "").toLowerCase().includes(search.toLowerCase())
    )
    .map((s) => ({
      id: s.itemSupplierId,
      name: s.name,
      phoneNumber: s.phoneNumber,
      email: s.email,
      address: s.address,
      description: s.description || "",
    }));

  const columns = [
    { key: "name", label: Text.Add_Item_Supplier },
    { key: "phoneNumber", label: Text.Supplier_Phone },
    { key: "email", label: Text.Supplier_Email },
    { key: "address", label: Text.Address },
    { key: "description", label: Text.Description },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{Text.Loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 w-full">
      <div className="w-full lg:w-1/3 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-3 border-b pb-2">
          {editId !== null ? Text.Update : Text.Add_Item_Supplier}
        </h2>
        <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)}>
          <TextField
            name="name"
            label={Text.Supplier_Name}
            control={control}
            required
            disabled={editId !== null}
            placeholder={Text.Enter_Supplier_Name}
          />
          <MobileField
            name="phoneNumber"
            label={Text.Phone}
            control={control}
            placeholder={Text.Enter_Phone}
          />
          <EmailField
            name="email"
            label={Text.Email}
            control={control}
            placeholder={Text.Enter_Email}
          />
          <TextAreaField
            name="address"
            label={Text.Address}
            control={control}
            rows={2}
            placeholder={Text.Address}
          />
          <TextAreaField
            name="description"
            label={Text.Description}
            control={control}
            rows={2}
            placeholder={Text.Enter_Description}
          />

          <div className="flex gap-4">
            <Button
              name={editId !== null ? Text.Update : Text.Save}
              icon={<IconField name="FaSave" />}
              onClick={handleSubmit(onSubmit)}
              loading={false}
              permissionScope="INVENTORY"
              permissionType={editId ? "UPDATE" : "CREATE"}
              enablePermissions={true}
            />
            {editId && (
              <Button
                name={Text.Cancel}
                icon={<IconField name="FaTimes" />}
                onClick={() => {
                  reset();
                  setEditId(null);
                }}
                loading={false}
              />
            )}
          </div>
        </AllSchoolDropdown>
      </div>

      <div className="w-full lg:w-2/3">
        <ControlledTable
          title={Text.Item_Supplier_List}
          columns={columns}
          data={filteredData}
          searchTerm={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteMultiple}
          showSelectAll={true}
          enablePermissions={true}
          permissionScope="INVENTORY"
        />
      </div>
    </div>
  );
};

export default ItemSupplierPage;