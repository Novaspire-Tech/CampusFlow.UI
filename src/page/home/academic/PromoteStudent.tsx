import React, { useState, useMemo, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import Dropdown from '../../../components/controlled/Dropdown'
import Button from '../../../components/controlled/Button'
import AmountField from '../../../components/controlled/AmountField'
import {
  useSchoolClasses,
  useSchoolClassesBySession,
} from '../../../hooks/queries/academics/useClasses'
import { useSections } from '../../../hooks/queries/academics/useSections'
import { useSessions } from '../../../hooks/queries/systemSettinds/useSessionSetting'
import { useFeeTypes } from '../../../hooks/queries/feesCollection/useFeeTypes'
import { useGetClassFees } from '../../../hooks/queries/feesCollection/useClassFees'
import { useStudents } from '../../../hooks/queries/studentInformation/useStudents'
import { usePromoteStudents } from '../../../hooks/queries/academics/usePromoteStudent'
import { studentService } from '../../../services/studentInformation/studentService'

import type {
  PromoteStudentRequest,
  PromotionFee,
  StudentStatus,
  SessionStatus,
  StudentStatusType,
} from '../../../types/academics/promoteStudentTypes'
import { useDepartmentsByClassId } from '../../../hooks/queries/academics/useDepartments'
import type { Department } from '../../../types/academics/departments'
import { toast } from 'react-toastify'
import { getPagesDataText } from '../../../helpers/useTranslations'
import { useTranslation } from 'react-i18next'

interface StudentWithStatus {
  studentId: number
  admissionNo: string
  firstName: string
  lastName: string
  fatherName: string
  dob: string
  currentResult: StudentStatusType
  nextSessionStatus: SessionStatus
}

const StudentPromotion: React.FC = () => {

  const { t } = useTranslation()
  const Text = getPagesDataText(t)

  const { control, handleSubmit, setValue, getValues, watch } = useForm<any>({
    defaultValues: {
      currentClass: '',
      currentSection: '',
      promoteClass: '',
      promoteSection: '',
      promoteSession: '',
      fees: {},
    },
  })

  const currentClassId = useWatch({ control, name: 'currentClass' })
  const currentSectionId = useWatch({ control, name: 'currentSection' })
  const promoteClassId = useWatch({ control, name: 'promoteClass' })
  const promoteSectionId = useWatch({ control, name: 'promoteSection' })
  const promoteSessionId = useWatch({ control, name: 'promoteSession' })
  const fees = watch('fees') || {}

  const [showTable, setShowTable] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [showModal, setShowModal] = useState(false)
  const [studentResults, setStudentResults] = useState<Map<number, StudentWithStatus>>(new Map())
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [selectedFeeTypes, setSelectedFeeTypes] = useState<string[]>([])
  const [filteredStudentIds, setFilteredStudentIds] = useState<Set<string> | null>(null)
  const [isFeesForward, setIsFeesForward] = useState(false)

  const { data: classesData } = useSchoolClasses()

  const { data: sessionClassesData, isLoading: isLoadingSessionClasses } =
    useSchoolClassesBySession(promoteSessionId ? String(promoteSessionId) : undefined)

  // When session changes, reset dependent fields
  useEffect(() => {
    if (promoteSessionId) {
      setValue('promoteClass', '')
      setValue('departmentId', '')
      setValue('promoteSection', '')
    }
  }, [promoteSessionId, setValue])

  // When promoteClass changes, reset department and section
  useEffect(() => {
    setValue('departmentId', '')
    setValue('promoteSection', '')
  }, [promoteClassId, setValue])

  const { data: currentSectionsData, isLoading: isLoadingCurrentSections } = useSections(
    currentClassId ? Number(currentClassId) : 0,
  )
  const { data: promoteSectionsData, isLoading: isLoadingPromoteSections } = useSections(
    promoteClassId ? Number(promoteClassId) : 0,
  )

  const { data: sessionsData } = useSessions()
  const { data: feeTypesData } = useFeeTypes()
  const { data: allStudentsResponse, isLoading: isLoadingStudents } = useStudents(0, 100000, 'asc')

  const { data: departmentsData = [] } = useDepartmentsByClassId(
    promoteClassId ? Number(promoteClassId) : undefined,
  )

  const allStudentsLeaving = useMemo(() => {
    if (selectedRows.length === 0) return false
    return selectedRows.every((studentId) => {
      const student = studentResults.get(studentId)
      return student?.nextSessionStatus === 'LEAVE'
    })
  }, [selectedRows, studentResults])

  const hasContinuingStudents = useMemo(() => {
    if (selectedRows.length === 0) return false
    return selectedRows.some((studentId) => {
      const student = studentResults.get(studentId)
      return student?.nextSessionStatus === 'CONTINUE'
    })
  }, [selectedRows, studentResults])

  const shouldFetchClassFees =
    hasContinuingStudents && promoteClassId !== '' && selectedFeeTypes.length > 0

  const { data: classFees, isLoading: isLoadingClassFees } = useGetClassFees(
    {
      feeTypeIds: selectedFeeTypes.map((id) => parseInt(id, 10)),
      schoolClassId: promoteClassId ? parseInt(promoteClassId, 10) : 0,
    },
    shouldFetchClassFees,
  )

  const promoteStudentsMutation = usePromoteStudents()

  const filteredStudents = useMemo(() => {
    if (!allStudentsResponse?.students || !currentClassId || !currentSectionId || !showTable) {
      return []
    }
    const byClassSection = allStudentsResponse.students.filter((student: any) => {
      return (
        String(student.classId) === String(currentClassId) &&
        String(student.sectionId) === String(currentSectionId)
      )
    })

    if (filteredStudentIds && filteredStudentIds.size > 0) {
      return byClassSection.filter((student: any) =>
        filteredStudentIds.has(String(student.studentId || student.id)),
      )
    }
    return byClassSection
  }, [allStudentsResponse, currentClassId, currentSectionId, showTable, filteredStudentIds])

  useEffect(() => {
    if (hasContinuingStudents && classFees && Array.isArray(classFees) && classFees.length > 0) {
      classFees.forEach((classFee: any) => {
        const feeTypeId = String(classFee.feesTypeId)
        if (selectedFeeTypes.includes(feeTypeId)) {
          const currentFeeData = fees?.[feeTypeId]
          const currentTotalFees = currentFeeData?.totalFees
          const shouldAutoPopulate =
            !currentTotalFees ||
            currentTotalFees === '' ||
            currentTotalFees === '0' ||
            currentTotalFees === '0.00'
          if (shouldAutoPopulate) {
            const feeAmount = String(classFee.fee || 0)
            const classFeesId = String(classFee.classFeesId || 0)
            setValue(`fees.${feeTypeId}`, {
              totalFees: feeAmount,
              paid: '0',
              pending: feeAmount,
              classFeesId,
            })
          }
        }
      })
    }
  }, [classFees, selectedFeeTypes, hasContinuingStudents, fees, setValue])

  useEffect(() => {
    if (!hasContinuingStudents) return
    selectedFeeTypes.forEach((feeTypeId) => {
      const feeData = fees?.[feeTypeId]
      const totalFees = feeData?.totalFees
      const paid = feeData?.paid
      if (totalFees && paid) {
        const total = parseFloat(totalFees) || 0
        const paidAmount = parseFloat(paid) || 0
        const pendingAmount = total - paidAmount
        const newPending = pendingAmount.toFixed(2)
        if (feeData?.pending !== newPending) {
          setValue(`fees.${feeTypeId}.pending`, newPending)
        }
      } else if (totalFees) {
        if (feeData?.pending !== totalFees) {
          setValue(`fees.${feeTypeId}.pending`, totalFees)
        }
      }
    })
  }, [fees, selectedFeeTypes, hasContinuingStudents, setValue])

  useEffect(() => {
    if (filteredStudents && filteredStudents.length > 0) {
      const resultsMap = new Map<number, StudentWithStatus>()
      const initialSelectedRows: number[] = []
      filteredStudents.forEach((student: any) => {
        const studentId = Number(student.studentId || student.id || student.studentID)
        if (!studentId || isNaN(studentId)) return
        resultsMap.set(studentId, {
          studentId,
          admissionNo: student.admissionNo || '',
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          fatherName: student.fatherName || '',
          dob: student.dob || '',
          currentResult: 'PASS',
          nextSessionStatus: 'CONTINUE',
        })
        initialSelectedRows.push(studentId)
      })
      setStudentResults(resultsMap)
      setSelectedRows(initialSelectedRows)
      setSelectAll(initialSelectedRows.length > 0)
    } else {
      setStudentResults(new Map())
      setSelectedRows([])
      setSelectAll(false)
    }
  }, [filteredStudents])

  useEffect(() => {
    if (filteredStudents && filteredStudents.length > 0) {
      const allStudentIds = filteredStudents
        .map((s: any) => Number(s.studentId || s.id || s.studentID))
        .filter((id: number) => !isNaN(id))
      setSelectAll(selectedRows.length === allStudentIds.length && allStudentIds.length > 0)
    } else {
      setSelectAll(false)
    }
  }, [selectedRows, filteredStudents])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 8000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  const onSubmit = async () => {
    if (!currentClassId || !currentSectionId) {
      setErrorMessage('Please select current class and section')
      return
    }
    setIsLoadingSearch(true)
    try {
      try {
        const result = await studentService.search(
          {
            schoolClassId: String(currentClassId),
            sectionId: String(currentSectionId),
          },
          0,
          100000,
          'admissionNo',
          'asc',
        )
        const idSet = new Set<string>(
          (result.students || []).map((s: any) => String(s.studentId || s.id)),
        )
        setFilteredStudentIds(idSet.size > 0 ? idSet : null)
      } catch {
        setFilteredStudentIds(null)
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
      setShowTable(true)
    } catch {
      toast.error('Failed to search students')
    } finally {
      setIsLoadingSearch(false)
    }
  }

  const toggleSelectAll = () => {
    if (!filteredStudents || filteredStudents.length === 0) return
    const allStudentIds = filteredStudents
      .map((s: any) => Number(s.studentId || s.id || s.studentID))
      .filter((id: number) => !isNaN(id))
    if (!selectAll) {
      setSelectedRows(allStudentIds)
    } else {
      setSelectedRows([])
    }
    setSelectAll(!selectAll)
  }

  const toggleRowSelection = (id: number) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleFeeTypeToggle = (feeTypeId: string) => {
    if (!hasContinuingStudents) {
      toast.error('Cannot add fees when all students are marked as LEAVE')
      return
    }
    setSelectedFeeTypes((prev) => {
      if (prev.includes(feeTypeId)) {
        const updatedFees = { ...fees }
        delete updatedFees[feeTypeId]
        setValue('fees', updatedFees)
        return prev.filter((id) => id !== feeTypeId)
      } else {
        let classFeesId = ''
        let feeAmount = ''
        if (classFees && Array.isArray(classFees)) {
          const classFee = classFees.find((cf: any) => String(cf.feesTypeId) === feeTypeId)
          if (classFee) {
            classFeesId = classFee.classFeesId ? String(classFee.classFeesId) : '0'
            feeAmount = classFee.fee ? String(classFee.fee) : ''
          }
        }
        setValue(`fees.${feeTypeId}`, {
          totalFees: feeAmount || '',
          paid: '0',
          pending: feeAmount || '0',
          classFeesId: classFeesId || '0',
        })
        return [...prev, feeTypeId]
      }
    })
  }

  const updateStudentResult = (
    studentId: number,
    field: 'currentResult' | 'nextSessionStatus',
    value: StudentStatusType | SessionStatus,
  ) => {
    setStudentResults((prev) => {
      const newMap = new Map(prev)
      const student = newMap.get(studentId)
      if (student) {
        newMap.set(studentId, { ...student, [field]: value })
      }
      return newMap
    })
  }

  const handlePromote = () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one student to promote')
      return
    }

    // const hasInvalidCombination = selectedRows.some((studentId) => {
    //   const student = studentResults.get(studentId)
    //   return student?.currentResult === 'FAIL' && student?.nextSessionStatus === 'CONTINUE'
    // })
    // if (hasInvalidCombination) {
    //   toast.error(
    //     'Students who FAIL cannot CONTINUE to next session. Please mark FAIL students as LEAVE.',
    //   )
    //   return
    // }

    if (hasContinuingStudents) {
      if (!promoteClassId || !promoteSectionId || !promoteSessionId) {
        toast.error(
          'Please fill in all promotion details (class, section, session) for continuing students',
        )
        return
      }
      if (selectedFeeTypes.length === 0) {
        toast.error('Please select at least one fee type for continuing students')
        return
      }
      const invalidFees = selectedFeeTypes.filter((feeTypeId) => {
        const feeData = fees?.[feeTypeId]
        return (
          !feeData || !feeData.totalFees || feeData.totalFees === '0' || feeData.totalFees === ''
        )
      })
      if (invalidFees.length > 0) {
        toast.error('Please enter valid amounts for all selected fee types')
        return
      }
    }

    setShowModal(true)
  }

  const confirmPromotion = async () => {
    try {
      setErrorMessage('')
      setSuccessMessage('')
      const formValues = getValues()

      let selectedSession = null
      if (hasContinuingStudents) {
        selectedSession = sessionsData?.find(
          (s: any) => String(s.sessionId || s.id) === String(formValues.promoteSession),
        )
        if (!selectedSession) {
          toast.error('Invalid session selected for continuing students')
          setShowModal(false)
          return
        }
      }

      const students: StudentStatus[] = selectedRows.map((studentId) => {
        const studentData = studentResults.get(studentId)
        return {
          studentId,
          status: studentData?.currentResult === 'FAIL' ? 'FAIL' : 'PASS',
          nextSessionStatus: studentData?.nextSessionStatus === 'LEAVE' ? 'LEAVE' : 'CONTINUE',
        }
      })

      let requestData: PromoteStudentRequest

      if (allStudentsLeaving) {
        requestData = {
          classId: null,
          departmentId: null,
          sectionId: null,
          sessionName: null,
          fees: null,
          isFeesForward,
          students,
        }
      } else {
        const promotionFees: PromotionFee[] = selectedFeeTypes.map((feeTypeId) => {
          const feeData = fees?.[feeTypeId] || {}
          return {
            feeTypeId: parseInt(feeTypeId, 10),
            classFeeId: feeData?.classFeesId ? parseInt(feeData.classFeesId, 10) : 0,
            totalFees: feeData?.totalFees || '0',
            paid: feeData?.paid || '0',
          }
        })
        requestData = {
          classId: Number(formValues.promoteClass),
          departmentId: Number(formValues.departmentId),
          sectionId: Number(formValues.promoteSection),
          sessionName: selectedSession?.session || selectedSession?.sessionName || '',
          fees: promotionFees,
          isFeesForward,
          students,
        }
      }

      await promoteStudentsMutation.mutateAsync(requestData)

      toast.success(`Successfully processed ${selectedRows.length} student(s)!`)
      setShowModal(false)

      setTimeout(() => {
        setShowTable(false)
        setSelectedRows([])
        setSelectAll(false)
        setStudentResults(new Map())
        setValue('currentClass', '')
        setValue('currentSection', '')
        setValue('promoteClass', '')
        setValue('departmentId', '')
        setValue('promoteSection', '')
        setValue('promoteSession', '')
        setSelectedFeeTypes([])
        setValue('fees', {})
        setIsFeesForward(false)
        setFilteredStudentIds(null)
      }, 2000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to process students')
      setShowModal(false)
    }
  }

  const getClassFeesStatus = () => {
    if (!promoteClassId || !hasContinuingStudents) return null
    if (isLoadingClassFees && selectedFeeTypes.length > 0) {
      return (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-800">Loading class fees...</span>
        </div>
      )
    }
    return null
  }

  const statistics = useMemo(() => {
    if (studentResults.size === 0) return null
    const totalStudents = studentResults.size
    const continuingStudents = Array.from(studentResults.values()).filter(
      (s) => s.nextSessionStatus === 'CONTINUE',
    ).length
    const leavingStudents = totalStudents - continuingStudents
    const passedStudents = Array.from(studentResults.values()).filter(
      (s) => s.currentResult === 'PASS',
    ).length
    const failedStudents = totalStudents - passedStudents
    return {
      totalStudents,
      continuingStudents,
      leavingStudents,
      passedStudents,
      failedStudents,
      allStudentsLeaving: leavingStudents === totalStudents,
    }
  }, [studentResults])

  const promoteClassOptions = useMemo(() => {
    if (!promoteSessionId) {
      return [{ value: '', label: 'Please select a session first' }]
    }
    if (isLoadingSessionClasses) {
      return [{ value: '', label: 'Loading classes...' }]
    }
    if (!sessionClassesData || sessionClassesData.length === 0) {
      return [{ value: '', label: 'No classes available for this session' }]
    }
    return sessionClassesData.map((c: any) => ({
      value: String(c.id || c.schoolClassId),
      label: c.name || c.className,
    }))
  }, [promoteSessionId, isLoadingSessionClasses, sessionClassesData])

  const isLoading = promoteStudentsMutation.isPending

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {Text.Promote_Students || 'Promote Students'}
          </h1>
          <p className="text-slate-600 text-sm mt-1">{Text.Promote_Students_In_Next_Session || 'Promote students in the next session'}</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-sm">
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">{Text.Search_Student || 'Search Students'}</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Dropdown
                label={Text.Current_Class || 'Current Class'}
                name="currentClass"
                control={control}
                required
                options={
                  classesData?.map((c: any) => ({
                    value: String(c.id || c.schoolClassId),
                    label: c.name || c.className,
                  })) || []
                }
              />
              <Dropdown
                label={Text.Current_Section || 'Current Section'}
                name="currentSection"
                control={control}
                required
                options={
                  !currentClassId
                    ? [{ value: '', label: 'Please select a class first' }]
                    : isLoadingCurrentSections
                      ? [{ value: '', label: 'Loading sections...' }]
                      : !currentSectionsData || currentSectionsData.length === 0
                        ? [{ value: '', label: 'No sections available' }]
                        : currentSectionsData.map((s: any) => ({
                          value: String(s.id || s.sectionId),
                          label: s.name || s.sectionName,
                        }))
                }
              />
            </div>
            <div className="flex justify-end">
              <Button
                name={isLoadingSearch ? Text.Search : Text.Search_Student}
                loading={isLoadingSearch}
                showAlways={true}
              />
            </div>
          </form>
        </div>

        {/* Statistics */}
        {showTable && statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">{Text.Total_Students || 'Total Students'}</div>
              <div className="text-2xl font-bold text-slate-800">{statistics.totalStudents}</div>
            </div>
            <div className="bg-white rounded-xl shadow border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">{Text.Continuing || 'Continuing'}</div>
              <div className="text-2xl font-bold text-green-600">
                {statistics.continuingStudents}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">{Text.Leaving || 'Leaving'}</div>
              <div className="text-2xl font-bold text-orange-600">{statistics.leavingStudents}</div>
            </div>
            <div className="bg-white rounded-xl shadow border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">{Text.Passed || 'Passed'}</div>
              <div className="text-2xl font-bold text-blue-600">{statistics.passedStudents}</div>
            </div>
          </div>
        )}

        {/* Students Table */}
        {showTable && filteredStudents && filteredStudents.length > 0 && (
          <div className="space-y-6">
            {/* Student List */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-slate-800">
                    {Text.Student_List} ({filteredStudents.length}{Text.Student})
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">
                      Selected: {selectedRows.length} of {filteredStudents.length}
                    </span>
                    {allStudentsLeaving && (
                      <span className="text-sm text-orange-600 font-medium">
                        (All students leaving — no promotion details required)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-linear-to-r from-slate-50 to-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          checked={selectAll}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                      </th>
                      {[
                        Text.Admission_No || 'Admission No',
                        Text.Student_Name || 'Student Name',
                        Text.Father_Name || 'Father Name',
                        Text.Date_Of_Birth || 'Date Of Birth',
                        Text.Current_Result || 'Current Result',
                        Text.Next_Session_Status || 'Next Session Status',
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredStudents.map((student: any) => {
                      const studentId = Number(student.studentId || student.id || student.studentID)
                      const studentStatus = studentResults.get(studentId)
                      if (!studentId || isNaN(studentId)) return null
                      return (
                        <tr
                          key={studentId}
                          className={`hover:bg-blue-50 transition-colors ${selectedRows.includes(studentId) ? 'bg-blue-50' : ''
                            }`}
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(studentId)}
                              onChange={() => toggleRowSelection(studentId)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                            {student.admissionNo}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">{student.fatherName}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">{student.dob}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-4">
                              {(['PASS', 'FAIL'] as StudentStatusType[]).map((val) => (
                                <label key={val} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`result-${studentId}`}
                                    checked={studentStatus?.currentResult === val}
                                    onChange={() =>
                                      updateStudentResult(studentId, 'currentResult', val)
                                    }
                                    className={`w-4 h-4 focus:ring-2 ${val === 'PASS'
                                        ? 'text-green-600 focus:ring-green-500'
                                        : 'text-red-600 focus:ring-red-500'
                                      }`}
                                  />
                                  <span className="text-sm text-slate-700 capitalize">
                                    {val.charAt(0) + val.slice(1).toLowerCase()}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-4">
                              {(['CONTINUE', 'LEAVE'] as SessionStatus[]).map((val) => (
                                <label key={val} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`status-${studentId}`}
                                    checked={studentStatus?.nextSessionStatus === val}
                                    onChange={() =>
                                      updateStudentResult(studentId, 'nextSessionStatus', val)
                                    }
                                    className={`w-4 h-4 focus:ring-2 ${val === 'CONTINUE'
                                        ? 'text-blue-600 focus:ring-blue-500'
                                        : 'text-orange-600 focus:ring-orange-500'
                                      }`}
                                  />
                                  <span className="text-sm text-slate-700 capitalize">
                                    {val.charAt(0) + val.slice(1).toLowerCase()}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Promotion Details */}
            {hasContinuingStudents && (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">
                  {Text.Promotion_Details || 'Promotion Details'} ({Text.For_Continuing_Students_Only || 'only for continuing students'})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* STEP 1 — Session (controls class list) */}
                  <Dropdown
                    label={Text.Promote_To_Session || 'Promote to Session'}
                    name="promoteSession"
                    control={control}
                    required
                    options={
                      sessionsData?.map((s: any) => ({
                        value: String(s.sessionId || s.id),
                        label: s.session || s.sessionName,
                      })) || []
                    }
                  />

                  <Dropdown
                    label={Text.Promote_To_Class || 'Promote to Class'}
                    name="promoteClass"
                    control={control}
                    required
                    disabled={!promoteSessionId}
                    options={promoteClassOptions}
                  />

                  {/* STEP 3 — Department filtered by class */}
                  <Dropdown
                    label={Text.Department || 'Department'}
                    name="departmentId"
                    control={control}
                    required
                    disabled={!promoteClassId}
                    options={
                      !promoteClassId
                        ? [{ value: '', label: 'Select a class first' }]
                        : departmentsData.length === 0
                          ? [{ value: '', label: 'No departments available' }]
                          : departmentsData.map((d: Department) => ({
                            value: String(d.departmentId || d.id),
                            label: d.departmentName || d.name,
                          }))
                    }
                  />

                  {/* Section filtered by class */}
                  <Dropdown
                    label={Text.Promote_To_Section || 'Promote to Section'}
                    name="promoteSection"
                    control={control}
                    required
                    disabled={!promoteClassId}
                    options={
                      !promoteClassId
                        ? [{ value: '', label: 'Please select a class first' }]
                        : isLoadingPromoteSections
                          ? [{ value: '', label: 'Loading sections...' }]
                          : !promoteSectionsData || promoteSectionsData.length === 0
                            ? [{ value: '', label: 'No sections available' }]
                            : promoteSectionsData.map((s: any) => ({
                              value: String(s.id || s.sectionId),
                              label: s.name || s.sectionName,
                            }))
                    }
                  />
                </div>
              </div>
            )}

            {/* Fees Details */}
            {hasContinuingStudents && (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {Text.Fee_Details || 'Fees Details'} ({Text.For_Continuing_Students_Only})
                  </h3>
                  <label className="flex items-center gap-3 cursor-pointer select-none group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="isFeesForward"
                        checked={isFeesForward}
                        onChange={(e) => setIsFeesForward(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div
                        className={`w-11 h-6 rounded-full transition-colors duration-200 ${isFeesForward ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                      />
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isFeesForward ? 'translate-x-5' : 'translate-x-0'
                          }`}
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-700">{Text.Forward_Due_Fees}</span>
                      <p className="text-xs text-slate-500 leading-tight">
                        {Text.Add_Pending_Fees_From_Previous_Session}
                      </p>
                    </div>
                  </label>
                </div>

                {isFeesForward && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <p className="text-xs text-amber-700">
                      {Text.Due_Fees_Forward_On_Message}
                    </p>
                  </div>
                )}

                {!promoteClassId && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                    {Text.Select_Class_First_For_Fee_Types || 'Please select a promotion class first to enable fee type selection and auto-population.'}
                  </div>
                )}

                {getClassFeesStatus()}

                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">{Text.Select_Fee_Types}:</p>
                  <div className="flex flex-wrap gap-4">
                    {feeTypesData?.map((feeType: any) => {
                      const feeTypeId = String(feeType.id || feeType.feeTypeId)
                      const isChecked = selectedFeeTypes.includes(feeTypeId)
                      return (
                        <label
                          key={feeTypeId}
                          className={`flex items-center space-x-2 cursor-pointer ${!promoteClassId ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleFeeTypeToggle(feeTypeId)}
                            disabled={!promoteClassId}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                          />
                          <span className="text-sm">{feeType.name || feeType.feeTypeName}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {selectedFeeTypes.length > 0 && (
                  <div className="space-y-6 mt-6">
                    {selectedFeeTypes.map((feeTypeId) => {
                      const feeType = feeTypesData?.find(
                        (ft: any) => String(ft.id || ft.feeTypeId) === feeTypeId,
                      )
                      const feeTypeName = feeType?.name || feeType?.feeTypeName || 'Fee'
                      const classFee = classFees?.find(
                        (cf: any) => String(cf.feesTypeId) === feeTypeId,
                      )
                      return (
                        <div
                          key={feeTypeId}
                          className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-md font-semibold text-blue-600">{feeTypeName}</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <AmountField
                              name={`fees.${feeTypeId}.totalFees`}
                              label="Total Fees"
                              control={control}
                              placeholder={
                                classFee
                                  ? `Auto-populated: ₹${classFee.fee || 0}`
                                  : 'Enter total fees'
                              }
                              required
                            />
                            <AmountField
                              name={`fees.${feeTypeId}.paid`}
                              label={Text.Paid_Amount || 'Paid Amount'}
                              control={control}
                              placeholder='Enter paid amount'
                            />
                            <AmountField
                              name={`fees.${feeTypeId}.pending`}
                              label={Text.Pending_Amount || 'Pending Amount'}
                              control={control}
                              placeholder='Auto-calculated'
                              disabled
                            />
                          </div>
                          {!classFee && promoteClassId && !isLoadingClassFees && (
                            <p className="text-xs text-amber-600 mt-2">
                              No class fee defined for "{feeTypeName}" in the selected class. Please
                              enter manually or configure in Class Fees section.
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {selectedFeeTypes.length === 0 && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded text-center text-gray-500">
                    {Text.No_Fee_Types_Selected}
                  </div>
                )}
              </div>
            )}

            {/* All leaving notice */}
            {allStudentsLeaving && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
                <p className="text-sm text-orange-700">
                  <strong>Note:</strong> All selected students are marked as "LEAVE" (pass-out
                  students). No promotion details or fees are required. These students will be moved
                  to alumni.
                </p>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handlePromote}
                disabled={isLoading || selectedRows.length === 0}
                className="flex items-center gap-2 px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  'Processing...'
                ) : (
                  <>
                    {allStudentsLeaving ? 'Move to Alumni' : Text.Promote} {selectedRows.length}{' '}
                    {Text.Student}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  {allStudentsLeaving ? 'Confirm Move to Alumni' : Text.Confirm_Promotion}
                </h3>
                <p className="text-slate-600 mb-6">
                  {allStudentsLeaving ? (
                    <>
                      {Text.Confirm_Promotion_Message}
                    </>
                  ) : (
                    <>
                      Are you sure you want to promote{' '}
                      <span className="font-semibold">{selectedRows.length} student(s)</span> to the
                      next session? This action cannot be undone.
                    </>
                  )}
                </p>

                <div className="space-y-3 mb-6">
                  {hasContinuingStudents && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">{Text.Promoting_To}:</span>
                      <span className="font-medium text-sm">
                        {(() => {
                          const promoteClass = sessionClassesData?.find(
                            (c: any) => String(c.id || c.schoolClassId) === promoteClassId,
                          )
                          const promoteSection = promoteSectionsData?.find(
                            (s: any) => String(s.id || s.sectionId) === promoteSectionId,
                          )
                          const promoteSession = sessionsData?.find(
                            (s: any) => String(s.sessionId || s.id) === promoteSessionId,
                          )
                          return `${promoteClass?.name || promoteClass?.className} - ${promoteSection?.name || promoteSection?.sectionName
                            } (${promoteSession?.session || promoteSession?.sessionName})`
                        })()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">{Text.Continuing_Students}:</span>
                    <span className="font-medium text-green-600">
                      {statistics?.continuingStudents || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">{Text.Leaving_Students}:</span>
                    <span className="font-medium text-orange-600">
                      {statistics?.leavingStudents || 0}
                    </span>
                  </div>

                  {hasContinuingStudents && (
                    <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                      <span className="text-sm text-slate-600">{Text.Forward_Due_Fees}:</span>
                      <span
                        className={`text-sm font-semibold px-2 py-0.5 rounded ${isFeesForward
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-500'
                          }`}
                      >
                        {isFeesForward ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}

                  {allStudentsLeaving && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <p className="text-sm text-orange-700">
                        <strong>Note:</strong> All students are leaving. They will be moved to
                        alumni without creating new sessions or fees.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isLoading}
                    className="px-5 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    {Text.Cancel}
                  </button>
                  <button
                    type="button"
                    onClick={confirmPromotion}
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading
                      ? 'Processing...'
                      : allStudentsLeaving
                        ? 'Move to Alumni'
                        : Text.Confirm_Promotion}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {showTable && (!filteredStudents || filteredStudents.length === 0) && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Students Found</h3>
            <p className="text-slate-500 mb-4">
              No students found in the selected class and section.
            </p>
            <button
              type="button"
              onClick={() => setShowTable(false)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {Text.Back_To_Search}
            </button>
          </div>
        )}
        {!showTable && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-3">{Text.Student_Promotion}</h3>
            <p className="text-slate-600">
              {Text.Search_Students_For_Promotion}
            </p>
          </div>
        )}

        {isLoadingStudents && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-600">{Text.Loading}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentPromotion
