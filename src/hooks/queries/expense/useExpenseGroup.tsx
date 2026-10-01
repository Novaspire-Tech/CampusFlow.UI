import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expenseGroupService } from '../../../services/expense/expenseGroupService'
import type { ExpenseGroup, ExpenseGroupPayload } from '../../../types/expense/expenseGroup'

export const expenseGroupKeys = {
  all: ['expenseGroups'] as const,
  byHead: (headId: number) => ['expenseGroups', 'head', headId] as const,
}

export const useExpenseGroups = (expenseHeadId: number) =>
  useQuery({
    queryKey: expenseGroupKeys.byHead(expenseHeadId),
    queryFn: () => expenseGroupService.getAll(expenseHeadId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: expenseHeadId > 0,
    retry: 1,
  })

export const useAddExpenseGroup = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ExpenseGroupPayload) => expenseGroupService.create(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: expenseGroupKeys.byHead(vars.expenseHeadId) })
    },
  })
}

export const useUpdateExpenseGroup = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      expenseGroupId,
      payload,
    }: {
      expenseGroupId: string
      payload: ExpenseGroupPayload
    }) => expenseGroupService.update(expenseGroupId, payload),

    onMutate: async ({ expenseGroupId, payload }) => {
      const key = expenseGroupKeys.byHead(payload.expenseHeadId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<ExpenseGroup[]>(key)

      if (prev) {
        qc.setQueryData<ExpenseGroup[]>(
          key,
          prev.map((g) => (g.id === expenseGroupId ? { ...g, groupName: payload.groupName } : g)),
        )
      }
      return { prev, key }
    },

    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev)
    },

    onSettled: (_, __, vars) => {
      qc.invalidateQueries({ queryKey: expenseGroupKeys.byHead(vars.payload.expenseHeadId) })
    },
  })
}

export const useDeleteExpenseGroup = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ expenseGroupId }: { expenseGroupId: string; expenseHeadId: number }) =>
      expenseGroupService.delete(expenseGroupId),

    onMutate: async ({ expenseGroupId, expenseHeadId }) => {
      const key = expenseGroupKeys.byHead(expenseHeadId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<ExpenseGroup[]>(key)
      if (prev) {
        qc.setQueryData<ExpenseGroup[]>(
          key,
          prev.filter((g) => g.id !== expenseGroupId),
        )
      }
      return { prev, key }
    },

    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev)
    },

    onSettled: (_, __, vars) => {
      qc.invalidateQueries({ queryKey: expenseGroupKeys.byHead(vars.expenseHeadId) })
    },
  })
}
