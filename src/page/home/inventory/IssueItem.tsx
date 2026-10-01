import { useState, useEffect, useMemo } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import PastDateField from "../../../components/controlled/PastDateField";
import Dropdown from "../../../components/controlled/Dropdown";
import NumberField from "../../../components/controlled/NumberField";
import TextFields from "../../../components/controlled/TextField";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";

import {
  useFilterIssuesItems,
  useCreateIssuesItem,
  useUpdateIssuesItem,
  useDeleteIssuesItem,
  useDeleteMultipleIssuesItems,
} from "../../../hooks/queries/inventory/useIssuesItem";

import type { IssuesItemFormData } from "../../../types/inventory/IssuesItem";
import { useAddItemStocks } from "../../../hooks/queries/inventory/useAddItemStock";
import { useItemCategories } from "../../../hooks/queries/inventory/useItemCategory";
import { confirmToast } from "../../../helpers/confirmToast";
import { toast } from "react-toastify";
import AllSchoolDropdown from "../../../components/uncontrolled/AllSchoolDropdown";

const formatDateForInput = (date: string): string => {
  if (!date) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [dd, mm, yyyy] = date.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }
  return date;
};

export default function IssueItem() {
  const { t } = useTranslation();
  const Text = getPagesDataText(t);

  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: issuesResponse,
    isLoading,
    isFetching,
  } = useFilterIssuesItems(activeSearch, page, pageSize);

  const createMutation = useCreateIssuesItem();
  const updateMutation = useUpdateIssuesItem();
  const deleteMutation = useDeleteIssuesItem();
  const deleteMultipleMutation = useDeleteMultipleIssuesItems();

  const { data: itemStocks = [] } = useAddItemStocks();
  const { data: itemCategories = [] } = useItemCategories();

  const issuesItems = issuesResponse?.issuesItems ?? [];
  const totalItems = issuesResponse?.totalItems ?? 0;
  const totalPages = issuesResponse?.totalPages ?? 0;

  const { control, handleSubmit, reset, setValue, watch } =
    useForm<IssuesItemFormData>({
      defaultValues: {
        issueTo: "",
        issueDate: "",
        note: "",
        quantity: "",
        itemCategoryId: 0,
        addItemsId: 0,
      },
    });

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
  } = useForm<FieldValues>({
    defaultValues: {
      filterSearch: "",
    },
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const selectedCategoryId = watch("itemCategoryId");

  const allItems = useMemo(() => {
    const uniqueItems = new Map();
    itemStocks.forEach((stock) => {
      const itemId = stock.addItems?.addItemId;
      const itemName = stock.addItems?.item;
      const categoryId = stock.itemCategory?.itemCategoryId;
      if (itemId && !uniqueItems.has(itemId)) {
        uniqueItems.set(itemId, {
          addItemId: itemId,
          item: itemName,
          itemCategoryId: categoryId,
          itemCategory: stock.itemCategory,
        });
      }
    });
    return Array.from(uniqueItems.values());
  }, [itemStocks]);

  const filteredItems = useMemo(() => {
    if (!selectedCategoryId || selectedCategoryId === 0) return [];
    return allItems.filter(
      (item) => item.itemCategoryId === Number(selectedCategoryId),
    );
  }, [selectedCategoryId, allItems]);

  useEffect(() => {
    if (selectedCategoryId && selectedCategoryId !== 0) {
      const currentItemId = watch("addItemsId");
      if (currentItemId && currentItemId !== 0) {
        const isItemInCategory = filteredItems.some(
          (item) => item.addItemId === Number(currentItemId),
        );
        if (!isItemInCategory) setValue("addItemsId", 0);
      }
    }
  }, [selectedCategoryId, filteredItems, setValue, watch]);

  const handleApplyFilters = (data: FieldValues) => {
    setActiveSearch(data.filterSearch?.trim() ?? "");
    setPage(0);
  };

  const handleClearFilters = () => {
    resetFilter({ filterSearch: "" });
    setActiveSearch("");
    setPage(0);
  };

  const handlePageChange = (newPage: number) => setPage(newPage);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  const handleAddNew = () => {
    reset();
    setEditId(null);
    setShowFormModal(true);
  };

  const onSubmit = async (formData: IssuesItemFormData) => {
    if (!formData.itemCategoryId || formData.itemCategoryId === 0) {
      toast.error("Please select a category");
      return;
    }
    if (!formData.addItemsId || formData.addItemsId === 0) {
      toast.error("Please select an item");
      return;
    }
    const payload: IssuesItemFormData = {
      ...formData,
      itemCategoryId: Number(formData.itemCategoryId),
      addItemsId: Number(formData.addItemsId),
    };
    try {
      if (editId !== null) {
        await updateMutation.mutateAsync({ id: editId, data: payload });
        toast.success("Issue item updated successfully!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Issue item added successfully!");
      }
      reset();
      setEditId(null);
      setShowFormModal(false);
    } catch (error: any) {
      toast.error(error.message || "Operation failed. Please try again.");
    }
  };

  const handleEdit = (id: string | number) => {
    const item = issuesItems.find((d) => d.issuesItemId === Number(id));
    if (!item) return;
    setValue("itemCategoryId", item.itemCategory.itemCategoryId);
    setValue("issueTo", item.issueTo);
    setValue("issueDate", formatDateForInput(item.issueDate));
    setValue("note", item.note || "");
    setValue("quantity", item.quantity);
    setTimeout(() => {
      setValue("addItemsId", item.addItem.addItemId);
    }, 0);
    setEditId(item.issuesItemId);
    setShowFormModal(true);
  };

  const handleDelete = async (id: string | number) => {
    if (await confirmToast(Text.Do_you_want_to_delete_this_entry)) {
      try {
        await deleteMutation.mutateAsync(Number(id));
        toast.success("Issue item deleted successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete issue item.");
      }
    }
  };

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (await confirmToast("Do you want to delete selected entries?")) {
      try {
        await deleteMultipleMutation.mutateAsync(ids.map(Number));
        toast.success("Selected issue items deleted successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete issue items.");
      }
    }
  };

  const columns = [
    { label: Text.Item, key: "item" },
    { label: Text.Category, key: "category" },
    { label: Text.Issue_To, key: "issueTo" },
    { label: Text.Issue_Date, key: "issueDate" },
    { label: Text.Quantity, key: "quantity" },
    { label: Text.Note, key: "note" },
  ];

  const tableData = issuesItems.map((item) => ({
    id: item.issuesItemId,
    item: item.addItem.item,
    category: item.itemCategory.itemCategory,
    note: item.note || "",
    issueTo: item.issueTo,
    quantity: item.quantity,
    issueDate: item.issueDate,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading issue items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-auto w-full flex flex-col gap-4 p-4">
      {showFormModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="w-full max-w-lg bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              {editId ? Text.Edit : Text.Add} {Text.Item}
            </h2>
            <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)} queryKeys={['itemCategories', 'addItems', 'addItemStocks']} >
              <div className="grid grid-cols-2 gap-4">
                <Dropdown
                  name="itemCategoryId"
                  label={Text.Category}
                  required
                  control={control}
                  options={
                    itemCategories?.map((c) => ({
                      value: c.itemCategoryId,
                      label: c.itemCategory,
                    })) || []
                  }
                />
                <Dropdown
                  name="addItemsId"
                  label={Text.Item}
                  required
                  control={control}
                  options={
                    filteredItems?.map((i) => ({
                      value: i.addItemId,
                      label: i.item,
                    })) || []
                  }
                />
                <TextFields
                  name="issueTo"
                  label={Text.Issue_To}
                  required
                  placeholder={Text.Enter_Issue_To}
                  control={control}
                />
                <PastDateField
                  name="issueDate"
                  label={Text.Issue_Date}
                  required
                  control={control}
                />
                <NumberField
                  name="quantity"
                  label={Text.Quantity}
                  required
                  placeholder={Text.Enter_Quantity}
                  control={control}
                />
                <TextFields
                  name="note"
                  label={Text.Note}
                  control={control}
                  placeholder={Text.Enter_Note}
                />
              </div>
              <div className="flex gap-4">
                <Button
                  name={editId ? Text.Update : Text.Save}
                  icon={<IconField name="FaSave" />}
                  loading={createMutation.isPending || updateMutation.isPending}
                  permissionScope="INVENTORY"
                  permissionType={editId ? "UPDATE" : "CREATE"}
                  enablePermissions={true}
                />
                <Button
                  name={Text.Cancel}
                  icon={<IconField name="FaTimes" />}
                  onClick={() => setShowFormModal(false)}
                  loading={false}
                />
              </div>
            </AllSchoolDropdown>
          </div>
        </div>
      )}

      <div className="w-full bg-white shadow-md rounded p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {Text.Issue_Item_List}
          </h1>
        </div>

        <form onSubmit={handleFilterSubmit(handleApplyFilters)}>
          <section className="mb-4 max-w-sm">
            <TextFields
              label={Text.Search}
              name="filterSearch"
              placeholder={Text.Item_Name_Issue_To}
              control={filterControl}
            />
          </section>

          <div className="flex justify-end gap-2 mb-4">
            <Button
              onClick={handleClearFilters}
              name={Text.Cancel}
              loading={false}
              icon={<IconField name="FaTimes" size={16} />}
              showAlways={true}
            />
            <Button
              name={Text.Search}
              loading={isFetching && !isLoading}
              icon={<IconField name="FaSearch" size={16} />}
              showAlways={true}
            />
          </div>
        </form>

        <hr className="border-gray-300 mb-4" />

        <div className="relative">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500 animate-pulse">
                Updating…
              </span>
            </div>
          )}

          <ControlledTable
            title={Text.Issue_Item_List}
            columns={columns}
            data={tableData}
            fullData={tableData}
            showSearch={false}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeleteMultiple={handleDeleteMultiple}
            btn
            btnName={Text.Item}
            showForm={handleAddNew}
            enablePermissions={true}
            permissionScope="INVENTORY"
            showSelectAll
            serverPage={page}
            serverTotalPages={totalPages}
            serverTotalItems={totalItems}
            serverPageSize={pageSize}
            onServerPageChange={handlePageChange}
            onServerPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>
    </div>
  );
}
