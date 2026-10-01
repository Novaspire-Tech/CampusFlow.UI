import React, { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import TextField from '../../../components/controlled/TextField'
import { Button } from '../../../components/controlled'
import NumberField from '../../../components/controlled/NumberField'
import NameField from '../../../components/controlled/NameField'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'

import {
  useHostels,
  useAddHostel,
  useUpdateHostel,
  useDeleteHostel,
  useDeleteMultipleHostels,
} from '../../../hooks/queries/hostel/useHostel'

import type { HostelFormData } from '../../../types/hostel/Hostel'
import { confirmToast } from '../../../helpers/confirmToast'
import { toast } from 'react-toastify'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

const HostelPage = () => {
  const { control, handleSubmit, reset, setValue } = useForm<HostelFormData>({
    defaultValues: {
      hostelName: '',
      hostelType: '',
      address: '',
      intake: '',
      description: '',
    },
  })

  const [editId, setEditId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: hostels = [] } = useHostels()
  const addHostel = useAddHostel()
  const updateHostel = useUpdateHostel()
  const deleteHostel = useDeleteHostel()
  const deleteMultipleHostels = useDeleteMultipleHostels()

  const resetForm = () => {
    reset({
      hostelName: '',
      hostelType: '',
      address: '',
      intake: '',
      description: '',
    })
    setEditId(null)
  }

  const toNumber = (id: string | number) => Number(id)

  const onSubmit: SubmitHandler<HostelFormData> = (data) => {
    if (editId) {
      updateHostel.mutate(
        { id: editId, data },
        {
          onSuccess: () => {
            toast.success('Hostel updated')
            resetForm()
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message ?? 'Update failed')
          },
        },
      )
    } else {
      addHostel.mutate(data, {
        onSuccess: () => {
          toast.success('Hostel added')
          resetForm()
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message ?? 'Hostel already exists')
        },
      })
    }
  }

  const handleUpdate = (id: string | number) => {
    const numericId = toNumber(id)
    const hostel = hostels.find((h) => h.hostelId === numericId)
    if (!hostel) return

    setValue('hostelName', hostel.hostelName)
    setValue('hostelType', hostel.hostelType)
    setValue('address', hostel.address)
    setValue('intake', hostel.intake)
    setValue('description', hostel.description)
    setEditId(numericId)
  }

  const handleDelete = async (id: string | number) => {
    const numericId = toNumber(id)
    const confirm = await confirmToast(
      Text.Do_you_want_to_delete_this_entry,
    )

    if (confirm) {
      try {
        await deleteHostel.mutateAsync(numericId)
        toast.success('Hostel deleted successfully!')
      } catch (error: any) {
        // error.message carries the real backend message from throwIfFailed()
        toast.error(error?.message || 'Failed to delete hostel.')
      }
    }
  }

  const handleMultipleDelete = async (ids: (string | number)[]) => {
    const numericIds = ids.map(toNumber)
    const confirm = await confirmToast(Text.Delete_A)

    if (confirm) {
      try {
        await deleteMultipleHostels.mutateAsync(numericIds)
        toast.success('Selected hostels deleted successfully!')
      } catch (error: any) {
      
        toast.error(error?.message || 'Failed to delete hostels.')
      }
    }
  }

  const filteredData = hostels.filter(
    (item) =>
      item.hostelType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hostelName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const tableData = filteredData.map((item) => ({
    ...item,
    id: item.hostelId,
  }))

  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  

  const columns = [
    { key: 'hostelType', label: Text.Type },
    { key: 'address', label: Text.Address },
    { key: 'hostelName', label: Text.Hostel_Name },
    { key: 'intake', label: Text.Intake },
  ]

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-2 w-full">
      <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-2xl p-5">
        <h1 className="text-xl font-bold mb-4">
          {editId ? Text.Update_Hostel : Text.Add_Hostel}
        </h1>

        <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)} >
          <NameField
            name="hostelName"
            required
            label={Text.Hostel_Name}
            control={control}
            placeholder={Text.Enter_Hostel_Name}
          />

          <TextField
            name="hostelType"
            label={Text.Type}
            control={control}
            required
            placeholder={Text.Enter_Hostel_Type}
          />

          <NumberField
            name="intake"
            label={Text.Intake}
            control={control}
            placeholder={Text.Enter_Intake}
          />

          <TextField
            name="address"
            label={Text.Address}
            control={control}
            placeholder={Text.Address}
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
              loading={addHostel.isPending || updateHostel.isPending}
              icon={<IconField name="FaSave" />}
              permissionScope="HOSTEL"
              permissionType={editId ? 'UPDATE' : 'CREATE'}
              enablePermissions={true}
            />

            {editId && <Button name={Text.Cancel} loading={false} onClick={resetForm} />}
          </div>
        </AllSchoolDropdown>
      </div>

      <div className="w-full lg:w-2/3 bg-white p-4 rounded-2xl shadow-xl">
        <ControlledTable
          title={Text.Hostel_List}
          columns={columns}
          data={tableData}
          searchTerm={searchTerm}
          onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          onEdit={handleUpdate}
          onDelete={handleDelete}
          onDeleteMultiple={handleMultipleDelete}
          enablePermissions={true}
          permissionScope="HOSTEL"
        />
      </div>
    </div>
  )
}

export default HostelPage