import AxiosFunc from '../../utils/axios';
import type { DisableReason, DisableReasonStats } from '../../types/studentInformation/disableReason';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLocal = (key: string, fallback = 'default'): string =>
  localStorage.getItem(key) ?? (console.error(`${key} not found`), fallback);

const buildUrl = (endpoint: string): string =>
  endpoint
    .replace('{schoolGroupCode}', getLocal('schoolGroupCode'))
    .replace('{schoolCode}', getLocal('schoolCode'));

const buildGroupUrl = (endpoint: string): string =>
  endpoint.replace('{schoolGroupCode}', getLocal('schoolGroupCode'));

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true';

// ─── Endpoints ───────────────────────────────────────────────────────────────

const EP = {
  GET_ALL:       '/school-group/{schoolGroupCode}/school/{schoolCode}/disable-reason/all',
  GET_PAGINATED: '/school-group/{schoolGroupCode}/school/disable-reason/getAll',
  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/disable-reason/${id}`,
  CREATE:        '/school-group/{schoolGroupCode}/school/{schoolCode}/disable-reason/add',
  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/disable-reason/update/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/disable-reason/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/disable-reason/delete-multiple',
};

// ─── Transform ───────────────────────────────────────────────────────────────

const toFrontend = (d: any): DisableReason => ({
  id: d.disableReasonId?.toString() ?? d.id?.toString() ?? '',
  reason: d.disableReason ?? '',
  createdDate: d.createdDate
    ? new Date(d.createdDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0],
  status: d.isActive ? 'Active' : 'Inactive',
  schoolCode: d.schoolCode ?? '',
});

const toBackend = (d: Partial<DisableReason>) => ({
  disableReason: d.reason?.trim(),
});

const extractList = (response: any): DisableReason[] => {
  const data =
    response?.data?.data?.disableReasons ??
    response?.data?.disableReasons ??
    response?.data?.data ??
    [];

  if (!Array.isArray(data)) {
    console.warn('Expected array, got:', data);
    return [];
  }
  return data.map(toFrontend);
};

// ─── Service ─────────────────────────────────────────────────────────────────

export const disableReasonService = {

  getAll: async (): Promise<DisableReason[]> => {
    try {
      const url = isAllSchools()
        ? buildGroupUrl(EP.GET_PAGINATED)
        : buildUrl(EP.GET_ALL);

      const response = await AxiosFunc.Get(url, {
        page: 0, size: 1000, sortDirection: 'asc', sortBy: 'disableReason',
      });

      if (response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Failed to fetch disable reasons');

      const reasons = extractList(response);

      if (!isAllSchools()) {
        const schoolCode = getLocal('schoolCode');
        return reasons.filter(r => !r.schoolCode || r.schoolCode === schoolCode);
      }

      return reasons;
    } catch (error: any) {
      console.error('Error fetching disable reasons:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<DisableReason | null> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(EP.GET_BY_ID(id)));
      if (response.data?.status !== 200 || !response.data?.data) return null;
      return toFrontend(response.data.data);
    } catch (error: any) {
      console.error('Error fetching disable reason:', error);
      return null;
    }
  },

  create: async (data: Partial<DisableReason>): Promise<DisableReason> => {
    const response = await AxiosFunc.Post(buildUrl(EP.CREATE), toBackend(data));

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to create disable reason');

    return {
      ...(data as DisableReason),
      id: response.data?.data?.disableReasonId?.toString() ?? `temp-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      schoolCode: getLocal('schoolCode'),
    };
  },

  update: async (id: string, data: DisableReason): Promise<DisableReason> => {
    const response = await AxiosFunc.Put(buildUrl(EP.UPDATE(id)), toBackend(data));

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to update disable reason');

    return data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await AxiosFunc.Delete(buildUrl(EP.DELETE(id)));

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to delete disable reason');
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    const response = await AxiosFunc.Delete(
      buildUrl(EP.DELETE_MULTIPLE),
      ids.map(Number)
    );

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to delete disable reasons');
  },

  getStats: async (): Promise<DisableReasonStats[]> => {
    try {
      const reasons = await disableReasonService.getAll();
      const activeCount = reasons.filter(r => r.status === 'Active').length;

      return [
        { title: 'Total Disable Reasons', value: reasons.length.toString(), change: '+0%', icon: 'Ban' },
        { title: 'Active Reasons',         value: activeCount.toString(),    change: '+0%', icon: 'CheckCircle' },
      ];
    } catch (error: any) {
      console.error('Error fetching disable reason stats:', error);
      return [
        { title: 'Total Disable Reasons', value: '0', change: '+0%', icon: 'Ban' },
        { title: 'Active Reasons',         value: '0', change: '+0%', icon: 'CheckCircle' },
      ];
    }
  },
};