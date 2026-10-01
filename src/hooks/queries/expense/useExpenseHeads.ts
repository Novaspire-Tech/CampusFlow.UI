import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expenseHeadService } from '../../../services/expense/expenseHeadService'
import type { ExpenseHead } from '../../../types/expense/expenseHead'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

export const expenseHeadKeys = {
  all: ['expenseHeads'] as const,
  stats: ['expenseHeads', 'stats'] as const,
}

export const useExpenseHeads = () => {
  return useQuery({
    queryKey: [...expenseHeadKeys.all, { isAllSchools: isAllSchools() }],
    queryFn: expenseHeadService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Query: Get expense head statistics
export const useExpenseHeadStats = () => {
  return useQuery({
    queryKey: [...expenseHeadKeys.stats, { isAllSchools: isAllSchools() }],
    queryFn: expenseHeadService.getStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Mutation: Add new expense head
export const useAddExpenseHead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<ExpenseHead, 'id' | 'createdDate'>) => expenseHeadService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseHeadKeys.all })
      queryClient.invalidateQueries({ queryKey: expenseHeadKeys.stats })
    },
  })
}

// Mutation: Update expense head
export const useUpdateExpenseHead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseHead }) =>
      expenseHeadService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseHeadKeys.all })
      queryClient.invalidateQueries({ queryKey: expenseHeadKeys.stats })
    },
  })
}

// Mutation: Delete single expense head
export const useDeleteExpenseHead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => expenseHeadService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseHeadKeys.all })
      queryClient.invalidateQueries({ queryKey: expenseHeadKeys.stats })
    },
  })
}

// Mutation: Delete multiple expense heads
export const useDeleteMultipleExpenseHeads = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => expenseHeadService.deleteMultiple(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseHeadKeys.all })
      queryClient.invalidateQueries({ queryKey: expenseHeadKeys.stats })
    },
  })
}
