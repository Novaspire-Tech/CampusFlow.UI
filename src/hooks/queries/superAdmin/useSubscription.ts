import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import {
  getAllSubscriptions,
  getAllSubscriptionsPages,
  filterSubscriptions,
  getSubscriptionFilterOptions,
  suspendSubscription,
  type GetAllSubscriptionsParams,
  type FilterSubscriptionsBody,
} from '../../../services/superAdmin/subscriptionServices'
import type {
  SubscriptionPaginatedResponse,
  SubscriptionFilterOptions,
} from '../../../types/superAdmin/Subscription'

const subscriptionKeys = {
  all: ['subscriptions'] as const,
  lists: () => [...subscriptionKeys.all, 'list'] as const,
  list: (params: object) => [...subscriptionKeys.lists(), params] as const,
  filtered: (body: object, p: object) => [...subscriptionKeys.all, 'filter', body, p] as const,
  filterOptions: () => [...subscriptionKeys.all, 'filterOptions'] as const,
}

export const useSubscriptions = (params: GetAllSubscriptionsParams = {}) =>
  useQuery<SubscriptionPaginatedResponse>({
    queryKey: subscriptionKeys.list(params),
    queryFn: async () => {
      const res = await getAllSubscriptions(params)
      return res.data
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  })

export const useAllSubscriptions = (sortDirection = 'asc') =>
  useQuery<SubscriptionPaginatedResponse>({
    queryKey: [...subscriptionKeys.all, 'all-pages', sortDirection],
    queryFn: () => getAllSubscriptionsPages(sortDirection),
    staleTime: 2 * 60 * 1000,
  })

export const useFilterSubscriptions = (
  body: FilterSubscriptionsBody,
  params: GetAllSubscriptionsParams = {},
  enabled = false,
) =>
  useQuery<SubscriptionPaginatedResponse>({
    queryKey: subscriptionKeys.filtered(body, params),
    queryFn: async () => {
      const res = await filterSubscriptions(body, params)
      return res.data
    },
    enabled,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  })

export const useSubscriptionFilterOptions = () =>
  useQuery<SubscriptionFilterOptions>({
    queryKey: subscriptionKeys.filterOptions(),
    queryFn: async () => {
      const res = await getSubscriptionFilterOptions()
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })

export const useSuspendSubscription = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (subscriptionId: number | string) => suspendSubscription(subscriptionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.lists() })
      qc.invalidateQueries({ queryKey: subscriptionKeys.all })
    },
    onError: (err: any) => console.error('[useSuspendSubscription]', err?.message ?? err),
  })
}
