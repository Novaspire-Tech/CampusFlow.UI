import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { markSheetService } from '../../../services/examination/designMarksheetServices'
import type {
  MarkSheetTemplate,
  MarkSheetTemplateFormData,
} from '../../../types/examination/DesignMarksheet'

// Query Keys
export const markSheetKeys = {
  all: ['markSheet'] as const,
  allTemplates: () => [...markSheetKeys.all, 'templates'] as const,
  templatesByClassAndExam: (schoolClassId: number, examGroupId: number) =>
    [...markSheetKeys.all, 'templates', 'class', schoolClassId, 'exam', examGroupId] as const,
}

export const useGetAllMarksheetTemplates = () => {
  return useQuery({
    queryKey: markSheetKeys.allTemplates(),
    queryFn: markSheetService.getAllTemplates,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  })
}

export const useMarkSheetTemplatesByClassAndExam = (
  schoolClassId: number | null,
  examGroupId: number | null,
) => {
  return useQuery({
    queryKey: markSheetKeys.templatesByClassAndExam(schoolClassId!, examGroupId!),
    queryFn: () => markSheetService.getTemplatesByClassAndExam(schoolClassId!, examGroupId!),
    enabled: !!schoolClassId && schoolClassId > 0 && !!examGroupId && examGroupId > 0,
    staleTime: 5 * 60 * 1000,
  })
}

export const useAddMarksheetTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MarkSheetTemplateFormData) => markSheetService.createTemplate(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: markSheetKeys.allTemplates() })
    },

    onError: (error: any) => {
      console.error('Error creating mark sheet template:', error)
      throw error
    },
  })
}

export const useDeleteMarksheetTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: string | number) => {
      const id = typeof templateId === 'string' ? parseInt(templateId) : templateId
      return markSheetService.deleteTemplate(id)
    },

    // Optimistic update
    onMutate: async (templateId: string | number) => {
      await queryClient.cancelQueries({ queryKey: markSheetKeys.allTemplates() })

      const id = typeof templateId === 'string' ? parseInt(templateId) : templateId
      const previousTemplates = queryClient.getQueryData<MarkSheetTemplate[]>(
        markSheetKeys.allTemplates(),
      )

      queryClient.setQueryData<MarkSheetTemplate[]>(markSheetKeys.allTemplates(), (old = []) =>
        old.filter((template) => template.marksSheetTemplateId !== id),
      )

      return { previousTemplates }
    },

    onError: (error: any, _templateId, context) => {
      // Rollback on error
      if (context?.previousTemplates) {
        queryClient.setQueryData(markSheetKeys.allTemplates(), context.previousTemplates)
      }
      console.error('Error deleting mark sheet template:', error)
      throw error
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: markSheetKeys.allTemplates() })
    },
  })
}

export const useViewMarkSheetTemplate = () => {
  return useMutation({
    mutationFn: (templateId: number) => markSheetService.viewTemplate(templateId),

    onError: (error: any) => {
      console.error('Error viewing mark sheet template:', error)
      throw error
    },
  })
}

export const useDownloadMarkSheetTemplate = () => {
  return useMutation({
    mutationFn: (templateId: number) => markSheetService.downloadTemplate(templateId),

    onError: (error: any) => {
      console.error('Error downloading mark sheet template:', error)
      throw error
    },
  })
}

export const useGenerateMarkSheets = () => {
  return useMutation({
    mutationFn: ({ templateId, studentIds }: { templateId: number; studentIds: number[] }) =>
      markSheetService.generateMarkSheets(templateId, studentIds),

    onSuccess: () => {
      console.log('Mark sheets generated successfully')
    },

    onError: (error: any) => {
      console.error('Error generating mark sheets:', error)
      throw error
    },
  })
}
