import React, { useState, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation } from 'react-router-dom'
import {
  useStudentTransportFees,
  useFilteredStudentTransportFees,
} from '../../../../hooks/queries/transport/useStudentTransportFees'
import { useRoutes } from '../../../../hooks/queries/transport/useRoutes'
import { useRoutePickupPoints } from '../../../../hooks/queries/transport/useRoutePickupPoints'
import ControlledTable from '../../../../components/uncontrolled/ControlledTable'
import { Dropdown, TextField } from '../../../../components/controlled'
import Button from '../../../../components/controlled/Button'
import { IconField } from '../../../../components'
import type {
  StudentTransportFees,
  StudentTransportFeesFilterCriteria,
} from '../../../../types/transport/studentTransportFees'
import { useSchoolClasses } from '../../../../hooks/queries/academics/useClasses'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../../helpers/useTranslations'

interface SearchFormInputs {
  routeId: string
  pickUpPointId: string
  classId: string
  search: string
}

type Status = 'Paid' | 'Partial' | 'Unpaid'

const getStatus = (paid: number, total: number): Status => {
  if (paid >= total && total > 0) return 'Paid'
  if (paid > 0) return 'Partial'
  return 'Unpaid'
}

const fmt = (n: number) => '₹' + Math.round(n ?? 0).toLocaleString('en-IN')

const EMPTY_FILTER: StudentTransportFeesFilterCriteria = {
  studentId: undefined,
  routeId: undefined,
  pickUpPointId: undefined,
  classId: undefined,
  search: undefined,
}

