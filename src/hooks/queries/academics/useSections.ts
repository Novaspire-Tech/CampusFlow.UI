import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sectionService } from '../../../services/academics/sectionService'
import type { Section } from '../../../types/academics/section'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

export const sectionKeys = {
  all: ['sections'] as const,
  byClass: (classId: number) => ['sections', classId] as const,
  stats: (classId: number) => ['sections', 'stats', classId] as const,
}

export const useSections = (classId: number) => {
  return useQuery({
    queryKey: [...sectionKeys.byClass(classId), isAllSchools()],
    queryFn: () => sectionService.getAll(classId),
    enabled: !!classId,
  })
}

export const useSectionStats = (classId: number) => {
  return useQuery({
    queryKey: [...sectionKeys.stats(classId), isAllSchools()],
    queryFn: () => sectionService.getStats(classId),
    enabled: !!classId,
  })
}

export const useAddSection = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ classId, data }: any) => sectionService.create(classId, data),

    onSuccess: (_res, vars) => {
      qc.invalidateQueries({
        queryKey: [...sectionKeys.byClass(vars.classId), isAllSchools()],
      })
    },
  })
}

export const useUpdateSection = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ classId, sectionId, data }: any) =>
      sectionService.update(classId, sectionId, data),

    onSuccess: (_res, vars) => {
      qc.invalidateQueries({
        queryKey: [...sectionKeys.byClass(vars.classId), isAllSchools()],
      })
    },
  })
}

export const useDeleteSection = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ classId, sectionId }: any) => sectionService.delete(classId, sectionId),

    onMutate: async ({ classId, sectionId }) => {
      const key = [...sectionKeys.byClass(classId), isAllSchools()]

      await qc.cancelQueries({ queryKey: key })

      const prev = qc.getQueryData<Section[]>(key)

      qc.setQueryData<Section[]>(key, (old = []) => old.filter((s) => s.id !== sectionId))

      return { prev, key }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev)
    },

    onSettled: (_res, _err, vars) => {
      qc.invalidateQueries({
        queryKey: [...sectionKeys.byClass(vars.classId), isAllSchools()],
      })
    },
  })
}

export const useDeleteMultipleSections = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ classId, ids }: any) => sectionService.deleteMultiple(classId, ids),

    onMutate: async ({ classId, ids }) => {
      const key = [...sectionKeys.byClass(classId), isAllSchools()]

      await qc.cancelQueries({ queryKey: key })

      const prev = qc.getQueryData<Section[]>(key)

      qc.setQueryData<Section[]>(key, (old = []) => old.filter((s) => !ids.includes(s.id)))

      return { prev, key }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev)
    },

    onSettled: (_res, _err, vars) => {
      qc.invalidateQueries({
        queryKey: [...sectionKeys.byClass(vars.classId), isAllSchools()],
      })
    },
  })
}
