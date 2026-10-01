import React, { useState } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import Dropdown from '../../../components/controlled/Dropdown';
import ControlledTable from '../../../components/uncontrolled/ControlledTable';
import Button from '../../../components/controlled/Button';
import { IconField } from '../../../components';
import { useTranslation } from 'react-i18next';
import { getPagesDataText } from '../../../helpers/useTranslations';
import {
  useFilterClassFees,
  useAddClassFee,
  useUpdateClassFee,
  useDeleteClassFee,
  useDeleteMultipleClassFees,
} from '../../../hooks/queries/feesCollection/useClassFees';
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses';
import { useFeeTypes } from '../../../hooks/queries/feesCollection/useFeeTypes';
import { AmountField } from '../../../components/controlled';
import { toast } from 'react-toastify';
import { confirmToast } from '../../../helpers/confirmToast';
import {
  type ClassFeesSearchParams,
  EMPTY_CLASS_FEES_SEARCH_PARAMS,
} from '../../../services/feesCollection/classFeesService';
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown';

const ClassFees: React.FC = () => {
  const { t } = useTranslation()
  const texts = getPagesDataText(t) as any
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const sortBy = 'classFeesId'
  const sortDirection = 'asc'
  const [activeFilters, setActiveFilters] = useState<ClassFeesSearchParams>(
    EMPTY_CLASS_FEES_SEARCH_PARAMS,
  )
  const [tableKey, setTableKey] = useState(0)

  const {
    data: classFeesResponse,
    isLoading,
    isError,
    error,
    isFetching,
  } = useFilterClassFees(activeFilters, page, pageSize, sortBy, sortDirection)

  const {
    data: schoolClasses = [],
    isLoading: isLoadingClasses,
    isError: isErrorClasses,
  } = useSchoolClasses()
  const {
    data: feeTypes = [],
    isLoading: isLoadingFeeTypes,
    isError: isErrorFeeTypes,
  } = useFeeTypes()

  const { mutateAsync: addClassFee, isPending: isAdding } = useAddClassFee()
  const { mutateAsync: updateClassFee, isPending: isUpdating } = useUpdateClassFee()
  const { mutateAsync: deleteClassFee } = useDeleteClassFee()
  const { mutateAsync: deleteMultipleClassFees } = useDeleteMultipleClassFees()

  const [editIndex, setEditIndex] = useState<number | null>(null)

  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: { schoolClassId: '', feesTypeId: '', fee: '' },
  })

  const {
    control: filterControl,
    getValues: getFilterValues,
    reset: resetFilter,
  } = useForm<FieldValues>({
    defaultValues: { filterClassId: '', filterFeeTypeId: '' },
  })

  const classFees = classFeesResponse?.classFees ?? []
  const totalItems = classFeesResponse?.totalItems ?? 0
  const totalPages = classFeesResponse?.totalPages ?? 0

  const handlePageChange = (newPage: number) => setPage(newPage)
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  const handleApplyFilters = () => {
    const { filterClassId, filterFeeTypeId } = getFilterValues()
    const params: ClassFeesSearchParams = {}
    if (filterClassId) params.schoolClassId = Number(filterClassId)
    if (filterFeeTypeId) params.feeTypeId = Number(filterFeeTypeId)
    setActiveFilters(params)
    setPage(0)
  }

  const handleClearFilters = () => {
    resetFilter({ filterClassId: '', filterFeeTypeId: '' })
    setActiveFilters(EMPTY_CLASS_FEES_SEARCH_PARAMS)
    setPage(0)
  }

  const hasActiveFilters = !!(activeFilters.schoolClassId || activeFilters.feeTypeId)

  const classOptions = React.useMemo(
    () =>
      Array.isArray(schoolClasses)
        ? schoolClasses.map((cls: any) => ({
            value: String(cls.schoolClassId || cls.id || ''),
            label: cls.className || cls.name || 'Unknown Class',
          }))
        : [],
    [schoolClasses],
  )

  const feeTypeOptions = React.useMemo(
    () =>
      Array.isArray(feeTypes)
        ? feeTypes.map((ft: any) => ({
            value: String(ft.feeTypeId || ft.id || ''),
            label: ft.name || ft.feeTypeName || 'Unknown Fee Type',
          }))
        : [],
    [feeTypes],
  )

  const onSubmit = async (data: FieldValues) => {
    try {
      if (!data.schoolClassId || !data.feesTypeId || !data.fee) {
        toast.error('Please fill in all required fields')
        return
      }

      const payload = {
        schoolClassId: parseInt(data.schoolClassId, 10),
        feesTypeId: parseInt(data.feesTypeId, 10),
        fee: parseFloat(data.fee),
      }

      if (isNaN(payload.schoolClassId) || isNaN(payload.feesTypeId) || isNaN(payload.fee)) {
        toast.error('Invalid input values. Please check your entries.')
        return
      }
      if (payload.fee <= 0) {
        toast.error('Fee amount must be greater than 0')
        return
      }

      if (editIndex !== null) {
        await updateClassFee({ id: editIndex, data: payload })
        setEditIndex(null)
        toast.success('Fee updated successfully')
      } else {
        await addClassFee(payload)
        toast.success('Fee added successfully')
      }
      reset()
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Operation failed.')
    }
  }

  const handleEdit = (id: string | number) => {
    const classFeeId = typeof id === 'string' ? parseInt(id, 10) : id
    const item = classFees.find((h: any) => h.classFeesId === classFeeId)
    if (!item) {
      toast.error('Item not found')
      return
    }
    setValue('schoolClassId', item.schoolClassId?.toString() || '')
    setValue('feesTypeId', item.feesTypeId?.toString() || '')
    setValue('fee', item.fee?.toString() || '')
    setEditIndex(classFeeId)
  }

  const handleDelete = async (id: number | string) => {
    if (!(await confirmToast('Are you sure you want to delete this entry?'))) return
    try {
      const classFeeId = typeof id === 'string' ? parseInt(id, 10) : id
      await deleteClassFee(classFeeId)
      if (editIndex === classFeeId) {
        reset()
        setEditIndex(null)
      }
      toast.success('Class fee deleted successfully')
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete.')
    }
  }

  const handleDeleteMultiple = async (ids: (number | string)[]) => {
    if (!(await confirmToast(`Are you sure you want to delete ${ids.length} selected entries?`)))
      return
    try {
      const numericIds = ids.map((id) => (typeof id === 'string' ? parseInt(id, 10) : id))
      await deleteMultipleClassFees(numericIds)
      if (editIndex !== null && numericIds.includes(editIndex)) {
        reset()
        setEditIndex(null)
      }
      toast.success('Class fees deleted successfully')
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete.')
    } finally {
      setTableKey((prev) => prev + 1)
    }
  }

  const handleCancel = () => {
    reset()
    setEditIndex(null)
  }

  const tableData = React.useMemo(
    () =>
      classFees.map((item: any) => ({
        id: item.classFeesId,
        class: item.className || 'N/A',
        feeType: item.feeTypeName || 'N/A',
        fee: item.fee || 0,
      })),
    [classFees],
  )

  const columns = [
    { key: 'class', label: texts.Class || 'Class' },
    { key: 'feeType', label: texts.Fees_Type || 'Fee Type' },
    { key: 'fee', label: texts.Fees || 'Fee Amount' },
  ]

  const isSubmitting = isAdding || isUpdating

  if (isLoading || isLoadingClasses || isLoadingFeeTypes) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (isError || isErrorClasses || isErrorFeeTypes) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Data</h2>
          <div className="text-gray-600 mb-4 space-y-2">
            {isError && (
              <div className="text-sm">
                Class Fees: {(error as any)?.message || 'Failed to load'}
              </div>
            )}
            {isErrorClasses && <div className="text-sm">Classes: Failed to load</div>}
            {isErrorFeeTypes && <div className="text-sm">Fee Types: Failed to load</div>}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        <div className="w-full lg:w-1/3 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">
            {editIndex !== null
              ? `${texts.Edit_Class_Fee }`
              : `${texts.Add_Class_Fee }`}
          </h2>

          <AllSchoolDropdown
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            queryKeys={['classFees', 'schoolClasses', 'feeTypes']}
          >
            <Dropdown
              name="schoolClassId"
              label={texts.Class || 'Class'}
              control={control}
              options={classOptions}
              required
            />
            <Dropdown
              name="feesTypeId"
              label={texts.Fees_Type || 'Fee Type'}
              control={control}
              options={feeTypeOptions}
              required
            />
            <AmountField
              name="fee"
              label={texts.Fees || 'Fee Amount'}
              control={control}
              placeholder="Enter fee amount"
              required
            />

            <div className="flex gap-2">
              <div className="flex-1" onClick={handleSubmit(onSubmit)}>
                <Button
                  name={editIndex !== null ? texts.Update || 'Update' : texts.Save || 'Save'}
                  loading={isSubmitting}
                  permissionScope="FEES"
                  permissionType={editIndex !== null ? 'UPDATE' : 'CREATE'}
                  enablePermissions={true}
                  icon={<IconField name="FaSave" />}
                />
              </div>
              {editIndex !== null && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  {texts.Cancel || 'Cancel'}
                </button>
              )}
            </div>
          </AllSchoolDropdown>
        </div>

        <div className="w-full lg:w-2/3 p-2 bg-white shadow-lg rounded overflow-auto">
          <div className="flex flex-wrap items-end gap-2 mb-3 px-1">
            <div className="flex-1 min-w-35">
              <Dropdown
                name="filterClassId"
                label={texts.Class || 'Class'}
                control={filterControl}
                options={classOptions}
                required={false}
              />
            </div>

            <div className="flex-1 min-w-35">
              <Dropdown
                name="filterFeeTypeId"
                label={texts.Fees_Type || 'Fee Type'}
                control={filterControl}
                options={feeTypeOptions}
                required={false}
              />
            </div>

            <div className="flex gap-2 pb-2">
              <Button
                name={texts.Search || 'Search'}
                loading={isFetching && !isLoading}
                onClick={handleApplyFilters}
                icon={<IconField name="FaSearch" />}
                showAlways={true}
              />
              {hasActiveFilters && (
                <Button
                  name={texts.Cancel }
                  loading={false}
                  onClick={handleClearFilters}
                  icon={<IconField name="FaTimes" />}
                  showAlways={true}
                />
              )}
            </div>
          </div>

          <div className="relative">
            {isFetching && !isLoading && (
              <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
                <span className="text-sm text-gray-500 animate-pulse">Updating…</span>
              </div>
            )}

            <ControlledTable
              key={tableKey}
              title={texts.Class_Fee_List }
              columns={columns}
              data={tableData}
              fullData={tableData}
              showSearch={false}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeleteMultiple={handleDeleteMultiple}
              showSelectAll
              enablePermissions={true}
              permissionScope="FEES"
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
    </div>
  )
}

export default ClassFees