import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentIdCardService } from '../../../services/certificate/studentIdCardservices'
import type {
  StudentIdCardTemplate,
  StudentIdCardTemplateFormData,
  GenerateStudentIdCardsDto,
} from '../../../types/certificate/studentIdCard'

export const studentIdCardKeys = {
  all: ['studentIdCard'] as const,
  allTemplates: () => [...studentIdCardKeys.all, 'templates'] as const,
  template: (id: string) => [...studentIdCardKeys.all, 'templates', id] as const,
}

export const useStudentIdCardTemplates = () =>
  useQuery({
    queryKey: studentIdCardKeys.allTemplates(),
    queryFn: studentIdCardService.getAllTemplates,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000,
    retry: 1,
  })
  

export const useCreateStudentIdCardTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: StudentIdCardTemplateFormData) => studentIdCardService.createTemplate(data),

    onSuccess: (newTemplate) => {
      queryClient.setQueryData<StudentIdCardTemplate[]>(
        studentIdCardKeys.allTemplates(),
        (old = []) => {
          const alreadyExists = old.some(
            (t) =>
              t.studentIdCardTemplateId === newTemplate.studentIdCardTemplateId ||
              t.id === newTemplate.id,
          )
          if (alreadyExists) {
            return old.map((t) =>
              t.studentIdCardTemplateId === newTemplate.studentIdCardTemplateId ||
              t.id === newTemplate.id
                ? newTemplate
                : t,
            )
          }
          return [...old, newTemplate]
        },
      )

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: studentIdCardKeys.allTemplates(),
          refetchType: 'all',
        })
      }, 100)
    },
  })
}
export const useDeleteStudentIdCardTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: studentIdCardService.deleteTemplate,

    onMutate: async (templateId: string) => {
      await queryClient.cancelQueries({ queryKey: studentIdCardKeys.allTemplates() })

      const previousTemplates = queryClient.getQueryData<StudentIdCardTemplate[]>(
        studentIdCardKeys.allTemplates(),
      )

      queryClient.setQueryData<StudentIdCardTemplate[]>(
        studentIdCardKeys.allTemplates(),
        (old = []) =>
          old.filter((t) => t.studentIdCardTemplateId !== templateId && t.id !== templateId),
      )

      return { previousTemplates }
    },

    onError: (_error, _id, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(studentIdCardKeys.allTemplates(), context.previousTemplates)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: studentIdCardKeys.allTemplates(),
        refetchType: 'active',
      })
    },
  })
}
export const useViewStudentIdCardTemplate = () =>
  useMutation({
    mutationFn: studentIdCardService.viewTemplate,
  })

export const useDownloadStudentIdCardTemplate = () =>
  useMutation({
    mutationFn: studentIdCardService.downloadTemplate,
  })

export const useGenerateStudentIdCards = () =>
  useMutation({
    mutationFn: ({ templateId, dto }: { templateId: string; dto: GenerateStudentIdCardsDto }) =>
      studentIdCardService.generateIdCards(templateId, dto),
  })
