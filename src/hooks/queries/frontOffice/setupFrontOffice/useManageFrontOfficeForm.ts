import { useForm, type SubmitHandler, type FieldValues } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";

export function useManageFrontOfficeForm<T extends { id: string }>(
  data: T[] | undefined,
  isLoading: boolean,
  searchKey: keyof T,
  defaultValues: FieldValues,
  formKeyMap: { [key: string]: keyof T },
  addMutation: any,
  updateMutation: any,
  deleteMutation: any,
  deleteMultipleMutation: any
) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues,
  });

  const onSubmit: SubmitHandler<FieldValues> = async (formData) => {
    const payload = Object.keys(formKeyMap).reduce((acc, key) => {
      (acc as any)[formKeyMap[key]] = formData[key];
      return acc;
    }, {} as Partial<T>);

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast.success("Updated successfully");
      } else {
        await addMutation.mutateAsync(payload);
        toast.success("Added successfully");
      }
      setEditingId(null);
      reset();
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    }
  };

  const handleEdit = (id: string | number) => {
    const item = data?.find(d => d.id === id.toString());
    if (!item) return;

    setEditingId(id.toString());
    Object.keys(formKeyMap).forEach(key => {
      setValue(key, item[formKeyMap[key]]);
    });
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteMutation.mutateAsync(id.toString());
    toast.success("Deleted successfully");
  };

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (!window.confirm(`Delete ${ids.length} records?`)) return;
    await deleteMultipleMutation.mutateAsync(ids.map(String));
    toast.success("Deleted successfully");
  };

  const filteredData = (data || []).filter(item =>
    String(item[searchKey]).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    control,
    handleSubmit,
    onSubmit,
    reset,
    editingId,
    setEditingId,
    handleEdit,
    handleDelete,
    handleDeleteMultiple,
    searchTerm,
    setSearchTerm,
    filteredData,
    isLoading,
  };
}
