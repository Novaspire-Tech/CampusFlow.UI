import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentService } from '../../../services/studentInformation/studentService'
import type {
  StudentFormData,
  StudentSearchParams,
  UpdateCurrentStudentSessionRequestDTO,
} from '../../../types/studentInformation/student'

export const studentKeys = {
  all: ['students'] as const,
  paginated: (page: number, size: number, sort: string) =>
    ['students', 'paginated', page, size, sort] as const,
  search: (
    params: StudentSearchParams,
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string,
  ) => ['students', 'search', { ...params, page, size, sortBy, sortDirection }] as const,
  detail: (id: string) => ['students', id] as const,
  sessionHistory: (id: string) => ['students', id, 'session-history'] as const,
  byClass: (schoolClassId: string, sectionId?: string, page?: number, size?: number) =>
    ['students', 'byClass', schoolClassId, sectionId, page, size] as const,
  byClassAndExamGroup: (schoolClassId: string, examGroupId: string, page?: number, size?: number) =>
    ['students', 'byClassAndExamGroup', schoolClassId, examGroupId, page, size] as const,
  parents: (page: number, size: number, sort: string) =>
    ['students', 'parents', page, size, sort] as const,
}

// GET /student/all
export const useStudents = (page = 0, size = 100, sortDirection = 'asc') => {
  return useQuery({
    queryKey: studentKeys.paginated(page, size, sortDirection),
    queryFn: () => studentService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useSearchStudents = (
  params: StudentSearchParams,
  page = 0,
  size = 10,
  sortBy = 'admissionNo',
  sortDirection: 'asc' | 'desc' = 'asc',
) => {
  const hasFilters = !!(
    params.schoolClassId ||
    params.sectionId ||
    params.searchQuery ||
    params.sessionStatus
  )

  return useQuery({
    queryKey: studentKeys.search(params, page, size, sortBy, sortDirection),
    queryFn: () =>
      hasFilters
        ? studentService.search(params, page, size, sortBy, sortDirection)
        : studentService.getAll(page, size, sortDirection),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  })
}

// GET /student/{id}
export const useStudent = (id: string) => {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => studentService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}
export const useStudentSessionHistory = (id: string) => {
  return useQuery({
    queryKey: studentKeys.sessionHistory(id),
    queryFn: () => studentService.getSessionHistory(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export const useUpdateStudentSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateCurrentStudentSessionRequestDTO
      classFeesData?: any[]
    }) => studentService.updateCurrentSession(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: studentKeys.sessionHistory(variables.id) })
    },
    onError: (error: any) => {
      console.error('Update student error:', error)
      throw error
    },
  })
}

export const useParentStudents = (page = 0, size = 10, sortDirection = 'asc') => {
  return useQuery({
    queryKey: studentKeys.parents(page, size, sortDirection),
    queryFn: () => studentService.getParents(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useStudentsByClass = (
  schoolClassId: string,
  sectionId?: string,
  page = 0,
  size = 10,
  sortDirection = 'asc',
) => {
  return useQuery({
    queryKey: studentKeys.byClass(schoolClassId, sectionId, page, size),
    queryFn: () => studentService.getByClass(schoolClassId, sectionId, page, size, sortDirection),
    enabled: !!schoolClassId,
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export const useStudentsByClassAndExamGroup = (
  schoolClassId: string,
  examGroupId: string,
  page = 0,
  size = 10,
  sortDirection = 'asc',
) => {
  return useQuery({
    queryKey: studentKeys.byClassAndExamGroup(schoolClassId, examGroupId, page, size),
    queryFn: () =>
      studentService.getByClassAndExamGroup(schoolClassId, examGroupId, page, size, sortDirection),
    enabled: !!schoolClassId && !!examGroupId,
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export const useCreateStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ data, classFeesData }: { data: StudentFormData; classFeesData?: any[] }) =>
      studentService.create(data, classFeesData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
    onError: (error: any) => {
      console.error('Create student error:', error)
      throw error
    },
  })
}

export const useUpdateStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
      classFeesData,
    }: {
      id: string
      data: StudentFormData
      classFeesData?: any[]
    }) => studentService.update(id, data, classFeesData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: studentKeys.sessionHistory(variables.id) })
    },
    onError: (error: any) => {
      console.error('Update student error:', error)
      throw error
    },
  })
}

