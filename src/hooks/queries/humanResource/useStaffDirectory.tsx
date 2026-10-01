import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staffService } from '../../../services/hr/staffDirectoryService'
import type { StaffFormData } from '../../../types/humanResource/Staff'
import { toast } from 'react-toastify'

export const StaffKeys = {
  all: ['staff'] as const,
  byCode: (staffCode: string) => ['staff', staffCode] as const,
  stats: ['staff', 'stats'] as const,
  roles: ['staff', 'roles'] as const,
  designations: ['staff', 'designations'] as const,
  departments: ['staff', 'departments'] as const,
}

export const useGetAllStaff = () => {
  return useQuery({
    queryKey: StaffKeys.all,
    queryFn: () => staffService.getAll(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useStaffByCode = (staffCode: string | undefined) => {
  return useQuery({
    queryKey: staffCode ? StaffKeys.byCode(staffCode) : ['staff', 'empty'],
    queryFn: () => (staffCode ? staffService.findByStaffCode(staffCode) : null),
    enabled: !!staffCode,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useStaffStats = () => {
  return useQuery({
    queryKey: StaffKeys.stats,
    queryFn: staffService.getStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useStaffRoles = () => {
  return useQuery({
    queryKey: StaffKeys.roles,
    queryFn: staffService.getRoles,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}

export const useStaffDesignations = () => {
  return useQuery({
    queryKey: StaffKeys.designations,
    queryFn: staffService.getDesignations,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}

export const useStaffDepartments = () => {
  return useQuery({
    queryKey: StaffKeys.departments,
    queryFn: staffService.getDepartments,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}

export const useAddStaff = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: StaffFormData) => staffService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: StaffKeys.all })
      queryClient.invalidateQueries({ queryKey: StaffKeys.stats })
    },
  })
}

export const useUpdateStaff = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ staffCode, data }: { staffCode: string; data: StaffFormData }) =>
      staffService.update(staffCode, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: StaffKeys.all })
      queryClient.invalidateQueries({ queryKey: StaffKeys.byCode(variables.staffCode) })
      queryClient.invalidateQueries({ queryKey: StaffKeys.stats })
    },
  })
}

export const useUpdateStaffDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      staffCode,
      profilePicture,
      resume,
      joiningLetter,
      otherDocument,
    }: {
      staffCode: string
      profilePicture?: File
      resume?: File
      joiningLetter?: File
      otherDocument?: File
    }) =>
      staffService.updateDocument(staffCode, profilePicture, resume, joiningLetter, otherDocument),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: StaffKeys.all })
    },
    onError: (error: any) => {
      console.error('Error updating staff document:', error)
      toast.error(error.message || 'Failed to update document')
    },
  })
}

export const useDeleteStaff = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: staffService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: StaffKeys.all })
      queryClient.invalidateQueries({ queryKey: StaffKeys.stats })
    },
  })
}

export const useDeleteMultipleStaff = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: staffService.deleteMultiple,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: StaffKeys.all })
      queryClient.invalidateQueries({ queryKey: StaffKeys.stats })
    },
  })
}

export const useDeleteAllStaff = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: staffService.deleteAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: StaffKeys.all })
      queryClient.invalidateQueries({ queryKey: StaffKeys.stats })
    },
  })
}

export const useDownloadStaffTemplate = () => {
  return useMutation({
    mutationFn: () => staffService.downloadExcelTemplate(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'staff_template.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
    onError: (error: any) => {
      console.error('Staff template download error:', error)
      throw error
    },
  })
}

export const useBulkUploadStaff = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => staffService.bulkUploadFromExcel(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: StaffKeys.all })
      queryClient.invalidateQueries({ queryKey: StaffKeys.stats })
    },
    onError: (error: any) => {
      console.error('Staff bulk upload error:', error)
      throw error
    },
  })
}

export const useImportStaffFromExcel = useBulkUploadStaff
 