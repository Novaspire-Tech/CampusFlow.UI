import AxiosFunc from '../../utils/axios';
import type { Designation, DesignationStats } from '../../types/humanResource/designation';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLocal = (key: string, fallback = 'default'): string =>
  localStorage.getItem(key) ?? (console.error(`${key} not found`), fallback);

const buildUrl = (endpoint: string): string =>
  endpoint
    .replace('{schoolGroupCode}', getLocal('schoolGroupCode'))
    .replace('{schoolCode}', getLocal('schoolCode'));

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true';

// ─── Endpoints ───────────────────────────────────────────────────────────────

const EP = {
  GET_ALL:         '/school-group/{schoolGroupCode}/school/{schoolCode}/designation/all',
  GET_PAGINATED:   '/school-group/{schoolGroupCode}/school/designation/all',
  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/designation/${id}`,
  CREATE:          '/school-group/{schoolGroupCode}/school/{schoolCode}/designation/add',
  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/designation/update/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/designation/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/designation/delete-multiple',
};

// ─── Transform ───────────────────────────────────────────────────────────────

const toFrontend = (d: any): Designation => ({
  id: d.designationId?.toString() ?? d.id?.toString() ?? '',
  name: d.name ?? '',
  createdDate: d.createdDate
    ? new Date(d.createdDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0],
  status: d.isActive ? 'Active' : 'Inactive',
});

const toBackend = (d: Partial<Designation>) => ({ name: d.name });

const extractList = (response: any): Designation[] => {
  const raw = response?.data?.data;
  const data =
    raw?.designation ??
    raw?.Designation ??
    raw?.designations ??
    (Array.isArray(raw) ? raw : []);
  return data.map(toFrontend);
};

// ─── Service ─────────────────────────────────────────────────────────────────

export const DesignationService = {

  getAll: async (): Promise<Designation[]> => {
    try {
      const url = isAllSchools()
        ? buildUrl(EP.GET_PAGINATED)
        : buildUrl(EP.GET_ALL);

      const response = await AxiosFunc.Get(url, {
        page: 0, size: 1000, sortDirection: 'asc',
      });

      if (response.data?.status !== 200) return [];

      return extractList(response);
    } catch (error: any) {
      console.error('getAll error:', error.message);
      return [];
    }
  },

  getById: async (id: string): Promise<Designation | null> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(EP.GET_BY_ID(id)));
      if (response.data?.status !== 200 || !response.data?.data) return null;
      return toFrontend(response.data.data);
    } catch (error: any) {
      console.error('getById error:', error.message);
      return null;
    }
  },

  create: async (data: Partial<Designation>): Promise<Designation> => {
    const response = await AxiosFunc.Post(buildUrl(EP.CREATE), toBackend(data));

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to create designation');

    return {
      ...(data as Designation),
      id: response.data?.data?.id?.toString() ?? `temp-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
  },

  update: async (id: string, data: Designation): Promise<Designation> => {
    const response = await AxiosFunc.Put(buildUrl(EP.UPDATE(id)), toBackend(data));

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to update designation');

    return data;
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(buildUrl(EP.DELETE(id)));
      if (response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Failed to delete designation');
    } catch (error: any) {
      if (error.response?.status === 500) return;
      throw new Error(error.response?.data?.message ?? error.message ?? 'Failed to delete designation');
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    const response = await AxiosFunc.Delete(
      buildUrl(EP.DELETE_MULTIPLE),
      ids.map(Number)
    );

    const message = response.data?.message ?? '';
    if (message.toLowerCase().includes('cannot')) throw new Error(message);
    if (response.data?.status !== 200)
      throw new Error(message || 'Failed to delete designations');
  },

  getStats: async (): Promise<DesignationStats[]> => {
    try {
      const designations = await DesignationService.getAll();
      const activeCount = designations.filter(d => d.status === 'Active').length;

      return [
        { title: 'Total Designations', value: designations.length.toString(), change: '+0%', icon: 'Package' },
        { title: 'Active Heads',        value: activeCount.toString(),         change: '+0%', icon: 'CheckCircle' },
      ];
    } catch (error: any) {
      console.error('getStats error:', error.message);
      return [
        { title: 'Total Designations', value: '0', change: '+0%', icon: 'Package' },
        { title: 'Active Heads',        value: '0', change: '+0%', icon: 'CheckCircle' },
      ];
    }
  },
};