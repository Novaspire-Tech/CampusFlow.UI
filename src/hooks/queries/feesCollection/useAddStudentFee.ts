import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import {
  addStudentFeeService,
  type SearchStudentsParams,
  type SaveFeesParams,
} from '../../../services/feesCollection/addStudentFeeService'
import type { StudentFeeRecord, FeeRowData } from '../../../types/feesCollection/addStudentFeeTypes'

const calcTotals = (feesList: FeeRowData[]) => ({
  totalFees: feesList.reduce((a, f) => a + (parseFloat(f.totalFees) || 0), 0).toFixed(2),
  totalPaid: feesList.reduce((a, f) => a + (parseFloat(f.paid) || 0), 0).toFixed(2),
  totalPending: feesList.reduce((a, f) => a + (parseFloat(f.pending) || 0), 0).toFixed(2),
})

const patchStudent = (
  prev: StudentFeeRecord[],
  studentId: string,
  newFeesList: FeeRowData[],
): StudentFeeRecord[] =>
  prev.map((s) =>
    String(s.id) !== studentId
      ? s
      : {
          ...s,
          feesList: newFeesList,
          ...calcTotals(newFeesList),
          hasFees: newFeesList.length > 0,
        },
  )

export const studentFeeKeys = {
  all: ['studentFees'] as const,
  search: (params: SearchStudentsParams) => ['studentFees', 'search', params] as const,
}

export const useStudentFeeSearch = () => {
  const [students, setStudents] = useState<StudentFeeRecord[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const search = useCallback(async (params: SearchStudentsParams) => {
    setIsSearching(true)
    setHasSearched(true)
    try {
      const result = await addStudentFeeService.searchStudents(params)
      if (result.length === 0) toast.info('No students found for the selected filters.')
      setStudents(result)
      return result
    } catch (error) {
      console.error('Student fee search error:', error)
      toast.error('Failed to search students')
      setStudents([])
      return []
    } finally {
      setIsSearching(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setStudents([])
    setHasSearched(false)
  }, [])

  const updateStudentLocally = useCallback((studentId: string, newFeesList: FeeRowData[]) => {
    setStudents((prev) => patchStudent(prev, studentId, newFeesList))
  }, [])

  const removeFeeLocally = useCallback((studentId: string, feesId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (String(s.id) !== studentId) return s
        const newFeesList = s.feesList.filter((f) => f.feesId !== feesId)
        return {
          ...s,
          feesList: newFeesList,
          ...calcTotals(newFeesList),
          hasFees: newFeesList.length > 0,
        }
      }),
    )
  }, [])

  const clearStudentFeesLocally = useCallback((studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        String(s.id) !== studentId
          ? s
          : {
              ...s,
              feesList: [],
              totalFees: '0.00',
              totalPaid: '0.00',
              totalPending: '0.00',
              hasFees: false,
            },
      ),
    )
  }, [])

  return {
    students,
    isSearching,
    hasSearched,
    search,
    clearSearch,
    updateStudentLocally,
    removeFeeLocally,
    clearStudentFeesLocally,
  }
}

export const useSaveStudentFees = () =>
  useMutation({
    mutationFn: (params: SaveFeesParams) => addStudentFeeService.saveFees(params),
    onError: (error: any) => {
      console.error('Save student fees mutation error:', error)
    },
  })

export const useDeleteStudentFees = () =>
  useMutation({
    mutationFn: (studentId: string) => addStudentFeeService.deleteStudentFees(studentId),
    onError: (error: any) => {
      console.error('Delete student fees mutation error:', error)
    },
  })

export const useDeleteSingleFee = () =>
  useMutation({
    mutationFn: (feesId: string) => addStudentFeeService.deleteSingleFee(feesId),
    onError: (error: any) => {
      console.error('Delete single fee mutation error:', error)
    },
  })

export const useStudentFee = () => {
  const {
    students,
    isSearching,
    hasSearched,
    search,
    clearSearch,
    updateStudentLocally,
    removeFeeLocally,
    clearStudentFeesLocally,
  } = useStudentFeeSearch()

  const saveMutation = useSaveStudentFees()
  const deleteAllMutation = useDeleteStudentFees()
  const deleteSingleMutation = useDeleteSingleFee()

  const saveFees = useCallback(
    async (params: SaveFeesParams, resolvedFeesList: FeeRowData[]) => {
      const result = await saveMutation.mutateAsync(params)

      if (result.successCount > 0) {
        toast.success(`${result.successCount} fee type(s) saved successfully!`)
        updateStudentLocally(params.studentId, resolvedFeesList)
        window.dispatchEvent(
          new CustomEvent('feesUpdated', {
            detail: { studentId: params.studentId, timestamp: Date.now() },
          }),
        )
      }
      if (result.errorCount > 0) {
        toast.warning(`${result.errorCount} fee type(s) failed: ${result.errors.join(', ')}`)
      }

      return result
    },
    [saveMutation, updateStudentLocally],
  )
  const deleteStudentFees = useCallback(
    async (studentId: string, studentName: string) => {
      await deleteAllMutation.mutateAsync(studentId)
      clearStudentFeesLocally(studentId)
      toast.success(`All fees deleted for ${studentName}`)
      window.dispatchEvent(
        new CustomEvent('feesUpdated', { detail: { studentId, timestamp: Date.now() } }),
      )
    },
    [deleteAllMutation, clearStudentFeesLocally],
  )

  const deleteSingleFee = useCallback(
    async (fee: FeeRowData, studentId: string) => {
      await deleteSingleMutation.mutateAsync(fee.feesId)
      removeFeeLocally(studentId, fee.feesId)
      toast.success(`${fee.feeTypeName} fee deleted successfully`)
      window.dispatchEvent(
        new CustomEvent('feesUpdated', { detail: { studentId, timestamp: Date.now() } }),
      )
    },
    [deleteSingleMutation, removeFeeLocally],
  )

  return {
    // search
    students,
    isSearching,
    hasSearched,
    search,
    clearSearch,

    // save
    saveFees,
    isSaving: saveMutation.isPending,

    // delete all
    deleteStudentFees,
    isDeleting: deleteAllMutation.isPending,

    // delete single
    deleteSingleFee,
    isDeletingSingleFee: deleteSingleMutation.isPending,
  }
}
