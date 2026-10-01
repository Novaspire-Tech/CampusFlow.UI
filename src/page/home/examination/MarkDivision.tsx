import React, { useState, type ChangeEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import PercentageInput from '../../../components/controlled/PercentageField';
import TextField from '../../../components/controlled/TextField';
import ControlledTable from '../../../components/uncontrolled/ControlledTable';
import Button from '../../../components/controlled/Button';
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";
import {
  useMarkDivisions,
  useCreateMarkDivision,
  useUpdateMarkDivision,
  useDeleteMarkDivision,
  useDeleteMultipleMarkDivisions,
} from '../../../hooks/queries/examination/useMarkDivision';
import type { MarkDivisionFormData } from '../../../types/examination/MarkDivision';
import { toast } from 'react-toastify';
import { confirmToast } from '../../../helpers/confirmToast';

interface FormValues {
  divisionName: string;
  percentFrom: string;
  percentUpTo: string;
}

const MarkDivision: React.FC = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { t } = useTranslation();
  const Texts = getPagesDataText(t);

  const { data ,isLoading} = useMarkDivisions();
  const createMutation = useCreateMarkDivision();
  const updateMutation = useUpdateMarkDivision();
  const deleteMutation = useDeleteMarkDivision();
  const deleteMultipleMutation = useDeleteMultipleMarkDivisions();

  const { control, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: {
      divisionName: '',
      percentFrom: '',
      percentUpTo: '',
    },
  });

  const markDivisions = data?.markDivisions || [];

  const onSubmit: SubmitHandler<FormValues> = async (formData) => {
    try {
      const payload: MarkDivisionFormData = {
        divisionName: formData.divisionName,
        percentFrom: parseFloat(formData.percentFrom).toFixed(2),
        percentUpTo: parseFloat(formData.percentUpTo).toFixed(2),
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        setEditingId(null);
      } else {
        await createMutation.mutateAsync(payload);
      }

      reset();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleEdit = (id: string | number) => {
    const stringId = typeof id === 'number' ? id.toString() : id;
    const item = markDivisions.find((d) => d.id === stringId);
    if (!item) return;

    setValue('divisionName', item.divisionName);
    setValue('percentFrom', item.percentFrom);
    setValue('percentUpTo', item.percentUpTo);
    setEditingId(stringId);
  };

  const handleDelete = async (id: string | number) => {
    const stringId = typeof id === 'number' ? id.toString() : id;
    if (!await confirmToast(Texts.Do_you_want_to_delete_this_entry)) return;

    try {
      await deleteMutation.mutateAsync(stringId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete mark division');
    }
  };

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (!ids.length) return;
    if (!await confirmToast(Texts.Delete_A)) return;

    try {
      const stringIds = ids.map(id =>
        typeof id === 'number' ? id.toString() : id
      );
      await deleteMultipleMutation.mutateAsync(stringIds);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete mark divisions');
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = markDivisions.filter((d) =>
    d.divisionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { label: Texts.Division_Name, key: 'divisionName' },
    { label: Texts.Percent_From, key: 'percentFrom' },
    { label: Texts.Percent_Upto, key: 'percentUpTo' },
  ];

  const isSaving = createMutation.isPending || updateMutation.isPending;
 if (isLoading ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Marks Division data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col lg:flex-row gap-4 px-4 py-4 w-full h-full">
      <div className="w-full lg:w-1/3 p-4 bg-white rounded-2xl shadow-md">
        <h1 className="mb-4 text-black text-xl font-medium capitalize">
          {Texts.Add_Mark_Division}
        </h1>

        <div className="w-full h-0.5 bg-neutral-300 mb-4"></div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextField
            name="divisionName"
            label={Texts.Division_Name}
            control={control}
            required
            placeholder="Enter Division Name"
          />

          <PercentageInput
            name="percentFrom"
            control={control}
            required
            label={Texts.Percent_From}
            placeholder="Enter Percent From"
          />

          <PercentageInput
            name="percentUpTo"
            control={control}
            required
            label={Texts.Percent_Upto}
            placeholder="Enter Percent Upto"
          />

          <div className="flex items-center justify-end">
            <Button
              name={editingId ? Texts.Update : Texts.Save}
              loading={isSaving}
              isDisable={isSaving}
              permissionScope="EXAMINATION"  permissionType={editingId ? "UPDATE" : "CREATE"}  enablePermissions={true}
              icon={<IconField name="FaSave" />}
            />
          </div>
        </form>
      </div>

      <div className="w-full lg:w-2/3 p-4 bg-white rounded-2xl shadow-md">
        <ControlledTable
          title={Texts.Division_List}
          columns={columns}
          data={filteredData}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteMultiple}
          enablePermissions={true}
           permissionScope="EXAMINATION"
        />
      </div>
    </div>
  );
};

export default MarkDivision;
