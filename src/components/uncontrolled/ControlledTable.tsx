import React, { useState, useEffect } from 'react'
import IconField from '../IconField'
import ExportIcons from './ExportIcons'
import Button from '../controlled/Button'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../helpers/useTranslations'
import { usePermissions } from '../../hooks/queries/usePermissions'

interface Column<T> {
  key: string
  label: string
  render?: (value: any, row: T) => React.ReactNode
}

interface ControlledTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onAddClick?: React.Dispatch<React.SetStateAction<boolean>>
  confirmDelete?: (id: string | number) => void
  fullData?: T[]
  searchTerm?: string
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAdd?: (id: string | number) => void
  onView?: (id: string | number) => void
  onEdit?: (id: string | number) => void
  onDelete?: (id: string | number) => void
  onDeleteMultiple?: (ids: (string | number)[]) => void
  onAddFees?: (id: string | number) => void
  showEdit?: boolean
  title?: string
  titleNode?: React.ReactNode
  btn?: boolean
  btnName?: string
  showForm?: (val: boolean) => void
  header?: boolean
  onDownload?: (id: number | string) => Promise<void>
  showSearch?: boolean
  showExport?: boolean
  customClassName?: string
  emptyMessage?: string
  actionColumn?: boolean
  customExportColumns?: Column<T>[]
  exportFilename?: string
  exportTitle?: string
  hiddenColumns?: (keyof T)[]
  showSelectAll?: boolean
  showPaginationFooter?: boolean
  onRowClick?: (row: T) => void
  rowClassName?: string
  loading?: boolean
  grandTotal?: number
  showGrandTotal?: boolean
  grandTotalLabel?: string
  permissionScope?: string
  enablePermissions?: boolean
  forceShowActions?: boolean
  forceShowBtn?: boolean
  serverPage?: number
  serverTotalPages?: number
  serverTotalItems?: number
  serverPageSize?: number
  onServerPageChange?: (page: number) => void
  onServerPageSizeChange?: (size: number) => void
  onDownloadExcel?: () => void
  onImportExcel?: (file: File) => void
}

// A large number sent to backend to mean "fetch all"
const ALL_PAGE_SIZE = 100000

const PAGE_SIZE_OPTIONS_WITH_ALL = [2, 5, 10, 20, 50, 'all'] as const
type PageSizeOptionWithAll = (typeof PAGE_SIZE_OPTIONS_WITH_ALL)[number]

// ── Server Pagination Bar
interface ServerPaginationBarProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