export const useUpdateStudentDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, photo }: { id: string; photo: File }) =>
      studentService.updateDocument(id, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
    onError: (error: any) => {
      console.error('Error updating student document:', error)
      alert(error.message || 'Failed to update document')
    },
  })
}

export const useUpdateStudentOtherDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, aadhaar, birthCertificate, incomeCasteCertificateFile, migrationBonafideFile, transferCertificateFile, bankPassbookFile, sslcHallTicketFile, sslcMarksSheetFile }: { id: string; aadhaar: File; birthCertificate: File; incomeCasteCertificateFile: File; migrationBonafideFile: File; transferCertificateFile: File; bankPassbookFile: File; sslcHallTicketFile: File; sslcMarksSheetFile: File }) =>
      studentService.updateOtherDocuments(id, aadhaar, birthCertificate, incomeCasteCertificateFile, migrationBonafideFile, transferCertificateFile, bankPassbookFile, sslcHallTicketFile, sslcMarksSheetFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
    onError: (error: any) => {
      console.error('Error updating student document:', error)
      alert(error.message || 'Failed to update document')
    },
  })
}

export const useUpdateParentAadhaar = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, fatherAadhaar, motherAadhaar }: { id: string; fatherAadhaar: File, motherAadhaar: File, }) =>
      studentService.updateParentAadhaar(id, fatherAadhaar, motherAadhaar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
    onError: (error: any) => {
      console.error('Error updating Parent Aadhaar:', error)
      alert(error.message || 'Failed to update Parent Aadhaar')
    },
  })
}

export const useUpdateStudentBirthCertificate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, birthCertificate }: { id: string; birthCertificate: File }) =>
      studentService.updateBirthCertificate(id, birthCertificate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
    onError: (error: any) => {
      console.error('Error updating student BirthCertificate:', error)
      alert(error.message || 'Failed to update BirthCertificate')
    },
  })
}

export const useGenerateRollNumbers = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      classId,
      sectionId,
      rollNumberType,
    }: {
      classId: string
      sectionId: string
      rollNumberType: string
    }) => studentService.generateRollNumbers(classId, sectionId, rollNumberType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
    onError: (error: any) => {
      console.error('Error generating roll numbers:', error)
      throw error
    },
  })
}

export const useDeleteStudents = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => {
      
      return studentService.delete(ids)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: studentKeys.all })
      const previousData = queryClient.getQueryData(studentKeys.all)
      
      return { previousData }
    },
    onError: (error: any, _ids, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(studentKeys.all, context.previousData)
      }
      console.error('Delete student error:', error)
      throw error
    },
    onSuccess: (_data, ids) => {
      
      ids.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: studentKeys.detail(id) })
        queryClient.invalidateQueries({ queryKey: studentKeys.sessionHistory(id) })
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
  })
}

export const useDeleteAllStudents = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => studentService.deleteAll(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: studentKeys.all })
      const previousData = queryClient.getQueryData(studentKeys.all)
      return { previousData }
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(studentKeys.all, context.previousData)
      }
      console.error('Delete all students error:', error)
      throw error
    },
    onSuccess: () => {
      
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
  })
}

export const useDownloadStudentTemplate = () => {
  return useMutation({
    mutationFn: () => studentService.downloadExcelTemplate(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'students_template.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
    onError: (error: any) => {
      console.error('Template download error:', error)
      throw error
    },
  })
}

export const useDownloadStudentSessionTemplate = () => {
  return useMutation({
    mutationFn: () => studentService.downloadSessionExcelTemplate(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'student_sessions_template.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
    onError: (error: any) => {
      console.error('Template download error:', error)
      throw error
    },
  })
}

export const useBulkUploadStudents = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => studentService.bulkUploadFromExcel(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
  })
}

export const useBulkUploadStudentSessions = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => studentService.bulkUploadStudentSessionFromExcel(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
    onError: (error: any) => {
      console.error('Bulk upload student session error:', error)
      throw error
    },
  })
}

export const useImportStudentsFromExcel = useBulkUploadStudentSessions