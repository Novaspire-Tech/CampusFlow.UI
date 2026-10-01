import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm, type FieldValues } from 'react-hook-form'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import TextField from '../../../components/controlled/TextField'
import { Dropdown, PastDateField } from '../../../components/controlled'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import {
  useAuditLogs,
  useFilterAuditLogs,
  useAuditLogFilterOptions,
} from '../../../hooks/queries/systemSettinds/useUserActitity'
import type {
  AuditLog,
  FilterAuditLogsDto,
  AuditLogQueryParams,
} from '../../../types/systemSettinds/userActivity'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'

const ACTION_STYLES: Record<string, { bg: string; text: string }> = {
  CREATE: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  UPDATE: { bg: 'bg-amber-50', text: 'text-amber-700' },
  DELETE: { bg: 'bg-red-50', text: 'text-red-700' },
  VIEW: { bg: 'bg-violet-50', text: 'text-violet-700' },
  LOGIN: { bg: 'bg-blue-50', text: 'text-blue-700' },
  LOGOUT: { bg: 'bg-gray-100', text: 'text-gray-600' },
  APPROVE: { bg: 'bg-teal-50', text: 'text-teal-700' },
  REJECT: { bg: 'bg-rose-50', text: 'text-rose-700' },
  DOWNLOAD: { bg: 'bg-sky-50', text: 'text-sky-700' },
  STATUS_CHANGE: { bg: 'bg-orange-50', text: 'text-orange-700' },
}

const toLabel = (val: string) =>
  val.charAt(0).toUpperCase() + val.slice(1).toLowerCase().replace(/_/g, ' ')

const hasFilters = (dto: FilterAuditLogsDto): boolean =>
  Object.values(dto).some((v) => v !== undefined && v !== null && v !== '')

export default function ActivityLogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const texts = getPagesDataText(t)

  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [selectedUserRole, setSelectedUserRole] = useState<string>('')
  const [filterDto, setFilterDto] = useState<FilterAuditLogsDto>({})
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

  useEffect(() => {
    const urlUser = searchParams.get('user')
    const urlRole = searchParams.get('role')
    if (urlUser) {
      setSelectedUser(urlUser)
      setSelectedUserRole(urlRole || '')
      setFilterDto({ search: urlUser })
    }
  }, [])

  const queryParams: AuditLogQueryParams = { page, size, sortDirection: 'asc' }
  const isFilterActive = hasFilters(filterDto)

  const { data: filterOptions, isLoading: optionsLoading } = useAuditLogFilterOptions()

  const ACTION_OPTIONS = useMemo(
    () => [
      { label: 'All Actions', value: '' },
      ...(filterOptions?.auditActions ?? []).map((a) => ({ label: toLabel(a), value: a })),
    ],
    [filterOptions],
  )

  const MODULE_OPTIONS = useMemo(
    () => [
      { label: 'All Modules', value: '' },
      ...(filterOptions?.auditModules ?? []).map((m) => ({ label: toLabel(m), value: m })),
    ],
    [filterOptions],
  )

  const allLogsQuery = useAuditLogs(queryParams)
  const filteredQuery = useFilterAuditLogs(filterDto, queryParams, isFilterActive)

  const activeQuery = isFilterActive ? filteredQuery : allLogsQuery

  const logs = activeQuery.data?.auditLogs ?? []
  const totalItems = activeQuery.data?.totalElements ?? 0
  const totalPages = activeQuery.data?.totalPages ?? 1
  const isLoading = activeQuery.isLoading
  const isError = activeQuery.isError

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
  } = useForm<FieldValues>({
    defaultValues: {
      filterSearch: '',
      filterAction: '',
      filterModule: '',
      filterDate: '',
    },
  })

  const handleApplyFilters = (data: FieldValues) => {
    const dto: FilterAuditLogsDto = {}

    if (selectedUser) dto.search = selectedUser
    else if (data.filterSearch?.trim()) dto.search = data.filterSearch.trim()

    if (data.filterDate?.trim()) dto.startDate = data.filterDate.trim()
    if (data.filterAction?.trim()) dto.action = data.filterAction.trim()
    if (data.filterModule?.trim()) dto.module = data.filterModule.trim()

    setFilterDto(dto)
    setPage(0)
  }

  const handleClearFilters = () => {
    resetFilter({
      filterSearch: '',
      filterAction: '',
      filterModule: '',
      filterDate: '',
    })
    setFilterDto(selectedUser ? { search: selectedUser } : {})
    setPage(0)
  }

  const handleBackToUsers = () => {
    setSelectedUser(null)
    setSelectedUserRole('')
    setSearchParams({})
    setFilterDto({})
    navigate('/users')
  }

  const tableTitle = useMemo(() => {
    if (selectedUser) return ''
    if (isFilterActive) return texts.Filtered_Activity_Records
    return texts.All_Activity_Records
  }, [selectedUser, selectedUserRole, isFilterActive])

  const tableTitleNode = useMemo(() => {
    if (!selectedUser) return undefined
    return (
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold text-gray-800">Activity — {selectedUser}</span>
        {selectedUserRole && (
          <span
            className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold tracking-wider border"
            style={{
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              borderColor: '#BFDBFE',
            }}
          >
            {selectedUserRole.toUpperCase()}
          </span>
        )}
      </div>
    )
  }, [selectedUser, selectedUserRole])

  const allColumns = [
    {
      key: 'createdBy',
      label: texts.User_Login,
      hidden: !!selectedUser,
      render: (_: any, row: AuditLog) => (
        <div className="min-w-32.5">
          <p className="text-sm font-medium text-gray-800 leading-tight">{row.createdBy || '—'}</p>
          <p className="text-[11px] text-gray-400">{row.role}</p>
        </div>
      ),
    },
    {
      key: 'createdDate',
      label: texts.Date,
      render: (val: string) => {
        if (!val) return <p className="text-sm text-gray-400">—</p>
        const d = new Date(val)
        const date = d.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
        const time = d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
        return (
          <div className="whitespace-nowrap">
            <p className="text-sm font-medium text-gray-700">{date}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{time}</p>
          </div>
        )
      },
    },
    {
      key: 'action',
      label: texts.Action,
      render: (val: string) => {
        const s = ACTION_STYLES[val] ?? { bg: 'bg-gray-100', text: 'text-gray-600' }
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${s.bg} ${s.text}`}
          >
            {val}
          </span>
        )
      },
    },
    {
      key: 'module',
      label: texts.Module,
      render: (val: string) => (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-700">
          {toLabel(val)}
        </span>
      ),
    },
    {
      key: 'description',
      label: texts.Description,
      render: (_: any, row: AuditLog) => (
        <p className="text-sm text-gray-700 leading-snug max-w-65">{row.description}</p>
      ),
    },
  ]

  const columns = allColumns.filter((col) => !col.hidden)

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">{texts.User_Activity}</h1>
          </div>

          {selectedUser && (
            <Button
              name={texts.Back}
              loading={false}
              onClick={handleBackToUsers}
              icon={<IconField name="FaArrowLeft" />}
            />
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <form onSubmit={handleFilterSubmit(handleApplyFilters)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {!selectedUser && (
                <TextField
                  label={texts.Search}
                  name="filterSearch"
                  placeholder={texts.Search}
                  control={filterControl}
                />
              )}

              <PastDateField label={texts.Date} name="filterDate" control={filterControl} autoFillToday={false} />

              <Dropdown
                label={texts.Action}
                name="filterAction"
                control={filterControl}
                required={false}
                options={ACTION_OPTIONS}
                disabled={optionsLoading}
              />

              <Dropdown
                label={texts.Module}
                name="filterModule"
                control={filterControl}
                required={false}
                options={MODULE_OPTIONS}
                disabled={optionsLoading}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                name={texts.Clear}
                loading={false}
                onClick={handleClearFilters}
                icon={<IconField name="FaTimes" />}
                showAlways={true}
              />
              <Button
                name={texts.Search}
                loading={isLoading && isFilterActive}
                icon={<IconField name="FaSearch" />}
                showAlways={true}
              />
            </div>
          </form>
        </div>

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600">
            Failed to load activity logs. Please try again.
          </div>
        )}

        <ControlledTable<AuditLog>
          title={tableTitle}
          titleNode={tableTitleNode}
          columns={columns}
          data={logs}
          showSearch={false}
          actionColumn={false}
          showSelectAll={false}
          loading={false}
          emptyMessage="No activity records found."
          serverPage={page}
          serverTotalPages={totalPages}
          serverTotalItems={totalItems}
          serverPageSize={size}
          onServerPageChange={(newPage) => setPage(newPage)}
          onServerPageSizeChange={(newSize) => {
            setSize(newSize)
            setPage(0)
          }}
        />
      </div>
    </div>
  )
}

 