import React, { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import Button from '../controlled/Button'
import { IconField } from '..'
import { API_BASE_URL } from '../../utils/axios'

const resolvePath = (path: string): string => {
  const isAllSchools    = localStorage.getItem('isAllSchools') === 'true'
  const schoolCode      = localStorage.getItem('schoolCode')      || 'default'
  const schoolGroupCode = localStorage.getItem('schoolGroupCode') || 'default'

  let url = path.replace('{schoolGroupCode}', schoolGroupCode)

  if (!isAllSchools) {
    url = url.replace('{schoolCode}', schoolCode)
  } else {
    url = url.replace('{schoolCode}/', '')
    url = url.replace('{schoolCode}', '')
  }

  return url
}

interface ImportResult {
  success: number
  failed: number
  message: string
  errors?: string[]
  errorFile?: Blob
}

interface ExcelActionsProps {
  importMutation: {
    mutateAsync: (file: File) => Promise<{
      success: number
      failed: number
      message: string
      errors?: string[]
      errorFile?: Blob
    }>
    isPending: boolean
  }
  downloadMutation: {
    mutateAsync: () => Promise<unknown>
    isPending: boolean
  }
  uploadEndpoint?: string
  importLabel?: string
  downloadLabel?: string
  onImportSuccess?: () => void
}


export default function ExcelActions({
  importMutation,
  downloadMutation,
  uploadEndpoint,
  importLabel = 'Import XL',
  downloadLabel = 'Download XL Template',
  onImportSuccess,
}: ExcelActionsProps) {
  const isImporting = importMutation.isPending

  const [showModal, setShowModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const importFileRef = useRef<HTMLInputElement>(null)

  const resetModal = () => {
    setShowModal(false)
    setImportFile(null)
    setImportResult(null)
    if (importFileRef.current) importFileRef.current.value = ''
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isExcel =
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'
    if (!isExcel) {
      toast.error('Please upload a valid Excel file (.xlsx or .xls only)')
      e.target.value = ''
      return
    }
    setImportFile(file)
  }

  const fetchUpload = async (file: File): Promise<ImportResult> => {
    if (!uploadEndpoint) {
      return importMutation.mutateAsync(file)
    }

    const token = localStorage.getItem('accessToken') || ''
    const url   = `${API_BASE_URL}${resolvePath(uploadEndpoint)}`

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(url, {
      method:  'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body:    formData,
    })

    const contentType        = response.headers.get('content-type')        || ''
    const contentDisposition = response.headers.get('content-disposition') || ''

    if (
      contentType.includes('application/octet-stream') ||
      contentDisposition.includes('attachment')
    ) {
      const blob = await response.blob()
      return {
        success:   0,
        failed:    -1,
        message:   'Some records failed. Download the error file for details.',
        errorFile: blob,
      }
    }

    const json = await response.json()
    if (json?.status !== 200) {
      throw new Error(json?.message || 'Failed to upload Excel sheet')
    }

    return {
      success: json?.data?.successCount ?? 0,
      failed:  json?.data?.failureCount ?? 0,
      message: json?.message            || 'All records uploaded successfully',
      errors:  json?.data?.errors       ?? [],
    }
  }

  const handleImport = async () => {
    if (!importFile) { toast.error('Please select an Excel file first'); return }
    try {
      const result = await fetchUpload(importFile)
      setImportResult({
        success:   result.success,
        failed:    result.failed,
        message:   result.message,
        errors:    result.errors ?? [],
        errorFile: result.errorFile,
      })
      if (result.errorFile) {
        toast.error('Some records failed. Download the error file for details.')
      } else if (result.success > 0) {
        toast.success(`${result.success} records imported successfully!`)
        onImportSuccess?.()
        resetModal()
      } else {
        toast.warning('No records were imported.')
      }
      setImportFile(null)
      if (importFileRef.current) importFileRef.current.value = ''
    } catch (error: any) {
      toast.error(error?.message || 'Import failed. Please check your Excel file.')
    }
  }

  const handleDownloadErrorFile = () => {
    if (!importResult?.errorFile) return
    const url = URL.createObjectURL(importResult.errorFile)
    const a = document.createElement('a')
    a.href = url
    a.download = 'error.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Error file downloaded!')
    resetModal()
  }

  const handleDownloadTemplate = async () => {
    try {
      await downloadMutation.mutateAsync()
      toast.success('Template downloaded successfully!')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to download template.')
    }
  }

  const resultColor = importResult?.failed === 0 ? 'green' : importResult?.success === 0 ? 'red' : 'yellow'
  const resultIcon  = importResult?.failed === 0 ? 'FaCheckCircle' : importResult?.success === 0 ? 'FaTimesCircle' : 'FaExclamationTriangle'

  return (
    <>
      <Button
        name={importLabel}
        loading={false}
        type="button"
        icon={<IconField name="FaFileExcel" size={15} />}
        onClick={() => setShowModal(true)}
        // permissionScope="students"
        // permissionType="CREATE"
        // enablePermissions={true}
        // showDisabledIfNoPermission={false}
      />
      <Button
        name={downloadLabel}
        loading={downloadMutation.isPending}
        type="button"
        icon={<IconField name="FaFileExcel" size={15} />}
        onClick={handleDownloadTemplate}
        // permissionScope="students"
        // permissionType="CREATE"
        // enablePermissions={true}
        // showDisabledIfNoPermission={false}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-3 sm:mx-4 border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-5">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-green-100 shrink-0">
                  <IconField name="FaFileExcel" size={16} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Import from Excel</h3>
                  <p className="text-xs text-gray-500">Upload an .xlsx or .xls file</p>
                </div>
              </div>
              <button type="button" onClick={resetModal} className="text-gray-400 hover:text-gray-600 p-1 shrink-0">
                <IconField name="FaTimes" size={16} />
              </button>
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Excel File <span className="text-red-500">*</span>
              </label>
              <input
                ref={importFileRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileChange}
                className="block w-full text-xs sm:text-sm text-gray-600
                  file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0
                  file:text-xs file:font-medium file:bg-slate-700 file:text-white
                  hover:file:bg-slate-800 file:cursor-pointer
                  border border-gray-300 rounded-lg bg-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              {importFile && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <IconField name="FaCheckCircle" size={14} className="text-green-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-green-800 truncate">{importFile.name}</p>
                    <p className="text-xs text-green-600">{(importFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button type="button" onClick={() => { setImportFile(null); if (importFileRef.current) importFileRef.current.value = '' }} className="text-green-600 hover:text-green-800 p-0.5">
                    <IconField name="FaTimes" size={13} />
                  </button>
                </div>
              )}
            </div>

            {importResult && (
              <div className="mt-4">
                {importResult.errorFile ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2 mb-3">
                      <IconField name="FaTimesCircle" size={16} className="text-red-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-red-800">Import Failed</p>
                        <p className="text-xs text-red-600 mt-0.5">{importResult.message}</p>
                        {importResult.failed > 0 && importResult.failed !== -1 && (
                          <span className="text-xs text-red-700 font-medium">{importResult.failed} failed</span>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={handleDownloadErrorFile}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                      <IconField name="FaDownload" size={14} />
                      Download Error File (error.xlsx)
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className={`flex items-start sm:items-center gap-2 p-2.5 rounded-lg mb-2 bg-${resultColor}-50 border border-${resultColor}-200`}>
                      <IconField name={resultIcon} size={15} className={`shrink-0 text-${resultColor}-600`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-gray-800">{importResult.message}</p>
                        <div className="flex flex-wrap gap-2 mt-0.5">
                          <span className="text-xs text-green-700 font-medium">{importResult.success} succeeded</span>
                          {importResult.failed > 0 && <span className="text-xs text-red-700 font-medium">{importResult.failed} failed</span>}
                        </div>
                      </div>
                    </div>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="border border-red-200 rounded-lg overflow-hidden">
                        <div className="bg-red-50 px-3 py-2 border-b border-red-200">
                          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Failed Rows</p>
                        </div>
                        <ul className="max-h-32 overflow-y-auto divide-y divide-red-100">
                          {importResult.errors.map((err, idx) => (
                            <li key={idx} className="flex items-start gap-2 px-3 py-2">
                              <IconField name="FaTimesCircle" size={11} className="text-red-400 mt-0.5 shrink-0" />
                              <span className="text-xs text-red-700 leading-snug">{err}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 sm:gap-3 justify-end mt-4">
              <Button name="Cancel" loading={isImporting} isDisable={isImporting} onClick={resetModal} type="button" />
              <button type="button" onClick={handleImport} disabled={!importFile || isImporting}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5">
                {isImporting ? (
                  <><div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" /><span>Importing...</span></>
                ) : (
                  <><IconField name="FaUpload" size={13} /><span>Import</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}