function ServerPaginationBar({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ServerPaginationBarProps) {
  const isAll = pageSize >= ALL_PAGE_SIZE
  const from = totalItems === 0 ? 0 : currentPage * pageSize + 1
  const to = Math.min((currentPage + 1) * pageSize, totalItems)

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i)
    .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 1)
    .reduce<(number | '…')[]>((acc, i, idx, arr) => {
      if (idx > 0 && (i as number) - (arr[idx - 1] as number) > 1) acc.push('…')
      acc.push(i)
      return acc
    }, [])

  return (
    <div className="p-2 text-sm text-gray-600 flex flex-col md:flex-row justify-between items-center gap-3 mt-1">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span>Rows:</span>
          <select
            value={isAll ? 'all' : pageSize}
            onChange={(e) => {
              if (e.target.value === 'all') {
                onPageSizeChange(ALL_PAGE_SIZE)
              } else {
                onPageSizeChange(Number(e.target.value))
              }
            }}
            className="border rounded px-1 py-0.5 text-sm"
          >
            {([2, 5, 10, 20, 50] as const).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="all">All</option>
          </select>
        </div>
        <span>
          {isAll ? `1–${totalItems} of ${totalItems}` : `${from}–${to} of ${totalItems}`}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0 || isAll}
          className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-gray-100"
          aria-label="First page"
        >
          «
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || isAll}
          className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-gray-100"
          aria-label="Previous page"
        >
          ‹
        </button>

        {!isAll &&
          pageNumbers.map((item, idx) =>
            item === '…' ? (
              <span key={`ellipsis-${idx}`} className="px-1">
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item as number)}
                className={`px-2 py-1 rounded border ${
                  item === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                {(item as number) + 1}
              </button>
            ),
          )}

        {isAll && (
          <span className="px-2 py-1 rounded border bg-blue-600 text-white border-blue-600">
            All
          </span>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || isAll}
          className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-gray-100"
          aria-label="Next page"
        >
          ›
        </button>
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1 || isAll}
          className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-gray-100"
          aria-label="Last page"
        >
          »
        </button>
      </div>
    </div>
  )
}

// ── Main table component
const ControlledTable = <T extends { id: string | number; [key: string]: any }>({
  columns = [],
  data = [],
  fullData = [],
  searchTerm = '',
  onSearchChange = () => {},
  onAdd,
  onView,
  onEdit,
  onDelete,
  onDeleteMultiple,
  onAddFees,
  title = '',
  titleNode,
  btn = false,
  btnName,
  showForm = () => {},
  header = false,
  showSearch = true,
  showExport = true,
  customClassName = 'relative p-2 bg-white rounded-xl shadow-2xl mt-5',
  emptyMessage = '',
  actionColumn = true,
  customExportColumns = [],
  forceShowActions = false,
  forceShowBtn = true,
  exportFilename,
  exportTitle,
  hiddenColumns = [],
  showSelectAll = true,
  showPaginationFooter = true,
  onRowClick,
  rowClassName = '',
  loading = false,
  grandTotal = 0,
  showGrandTotal = false,
  grandTotalLabel = 'Grand Total',
  permissionScope,
  enablePermissions = false,
  serverPage,
  serverTotalPages,
  serverTotalItems,
  serverPageSize,
  onServerPageChange,
  onServerPageSizeChange,
  onDownloadExcel,
  onImportExcel,
}: ControlledTableProps<T>) => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)

  const { canCreate, canUpdate, canDelete } = usePermissions()
  const hasCreatePermission = !enablePermissions || !permissionScope || canCreate(permissionScope)
  const hasUpdatePermission = !enablePermissions || !permissionScope || canUpdate(permissionScope)
  const hasDeletePermission = !enablePermissions || !permissionScope || canDelete(permissionScope)

  const isServerMode =
    serverPage !== undefined &&
    serverTotalPages !== undefined &&
    serverTotalItems !== undefined &&
    serverPageSize !== undefined &&
    onServerPageChange !== undefined &&
    onServerPageSizeChange !== undefined

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<PageSizeOptionWithAll>(10)

  const effectivePageSize =
    itemsPerPage === 'all' ? (data.length || 1) : (itemsPerPage as number)

  const startIndex = (currentPage - 1) * effectivePageSize
  const endIndex = startIndex + effectivePageSize

  const paginatedData = isServerMode ? data : data.slice(startIndex, endIndex)
  const totalPages = isServerMode
    ? serverTotalPages!
    : Math.ceil(data.length / effectivePageSize)

  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  const handleAddClick = () => {
    if (enablePermissions && permissionScope && !hasCreatePermission) {
      alert("You don't have permission to create")
      return
    }
    showForm(true)
  }

  const handleEditClick = (id: string | number) => {
    if (enablePermissions && permissionScope && !hasUpdatePermission) {
      alert("You don't have permission to edit")
      return
    }
    if (onEdit) onEdit(id)
  }

  const handleDeleteClick = (id: string | number) => {
    if (enablePermissions && permissionScope && !hasDeletePermission) {
      alert("You don't have permission to delete")
      return
    }
    if (onDelete) onDelete(id)
  }

  const handleDeleteMultipleClick = () => {
    if (enablePermissions && permissionScope && !hasDeletePermission) {
      alert("You don't have permission to delete")
      return
    }
    if (onDeleteMultiple) onDeleteMultiple(Array.from(selectedRows))
  }

  const isAllSchoolsMode =
    !localStorage.getItem('schoolCode') || localStorage.getItem('schoolCode') === ''

  const shouldShowActionColumn =
    (forceShowActions || !isAllSchoolsMode) &&
    actionColumn &&
    (onAdd ||
      onView ||
      (onEdit && hasUpdatePermission) ||
      (onDelete && hasDeletePermission) ||
      onAddFees)

  const shouldShowSelectAll = !isAllSchoolsMode && showSelectAll && hasDeletePermission

  useEffect(() => {
    setSelectedRows(new Set())
    setSelectAll(false)
  }, [data])

  useEffect(() => {
    if (!isServerMode) setCurrentPage(1)
  }, [searchTerm])

  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  useEffect(() => {
    setSelectAll(selectedRows.size === paginatedData.length && paginatedData.length > 0)
  }, [selectedRows, paginatedData])

  const handleSelectAll = (checked: boolean) => {
    const pageIds = new Set(paginatedData.map((item) => item.id))
    const newSelected = new Set(selectedRows)
    if (checked) {
      pageIds.forEach((id) => newSelected.add(id))
    } else {
      pageIds.forEach((id) => newSelected.delete(id))
    }
    setSelectedRows(newSelected)
    setSelectAll(checked)
  }

  const handleRowSelect = (id: string | number, checked: boolean) => {
    const newSelectedRows = new Set(selectedRows)
    checked ? newSelectedRows.add(id) : newSelectedRows.delete(id)
    setSelectedRows(newSelectedRows)
  }

  return (
    <div className={customClassName}>
      {loading && (
        <div className="absolute flex justify-center items-center w-full h-full z-50">
          <div className="animate-spin">
            <IconField name="FaSpinner" size={50} />
          </div>
        </div>
      )}

      {!header && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          {titleNode ? (
            <div className="w-full sm:w-auto">{titleNode}</div>
          ) : (
            <h1 className="text-xl font-semibold w-full sm:w-auto">{title}</h1>
          )}

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
            {shouldShowSelectAll && selectedRows.size > 0 && (
              <Button
                name={`${Text.Delete_ALL} (${selectedRows.size})`}
                loading={false}
                onClick={handleDeleteMultipleClick}
              />
            )}
            {btn && hasCreatePermission && (
              <Button
                name={btnName || Text.Add}
                loading={false}
                onClick={handleAddClick}
                icon={<IconField name="FaPlus" />}
                showAlways={forceShowBtn}
              />
            )}
          </div>
        </div>
      )}

      <hr className="mb-4" />

      {(showSearch || showExport || onDownloadExcel || onImportExcel) && (
        <div
          className={`${
            header
              ? 'hidden'
              : 'mb-4 flex flex-col md:flex-row justify-between items-center gap-2'
          }`}
        >
          {showSearch && (
            <input
              type="text"
              placeholder={Text.Search}
              value={searchTerm}
              onChange={onSearchChange}
              className="px-2 py-2 border-b w-full md:w-30 lg:w-42 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl"
            />
          )}
          {showExport && (
            <ExportIcons
              data={fullData.length > 0 ? fullData : data}
              columns={customExportColumns.length > 0 ? customExportColumns : columns}
              filename={exportFilename || title.toLowerCase().replace(/\s+/g, '_')}
              pdfTitle={exportTitle || `${title} Report`}
              className="flex-wrap gap-3 text-gray-700"
              iconSize={25}
              grandTotal={showGrandTotal ? grandTotal : undefined}
              grandTotalLabel={grandTotalLabel}
            />
          )}
          <div className="flex gap-2">
            {onImportExcel && (
              <>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  id="excel-import-input"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      onImportExcel(file)
                      e.target.value = ''
                    }
                  }}
                />
                <Button
                  name={'Import Excel'}
                  loading={false}
                  onClick={() => document.getElementById('excel-import-input')?.click()}
                  icon={<IconField name="FaFileImport" />}
                />
              </>
            )}
            {onDownloadExcel && (
              <Button
                name={'Excel Download'}
                loading={false}
                onClick={onDownloadExcel}
                icon={<IconField name="FaFileDownload" />}
              />
            )}
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className="table-auto w-full text-sm text-gray-600">
          <thead className="bg-gray-100">
            <tr>
              {shouldShowSelectAll && data.length > 0 && (
                <th className="px-4 py-2 text-left font-semibold w-12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-2 text-left font-semibold ${
                    hiddenColumns.includes(col.key as keyof T) ? 'hidden' : ''
                  }`}
                >
                  {col.label}
                </th>
              ))}
              {shouldShowActionColumn && (
                <th className="px-7 py-2 text-left font-semibold">{Text.Action}</th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (shouldShowActionColumn ? 1 : 0) +
                    (shouldShowSelectAll ? 1 : 0)
                  }
                  className="text-center py-4"
                >
                  <p className="text-red-500 font-semibold">
                    {emptyMessage || Text.No_data_available_in_Table}
                  </p>
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`border-b transition-colors duration-200 ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${rowClassName || 'hover:bg-gray-50'}`}
                >
                  {shouldShowSelectAll && (
                    <td className="px-4 py-2 w-12" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(item.id)}
                        onChange={(e) => handleRowSelect(item.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </td>
                  )}

                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-2 ${
                        hiddenColumns.includes(col.key as keyof T) ? 'hidden' : ''
                      }`}
                    >
                      {col.render
                        ? col.render(item[col.key], item)
                        : String(item[col.key] ?? '')}
                    </td>
                  ))}

                  {shouldShowActionColumn && (
                    <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center">
                        {onAdd && (
                          <button
                            onClick={() => onAdd(item.id)}
                            className="text-black font-bold text-2xl ml-2"
                          >
                            +
                          </button>
                        )}
                        {onView && (
                          <button onClick={() => onView(item.id)} className="text-green-500 ml-2">
                            <IconField name="FaEye" size={20} />
                          </button>
                        )}
                        {onEdit && hasUpdatePermission && (
                          <button
                            onClick={() => handleEditClick(item.id)}
                            className="text-blue-500 ml-2"
                          >
                            <IconField name="FaEdit" size={18} />
                          </button>
                        )}
                        {onDelete && hasDeletePermission && (
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="text-red-500 ml-2"
                          >
                            <IconField name="FaTrash" size={20} />
                          </button>
                        )}
                        {onAddFees && (
                          <button
                            onClick={() => onAddFees(item.id)}
                            className="text-green-500 text-lg ml-2"
                          >
                            ₹
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {showPaginationFooter &&
        (isServerMode ? (
          <ServerPaginationBar
            currentPage={serverPage!}
            totalPages={serverTotalPages!}
            totalItems={serverTotalItems!}
            pageSize={serverPageSize!}
            onPageChange={onServerPageChange!}
            onPageSizeChange={onServerPageSizeChange!}
          />
        ) : (
          <div className="p-2 text-sm text-gray-600 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span>Rows:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    const val =
                      e.target.value === 'all' ? 'all' : Number(e.target.value)
                    setItemsPerPage(val as PageSizeOptionWithAll)
                  }}
                  className="border rounded px-1 py-0.5 text-sm"
                >
                  {PAGE_SIZE_OPTIONS_WITH_ALL.map((s) => (
                    <option key={s} value={s}>
                      {s === 'all' ? 'All' : s}
                    </option>
                  ))}
                </select>
              </div>
              <p>
                {data.length > 0
                  ? `${Text.Records} ${startIndex + 1} ${Text.to} ${Math.min(
                      endIndex,
                      data.length,
                    )} ${Text.of} ${data.length}`
                  : Text.Records_0_to_0_of_0}
              </p>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <button
                disabled={currentPage === 1 || itemsPerPage === 'all'}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className={currentPage === 1 || itemsPerPage === 'all' ? 'opacity-50' : ''}
              >
                <IconField name="FaLessThan" size={20} />
              </button>
              <span className="px-3 py-1 bg-gray-200 rounded">{currentPage}</span>
              <button
                disabled={
                  currentPage === totalPages ||
                  totalPages === 0 ||
                  itemsPerPage === 'all'
                }
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className={
                  currentPage === totalPages ||
                  totalPages === 0 ||
                  itemsPerPage === 'all'
                    ? 'opacity-50'
                    : ''
                }
              >
                <IconField name="FaGreaterThan" size={20} />
              </button>
            </div>
          </div>
        ))}
    </div>
  )
}

export default ControlledTable
 