const StudentTransportDetailsPage: React.FC = () => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)

 
  const columns = useMemo(() => [
    { key: 'studentName',     label: Text.Student_Name },
    { key: 'admissionNo',     label: Text.Admission_No },
    { key: 'studentClass',    label: Text.Class },
    { key: 'section',         label: Text.Section },
    { key: 'routeName',       label: Text.Route },
    { key: 'pickUpPointName', label: Text.Pickup_Point },
    { key: 'totalMonths',     label: Text.Month },
    { key: 'startDate',       label: Text.Start_Date },
    { key: 'totalFees',       label: Text.Total_Fees },
    { key: 'paidFees',        label: Text.Paid },
    { key: 'balance',         label: Text.Balance },
    { key: 'status',          label: Text.Status },
  ], [Text])

  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  const routeIdParam = searchParams.get('routeId') || ''
  const pickUpPointIdParam = searchParams.get('pickUpPointId') || ''
  const hasUrlParams = !!(routeIdParam || pickUpPointIdParam)

  const { data: classesData } = useSchoolClasses()
  const { data: routesData = [] } = useRoutes()
  const { data: routePickupPointsResponse } = useRoutePickupPoints(0, 1000)
  const routePickupPoints = routePickupPointsResponse?.routePickupPoints || []

  const routeLabel = useMemo(() => {
    if (!routeIdParam || !(routesData as any[]).length) return routeIdParam
    const found = (routesData as any[]).find(
      (r) => String(r.routeId || r.id) === routeIdParam,
    )
    return found?.routeTitle || found?.name || routeIdParam
  }, [routeIdParam, routesData])

  const pickupLabel = useMemo(() => {
    if (!pickUpPointIdParam || !routePickupPoints.length) return pickUpPointIdParam
    const found = routePickupPoints.find(
      (rpp: any) => String(rpp.pickupPointId) === pickUpPointIdParam,
    )
    return found?.pickUpPoint || pickUpPointIdParam
  }, [pickUpPointIdParam, routePickupPoints])

  const { control, handleSubmit, reset, watch, setValue } = useForm<SearchFormInputs>({
    defaultValues: {
      routeId: routeIdParam,
      pickUpPointId: pickUpPointIdParam,
      classId: '',
      search: '',
    },
  })

  const watchedRouteId = watch('routeId')

  useEffect(() => {
    setValue('pickUpPointId', '')
  }, [watchedRouteId, setValue])

  useEffect(() => {
    if (routeIdParam) setValue('routeId', routeIdParam)
  }, [routeIdParam, setValue])

  useEffect(() => {
    if (pickUpPointIdParam) setValue('pickUpPointId', pickUpPointIdParam)
  }, [pickUpPointIdParam, setValue])

  const classOptions = useMemo(
    () =>
      classesData?.map((c: any) => ({
        label: c.name || c.className,
        value: String(c.id || c.schoolClassId),
      })) || [],
    [classesData],
  )

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sortCol] = useState('studentTransportFeesId')
  const [sortDir] = useState<'asc' | 'desc'>('asc')

  const [activeFilter, setActiveFilter] = useState<StudentTransportFeesFilterCriteria | null>(
    hasUrlParams
      ? {
          ...EMPTY_FILTER,
          routeId: routeIdParam ? Number(routeIdParam) : undefined,
          pickUpPointId: pickUpPointIdParam ? Number(pickUpPointIdParam) : undefined,
        }
      : null,
  )

  const [hasSearched, setHasSearched] = useState(hasUrlParams)

  const isFiltered = activeFilter !== null

  const allQuery = useStudentTransportFees(page, pageSize, sortCol, sortDir, !isFiltered)
  const filteredQuery = useFilteredStudentTransportFees(
    activeFilter ?? EMPTY_FILTER,
    page,
    pageSize,
    sortCol,
    sortDir,
    isFiltered,
  )

  const activeQuery = isFiltered ? filteredQuery : allQuery
  const records: StudentTransportFees[] = activeQuery.data?.data ?? []
  const totalItems: number = activeQuery.data?.totalItems ?? 0
  const totalPages: number = activeQuery.data?.totalPages ?? 1
  const isLoading = activeQuery.isLoading || activeQuery.isFetching

  const routeOptions = useMemo(
    () =>
      (routesData as any[]).map((r: any) => ({
        label: r.routeTitle || r.name || 'Unknown Route',
        value: String(r.routeId || r.id),
      })),
    [routesData],
  )

  const pickupOptions = useMemo(() => {
    if (!watchedRouteId) return []
    return routePickupPoints
      .filter((rpp: any) => String(rpp.routeId) === String(watchedRouteId))
      .map((rpp: any) => ({
        label: rpp.pickUpPoint || rpp.pickupPointName || `Point ${rpp.pickupPointId}`,
        value: String(rpp.pickupPointId),
      }))
  }, [watchedRouteId, routePickupPoints])

  const displayedRecords = useMemo(
    () =>
      records.map((r) => {
        const paid = r.paidFees ?? 0
        const total = r.totalFees ?? 0
        return {
          ...r,
          id: r.studentTransportFeesId,
          studentName: `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim(),
          balance: fmt(total - paid),
          status: getStatus(paid, total),
          totalFees: fmt(total),
          paidFees: fmt(paid),
        }
      }),
    [records],
  )

  const onSearch = (data: SearchFormInputs) => {
    const criteria: StudentTransportFeesFilterCriteria = {
      ...EMPTY_FILTER,
      routeId: data.routeId ? Number(data.routeId) : undefined,
      pickUpPointId: data.pickUpPointId ? Number(data.pickUpPointId) : undefined,
      classId: data.classId ? Number(data.classId) : undefined,
      search: data.search?.trim() || undefined,
    }

    const hasAnyFilter = !!(
      criteria.routeId ||
      criteria.pickUpPointId ||
      criteria.classId ||
      criteria.search
    )

    setActiveFilter(hasAnyFilter ? criteria : null)
    setHasSearched(true)
    setPage(0)
  }

  const handleClear = () => {
    reset({ routeId: '', pickUpPointId: '', classId: '', search: '' })
    setActiveFilter(null)
    setHasSearched(false)
    setPage(0)
  }

  return (
    <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4">

      {hasUrlParams && (
        <div className="mb-4 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-md transition-all duration-200 hover:scale-105"
          >
            <i className="bx bx-arrow-back text-xl text-gray-700" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {routeLabel || Text.All_Routes}
              {pickupLabel ? ` — ${pickupLabel}` : ''}
            </h2>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSearch)}
        className="rounded-lg bg-white mb-4 shadow-sm border border-gray-100"
      >
        <div className="p-4 bg-gray-50 border-b rounded-t-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{Text.Student_Transport_Fees}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {Text.View_and_manage_transport_fee_records_for_students}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Dropdown
            label="Route"
            name="routeId"
            control={control}
            options={[{ label: Text.All_Routes, value: '' }, ...routeOptions]}
          />
          <Dropdown
            label="Pickup Point"
            name="pickUpPointId"
            control={control}
            options={
              !watchedRouteId
                ? [{ label: Text.Select_a_route_first, value: '' }]
                : pickupOptions.length === 0
                  ? [{ label: Text.No_pickup_points_for_this_route, value: '' }]
                  : [{ label: Text.All_Pickup_Points, value: '' }, ...pickupOptions]
            }
          />
          <Dropdown
            label="Class"
            name="classId"
            control={control}
            options={[{ label: Text.All_Classes, value: '' }, ...classOptions]}
          />
          <TextField
            label="Name / Admission No"
            name="search"
            control={control}
            placeholder="Search by name or admission no."
          />
        </div>

        <div className="px-4 pb-4 flex justify-end gap-2">
          {hasSearched && (
            <Button
              name="Clear"
              icon={<IconField name="FaTimes" size={16} />}
              onClick={handleClear}
              loading={false}
            />
          )}
          <Button
            name="Search"
            icon={<IconField name="FaSearch" />}
            loading={isLoading}
            showAlways={true}
          />
        </div>
      </form>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-4 py-2">
          <IconField name="FaSpinner" size={14} className="animate-spin" />
          <span>{Text.Loading_transport_fee_records}</span>
        </div>
      )}

      {!isLoading && (
        <div className="mt-4 rounded-lg bg-white shadow-sm border border-gray-100">
          <div className="p-4">
            <ControlledTable
              columns={columns}
              data={displayedRecords}
              fullData={displayedRecords}
              title={Text.Transport_Details}
              btn={false}
              header={false}
              showSelectAll={false}
              showExport={true}
              exportFilename="student_transport_fees"
              exportTitle={Text.Student_Transport_Fees}
              emptyMessage={
                isFiltered
                  ? Text.No_transport_fee_records_match_the_selected_filters
                  : Text.No_transport_fee_records_found
              }
              customClassName="relative bg-transparent rounded-xl shadow-none mt-0"
              serverPage={page}
              serverTotalPages={totalPages}
              serverTotalItems={totalItems}
              serverPageSize={pageSize}
              onServerPageChange={(p: number) => setPage(p)}
              onServerPageSizeChange={(s: number) => {
                setPageSize(s)
                setPage(0)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentTransportDetailsPage