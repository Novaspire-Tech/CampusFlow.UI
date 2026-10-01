import AxiosFunc from '../../utils/axios';
import type { Department, DepartmentStats } from '../../types/humanResource/department';

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
  GET_ALL:         '/school-group/{schoolGroupCode}/school/{schoolCode}/department/all',
  GET_PAGINATED:   '/school-group/{schoolGroupCode}/school/department/all',
  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/department/${id}`,
  CREATE:          '/school-group/{schoolGroupCode}/school/{schoolCode}/department/add',
  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/department/update/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/department/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/department/delete-multiple',
};

// ─── Transform ───────────────────────────────────────────────────────────────

const toFrontend = (d: any): Department => ({
  id: d.departmentId?.toString() ?? d.id?.toString() ?? '',
  name: d.name ?? '',
  createdDate: d.createdDate
    ? new Date(d.createdDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0],
  status: d.isActive ? 'Active' : 'Inactive',
});

const toBackend = (d: Partial<Department>) => ({ name: d.name });

const extractList = (response: any): Department[] => {
  const raw = response?.data?.data;
  const data = raw?.Department ?? raw?.department ?? (Array.isArray(raw) ? raw : []);
  return data.map(toFrontend);
};

// ─── Service ─────────────────────────────────────────────────────────────────

export const DepartmentService = {

  getAll: async (): Promise<Department[]> => {
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

  getById: async (id: string): Promise<Department | null> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(EP.GET_BY_ID(id)));
      if (response.data?.status !== 200 || !response.data?.data) return null;
      return toFrontend(response.data.data);
    } catch (error: any) {
      console.error('getById error:', error.message);
      return null;
    }
  },

  create: async (data: Partial<Department>): Promise<Department> => {
    const response = await AxiosFunc.Post(buildUrl(EP.CREATE), toBackend(data));

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to create department');

    return {
      ...(data as Department),
      id: response.data?.data?.id?.toString() ?? `temp-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
  },

  update: async (id: string, data: Department): Promise<Department> => {
    const response = await AxiosFunc.Put(buildUrl(EP.UPDATE(id)), toBackend(data));

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to update department');

    return data;
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(buildUrl(EP.DELETE(id)));
      if (response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Failed to delete department');
    } catch (error: any) {
      if (error.response?.status === 500) return;
      throw new Error(error.response?.data?.message ?? error.message ?? 'Failed to delete department');
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
      throw new Error(message || 'Failed to delete departments');
  },

  getStats: async (): Promise<DepartmentStats[]> => {
    try {
      const departments = await DepartmentService.getAll();
      const activeCount = departments.filter(d => d.status === 'Active').length;

      return [
        { title: 'Total departments', value: departments.length.toString(), change: '+0%', icon: 'Package' },
        { title: 'Active Heads',      value: activeCount.toString(),        change: '+0%', icon: 'CheckCircle' },
      ];
    } catch (error: any) {
      console.error('getStats error:', error.message);
      return [
        { title: 'Total departments', value: '0', change: '+0%', icon: 'Package' },
        { title: 'Active Heads',      value: '0', change: '+0%', icon: 'CheckCircle' },
      ];
    }
  },
};