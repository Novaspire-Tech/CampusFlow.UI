import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staffIdCardService } from '../../../services/certificate/staffIdCardservices'
import type {
  StaffIdCardTemplate,
  StaffIdCardTemplateFormData,
} from '../../../types/certificate/staffIdCard'

export const staffIdCardKeys = {
  all: ['staffIdCard'] as const,
  allTemplates: () => [...staffIdCardKeys.all, 'templates'] as const,
  template: (id: number) => [...staffIdCardKeys.all, 'templates', id] as const,
}

export const useStaffIdCardTemplates = () => {
  return useQuery({
    queryKey: staffIdCardKeys.allTemplates(),
    queryFn: staffIdCardService.getAllTemplates,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  })
}


export const useStaffIdCardTemplate = (templateId: number | null) => {
  return useQuery({
    queryKey: staffIdCardKeys.template(templateId!),
    queryFn: () => staffIdCardService.getTemplate(templateId!),
    enabled: !!templateId && templateId > 0,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateStaffIdCardTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: StaffIdCardTemplateFormData) => staffIdCardService.createTemplate(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffIdCardKeys.allTemplates() })
    },

    onError: (error: any) => {
      console.error('Error creating staff ID card template:', error)
      throw error
    },
  })
}

export const useDeleteStaffIdCardTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: number) => staffIdCardService.deleteTemplate(templateId),

    onMutate: async (templateId: number) => {
      await queryClient.cancelQueries({ queryKey: staffIdCardKeys.allTemplates() })

      const previousTemplates = queryClient.getQueryData<StaffIdCardTemplate[]>(
        staffIdCardKeys.allTemplates(),
      )

      queryClient.setQueryData<StaffIdCardTemplate[]>(staffIdCardKeys.allTemplates(), (old = []) =>
        old.filter((template) => template.staffIdCardTemplateId !== templateId),
      )

      return { previousTemplates }
    },

    onError: (error: any, _templateId, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(staffIdCardKeys.allTemplates(), context.previousTemplates)
      }
      console.error('Error deleting staff ID card template:', error)
      throw error
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: staffIdCardKeys.allTemplates() })
    },
  })
}

export const useViewStaffIdCardTemplate = () => {
  return useMutation({
    mutationFn: (templateId: number) => staffIdCardService.viewTemplate(templateId),

    onError: (error: any) => {
      console.error('Error viewing staff ID card template:', error)
      throw error
    },
  })
}

export const useDownloadStaffIdCardTemplate = () => {
  return useMutation({
    mutationFn: (templateId: number) => staffIdCardService.downloadTemplate(templateId),

    onError: (error: any) => {
      console.error('Error downloading staff ID card template:', error)
      throw error
    },
  })
}

export const useGenerateStaffIdCards = () => {
  return useMutation({
    mutationFn: ({ templateId, staffIds }: { templateId: number; staffIds: number[] }) =>
      staffIdCardService.generateStaffIdCards(templateId, staffIds),

    onError: (error: any) => {
      console.error('Error generating staff ID cards:', error)
      throw error
    },
  })
}
