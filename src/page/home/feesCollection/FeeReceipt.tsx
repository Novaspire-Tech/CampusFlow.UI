import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { getPagesDataText, getPagesNameText } from '../../../helpers/useTranslations'
import { feeTransactionService } from '../../../services/feesCollection/feeTransactionService'
import { studentFilterService } from '../../../services/feesCollection/fineTransactionService'
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses'
import { useSections } from '../../../hooks/queries/academics/useSections'
import { useSchool } from '../../../hooks/queries/superAdmin/useSchool'
import { useStaffPhoto } from '../../../hooks/queries/humanResource/useStaffPhoto'
import { Dropdown } from '../../../components/controlled'
import Button from '../../../components/controlled/Button'
import { IconField } from '../../../components'
import TextFields from '../../../components/controlled/TextField'


interface FilterFormValues {
  searchClass: string
  searchSection: string
  searchKeyword: string
  searchRollNo: string
}

interface FeeDetail {
  feesId?: string
  feeTypeId: string
  feeTypeName: string
  totalFees: string
  paid: string
  pending: string
  date?: string
  receiptNo?: string
  mode?: string
  discount?: string
  fine?: string
  feeTransactionId?: number
}

type StudentDueFeesData = {
  id: number | string
  studentId: number | string
  studentName: string
  class: string
  classId?: number
  section: string
  sectionId?: number
  admissionNo: string
  rollNumber: number | string
  fatherName: string
  mobileNo?: string
  totalFees: number
  paidFees: number
  discount: number
  fine: number
  pending: number
  feesList?: FeeDetail[]
}

const getPaymentStatus = (totalFees: number, paid: number): 'Partial' | 'Unpaid' | 'Paid' => {
  if (paid === 0) return 'Unpaid'
  if (paid >= totalFees) return 'Paid'
  return 'Partial'
}

const getStatusColor = (status: 'Partial' | 'Unpaid' | 'Paid') => {
  switch (status) {
    case 'Partial': return 'bg-orange-200 text-orange-800'
    case 'Unpaid': return 'bg-pink-200 text-pink-800'
    case 'Paid': return 'bg-green-200 text-green-800'
    default: return 'bg-gray-200 text-gray-800'
  }
}

