import { useState } from 'react';
import { useForm } from 'react-hook-form';
import TextField from "../../../components/controlled/TextField";
import TextAreaField from "../../../components/controlled/TextareaField";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { useTranslation } from 'react-i18next';
import { getPagesDataText } from '../../../helpers/useTranslations';
import {
  useItemStores,
  useAddItemStore,
  useUpdateItemStore,
  useDeleteItemStore,
  useDeleteMultipleItemStores,
} from '../../../hooks/queries/inventory/useItemStore';
import type { ItemStoreFormData } from "../../../types/inventory/ItemStore";
import { toast } from 'react-toastify';
import { confirmToast } from '../../../helpers/confirmToast';
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown';

const ItemStorePage = () => {
  const { control, handleSubmit, reset, setValue } = useForm<ItemStoreFormData>({
    defaultValues: {
      itemStoreName: '',
      itemStoreCode: '',
      description: '',
    },
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>('');

  const { data: stores = [], isLoading } = useItemStores();
  const { mutateAsync: addStore } = useAddItemStore();
  const { mutateAsync: updateStore } = useUpdateItemStore();
  const { mutateAsync: deleteStore } = useDeleteItemStore();
  const { mutateAsync: deleteMultipleStores } = useDeleteMultipleItemStores();

  const { t } = useTranslation();
  const Text = getPagesDataText(t);

  const onSubmit = async (data: ItemStoreFormData) => {
    try {
      if (editId !== null) {
        await updateStore({ id: editId, data });
        toast.success('Item store updated successfully!');
        setEditId(null);
      } else {
        await addStore(data);
        toast.success('Item store added successfully!');
      }
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed. Please try again.');
    }
  };

  const handleEdit = (id: number | string) => {
    const numericId = Number(id);
    const store = stores.find((s) => s.itemStoreId === numericId);
    if (!store) return;

    setValue('itemStoreName', store.itemStoreName);
    setValue('itemStoreCode', store.itemStoreCode || '');
    setValue('description', store.description || '');
    setEditId(numericId);
  };

  const handleDelete = async (id: number | string) => {
    if (await confirmToast('Do you want to delete this item store?')) {
      try {
        await deleteStore(Number(id));
        toast.success('Item store deleted successfully!');
        if (editId === id) {
          reset();
          setEditId(null);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete item store.');
      }
    }
  };

  const handleDeleteMultiple = async (ids: (number | string)[]) => {
    if (await confirmToast('Do you want to delete selected item stores?')) {
      try {
        const numericIds = ids.map((id) => Number(id));
        await deleteMultipleStores(numericIds);
        toast.success('Selected item stores deleted successfully!');
        reset();
        setEditId(null);
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete item stores.');
      }
    }
  };

  const tableData = stores
    .filter((s) =>
      s.itemStoreName.toLowerCase().includes(search.toLowerCase())
    )
    .map((s) => ({
      id: s.itemStoreId,
      itemStoreName: s.itemStoreName || '',
      itemStoreCode: s.itemStoreCode || '',
      description: s.description || '',
    }));

  const tableColumns = [
    { key: 'itemStoreName', label: Text.Item_Store_Name },
    { key: 'itemStoreCode', label: Text.Item_Store_Code },
    { key: 'description', label: Text.Description },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{Text.Add_Item_Store || 'Loading stores...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 w-full">
      <div className="w-full lg:w-1/3 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-3 border-b pb-2">
          {editId !== null ? Text.Update : Text.Add_Item_Store}
        </h2>
        <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)}>
          <TextField
            name="itemStoreName"
            label={Text.Item_Store_Name}
            control={control}
            required
            placeholder={Text.Enter_Item_Store_Name}
          />
          <TextField
            name="itemStoreCode"
            label={Text.Item_Store_Code}
            control={control}
            required
            placeholder={Text.Enter_Item_Store_Code}
          />
          <TextAreaField
            name="description"
            label={Text.Description}
            control={control}
            placeholder={Text.Enter_Description}
            rows={2}
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
            {editId !== null && (
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
          title={Text.Item_Store_List}
          columns={tableColumns}
          data={tableData}
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

export default ItemStorePage;