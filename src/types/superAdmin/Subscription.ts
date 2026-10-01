export interface Subscription {
  subscriptionId: number
  schoolGroupName: string
  phoneNumber: string
  email: string
  logo: string | null
  paymentMethod: string | null
  billingPeriod: string
  subscriptionStatus: string
  amount: number | null
  startDate: string
  endDate: string
  isPaid: boolean
  packageCategory: string
}

export interface SubscriptionPaginatedResponse {
  subscriptions: Subscription[]
  currentPage: number
  totalItems: number
  totalPages: number
}

export interface SubscriptionFilterOptions {
  categories: string[]
  status: string[]
}

export interface SubscriptionApiResponse {
  status: number
  message: string
  data: SubscriptionPaginatedResponse
}

export interface SubscriptionFilterOptionsApiResponse {
  status: number
  message: string
  data: SubscriptionFilterOptions
}

export interface FilterSubscriptionsBody {
  packageCategories?: string
  billingPeriod?: string
  subscriptionStatus?: string
  startDate?: string
  endDate?: string
  search?: string
}
