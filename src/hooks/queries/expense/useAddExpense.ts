import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addExpenseService } from '../../../services/expense/addExpenseService'
import type {
  ExpenseFilterParams,
  ExpenseSearchParams,
} from '../../../services/expense/addExpenseService'
import type { AddExpense, AddExpenseFormData } from '../../../types/expense/addExpense'
import { expenseHeadKeys } from './useExpenseHeads'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

export const addExpenseKeys = {
  all: ['addExpenses'] as const,
  filter: (params: ExpenseFilterParams) => ['addExpenses', 'filter', params] as const,
  search: (params: ExpenseSearchParams) => ['addExpenses', 'search', params] as const,
  byName: (name: string) => ['addExpenses', 'name', name] as const,
}

export const useAddExpenses = (page = 0, size = 10, sortDirection: 'asc' | 'desc' = 'asc') => {
  return useQuery({
    queryKey: [...addExpenseKeys.all, { page, size, sortDirection, isAllSchools }],
    queryFn: () => addExpenseService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (prev) => prev,
  })
}

export const useSearchExpenses = (params: ExpenseSearchParams, enabled: boolean) => {
  return useQuery({
    queryKey: addExpenseKeys.search(params),
    queryFn: () => addExpenseService.search(params),
    enabled,
    staleTime: 0,
    gcTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
    retry: 1,
  })
}

export const useFilterExpenses = (params: ExpenseFilterParams, enabled: boolean) => {
  return useQuery({
    queryKey: addExpenseKeys.filter(params),
    queryFn: () => addExpenseService.filter(params),
    enabled,
    staleTime: 0,
    gcTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
    retry: 1,
  })
}

export const useAddExpenseByName = (name?: string) => {
  return useQuery({
    queryKey: name ? addExpenseKeys.byName(name) : ['addExpenses', 'empty'],
    queryFn: () => (name ? addExpenseService.findByName(name) : null),
    enabled: !!name,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useCreateAddExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddExpenseFormData) => addExpenseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addExpenseKeys.all })
      queryClient.invalidateQueries({ queryKey: ['addExpenses', 'filter'] })
      queryClient.invalidateQueries({ queryKey: ['addExpenses', 'search'] })
      queryClient.invalidateQueries({ queryKey: expenseHeadKeys.stats })
    },
    onError: (error: any) => {
      console.error('Error creating expense:', error)
      alert(error.message || 'Failed to create expense')
    },
  })
}

export const useUpdateAddExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddExpenseFormData }) =>
      addExpenseService.updateData(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addExpenseKeys.all })
      queryClient.invalidateQueries({ queryKey: ['addExpenses', 'filter'] })
      queryClient.invalidateQueries({ queryKey: ['addExpenses', 'search'] })
      queryClient.invalidateQueries({ queryKey: expenseHeadKeys.stats })
    },
    onError: (error: any) => {
      console.error('Error updating expense:', error)
      alert(error.message || 'Failed to update expense')
    },
  })
}

export const useUpdateAddExpenseDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      addExpenseService.updateDocument(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addExpenseKeys.all })
      queryClient.invalidateQueries({ queryKey: ['addExpenses', 'filter'] })
      queryClient.invalidateQueries({ queryKey: ['addExpenses', 'search'] })
    },
    onError: (error: any) => {
      console.error('Error updating expense document:', error)
      alert(error.message || 'Failed to update document')
    },
  })
}

export const useDeleteAddExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addExpenseService.delete,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: addExpenseKeys.all })
      const previousExpenses = queryClient.getQueryData<AddExpense[]>(addExpenseKeys.all)
      queryClient.setQueryData<AddExpense[]>(addExpenseKeys.all, (old = []) =>
        old.filter((expense) => expense.id !== id),
      )
      return { previousExpenses }
    },
    onError: (error: any, _id, context) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(addExpenseKeys.all, context.previousExpenses)
      }
      console.error('Error deleting expense:', error)
      alert(error.message || 'Failed to delete expense')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: addExpenseKeys.all })
      queryClient.invalidateQueries({ queryKey: ['addExpenses', 'filter'] })
      queryClient.invalidateQueries({ queryKey: ['addExpenses', 'search'] })
      queryClient.invalidateQueries({ queryKey: expenseHeadKeys.stats })
    },
  })
}

export const useDeleteMultipleAddExpenses = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addExpenseService.deleteMultiple,
    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: addExpenseKeys.all })
      const previousExpenses = queryClient.getQueryData<AddExpense[]>(addExpenseKeys.all)
      queryClient.setQueryData<AddExpense[]>(addExpenseKeys.all, (old = []) =>
        old.filter((expense) => !ids.includes(expense.id)),
      )
      return { previousExpenses }
    },
    onError: (error: any, _ids, context) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(addExpenseKeys.all, context.previousExpenses)
      }
      console.error('Error deleting expenses:', error)
      alert(error.message || 'Failed to delete expenses')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: addExpenseKeys.all })
      queryClient.invalidateQueries({ queryKey: ['addExpenses', 'filter'] })
      queryClient.invalidateQueries({ queryKey: ['addExpenses', 'search'] })
      queryClient.invalidateQueries({ queryKey: expenseHeadKeys.stats })
    },
  })
}
