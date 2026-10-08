import AxiosFunc from '../../utils/axios';
import type {
  SubscriptionApiResponse,
  SubscriptionFilterOptionsApiResponse,
  Subscription,
  SubscriptionPaginatedResponse,
} from '../../types/superAdmin/Subscription';

export interface GetAllSubscriptionsParams {
  page?:          number;
  size?:          number;
  sortBy?:        string;
  sortDirection?: string;
}

export interface FilterSubscriptionsBody {
  billingPeriod?:       string;
  subscriptionStatus?:  string;
  startDate?:           string;
  endDate?:             string;
  search?:              string;
}

const EP = {
  GET_ALL:        '/subscription/getAll',
  FILTER:         '/subscription/filter-subscription',
  FILTER_OPTIONS: '/subscription/filter-options',
  SUSPEND:        (id: number | string) => `/subscription/${id}/suspend`,
};

const extractError = (error: any, fallback: string): never => {
  throw new Error(error?.response?.data?.message ?? error?.message ?? fallback);
};

const toSubscription = (item: any): Subscription => ({
  subscriptionId:     Number(item.subscriptionId    ?? 0),
  schoolGroupName:    String(item.schoolGroupName    ?? ''),
  phoneNumber:        String(item.phoneNumber        ?? ''),
  email:              String(item.email              ?? ''),
  logo:               item.logo                     ?? null,
  paymentMethod:      item.paymentMethod             ?? null,
  packageName:        String(item.packageName        ?? ''),
  billingPeriod:      String(item.billingPeriod      ?? ''),
  subscriptionStatus: String(item.subscriptionStatus ?? ''),
  amount:             item.amount != null ? Number(item.amount) : null,
  startDate:          String(item.startDate          ?? ''),
  endDate:            String(item.endDate            ?? ''),
  isPaid:             item.isPaid == null ? null : Boolean(item.isPaid),
});

const toPaginatedResponse = (data: any): SubscriptionPaginatedResponse => ({
  subscriptions: (data?.subscriptions ?? []).map(toSubscription),
  currentPage:   Number(data?.currentPage ?? 0),
  totalItems:    Number(data?.totalItems  ?? 0),
  totalPages:    Number(data?.totalPages  ?? 0),
});

export const getAllSubscriptions = async (
  params: GetAllSubscriptionsParams = {}
): Promise<SubscriptionApiResponse> => {
  try {
    const { page = 0, size = 10, sortBy, sortDirection } = params;
    const response = await AxiosFunc.Get(EP.GET_ALL, {
      page,
      size,
      ...(sortBy        && { sortBy }),
      ...(sortDirection && { sortDirection }),
    });
    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Fetch failed');
    return { ...response.data, data: toPaginatedResponse(response.data?.data) };
  } catch (e: any) {
    return extractError(e, 'Failed to fetch subscriptions');
  }
};

export const getAllSubscriptionsPages = async (
  sortDirection = 'asc',
): Promise<SubscriptionPaginatedResponse> => {
  const pageSize = 10
  const firstPage = (await getAllSubscriptions({ page: 0, size: pageSize, sortDirection })).data
  const subscriptions = [...firstPage.subscriptions]
  for (let page = 1; page < firstPage.totalPages; page += 1) {
    const response = await getAllSubscriptions({ page, size: pageSize, sortDirection })
    subscriptions.push(...response.data.subscriptions)
  }
  return { ...firstPage, subscriptions, currentPage: 0 }
}

export const filterSubscriptions = async (
  body:   FilterSubscriptionsBody,
  params: GetAllSubscriptionsParams = {},
): Promise<SubscriptionApiResponse> => {
  try {
    const { page = 0, size = 10, sortBy, sortDirection } = params;
    const response = await AxiosFunc.Post(
      EP.FILTER,
      body,
      {
        page,
        size,
        ...(sortBy        && { sortBy }),
        ...(sortDirection && { sortDirection }),
      },
    );
    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Filter failed');
    return { ...response.data, data: toPaginatedResponse(response.data?.data) };
  } catch (e: any) {
    return extractError(e, 'Failed to filter subscriptions');
  }
};

export const getSubscriptionFilterOptions =
  async (): Promise<SubscriptionFilterOptionsApiResponse> => {
    try {
      const response = await AxiosFunc.Get(EP.FILTER_OPTIONS);
      if (response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Fetch failed');
      return response.data;
    } catch (e: any) {
      return extractError(e, 'Failed to fetch subscription filter options');
    }
  };

export const suspendSubscription = async (
  subscriptionId: number | string
): Promise<void> => {
  try {
    const response = await AxiosFunc.Delete(
      EP.SUSPEND(subscriptionId),
      undefined,
      { subscriptionId },
    );
    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Suspend failed');
  } catch (e: any) {
    return extractError(e, 'Failed to suspend subscription');
  }
};