function buildStudentRecord(
  student: any,
  latestTransactionsByStudent: Map<string, Map<string, any>>,
): StudentDueFeesData | null {
  const studentId = student.studentId?.toString() || student.id?.toString()
  if (!studentId) return null

  const studentLatestTransactions = latestTransactionsByStudent.get(studentId)
  let feesList: FeeDetail[] = []

  if (studentLatestTransactions && studentLatestTransactions.size > 0) {
    feesList = Array.from(studentLatestTransactions.values()).map((tx: any) => ({
      feesId: tx.feesId?.toString() || '',
      feeTypeId: String(tx.feeTypeId),
      feeTypeName: tx.feeTypeName || 'N/A',
      totalFees: parseFloat(tx.feesTotalFees?.toString() || '0').toString(),
      paid: parseFloat(tx.feesPaid?.toString() || '0').toString(),
      pending: parseFloat(tx.feesPending?.toString() || '0').toString(),
      date: tx.date || new Date().toLocaleDateString('en-IN'),
      receiptNo: tx.receiptNo || 'N/A',
      mode: tx.mode || 'N/A',
      discount: parseFloat(tx.discountAmount?.toString() || '0').toString(),
      fine: parseFloat(tx.fine?.toString() || '0').toString(),
      feeTransactionId: tx.feeTransactionId,
    }))
  } else if (student.feesList && student.feesList.length > 0) {
    feesList = student.feesList.map((fee: any) => ({
      feesId: fee.feesId?.toString(),
      feeTypeId: fee.feeTypeId?.toString(),
      feeTypeName: fee.feeTypeName || '',
      totalFees: fee.totalFees || '0',
      paid: fee.paid || '0',
      pending: fee.pending || '0',
      date: fee.date || new Date().toLocaleDateString('en-IN'),
      receiptNo: fee.receiptNo || 'N/A',
      mode: fee.mode || 'N/A',
      discount: fee.discount || '0',
      fine: fee.fine || '0',
    }))
  }

  const totalFees = feesList.reduce((s, f) => s + (parseFloat(f.totalFees) || 0), 0)
  const totalPaid = feesList.reduce((s, f) => s + (parseFloat(f.paid) || 0), 0)
  const totalDiscount = feesList.reduce((s, f) => s + (parseFloat(f.discount || '0') || 0), 0)
  const totalFine = feesList.reduce((s, f) => s + (parseFloat(f.fine || '0') || 0), 0)
  const totalPending = feesList.reduce((s, f) => s + (parseFloat(f.pending) || 0), 0)

  const raw = student as any
  const mobileNo =
    raw.parent?.phoneNumber || raw.parent?.alternatePhoneNumber ||
    raw.parentPhone || raw.phoneNumber || raw.mobileNumber ||
    raw.parentMobile || raw.fatherMobile || raw.motherMobile || '—'

  return {
    id: studentId,
    studentId: student.studentId || student.id,
    studentName: `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim(),
    class: student.className || student.class || '',
    classId: student.classId,
    section: student.sectionName || student.section || '',
    sectionId: student.sectionId,
    admissionNo: student.admissionNo || '',
    rollNumber: student.rollNo || 0,
    fatherName: student.fatherName || '',
    mobileNo,
    totalFees,
    paidFees: totalPaid,
    discount: totalDiscount,
    fine: totalFine,
    pending: totalPending,
    feesList,
  }
}

const CutLine: React.FC = () => (
  <>
    <div className="cut-line-screen my-6 select-none">
      <div className="flex items-center gap-0">
        <div className="flex-1 border-t-2 border-dashed border-gray-400" />
        <div className="flex items-center gap-2 px-4 py-1 bg-gray-100 border border-dashed border-gray-400 rounded-full text-xs font-semibold text-gray-500 tracking-widest">
          <span className="text-base leading-none">✂</span>
          
        </div>
        <div className="flex-1 border-t-2 border-dashed border-gray-400" />
      </div>
    </div>

    <div className="cut-line-print">
      <div style={{ height: '8mm' }} />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: 1, borderTop: '1.5px dashed #9ca3af' }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '1px 10px', border: '1px dashed #9ca3af',
          borderRadius: '999px', fontSize: '9px', color: '#6b7280',
          fontWeight: 700, letterSpacing: '0.08em', background: 'white', whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: '12px', lineHeight: 1 }}>✂</span>
        </div>
        <div style={{ flex: 1, borderTop: '1.5px dashed #9ca3af' }} />
      </div>
      <div style={{ height: '8mm' }} />
    </div>
  </>
)

const FeeReceipt: React.FC = () => {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  const NameText = getPagesNameText(t)
  const [schoolCode] = useState<string>(
    () => localStorage.getItem('schoolCode') || sessionStorage.getItem('schoolCode') || '',
  )
  const [schoolGroupCode] = useState<string>(
    () => localStorage.getItem('schoolGroupCode') || sessionStorage.getItem('schoolGroupCode') || '',
  )
  const { data: schoolData, isLoading: isSchoolLoading } = useSchool(schoolGroupCode, schoolCode)

  const logoPath: string = (schoolData as any)?.logo ?? ''
  const { photoUrl: schoolLogoUrl, loading: logoLoading, error: logoError } = useStaffPhoto(logoPath || undefined)

  const [cachedSchool, setCachedSchool] = useState<{
    schoolName: string; address: string; phoneNumber: string
    email: string; managedBy: string; webSite: string
  } | null>(() => {
    try {
      const raw = localStorage.getItem('schoolDetails')
      if (!raw) return null
      const p = JSON.parse(raw)
      return {
        schoolName: p.schoolName || '', address: p.address || '',
        phoneNumber: p.phoneNumber || '', email: p.email || '',
        managedBy: p.managedBy || '', webSite: p.webSite || '',
      }
    } catch { return null }
  })

  useEffect(() => {
    if (!schoolData) return
    const next = {
      schoolName: schoolData.schoolName || '', address: schoolData.address || '',
      phoneNumber: schoolData.phoneNumber || '', email: schoolData.email || '',
      managedBy: (schoolData as any).managedBy || '', webSite: (schoolData as any).webSite || '',
    }
    setCachedSchool(next)
    localStorage.setItem('schoolDetails', JSON.stringify(schoolData))
  }, [schoolData])

  const schoolName = schoolData?.schoolName || cachedSchool?.schoolName || ''
  const schoolAddress = schoolData?.address || cachedSchool?.address || ''
  const schoolPhone = schoolData?.phoneNumber || cachedSchool?.phoneNumber || ''
  const schoolEmail = schoolData?.email || cachedSchool?.email || ''
  const schoolManagedBy = (schoolData as any)?.managedBy || cachedSchool?.managedBy || ''
  const schoolWebSite = (schoolData as any)?.webSite || cachedSchool?.webSite || ''

  const { control, handleSubmit, reset: resetForm, watch, setValue: setFormValue } =
    useForm<FilterFormValues>({
      defaultValues: { searchClass: '', searchSection: '', searchKeyword: '', searchRollNo: '' },
    })

  const selectedClassId = watch('searchClass')
  const { data: classesData } = useSchoolClasses()
  const [selectedClassForSections, setSelectedClassForSections] = useState<number>(0)
  const { data: sectionsData } = useSections(selectedClassForSections)

  useEffect(() => {
    if (selectedClassId) {
      setSelectedClassForSections(Number(selectedClassId))
      setFormValue('searchSection', '')
    } else {
      setSelectedClassForSections(0)
      setFormValue('searchSection', '')
    }
  }, [selectedClassId, setFormValue])

  const classOptions = useMemo(
    () => classesData?.map((cls: any) => ({ value: String(cls.id || cls.schoolClassId), label: cls.name || cls.className })) || [],
    [classesData],
  )
  const sectionOptions = useMemo(
    () => sectionsData?.map((sec: any) => ({ value: String(sec.id || sec.sectionId), label: sec.name || sec.sectionName })) || [],
    [sectionsData],
  )

  const [allStudents, setAllStudents] = useState<StudentDueFeesData[]>([])
  const [filteredData, setFilteredData] = useState<StudentDueFeesData[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isLoadingBase, setIsLoadingBase] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [isFilterActive, setIsFilterActive] = useState(false)
  const [txMap, setTxMap] = useState<Map<string, Map<string, any>>>(new Map())
  const [txLoaded, setTxLoaded] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [selectedStudentForPrint, setSelectedStudentForPrint] = useState<StudentDueFeesData | null>(null)

  const currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const showSchoolLoader = (isSchoolLoading || logoLoading) && !cachedSchool

  useEffect(() => {
    if (txLoaded) return
      ; (async () => {
        try {
          const res = await feeTransactionService.getAll(0, 100000, 'desc')
          const map = new Map<string, Map<string, any>>()
            ; (res.feeTransactions || []).forEach((tx) => {
              const sid = String(tx.studentId)
              const ftid = String(tx.feeTypeId)
              if (!map.has(sid)) map.set(sid, new Map())
              const studentMap = map.get(sid)!
              if (!studentMap.has(ftid)) {
                studentMap.set(ftid, tx)
              } else {
                const existing = studentMap.get(ftid)
                const existDate = new Date(existing.date || 0)
                const curDate = new Date(tx.date || 0)
                if (curDate > existDate || (curDate.getTime() === existDate.getTime() && (tx.feeTransactionId || 0) > (existing.feeTransactionId || 0))) {
                  studentMap.set(ftid, tx)
                }
              }
            })
          setTxMap(map)
        } catch (err) {
          console.error('Error loading transactions:', err)
        } finally {
          setTxLoaded(true)
        }
      })()
  }, [txLoaded])

  useEffect(() => {
    if (!txLoaded) return
      ; (async () => {
        setIsLoadingBase(true)
        try {
          const res = await studentFilterService.getAll(0, 100000, 'asc')
          const transformed = res.students
            .map((s: any) => buildStudentRecord(s, txMap))
            .filter((s): s is StudentDueFeesData => s !== null)
          setAllStudents(transformed)
        } catch (err) {
          console.error('Error loading students:', err)
        } finally {
          setIsLoadingBase(false)
        }
      })()
  }, [txLoaded, txMap])

  const applyLocalFilters = useCallback(
    (list: StudentDueFeesData[], f: FilterFormValues): StudentDueFeesData[] =>
      list.filter((s) => {
        if (f.searchClass && String(s.classId) !== String(f.searchClass)) return false
        if (f.searchSection && String(s.sectionId) !== String(f.searchSection)) return false
        if (f.searchRollNo && !String(s.rollNumber).toLowerCase().includes(f.searchRollNo.toLowerCase())) return false
        if (f.searchKeyword) {
          const q = f.searchKeyword.toLowerCase()
          if (!s.studentName.toLowerCase().includes(q) && !s.admissionNo.toLowerCase().includes(q)) return false
        }
        return true
      }),
    [],
  )

  const onSearch: SubmitHandler<FilterFormValues> = useCallback(
    async (data) => {
      const hasAny = Object.values(data).some((v) => v !== undefined && v !== null && v !== '')
      if (!hasAny) {
        setIsFilterActive(false); setFilteredData(allStudents); setShowResults(true); return
      }
      setIsFiltering(true); setIsFilterActive(true); setShowResults(true)
      try {
        const filterDto = {
          search: data.searchKeyword || undefined,
          schoolClassId: data.searchClass ? Number(data.searchClass) : undefined,
          sectionId: data.searchSection ? Number(data.searchSection) : undefined,
          rollNo: data.searchRollNo || undefined,
          sessionStatus: 'ACTIVE' as const,
        }
        const shouldCallBackend = !!filterDto.search || !!filterDto.schoolClassId || !!filterDto.sectionId || !!filterDto.rollNo
        let baseStudents: StudentDueFeesData[]
        if (shouldCallBackend) {
          const res = await studentFilterService.filter({ dto: filterDto, page: 0, size: 100000, sortDirection: 'asc' })
          baseStudents = res.students
            .map((s: any) => buildStudentRecord(s, txMap))
            .filter((s): s is StudentDueFeesData => s !== null)
          if (baseStudents.length === 0 && filterDto.search)
            baseStudents = applyLocalFilters(allStudents, { ...data, searchClass: '', searchSection: '', searchRollNo: '' })
          if (baseStudents.length === 0 && filterDto.rollNo)
            baseStudents = applyLocalFilters(allStudents, { ...data, searchClass: '', searchSection: '', searchKeyword: '' })
        } else {
          baseStudents = allStudents
        }
        setFilteredData(applyLocalFilters(baseStudents, { searchClass: data.searchClass, searchSection: data.searchSection, searchRollNo: data.searchRollNo, searchKeyword: '' }))
      } catch (err) {
        console.warn('Backend filter failed, falling back to local:', err)
        setFilteredData(applyLocalFilters(allStudents, data))
      } finally {
        setIsFiltering(false)
      }
    },
    [allStudents, txMap, applyLocalFilters],
  )

  const handleReset = () => {
    resetForm(); setSelectedClassForSections(0)
    setIsFilterActive(false); setFilteredData(allStudents); setShowResults(false)
  }

  const handlePrint = (student: StudentDueFeesData) => {
    setSelectedStudentForPrint(student)
    setIsPrintModalOpen(true)
  }

  const renderReceiptContent = (copyLabel: string) => {
    if (!selectedStudentForPrint) return null
    const student = selectedStudentForPrint

    return (
      <div className="border-2 border-gray-800 rounded-lg print:rounded-none print:border-black relative">

        {/* Copy label */}
        <div className="absolute top-2 right-3 text-xs font-bold text-gray-400 uppercase tracking-widest print:text-gray-500">
          {copyLabel}
        </div>

        {/* School header with logo */}
        <div className="px-6 py-4 border-b-2 border-gray-800 print:border-black flex items-center gap-4">
          <div className="shrink-0 w-16 h-16 rounded-full border-2 border-gray-700 flex items-center justify-center overflow-hidden bg-gray-100">
            {logoLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            ) : schoolLogoUrl && !logoError ? (
              <img src={schoolLogoUrl} alt="School Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-gray-500 text-center font-semibold leading-tight px-1">LOGO</span>
            )}
          </div>

          <div className="flex-1 text-center">
            {showSchoolLoader ? (
              <div className="flex justify-center py-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              </div>
            ) : (
              <>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800 print:text-xl leading-tight">
                  {schoolName || '—'}
                </h1>
                {schoolManagedBy && (
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mt-0.5 print:text-xs">
                    Managed by: {schoolManagedBy}
                  </p>
                )}
                {schoolAddress && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 print:text-xs">
                    {schoolAddress}
                  </p>
                )}
                {(schoolWebSite || schoolPhone || schoolEmail) && (
                  <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-0.5 mt-1 text-xs text-gray-500">
                    {schoolWebSite && (
                      <span><span className="font-medium text-gray-600">Web:</span>{' '}
                        <span className="text-blue-600">{schoolWebSite}</span></span>
                    )}
                    {schoolPhone && (
                      <span><span className="font-medium text-gray-600">Ph:</span> {schoolPhone}</span>
                    )}
                    {schoolEmail && (
                      <span><span className="font-medium text-gray-600">Email:</span> {schoolEmail}</span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Receipt label */}
        <div className="text-center py-2 border-b border-gray-300 bg-gray-50">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-[0.2em]">Fee Receipt</h2>
        </div>

        {/* Student info — 4-column grid matching SearchDueFees */}
        <div className="px-6 py-3 border-b-2 border-gray-800 print:border-black">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1.5 text-xs">
            {[
              { label: 'Admission No', value: student.admissionNo },
              { label: 'Student Name', value: student.studentName },
              { label: "Father's Name", value: student.fatherName || '—' },
              { label: 'Mobile No', value: student.mobileNo || '—' },
              { label: 'Roll No', value: String(student.rollNumber) },
              { label: 'Class', value: student.class },
              { label: 'Section', value: student.section },
              { label: 'Date', value: currentDate },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-1 min-w-0">
                <span className="font-semibold text-gray-700 whitespace-nowrap shrink-0">{label}:</span>
                <span className="text-gray-800 truncate">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee table */}
        <div className="px-6 py-3 border-b-2 border-gray-800 print:border-black">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100">
                  {[
                    { h: 'Fee Type', a: 'text-left' },
                    { h: 'Status', a: 'text-center' },
                    { h: 'Total (₹)', a: 'text-right' },
                    { h: 'Paid (₹)', a: 'text-right' },
                    { h: 'Pending (₹)', a: 'text-right' },
                  ].map(({ h, a }) => (
                    <th key={h} className={`border border-gray-300 print:border-black px-3 py-2 font-semibold text-gray-700 ${a}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {student.feesList && student.feesList.length > 0 ? (
                  <>
                    {student.feesList.map((fee, i) => {
                      const feeAmount = parseFloat(fee.totalFees) || 0
                      const feePaid = parseFloat(fee.paid) || 0
                      const feePending = parseFloat(fee.pending) || 0
                      const status = getPaymentStatus(feeAmount, feePaid)
                      return (
                        <tr key={fee.feeTypeId ?? i} className="even:bg-gray-50/50">
                          <td className="border border-gray-300 print:border-black px-3 py-2 text-gray-800 whitespace-nowrap">{fee.feeTypeName}</td>
                          <td className="border border-gray-300 print:border-black px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${getStatusColor(status)}`}>{status}</span>
                          </td>
                          <td className="border border-gray-300 print:border-black px-3 py-2 text-right text-gray-800">{feeAmount.toFixed(2)}</td>
                          <td className="border border-gray-300 print:border-black px-3 py-2 text-right text-green-700 font-semibold">{feePaid.toFixed(2)}</td>
                          <td className={`border border-gray-300 print:border-black px-3 py-2 text-right font-bold ${feePending > 0 ? 'text-red-600' : 'text-green-600'}`}>{feePending.toFixed(2)}</td>
                        </tr>
                      )
                    })}
                    {/* Grand total row */}
                    <tr className="bg-white font-bold text-gray-900">
                      <td colSpan={2} className="border border-gray-400 print:border-black px-3 py-3 text-xs font-bold uppercase">Grand Total</td>
                      <td className="border border-gray-400 print:border-black px-3 py-3 text-right text-xs">{student.totalFees.toFixed(2)}</td>
                      <td className="border border-gray-400 print:border-black px-3 py-3 text-right text-xs text-green-700">{student.paidFees.toFixed(2)}</td>
                      <td className={`border border-gray-400 print:border-black px-3 py-3 text-right text-xs font-bold ${student.pending > 0 ? 'text-red-600' : 'text-green-600'}`}>{student.pending.toFixed(2)}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={5} className="border border-gray-300 px-3 py-4 text-center text-gray-400 italic">
                      No fee transactions found for this student
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Discount / Fine note */}
        {(student.discount > 0 || student.fine > 0) && (
          <div className="px-6 pt-2 pb-0 flex flex-wrap gap-4 justify-end text-xs text-gray-600">
            {student.discount > 0 && (
              <span>Discount Applied: <strong className="text-blue-700">₹{student.discount.toFixed(2)}</strong></span>
            )}
            {student.fine > 0 && (
              <span>Fine: <strong className="text-red-600">₹{student.fine.toFixed(2)}</strong></span>
            )}
          </div>
        )}

        {/* Authorised signatory (right-aligned, matching SearchDueFees) */}
        <div className="px-6 py-4">
          <div className="flex justify-end">
            <div className="text-center w-1/2">
              <div className="h-12 border-b border-gray-400 print:border-black mb-2" />
              <p className="text-xs font-semibold text-gray-700">Authorised Signatory</p>
              <p className="text-xs text-gray-500 mt-0.5">{schoolName || 'School'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const displayData = isFilterActive ? filteredData : []
  const loading = isLoadingBase || isFiltering


  return (
    <>
      {/* ── Main page ── */}
      <div className="p-2 sm:p-4 bg-gray-100 min-h-screen print:hidden">
        <div className="bg-white p-3 sm:p-6 rounded-md shadow-md">
          <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
            {Text.Fees_Receipt }
          </h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            {[
              { label: Text.Total_Students, value: allStudents.length, color: 'blue' },
              { label: Text.Fully_Paid || 'Fully Paid', value: allStudents.filter((s) => s.pending <= 0).length, color: 'green' },
              { label: Text.Partial_Paid || 'Partial Paid', value: allStudents.filter((s) => s.pending > 0 && s.paidFees > 0).length, color: 'orange' },
              { label: Text.Unpaid || 'Unpaid', value: allStudents.filter((s) => s.paidFees === 0).length, color: 'red' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`bg-${color}-50 p-3 sm:p-4 rounded-lg border border-${color}-200`}>
                <p className={`text-xs sm:text-sm text-${color}-600 font-medium`}>{label}</p>
                <p className={`text-xl sm:text-2xl font-bold text-${color}-700`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{Text.Search_Filter}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Dropdown label={Text.Class || 'Class'} name="searchClass" control={control} required={false} options={classOptions} />
              <Dropdown label={NameText.Section || 'Section'} name="searchSection" control={control} required={false} options={sectionOptions} />
              <TextFields name="searchKeyword" label={Text.Search_By_Name_Admission_No} placeholder={Text.Enter_Name_Or_Admission_No} control={control} required={false} />
              <TextFields name="searchRollNo" label={Text.Roll_No} placeholder={Text.Enter_Roll_Number} control={control} required={false} />
            </div>
            <div className="flex items-center justify-end gap-2 mt-3 sm:mt-4">
              <Button name={Text.Cancel} loading={false} icon={<IconField name="FaTimes" size={14} />} onClick={handleReset} showAlways={true} />
              <Button name={Text.Search || 'Search'} loading={loading} icon={<IconField name="FaSearch" size={14} />} onClick={handleSubmit(onSearch)} showAlways={true} />
            </div>
          </div>

          {isFiltering && (
            <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-3 sm:px-4 py-2">
              <IconField name="FaSpinner" size={14} className="animate-spin" />
              <span>{Text.Searching_Records_On_Server}</span>
            </div>
          )}
        </div>

        {/* Results table */}
        {showResults && (
          <div className="mt-4 sm:mt-6">
            {loading ? (
              <div className="flex justify-center items-center p-8 bg-white rounded-md shadow-md">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : displayData.length === 0 ? (
              <div className="bg-white p-8 rounded-md shadow-md text-center text-gray-500">
                {Text.No_Record_Found || 'No records found'}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {displayData.map((student, index) => (
                  <div key={index} className="bg-white p-3 sm:p-4 rounded-md shadow-md">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-1 text-sm text-gray-700 flex-1">
                        <div><strong>{Text.Admission_No || 'Admission No'}:</strong> <span className="break-all">{student.admissionNo}</span></div>
                        <div><strong>{Text.Name || 'Name'}:</strong> {student.studentName}</div>
                        <div><strong>{Text.Roll_No || 'Roll No'}:</strong> {student.rollNumber}</div>
                        <div><strong>{Text.Class || 'Class'}:</strong> {student.class} ({student.section})</div>
                        <div><strong>{Text.Date || 'Date'}:</strong> {currentDate}</div>
                      </div>
                      <div className="shrink-0 self-start sm:self-auto">
                        <Button name="" loading={false} icon={<IconField name="FaPrint" size={16} />} onClick={() => handlePrint(student)} showAlways={true} />
                      </div>
                    </div>

                    <div className="mt-2 overflow-x-auto -mx-3 sm:mx-0">
                      <div className="min-w-120 px-3 sm:px-0 sm:min-w-0">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {[
                                { label: Text.Date || 'Date', align: 'text-left' },
                                { label: Text.Fee_Type || 'Fee Type', align: 'text-left' },
                                { label: Text.Status || 'Status', align: 'text-center' },
                                { label: Text.Amount || 'Amount (₹)', align: 'text-right' },
                                { label: Text.Paid || 'Paid', align: 'text-right' },
                                { label: Text.Pending || 'Pending', align: 'text-right' }
                              ].map((h) => (
                                <th key={h.label} className={`px-2 sm:px-3 py-2 text-xs font-medium text-gray-500 uppercase ${h.align}`}>
                                  {h.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {student.feesList && student.feesList.length > 0 ? (
                              <>
                                {student.feesList.map((fee, feeIndex) => {
                                  const feeAmount = parseFloat(fee.totalFees) || 0
                                  const feePaid = parseFloat(fee.paid) || 0
                                  const feePending = parseFloat(fee.pending) || 0
                                  const status = getPaymentStatus(feeAmount, feePaid)
                                  return (
                                    <tr key={feeIndex}>
                                      <td className="px-2 sm:px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{fee.date}</td>
                                      <td className="px-2 sm:px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{fee.feeTypeName}</td>
                                      <td className="px-2 sm:px-3 py-2 text-center whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>{status}</span>
                                      </td>
                                      <td className="px-2 sm:px-3 py-2 text-sm text-right text-gray-900 whitespace-nowrap">{feeAmount.toFixed(2)}</td>
                                      <td className="px-2 sm:px-3 py-2 text-sm text-right text-green-600 font-semibold whitespace-nowrap">{feePaid.toFixed(2)}</td>
                                      <td className={`px-2 sm:px-3 py-2 text-sm text-right font-bold whitespace-nowrap ${feePending > 0 ? 'text-red-500' : 'text-green-600'}`}>{feePending.toFixed(2)}</td>
                                    </tr>
                                  )
                                })}
                                <tr className="bg-gray-100 font-bold">
                                  <td colSpan={3} className="px-2 sm:px-3 py-2 text-sm text-right text-gray-900">{Text.Grand_Total || 'Grand Total'}</td>
                                  <td className="px-2 sm:px-3 py-2 text-sm text-right text-gray-900">{student.totalFees.toFixed(2)}</td>
                                  <td className="px-2 sm:px-3 py-2 text-sm text-right text-green-600">{student.paidFees.toFixed(2)}</td>
                                  <td className={`px-2 sm:px-3 py-2 text-sm text-right ${student.pending > 0 ? 'text-red-500' : 'text-green-600'}`}>{student.pending.toFixed(2)}</td>
                                </tr>
                              </>
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-3 py-4 text-center text-sm text-gray-500">No fee transactions found</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Print modal ── */}
      {isPrintModalOpen && selectedStudentForPrint && (
        <>
          {/* Screen preview */}
          <div className="fee-receipt-screen fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">
              <div className="flex justify-between items-center px-5 py-3 border-b border-gray-200 shrink-0">
                <h2 className="text-base font-bold text-gray-800">Fee Receipt Preview</h2>
                <div className="flex gap-2">
                  <Button name="Print" loading={false} icon={<IconField name="FaPrint" size={14} />} onClick={() => window.print()} showAlways={true} />
                  <Button
                    name="Close"
                    loading={false}
                    onClick={() => { setIsPrintModalOpen(false); setSelectedStudentForPrint(null) }}
                    showAlways={true}
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 px-4 py-4">
                {renderReceiptContent('Office Copy')}
                <CutLine />
                {renderReceiptContent('Student Copy')}
              </div>
            </div>
          </div>

          {/* Hidden printable area */}
          <div id="fee-receipt-printable">
            {renderReceiptContent('Office Copy')}
            <CutLine />
            {renderReceiptContent('Student Copy')}
          </div>
        </>
      )}

      <style>{`
        .cut-line-print { display: none; }

        @media print {
          @page { size: A4 portrait; margin: 8mm 10mm; }

          body * { visibility: hidden !important; }

          .fee-receipt-screen { display: none !important; }

          #fee-receipt-printable,
          #fee-receipt-printable * { visibility: visible !important; }

          #fee-receipt-printable {
            position: fixed; top: 0; left: 0;
            width: 190mm; padding: 0; margin: 0; background: white; font-size: 10px;
          }

          #fee-receipt-printable .cut-line-screen { display: none !important; }
          #fee-receipt-printable .cut-line-print  { display: block !important; visibility: visible !important; }
          #fee-receipt-printable .cut-line-print * { visibility: visible !important; }

          #fee-receipt-printable > div:first-child,
          #fee-receipt-printable > div:last-child { page-break-inside: avoid; }

          #fee-receipt-printable .px-6 { padding-left: 10px !important; padding-right: 10px !important; }
          #fee-receipt-printable .py-4 { padding-top: 6px !important; padding-bottom: 6px !important; }
          #fee-receipt-printable .py-3 { padding-top: 4px !important; padding-bottom: 4px !important; }
          #fee-receipt-printable .py-2 { padding-top: 3px !important; padding-bottom: 3px !important; }
          #fee-receipt-printable .gap-y-1\\.5 { row-gap: 3px !important; }
          #fee-receipt-printable .h-12 { height: 28px !important; }
          #fee-receipt-printable .w-16 { width: 48px !important; }
          #fee-receipt-printable .h-16 { height: 48px !important; }
          #fee-receipt-printable h1    { font-size: 14px !important; }
          #fee-receipt-printable h2    { font-size: 10px !important; }
          #fee-receipt-printable table { font-size: 9px !important; }
          #fee-receipt-printable td,
          #fee-receipt-printable th   { padding: 2px 6px !important; }
          #fee-receipt-printable .rounded-lg { border-radius: 0 !important; }

          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </>
  )
}

export default FeeReceipt